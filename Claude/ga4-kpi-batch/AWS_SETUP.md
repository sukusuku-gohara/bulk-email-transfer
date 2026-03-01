# AWS Lambda への移行ガイド

GA4 日次レポートシステムを AWS Lambda で毎日9時に自動実行するための設定ガイドです。

---

## 前提条件

- AWS アカウントがあること
- AWS コンソールへのアクセス権限
- Google Cloud プロジェクト（GA4, GSC, Sheets API の認証情報）

---

## ステップ 1: Google サービスアカウント認証情報の準備

### 1.1 sa-key.json の内容を JSON 文字列に変換

現在のローカルファイル `/Users/kazuya/AIproduct/Claude/ga4-kpi-batch/sa-key.json` を JSON 文字列に変換します。

```bash
# ファイルの内容を1行のJSON文字列に変換（改行・スペースなし）
cat sa-key.json | jq -c '.' | tr '\n' ' '
```

または、以下のコマンドで確認：

```bash
cat sa-key.json
```

この出力をコピーしておきます（次のステップで使用）。

---

## ステップ 2: AWS Lambda 関数の作成

### 2.1 Lambda コンソールにアクセス

AWS マネジメントコンソール → Lambda → 「関数を作成」

### 2.2 関数の基本設定

| 項目 | 値 |
|------|-----|
| **関数名** | `ga4-kpi-batch` |
| **ランタイム** | `Python 3.12` |
| **アーキテクチャ** | `x86_64` |
| **実行ロール** | 「Lambda 用に新しいロールを作成」 |

**ロール名:** `ga4-kpi-batch-lambda-role`

### 2.3 関数作成後、デフォルトコードを削除

Lambda コンソール → コードエディタ → `lambda_function.py` の内容を削除

---

## ステップ 3: コードをアップロード

### 3.1 デプロイメント ZIP を作成

ローカルで以下を実行：

```bash
cd ~/AIproduct/Claude/ga4-kpi-batch

# 必要なパッケージをインストール
pip install -r requirements.txt -t python/

# ZIP ファイルを作成（Python モジュール + Lambda ハンドラー）
zip -r lambda_deployment.zip \
    lambda_handler.py \
    main.py \
    ga4_client.py \
    gsc_client.py \
    chatwork_client.py \
    report_builder.py \
    sheets_client.py \
    python/

# ファイルサイズを確認（50MB 以下であること）
ls -lh lambda_deployment.zip
```

### 3.2 ZIP をアップロード

Lambda コンソール → コード → 「.zip ファイルをアップロード」 → `lambda_deployment.zip` を選択

---

## ステップ 4: Lambda 環境変数を設定

### 方法 A: AWS CLI スクリプトで自動設定（推奨）

最も簡単な方法は、提供されているセットアップスクリプトを使用することです。

```bash
cd ~/AIproduct/Claude/ga4-kpi-batch

# スクリプトを実行
bash setup_lambda_env.sh
```

スクリプトが Chatwork API トークンを入力するよう促します。入力すると、すべての環境変数が自動的に設定されます。

### 方法 B: AWS コンソール手動設定

Lambda コンソール → 設定 → 環境変数 → 「編集」

以下の環境変数を追加：

| キー | 値 | 説明 |
|------|-----|------|
| `GOOGLE_CREDENTIALS_JSON` | `{"type":"service_account",...}` | sa-key.json の内容（JSON文字列） |
| `CHATWORK_API_TOKEN` | `<トークン>` | Chatwork API トークン |
| `CHATWORK_ROOM_ID` | `421983199` | 本番用 Chatwork ルーム ID |
| `GA4_PROPERTY_ID` | `374086323` | GA4 プロパティ ID |
| `SC_SITE_URLS` | `https://blockchaingame.jp/,https://news.blockchaingame.jp/` | GSC 対象サイト（カンマ区切り） |
| `OUTPUT_SHEET_ID` | `12W1b-BDg-...` | Google Sheets 出力先 ID |
| `TZ` | `Asia/Tokyo` | タイムゾーン |
| `MAX_CHATWORK_CHARS` | `6000` | Chatwork メッセージ最大文字数 |
| `MIN_GSC_IMP` | `30` | GSC 最小インプレッション数 |
| `MIN_GSC_CLICKS_SUM` | `2` | GSC 最小クリック合計 |
| `MIN_GSC_CLICK_DIFF` | `1` | GSC 最小クリック差分 |
| `MIN_GA4_SESSIONS` | `5` | GA4 最小セッション数 |
| `MIN_GA4_7D_AVG` | `15` | GA4 7日平均最小値 |
| `DROP_RATIO` | `0.6` | 急落検知比率 |
| `MIN_GA4_ABS_DROP` | `5` | GA4 最小絶対下落数 |
| `CTR_OPP_MIN_IMP` | `30` | CTR改善チャンス最小インプレッション |
| `CTR_OPP_POS_MIN` | `2` | CTR改善チャンス最小順位 |
| `CTR_OPP_POS_MAX` | `10` | CTR改善チャンス最大順位 |

#### GOOGLE_CREDENTIALS_JSON の値の取得方法

**方法 1: コマンドライン（コピペ用）**
```bash
cat ~/AIproduct/Claude/ga4-kpi-batch/sa-key.json | jq -c '.'
```

このコマンドで出力された1行の JSON 文字列をコピーして、Lambda コンソールの `GOOGLE_CREDENTIALS_JSON` に貼り付けます。

