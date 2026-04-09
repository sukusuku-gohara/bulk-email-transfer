# Phase 6 コードレビュー結果

レビュー日: 2026-04-09
レビュアー: reviewer Agent

---

## セキュリティ ✅ / ❌（一部要修正あり → 修正済み）

### 問題なし ✅

- **`.env` への秘密情報直書き**: `.env` ファイル自体は `.gitignore` に含まれており、コード内への直書きは確認されなかった。`config/bulkmail.php` で `env()` 経由で参照している。
- **XSS対策（管理画面Blade）**: `resources/views/campaigns/create.blade.php` のフォームエラー表示・ラベル等はすべて `{{ }}` エスケープを使用している。
- **XSS対策（メールテンプレート）**: `resources/views/emails/campaign.blade.php` で `{!! $campaign->body_html !!}` を使用しているが、これは管理者が投稿したHTMLメール本文であり意図的な使用。管理画面は `auth` ミドルウェアで保護されているため許容範囲。
- **CSRF対策**: `campaigns/create.blade.php` の全フォーム（本配信・テスト送信）に `@csrf` が設定されている。`routes/web.php` のPOSTルートもすべて `auth` グループ内か `unsubscribe.store` のみ認証不要（CSRF保護はLaravel標準で有効）。
- **マスアサインメント対策**: 全モデルに `$fillable` が明示されている（`Campaign`, `Recipient`, `CampaignRecipient`, `OpenLog`, `Unsubscribe`）。
- **Google API認証情報のgitignore**: `.gitignore` に `/storage/app/google/` が明示的に追加されており、credentials.json が誤ってコミットされる危険がない。
- **管理画面の `auth` ミドルウェア**: `routes/web.php` で `/dashboard`, `/campaigns/*`, `/recipients/*`, `/unsubscribes` はすべて `Route::middleware('auth')` グループ内に含まれている。
- **認証不要ルートの最小化**: `/track/{tracking_id}`, `/unsubscribe/{token}`, `/unsubscribe` (POST) のみが認証不要で適切。

### 推奨改善事項（要修正ではない）

- **プレビュー欄の `x-html`**: `campaigns/create.blade.php` 74行目の `x-html="bodyHtml"` はAlpine.jsでユーザー入力HTMLをそのままレンダリングする。管理者しかアクセスできないため即座なリスクではないが、管理者アカウントが乗っ取られた場合のリスクを考慮して将来的に `<iframe srcdoc>` や DOMPurify によるサニタイズを検討することを推奨する。

---

## CLAUDE.md 準拠 ✅（修正済み）

### 問題なし ✅

- **命名規則**: Model（`Campaign`, `Recipient`, `CampaignRecipient`, `OpenLog`, `Unsubscribe`）、Service（`CampaignService`, `SpreadsheetService`, `BounceService`）、Job（`SendCampaignJob`）、Command（`recipients:sync`, `campaign:send`）、Enum（`CampaignStatus`, `RecipientStatus`）すべてCLAUDE.mdの規約に準拠している。
- **設定値のハードコード禁止**: `config/bulkmail.php` で全設定値を管理しており、コード内にハードコードされた設定値は存在しない。
- **コメント日本語**: 全ファイルのコメントが日本語で記述されている。

### 修正済み ✅（元は ❌）

1. **`app/Http/Controllers/RecipientController.php` ビジネスロジックの重複**

   元の問題: `RecipientController::sync()` に `RecipientsSyncCommand` と同一の同期ロジック（DB操作ループ）が重複していた。CLAUDE.md「ControllerにビジネスロジックNG → `app/Services/` に集約」に違反。

   修正内容: `SpreadsheetService::syncRecipients()` メソッドを新設し、同期ロジックをサービス層に集約。`RecipientController::sync()` と `RecipientsSyncCommand` の両方から同メソッドを呼び出すよう変更した。

   修正ファイル:
   - `app/Services/SpreadsheetService.php` — `syncRecipients()` メソッドを追加
   - `app/Console/Commands/RecipientsSyncCommand.php` — `syncRecipients()` を呼び出すよう変更
   - `app/Http/Controllers/RecipientController.php` — `syncRecipients()` を呼び出すよう変更

---

## コード品質 ✅（修正済み）

