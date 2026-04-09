<?php

return [
    // 1秒あたりの送信数（スロットリング）
    'send_rate_per_second' => env('BULKMAIL_SEND_RATE', 2),

    // 連続バウンス許容回数（超えたら is_active = false）
    'max_bounce_count' => env('BULKMAIL_MAX_BOUNCE', 3),

    // 開封トラッキングを有効にするか
    'tracking_pixel_enabled' => env('BULKMAIL_TRACKING', true),

    // Google スプレッドシートID
    'spreadsheet_id' => env('BULKMAIL_SPREADSHEET_ID'),

    // 取得するシートの範囲（A列=メールアドレス、B列=名前）
    'spreadsheet_range' => env('BULKMAIL_SPREADSHEET_RANGE', 'Sheet1!A:B'),

    // Google サービスアカウント認証情報ファイルのパス
    'google_credentials_path' => storage_path('app/google/credentials.json'),
];
