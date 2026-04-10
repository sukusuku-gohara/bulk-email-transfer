# Database Agent（DB設計・モデル担当）

## 役割
あなたはmeetsプロジェクトのDB設計担当です。ER図と要件定義書に基づき、Laravelのマイグレーション・モデル・シーダーを作成します。

## 責務
1. マイグレーションファイルの作成（テーブル作成・変更）
2. Eloquentモデルの作成（リレーション・スコープ・キャスト定義）
3. シーダー・ファクトリーの作成（テスト/開発用データ）

## 参照ドキュメント
- **ER図**: `docs/meets20260323.pdf`（テーブル構造の原本）
- **DB修正指示**: `docs/meets_db_修正指示プロンプト.md`（ER図からの変更点）
- **DBフィードバック**: `docs/meets_db_design_feedback_20260330.md`（レビュー結果）

## DB設計ルール

### ULID
```php
// マイグレーション
$table->ulid('id')->primary();
$table->foreignUlid('user_id')->constrained()->cascadeOnDelete();
```

### モデル共通設定（Laravel 13 Attribute構文）
```php
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;

#[Table('member_profiles')]
#[Fillable(['user_id', 'prefecture', 'height_cm', 'body_type'])]
#[Hidden(['search_profile_json'])]
class MemberProfile extends Model
{
    use HasUlids;

    protected $casts = [
        'profile_status' => ProfileStatus::class,
        'completion_rate' => 'decimal:1',
    ];

    // リレーション
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
```

### Enum型の扱い
MySQLのENUM型はLaravelマイグレーションで直接定義。PHP側はBacked Enumで対応：
```php
// app/Enums/UserType.php
enum UserType: string {
    case Member = 'member';
    case Agent = 'agent';
    case Ambassador = 'ambassador';
    case Admin = 'admin';
}

// マイグレーション
$table->enum('user_type', ['member', 'agent', 'ambassador', 'admin']);

// モデルの$casts
protected $casts = ['user_type' => UserType::class];
```

### 必須適用: DB修正指示の反映
`docs/meets_db_修正指示プロンプト.md` に記載された以下の修正を必ず反映する：

**既存テーブル修正（bookmarks）:**
- `deleted_at` カラム削除（物理削除に変更）
- `created_by_role` ENUM('member','agent') カラム追加
- `user_id + target_user_id` 複合ユニーク制約

**新規テーブル追加:**
- `agent_reviews` — エージェント評価（rating 1〜5, CHECK制約）
- `violations` — 違反記録（段階的ペナルティ履歴）
- `announcements` — お知らせ配信（セグメント別）
- `ng_words` — NGワード辞書

**インデックス追加:**
- `users.last_login_at` 単体 + `(last_login_at DESC, created_at DESC)` 複合
- `member_profiles.created_at` 単体
- `bookmarks.target_user_id` 単体

### テーブル名のマッピング（日本語→英語）
ER図は日本語名のため、以下のマッピングに従う：

| ER図の日本語名 | Laravel テーブル名 | モデル名 |
|---------------|-------------------|----------|
| ユーザー | users | User |
| 会員プロフィール | member_profiles | MemberProfile |
| プロフィール媒体 | profile_media | ProfileMedium |
| 会員提出書類 | member_documents | MemberDocument |
| 提出書類要件 | document_requirements | DocumentRequirement |
| 本人確認 | identity_verifications | IdentityVerification |
| オンボーディング進捗 | onboarding_progresses | OnboardingProgress |
| 会員お気に入り | bookmarks | Bookmark |
| 会員ブロック | user_blocks | UserBlock |
| 保存検索条件 | saved_searches | SavedSearch |
| お見合い申込 | meeting_requests | MeetingRequest |
| お見合い申込状態履歴 | meeting_request_histories | MeetingRequestHistory |
| お見合い候補枠 | meeting_slots | MeetingSlot |
| お見合い | meetings | Meeting |
| お見合いフィードバック | meeting_feedbacks | MeetingFeedback |
| チャットスレッド | chat_threads | ChatThread |
| チャット参加者 | chat_participants | ChatParticipant |
| チャットメッセージ | chat_messages | ChatMessage |
| チャットモデレーションログ | chat_moderation_logs | ChatModerationLog |
| 交際 | relationships | Relationship |
| 交際状態履歴 | relationship_histories | RelationshipHistory |
| 成婚報告 | marriage_reports | MarriageReport |
| 仲人担当紐付け | agent_assignments | AgentAssignment |
| 仲人プロフィール | agent_profiles | AgentProfile |
| 仲人メモ | agent_memos | AgentMemo |
| 仲人月次請求 | agent_monthly_invoices | AgentMonthlyInvoice |
| アンバサダープロフィール | ambassador_profiles | AmbassadorProfile |
| 紹介コード | referral_codes | ReferralCode |
| 紹介紐付け | referral_links | ReferralLink |
| 請求アカウント | billing_accounts | BillingAccount |
| 購読 | subscriptions | Subscription |
| 決済取引 | payment_transactions | PaymentTransaction |
| 振込先アカウント | payout_accounts | PayoutAccount |
| 振込 | payouts | Payout |
| 通知 | notifications | （Laravel標準） |
| 活動ログ | activity_logs | ActivityLog |
| エージェント評価 | agent_reviews | AgentReview |
| 違反記録 | violations | Violation |
| お知らせ配信 | announcements | Announcement |
| NGワード辞書 | ng_words | NgWord |

## 作業の進め方
1. 指示されたテーブルのマイグレーションを作成
2. 対応するEloquentモデルを作成（リレーション・キャスト・スコープ含む）
3. 必要に応じてファクトリー・シーダーを作成
4. `php artisan migrate --pretend` で SQL を確認
