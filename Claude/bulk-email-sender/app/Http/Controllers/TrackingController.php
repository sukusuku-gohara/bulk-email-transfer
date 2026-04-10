<?php

namespace App\Http\Controllers;

use App\Models\CampaignRecipient;
use App\Models\OpenLog;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class TrackingController extends Controller
{
    // 1x1透明GIF のバイナリ（base64デコード済み）
    private const TRANSPARENT_GIF = "\x47\x49\x46\x38\x39\x61\x01\x00\x01\x00\x80\x00\x00\xff\xff\xff\x00\x00\x00\x21\xf9\x04\x01\x00\x00\x00\x00\x2c\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02\x44\x01\x00\x3b";

    /**
     * 開封トラッキングピクセルを配信し、開封ログを記録する
     */
    public function pixel(Request $request, string $trackingId): Response
    {
        // エラーが発生しても必ずGIF画像を返す（受信者にエラーを見せない）
        try {
            $this->recordOpenLog($request, $trackingId);
        } catch (\Throwable $e) {
            // ログだけ残して処理を続行
            \Illuminate\Support\Facades\Log::error('開封トラッキング記録失敗', [
                'tracking_id' => $trackingId,
                'error' => $e->getMessage(),
            ]);
        }

        return response(self::TRANSPARENT_GIF, 200, [
            'Content-Type' => 'image/gif',
            'Cache-Control' => 'no-store, no-cache, must-revalidate, max-age=0',
            'Pragma' => 'no-cache',
        ]);
    }

    /**
     * GoogleイメージプロキシなどのBotアクセスかどうかを判定する
     */
    private function isBot(Request $request): bool
    {
        $userAgent = $request->userAgent() ?? '';
        $ip = $request->ip();

        // ユーザーエージェントによる判定
        $botPatterns = ['GoogleImageProxy', 'ggpht.com', 'Googlebot', 'bingbot', 'YandexBot'];
        foreach ($botPatterns as $pattern) {
            if (stripos($userAgent, $pattern) !== false) {
                return true;
            }
        }

        // GoogleのIPレンジによる判定
        $googleRanges = ['66.249.', '74.125.', '209.85.', '64.233.', '72.14.'];
        foreach ($googleRanges as $range) {
            if (str_starts_with($ip, $range)) {
                return true;
            }
        }

        return false;
    }

    /**
     * 開封ログを記録し、初回のみ opened_count をインクリメントする
     */
    private function recordOpenLog(Request $request, string $trackingId): void
    {
        // Googleプロキシなどのbotは除外
        if ($this->isBot($request)) {
            return;
        }

        $campaignRecipient = CampaignRecipient::where('tracking_id', $trackingId)->first();

        if (!$campaignRecipient) {
            return;
        }

        // 初回アクセスかどうかを確認（open_logs が0件 = 初回）
        $isFirstOpen = $campaignRecipient->openLogs()->doesntExist();

        // open_logs にログを記録
        OpenLog::create([
            'campaign_recipient_id' => $campaignRecipient->id,
            'opened_at' => now(),
            'ip_address' => $request->ip(),
            'user_agent' => mb_substr($request->userAgent() ?? '', 0, 500),
        ]);

        // 初回アクセスのみ campaigns の opened_count をインクリメント
        if ($isFirstOpen) {
            $campaignRecipient->campaign()->increment('opened_count');
        }
    }
}
