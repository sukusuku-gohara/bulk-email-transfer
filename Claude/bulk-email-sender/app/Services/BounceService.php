<?php

namespace App\Services;

use App\Enums\RecipientStatus;
use App\Models\CampaignRecipient;
use Illuminate\Support\Facades\Log;

class BounceService
{
    /**
     * バウンスを記録し、連続バウンス回数が上限を超えたら受信者を無効化する
     */
    public function recordBounce(CampaignRecipient $campaignRecipient): void
    {
        // campaign_recipients のステータスを bounced に更新
        $campaignRecipient->update([
            'status' => RecipientStatus::Bounced,
        ]);

        $recipient = $campaignRecipient->recipient;

        // 連続バウンス回数をインクリメント
        $recipient->increment('bounce_count');
        $recipient->refresh();

        $maxBounce = config('bulkmail.max_bounce_count', 3);

        Log::warning('バウンス記録', [
            'email' => $recipient->email,
            'bounce_count' => $recipient->bounce_count,
            'max_bounce_count' => $maxBounce,
        ]);

        // 上限に達したら無効化
        if ($recipient->bounce_count >= $maxBounce) {
            $recipient->update(['is_active' => false]);

            Log::warning('受信者を無効化しました（連続バウンス上限超過）', [
                'email' => $recipient->email,
                'bounce_count' => $recipient->bounce_count,
            ]);
        }
    }

    /**
     * 送信成功時にバウンスカウントをリセットする
     */
    public function resetBounceCount(CampaignRecipient $campaignRecipient): void
    {
        $recipient = $campaignRecipient->recipient;

        // バウンスカウントが0より大きい場合のみリセット（不要なDB更新を避ける）
        if ($recipient->bounce_count > 0) {
            $recipient->update(['bounce_count' => 0]);

            Log::info('バウンスカウントをリセットしました', [
                'email' => $recipient->email,
            ]);
        }
    }
}
