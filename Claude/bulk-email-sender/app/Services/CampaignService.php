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
    /**
     * キャンペーンの送信を開始する
     *
     * 配信対象のアドレスを絞り込み、campaign_recipientsレコードを作成し、
     * スロットリングを考慮してJobをディスパッチする。
     */
    public function dispatch(Campaign $campaign): void
    {
        // 送信中ステータスに更新
        $campaign->update([
            'status' => CampaignStatus::Sending,
            'sent_at' => now(),
        ]);

        // 配信対象を絞り込む
        // - is_active = true（バウンス超過で無効化されていない）
        // - unsubscribesテーブルに含まれない（配信停止していない）
        $unsubscribedEmails = Unsubscribe::pluck('email');

        $recipients = Recipient::where('is_active', true)
            ->whereNotIn('email', $unsubscribedEmails)
            ->get();

        $total = $recipients->count();
        $campaign->update(['total_count' => $total]);

        // スロットリング設定（1秒あたりの送信数）
        $ratePerSecond = config('bulkmail.send_rate_per_second', 2);
        $delaySeconds = 0;

        foreach ($recipients->chunk(100) as $chunk) {
            foreach ($chunk as $index => $recipient) {
                // N通ごとに1秒のディレイを加算
                if ($index > 0 && $index % $ratePerSecond === 0) {
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
