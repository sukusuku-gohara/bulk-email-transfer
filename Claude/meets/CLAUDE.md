# meets プロジェクト共通ルール

## プロジェクト概要
婚活マッチングプラットフォーム「meets」の開発プロジェクト。
Missing Middle層（マッチングアプリと結婚相談所の中間層）をターゲットとした、エージェント型マッチングサービス。

## 技術スタック
- **言語/FW**: PHP 8.3+ / Laravel 13
- **DB**: MySQL 8.0
- **フロント**: Blade + Tailwind CSS + Alpine.js
- **認証**: Laravel Sanctum（セッションベース、24時間タイムアウト）
- **CSRF**: PreventRequestForgery ミドルウェア（Laravel 13標準）
- **決済**: Stripe（Laravel Cashier）
- **ストレージ**: AWS S3（画像・証明書）
- **キュー**: Laravel Queue（Redis/database driver）+ Queue::route() で一元ルーティング
- **AI SDK**: Laravel AI SDK（将来のAIマッチング機能で活用予定）
- **外部API**: LINE Messaging API / Zoom API / eKYC SaaS

## 主要ユーザーロール（RBAC）
| ロール | 説明 |
|--------|------|
| member | 会員ユーザー（婚活利用者） |
| agent | エージェント（仲人・結婚相談所） |
| ambassador | アンバサダー（会員紹介者） |
| admin | プラットフォーム管理者 |

## コーディング規約

### 命名規則
- モデル: 単数形PascalCase（`User`, `MemberProfile`, `MeetingRequest`）
- テーブル: 複数形snake_case（`users`, `member_profiles`, `meeting_requests`）
- コントローラ: リソース名+Controller（`MeetingRequestController`）
- マイグレーション: `create_テーブル名_table` / `add_カラム名_to_テーブル名_table`
- FormRequest: 動詞+リソース+Request（`StoreMeetingRequestRequest`）
- Policy: モデル名+Policy（`MeetingRequestPolicy`）

### ID方式
- 全テーブルのPKはULID（`$table->ulid('id')->primary()`）
- FKもULID型で定義

### 共通カラム
- 全テーブルに `created_at`, `updated_at`（Laravelデフォルト）
- ソフトデリートが必要なテーブルのみ `deleted_at` を追加（bookmarksは物理削除）

### コメント・言語
- コード内コメントは日本語
- Gitコミットメッセージは日本語
- エラーメッセージはユーザー向けに日本語で返す
- API/変数名は英語

### ディレクトリ構成
```
app/
├── Http/
│   ├── Controllers/
│   │   ├── Member/        # 会員向け
│   │   ├── Agent/         # エージェント向け
│   │   ├── Ambassador/    # アンバサダー向け
│   │   └── Admin/         # 管理者向け
│   ├── Requests/          # FormRequest
│   └── Middleware/
├── Models/
├── Policies/
├── Services/              # ビジネスロジック
├── Events/
├── Listeners/
├── Jobs/                  # 非同期処理
├── Notifications/
└── Enums/                 # PHP Enum
```

### セキュリティ必須事項
- Eloquent ORMを必ず使用（生SQLは原則禁止）
- CSRF対策: PreventRequestForgery ミドルウェア（Laravel 13標準。Blade `@csrf` も引き続き使用）
- XSS対策: `{{ }}` でエスケープ（`{!! !!}` は原則禁止）
- 認可: `#[Authorize]` Attribute または Policy/Gate を使用
- バリデーション: 全入力にFormRequestを使用

### Laravel 13 PHP Attributes（推奨スタイル）
Laravel 13ではPHP Attributeによる宣言的な記述を推奨する。従来のプロパティ方式も動作するが、新規コードはAttribute構文で統一する。

```php
// ✅ Laravel 13推奨: Attribute構文
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Table('member_profiles')]
#[Fillable(['user_id', 'prefecture', 'height_cm', ...])]
class MemberProfile extends Model
{
    use HasUlids;
}

// ✅ コントローラ: Middleware/Authorize Attribute
use Illuminate\Routing\Attributes\Controllers\Middleware;
use Illuminate\Routing\Attributes\Controllers\Authorize;

#[Middleware(['auth', 'role:member'])]
class BookmarkController extends Controller
{
    #[Authorize('create', Bookmark::class)]
    public function store(StoreBookmarkRequest $request) { ... }
}

// ✅ ジョブ: Queue Attribute
use Illuminate\Queue\Attributes\Tries;
use Illuminate\Queue\Attributes\Timeout;

#[Tries(3)]
#[Timeout(120)]
class SendReminderNotification implements ShouldQueue { ... }
```

## 要件定義書の参照先
| ドキュメント | パス |
|-------------|------|
| 業務要件定義書 | `docs/meets_business_requirements.xlsx` |
| 要件仕様書 | `docs/meets_requirements_specification.xlsx` |
| 技術要件定義書 | `docs/meets_technical_requirements.xlsx` |
| ER図 | `docs/meets20260323.pdf` |
| DB設計フィードバック | `docs/meets_db_design_feedback_20260330.md` |
| DB修正指示 | `docs/meets_db_修正指示プロンプト.md` |

## Task実行時の共通ルール
- 作業開始前に対象の要件IDを明記する（例: BR-001, TR-079）
- 1つのTaskでは1機能（1〜3要件ID）に絞る
- ファイル作成後は必ず `php artisan test` でエラーがないことを確認
- 不明点がある場合は作業を止めて質問する
