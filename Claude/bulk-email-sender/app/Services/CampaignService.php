<?php

namespace App\Services;

use App\Enums\CampaignStatus;
use App\Enums\RecipientStatus;
use App\Jobs\SendCampaignJob;
use App\Models\Campaign;
use App\Models\CampaignRecipient;
use App\Models\Recipient;
use App\Models\Unsubscribe;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class CampaignService
{
    public function __construct(private readonly SpreadsheetService $spreadsheetService) {}

    /**
     * キャンペーンの送信を開始する
     *
     * 選択したシートから受信者を取得し、campaign_recipientsレコードを作成して
     * スロットリングを考慮してJobをディスパッチする。
     */
    public function dispatch(Campaign $campaign): void
    {
        // 送信中ステータスに更新
        $campaign->update([
            'status' => CampaignStatus::Sending,
            'sent_at' => now(),
        ]);

        // 選択シートから受信者を取得
        $sheetRows = $this->spreadsheetService->fetchRecipients($campaign->sheet_name);

        // 配信停止リストと非アクティブを除外
        $unsubscribedEmails = Unsubscribe::pluck('email')->map(fn($e) => strtolower($e))->toArray();
        $inactiveEmails = Recipient::where('is_active', false)->pluck('email')->map(fn($e) => strtolower($e))->toArray();
        $excludedEmails = array_merge($unsubscribedEmails, $inactiveEmails);

        $filteredRows = array_filter($sheetRows, fn($row) => !in_array($row['email'], $excludedEmails));
        $filteredRows = array_values($filteredRows);

        // Recipientレコードをupsert（存在しない場合は新規作成）
        foreach ($filteredRows as $row) {
            Recipient::firstOrCreate(
                ['email' => $row['email']],
                ['name' => $row['name'], 'is_active' => true, 'bounce_count' => 0]
            );
        }

        $emails = array_column($filteredRows, 'email');
        $recipients = Recipient::whereIn('email', $emails)->get();

        $total = $recipients->count();
        $campaign->update(['total_count' => $total]);

        // スロットリング設定（1秒あたりの送信数）
        $ratePerSecond = config('bulkmail.send_rate_per_second', 2);
        $delaySeconds = 0;
        // 送信順のカウンター（Eloquentコレクションのキーに依存しないよう独立したカウンターを使用）
        $dispatchCount = 0;

        foreach ($recipients->chunk(100) as $chunk) {
            foreach ($chunk as $recipient) {
                // N通ごとに1秒のディレイを加算（dispatchCountで正確にカウント）
                if ($dispatchCount > 0 && $dispatchCount % $ratePerSecond === 0) {
                    $delaySeconds++;
                }

                // campaign_recipientsレコードを作成（tracking_idはUUID）
                $campaignRecipient = CampaignRecipient::create([
                    'campaign_id' => $campaign->id,
                    'recipient_id' => $recipient->id,
                    'tracking_id' => Str::uuid()->toString(),
                    'status' => RecipientStatus::Pending,
                    'created_at' => now(),
                ]);

                // ディレイ付きでジョブをディスパッチ
                SendCampaignJob::dispatch($campaign, $campaignRecipient)
                    ->delay(now()->addSeconds($delaySeconds));

                $dispatchCount++;
            }
        }

        Log::info('キャンペーン送信ディスパッチ完了', [
            'campaign_id' => $campaign->id,
            'total_count' => $total,
        ]);
    }

    /**
     * キャンペーンの送信完了を確認してステータスを更新する
     *
     * pending/failedが残っていない場合に completed へ移行する。
     */
    public function checkCompletion(Campaign $campaign): void
    {
        $pendingCount = CampaignRecipient::where('campaign_id', $campaign->id)
            ->where('status', RecipientStatus::Pending)
            ->count();

        if ($pendingCount === 0) {
            $campaign->update([
                'status' => CampaignStatus::Completed,
                'completed_at' => now(),
            ]);
        }
    }
}
