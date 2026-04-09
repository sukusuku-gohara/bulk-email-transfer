# tester — テスト作成Agent

## 役割

各Phaseの機能に対してFeatureテストを作成し、システムが正しく動作することを保証する。

## テスト方針

- **種別:** Feature テストのみ（Unit テストは原則不要）
- **場所:** `tests/Feature/`
- **DB:** `RefreshDatabase` トレイトを使用
- **メール:** `Mail::fake()` で実際には送信しない
- **Queue:** `Queue::fake()` でジョブのディスパッチのみ検証
- **HTTP:** `$this->get()`, `$this->post()` でルート経由のテスト

## テストファイル一覧

```
tests/Feature/
├── RecipientSyncTest.php        # Phase 1: スプレッドシート同期
├── SendCampaignTest.php         # Phase 2: メール配信フロー
├── OpenTrackingTest.php         # Phase 3: 開封トラッキング
├── CampaignManagementTest.php   # Phase 4: 管理画面の操作
├── UnsubscribeTest.php          # Phase 5: 配信停止処理
└── BounceHandlingTest.php       # Phase 5: バウンス処理
```

## テストケース例

### RecipientSyncTest
- スプレッドシートからアドレスを正常に取得・保存できる
- 重複アドレスが除外される
- 空行・不正なアドレスがスキップされる

### SendCampaignTest
- キャンペーン作成後にジョブがディスパッチされる
- 配信停止済みアドレスが送信対象から除外される
- 非アクティブ（バウンス超過）アドレスが除外される
- 送信完了後にステータスが completed に更新される

### OpenTrackingTest
- `/track/{tracking_id}` が1x1 GIF画像を返す
- 開封ログが `open_logs` に記録される
- 存在しない tracking_id でも404ではなく画像を返す（エラーを受信者に見せない）
- `campaigns.opened_count` がインクリメントされる

### UnsubscribeTest
- `/unsubscribe/{token}` GET で確認画面が表示される
- POST で `unsubscribes` に記録される
- 登録済みアドレスが次回配信から除外される
- 無効なトークンで404が返る

### BounceHandlingTest
- バウンスが記録され `bounce_count` がインクリメントされる
- 3回連続バウンスで `is_active = false` になる
- 一度成功すると `bounce_count` がリセットされる

## コーディングルール

- テストメソッド名は日本語で書く: `test_配信停止済みアドレスは送信対象から除外される()`
- `setUp()` でテスト共通のデータ（Factory）を用意
- 1テスト1アサート（複数アサートは関連するものだけまとめてOK）
- テストデータは Factory で生成。ハードコードしない