### 問題なし ✅

- **外部API呼び出しの try-catch**: `SpreadsheetService::fetchRecipients()` で try-catch が実装されており、ログ記録後に例外を再スローしている。
- **`failed()` メソッド**: `SendCampaignJob` に `failed()` メソッドが定義されている（76行目）。
- **N+1クエリ対策**: `CampaignController::show()` で `CampaignRecipient::with('recipient')` を使用しており Eager Loading が適用されている。`TrackingController` の `recordOpenLog()` では `CampaignRecipient` を取得後に `recipient` リレーションは使用しておらず問題なし。
- **ページネーション**: `CampaignController::index()`（50件）、`RecipientController::index()`（50件）、`UnsubscribeController::index()`（50件）、`CampaignController::show()` の openedRecipients（50件）すべてにページネーションが設定されている。
- **リトライ設定**: `SendCampaignJob` に `$tries = 3`, `$backoff = 60` が設定されている。ただし `handle()` 内で即座に `$this->fail()` を呼んでいるため実際にはリトライされない（意図的な設計であることがコメントで説明されている）。

### 修正済み ✅（元は ❌）

1. **`app/Services/CampaignService.php` スロットリングのディレイ計算バグ**

   元の問題（47〜52行目）:
   ```php
   foreach ($recipients->chunk(100) as $chunk) {
       foreach ($chunk as $index => $recipient) {
           if ($index > 0 && $index % $ratePerSecond === 0) {
               $delaySeconds++;
           }
   ```
   `foreach ($chunk as $index => $recipient)` の `$index` は Eloquent コレクションのキー（DBのID値）を使用する。例えばIDが 1, 2, 3, ... の場合は偶然動作するが、IDが飛び番になっている場合（例: 1, 5, 10, ...）は `$index % $ratePerSecond === 0` の条件が期待通りに評価されずスロットリングが正確に機能しない。

   修正内容: 独立したカウンター変数 `$dispatchCount` を追加し、ディレイ計算をDBのIDに依存しない連番カウンターで行うよう変更した。

   修正ファイル: `app/Services/CampaignService.php`

---

## メール配信固有 ✅

### 問題なし ✅

- **スロットリング**: `CampaignService::dispatch()` でジョブのディスパッチにディレイを付与することで実装されている（修正後、カウンターが正確になった）。`config/bulkmail.php` の `send_rate_per_second`（デフォルト2）で制御可能。
- **配信停止リンク（メール本文）**: `resources/views/emails/campaign.blade.php` の15行目に `/unsubscribe/{tracking_id}` へのリンクが含まれている。
- **`List-Unsubscribe` ヘッダー**: `CampaignMail::headers()` で `List-Unsubscribe` および `List-Unsubscribe-Post: List-Unsubscribe=One-Click` の両方を設定しており、Gmail/Apple Mailの一括配信要件を満たしている。
- **配信停止済みアドレスの除外**: `CampaignService::dispatch()` の34〜38行目で `Unsubscribe::pluck('email')` を取得し `whereNotIn` で除外している。また `is_active = false` のアドレスも `where('is_active', true)` で除外されている。

---

## 総合評価

**判定: PASS（修正実施済み）**

修正必須事項: 2件（修正済み）
推奨改善事項: 1件（未修正・将来対応）

### 修正済み一覧

| # | ファイル | 種別 | 内容 |
|---|---------|------|------|
| 1 | `app/Services/CampaignService.php` | バグ修正 | スロットリングのディレイ計算でEloquentコレクションのキー（DB ID）を使用していた問題を独立カウンターで解決 |
| 2 | `app/Http/Controllers/RecipientController.php`, `app/Console/Commands/RecipientsSyncCommand.php`, `app/Services/SpreadsheetService.php` | リファクタリング | Controllerに重複していた同期ビジネスロジックを `SpreadsheetService::syncRecipients()` に集約 |

### 推奨改善事項（未修正）

| # | ファイル | 内容 |
|---|---------|------|
| 1 | `resources/views/campaigns/create.blade.php` L74 | プレビュー欄の `x-html` ディレクティブに DOMPurify 等のサニタイズを追加することを推奨（現時点では認証済み管理者のみアクセス可能のため致命的なリスクではない） |
