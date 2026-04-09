<?php

namespace App\Jobs;

use App\Enums\RecipientStatus;
use App\Mail\CampaignMail;
use App\Models\Campaign;
use App\Models\CampaignRecipient;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendCampaignJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    // 最大リトライ回数
    public int $tries = 3;

    // リトライ間隔（秒）
    public int $backoff = 60;

    public function __construct(
        public readonly Campaign $campaign,
        public readonly CampaignRecipient $campaignRecipient,
    ) {}

    public function handle(): void
    {
        // 送信前に最新のステータスを確認（重複送信防止）
        $this->campaignRecipient->refresh();
        if ($this->campaignRecipient->status !== RecipientStatus::Pending) {
            return;
        }

        try {
            Mail::to($this->campaignRecipient->recipient->email)
                ->send(new CampaignMail($this->campaign, $this->campaignRecipient));

            // 送信成功: ステータスを sent に更新
            $this->campaignRecipient->update([
                'status' => RecipientStatus::Sent,
                'sent_at' => now(),
            ]);

            // campaigns の送信済みカウントをインクリメント
            $this->campaign->increment('sent_count');

        } catch (\Exception $e) {
            Log::error('メール送信失敗', [
                'campaign_id' => $this->campaign->id,
                'recipient_id' => $this->campaignRecipient->recipient_id,
                'email' => $this->campaignRecipient->recipient->email,
                'error' => $e->getMessage(),
            ]);

            // ステータスを failed に更新
            $this->campaignRecipient->update([
                'status' => RecipientStatus::Failed,
            ]);

            // campaigns の失敗カウントはbounced_countで管理（バウンス扱い）
            $this->campaign->increment('bounced_count');

            // リトライさせない（失敗はそのまま記録）
            $this->fail($e);
        }
    }

    public function failed(\Throwable $exception): void
    {
        Log::error('SendCampaignJob 失敗（リトライ上限超過）', [
            'campaign_id' => $this->campaign->id,
            'recipient_id' => $this->campaignRecipient->recipient_id,
            'error' => $exception->getMessage(),
        ]);
    }
}
