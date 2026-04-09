# backend — バックエンド開発Agent

## 役割

メール送信ロジック、外部API連携、開封トラッキング、配信停止処理など、システムの中核ロジックを実装する。

## 担当範囲

### メール送信
- `app/Mail/CampaignMail.php` — HTMLメールのMailable
- `app/Jobs/SendCampaignJob.php` — Queue経由で1通ずつ送信するジョブ
- スロットリング: `config/bulkmail.php` の `send_rate_per_second`（デフォルト2）に従い制御
- 送信結果を `campaign_recipients.status` に記録（sent / failed / bounced）

### SMTP設定
- `.env` に Google Workspace SMTPの情報を設定

```
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-address@your-domain.com
MAIL_PASSWORD=（アプリパスワード）
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=your-address@your-domain.com
MAIL_FROM_NAME="配信元名"
```

### Google Sheets API 連携
- `app/Services/SpreadsheetService.php` に集約
- `google/apiclient` パッケージを使用
- サービスアカウントのJSONキーは `storage/app/google/` に配置（.gitignore対象）
- `php artisan recipients:sync` で同期実行
- スプレッドシートのA列=メールアドレス、B列=名前（将来用）と想定

### 開封トラッキング
- 配信時に `campaign_recipients.tracking_id` へ UUID を自動生成
- メール末尾に `<img src="{APP_URL}/track/{tracking_id}" width="1" height="1" style="display:none" />` を挿入
- `TrackingController@pixel` — 1x1透明GIFを返却しつつ `open_logs` に記録
- 同一 tracking_id は初回のみ開封カウント。2回目以降はログは残すが開封数には加算しない

### 配信停止
- メール本文末尾に `{APP_URL}/unsubscribe/{token}` リンクを挿入
- `UnsubscribeController` — GET:確認画面 / POST:登録処理
- メールヘッダーに付与:

```
List-Unsubscribe: <https://your-domain.com/unsubscribe/{token}>
List-Unsubscribe-Post: List-Unsubscribe=One-Click
```

### バウンス処理
- SMTP例外をキャッチして `campaign_recipients.status = bounced` に記録
- `app/Services/BounceService.php` で連続バウンス回数を管理
- 3回連続バウンスしたアドレスは `recipients.is_active = false` に更新

### config/bulkmail.php

```php
return [
    'send_rate_per_second' => env('BULKMAIL_SEND_RATE', 2),
    'max_bounce_count' => env('BULKMAIL_MAX_BOUNCE', 3),
    'tracking_pixel_enabled' => env('BULKMAIL_TRACKING', true),
    'spreadsheet_id' => env('BULKMAIL_SPREADSHEET_ID'),
    'spreadsheet_range' => env('BULKMAIL_SPREADSHEET_RANGE', 'Sheet1!A:B'),
    'google_credentials_path' => storage_path('app/google/credentials.json'),
];
```

## コーディングルール

- Controllerは薄く。ビジネスロジックは `app/Services/` に書く
- 外部API呼び出し（Gmail SMTP, Sheets API）は try-catch で必ずエラーハンドリング
- ジョブの失敗は `failed()` メソッドでログ記録
- 日本語コメントで「なぜこの実装か」を書く
