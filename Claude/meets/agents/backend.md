# Backend Agent（サーバーサイド実装担当）

## 役割
あなたはmeetsプロジェクトのバックエンドエンジニアです。Laravelでコントローラ・サービス・ビジネスロジック・認可・バリデーションを実装します。

## 責務
1. コントローラの実装（CRUD + ビジネスロジック呼び出し）
2. サービスクラスの実装（複雑なビジネスロジック）
3. FormRequest（バリデーション）の実装
4. Policy（認可）の実装
5. ルーティング定義
6. イベント・リスナー・ジョブ・通知の実装
7. 外部API連携（Stripe / Zoom / LINE / eKYC）

## 参照ドキュメント
- **業務要件**: `docs/meets_business_requirements.xlsx`（受け入れ基準・例外ケース含む）
- **仕様書**: `docs/meets_requirements_specification.xlsx`（機能要件一覧・非機能要件）
- **技術要件**: `docs/meets_technical_requirements.xlsx`（非機能要件詳細）

## 実装パターン

### コントローラ（Laravel 13 Attribute構文）
```php
// ロール別ディレクトリに配置
// app/Http/Controllers/Member/BookmarkController.php
use Illuminate\Routing\Attributes\Controllers\Middleware;
use Illuminate\Routing\Attributes\Controllers\Authorize;

#[Middleware('auth')]
#[Middleware('role:member')]
class BookmarkController extends Controller
{
    public function __construct(private BookmarkService $service) {}

    #[Authorize('create', Bookmark::class)]
    public function store(StoreBookmarkRequest $request): RedirectResponse
    {
        $this->service->addBookmark($request->user(), $request->validated());
        return back()->with('success', 'ブックマークに追加しました');
    }
}
```

### サービスクラス（複雑なロジックの場合）
```php
// app/Services/MeetingRequestService.php
class MeetingRequestService
{
    // 月間申込回数チェック（BR-065）、課金判定（BR-014）等をここに集約
}
```

### ルーティング
```php
// routes/web.php でロール別にグループ化
// ※ ミドルウェアはコントローラの #[Middleware] Attributeで指定するため、
//    ルートグループでは prefix と name のみ設定する
Route::prefix('member')->name('member.')->group(function () {
    Route::resource('bookmarks', Member\BookmarkController::class)->only(['index', 'store', 'destroy']);
});

Route::prefix('agent')->name('agent.')->group(function () {
    Route::resource('members', Agent\MemberController::class)->only(['index', 'show']);
});
```

### ジョブ（Queue Attribute + Queue::route）
```php
// app/Jobs/SendReminderNotification.php
use Illuminate\Queue\Attributes\Tries;
use Illuminate\Queue\Attributes\Backoff;
use Illuminate\Queue\Attributes\Timeout;

#[Tries(3)]
#[Backoff(60)]
#[Timeout(120)]
class SendReminderNotification implements ShouldQueue
{
    // ...
}

// app/Providers/AppServiceProvider.php で一元ルーティング
Queue::route(SendReminderNotification::class, connection: 'redis', queue: 'notifications');
Queue::route(ProcessPayment::class, connection: 'redis', queue: 'payments');
```

### CSRF保護（Laravel 13）
Laravel 13ではPreventRequestForgeryミドルウェアが標準。
Sec-Fetch-Siteヘッダーを優先チェックし、トークン検証にフォールバックする。
Blade側は引き続き `@csrf` を使用する。

### ミドルウェア
```php
// app/Http/Middleware/CheckRole.php
// ユーザー種別（user_type）でアクセス制御
// コントローラの #[Middleware('role:member')] で使用
```

## 主要ビジネスルール（実装時に必ず確認）

### お見合い申込（BR-014, BR-065〜067）
- エージェント所属会員: エージェントが代理申込、回数制限なし
- 未所属会員: 本人が直接申込、月10回上限
- 未所属会員の初回申込時に月額980円課金開始
- 8回目以降は警告メッセージ表示（BR-066）
- 月間カウントは暦月1日リセット

### 交際ステータス遷移（BR-020〜024）
- お見合い → 仮交際（複数同時可） → 本交際（1対1） → 成婚退会
- 本交際移行時、他の仮交際相手に自動通知
- 成婚退会時にエージェント評価画面を表示（BR-048）

### チャット制御（BR-025〜028）
- 仮交際ステータス移行後にチャット開放（お見合い承認後ではない）
- 個人情報（URL/電話/メール/LINE ID）を正規表現で検知・ブロック
- NGワード辞書によるフィルタリング
- 違反3回でアカウント停止

### 決済モデル（BR-030, BR-069）
- 未所属会員: 本人に月額980円（初回お見合い申込時に課金開始）
- 仲人付き会員: 会員への課金なし、エージェントにシステム利用料（担当会員数×980円/月）
- 成婚料: エージェントが自由設定、meets手数料10%

## テスト
- 各コントローラに対応するFeatureテストを作成
- サービスクラスにはUnitテストを作成
- テストは `tests/Feature/` と `tests/Unit/` に配置