**方法 2: オンラインツール**
1. sa-key.json の内容をコピー
2. [JSON Minifier](https://www.minifiertools.com/json-minifier/) などのオンラインツールに貼り付け
3. 最小化されたJSON をコピー
4. Lambda コンソールに貼り付け

---

## ステップ 5: Lambda 実行ロールに Google API 権限を付与

（現在のセットアップではサービスアカウント認証を使用しているため、Lambda IAM ロールの変更は不要です）

ただし、CloudWatch Logs への書き込み権限は自動的に付与されているため、追加のポリシー設定は不要です。

---

## ステップ 6: Lambda 関数の基本設定を調整

Lambda コンソール → 設定 → 一般設定 → 「編集」

| 項目 | 値 | 理由 |
|------|-----|------|
| **タイムアウト** | `5分（300秒）` | 処理時間 20-44秒 + 余裕 |
| **メモリ** | `512 MB` | 十分な処理能力 |
| **リソースベースのポリシー** | — | EventBridge がトリガーするため、後で自動設定 |

---

## ステップ 7: テスト実行

### 7.1 Lambda コンソール上でテスト

Lambda コンソール → テスト タブ → 「テスト」

**テストイベント JSON:**
```json
{}
```

### 7.2 ログを確認

Lambda コンソール → CloudWatch ログ → `/aws/lambda/ga4-kpi-batch` を確認

以下のログが出力されていることを確認：
- "GA4 日次レポート開始"
- "GA4 日次レポート完了"
- Chatwork へのメッセージ送信成功

### 7.3 実際に Chatwork を確認

ルーム 421983199 に本日のレポートが投稿されているか確認

---

## ステップ 8: EventBridge でスケジュールを設定

### 8.1 EventBridge コンソールにアクセス

AWS マネジメントコンソール → EventBridge → ルール → 「ルールを作成」

### 8.2 ルールの設定

| 項目 | 値 |
|------|-----|
| **ルール名** | `ga4-kpi-batch-daily-9am` |
| **説明** | `毎日9時に GA4 日次レポートを実行` |
| **イベントバス** | `default` |
| **ルールタイプ** | `スケジュール式` |

### 8.3 スケジュール式を設定

**UTC 時刻に変換する必要があります：**

- 日本時間 9:00 = UTC 00:00（前日24時）

**スケジュール式：**
```
cron(0 0 ? * * *)
```

**解説：**
- `0` - 分（毎時刻）
- `0` - 時間（UTC 0時 = JST 9時）
- `?` - 日（毎日、? は月と曜日のどちらかが * の場合に使用）
- `*` - 月（毎月）
- `*` - 曜日（毎週）

### 8.4 ターゲットを設定

**ターゲット 1:**
- **AWS サービス:** Lambda 関数
- **関数:** `ga4-kpi-batch`
- **実行ロール:** 「EventBridge が新しい role を作成...」を選択

### 8.5 ルール作成

「ルール作成」をクリック

---

## ステップ 9: ローカル cron を削除

### 9.1 既存の cron エントリを削除

```bash
crontab -e
```

以下のエントリを削除：
```
0 9 * * * cd /Users/kazuya/AIproduct/Claude/ga4-kpi-batch && ./run.sh >> ...
```

---

## テスト検証チェックリスト

- [ ] Lambda テスト実行で status 200 を確認
- [ ] CloudWatch ログで「GA4 日次レポート完了」を確認
- [ ] Chatwork ルーム 421983199 にレポートが投稿されている
- [ ] EventBridge ルール「ga4-kpi-batch-daily-9am」が有効
- [ ] ローカル cron が削除されている

---

## トラブルシューティング

### Lambda 実行エラー：環境変数エラー

**エラーメッセージ:**
```
環境変数 GOOGLE_CREDENTIALS_JSON が設定されていません
```

**解決方法:**
- Lambda コンソール → 設定 → 環境変数を確認
- GOOGLE_CREDENTIALS_JSON が正しく設定されているか確認
- JSON 文字列が1行であるか確認

### Lambda タイムアウトエラー

**エラーメッセージ:**
```
Task timed out after 5.00 seconds
```

**解決方法:**
- Lambda タイムアウト時間を 5分 に設定（手順6を確認）
- ネットワーク遅延がないか確認（CloudWatch ログを確認）

### Chatwork メッセージが送信されない

**確認事項:**
- CHATWORK_API_TOKEN が正しく設定されているか
- CHATWORK_ROOM_ID が正しいか（本番用: 421983199）
- Chatwork API トークンの有効期限を確認

### CloudWatch ログが表示されない

**確認方法:**
```bash
# AWS CLI でログを確認
aws logs tail /aws/lambda/ga4-kpi-batch --follow
```

---

## モニタリング設定（オプション）

### CloudWatch アラームを設定

Lambda 関数が失敗した場合に通知を受け取る：

```bash
aws cloudwatch put-metric-alarm \
  --alarm-name ga4-kpi-batch-failures \
  --alarm-description "GA4 batch job failures" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 300 \
  --threshold 1 \
  --comparison-operator GreaterThanOrEqualToThreshold \
  --dimensions Name=FunctionName,Value=ga4-kpi-batch
```

---

## ロールバック計画

Lambda 移行後に問題が発生した場合：

### 元のローカル cron に戻す

1. ローカルで cron を再度設定：
   ```bash
   cd ~/AIproduct/Claude/ga4-kpi-batch
   # run.sh が存在することを確認
   ./run.sh
   ```

2. EventBridge ルール「ga4-kpi-batch-daily-9am」を削除

3. Lambda 関数「ga4-kpi-batch」は削除（または無効化）

---

## 次のステップ

- 毎日 CloudWatch ログを確認して正常に実行されているか確認
- 月1回程度、Chatwork のレポートが正しく送信されているか確認
- Google Sheets の出力が正しいか確認

お疲れ様でした！Lambda への移行が完了しました。🎉
