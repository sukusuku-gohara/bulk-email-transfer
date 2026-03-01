# GA4 Daily KPI Report Batch

GA4 Data API で昨日分の KPI を取得し、前日比・7日平均比・簡易異常検知付きの日次レポートを **Chatwork** に自動投稿するバッチ。

## ファイル構成

```
ga4-kpi-batch/
├── main.py              # エントリーポイント（CLI / Cloud Run HTTP）
├── ga4_client.py        # GA4 Data API 取得関数
├── report_builder.py    # 比較計算・異常検知・テキスト整形
├── chatwork_client.py   # Chatwork API 送信
├── requirements.txt     # 依存パッケージ
├── Dockerfile           # Cloud Run 用
└── README.md
```

## 環境変数一覧

| 変数名 | 必須 | 説明 | デフォルト |
|---|---|---|---|
| `GA4_PROPERTY_ID` | △ | GA4 プロパティ ID | `374086323` |
| `GOOGLE_APPLICATION_CREDENTIALS` | ○(ローカル) | サービスアカウント JSON パス | — |
| `CHATWORK_API_TOKEN` | ○ | Chatwork API トークン | — |
| `CHATWORK_ROOM_ID` | ○ | Chatwork 投稿先ルーム ID | — |
| `TZ` | △ | タイムゾーン | `Asia/Tokyo` |
| `PORT` | △ | HTTP サーバポート（Cloud Run） | `8080` |

## ローカル実行

```bash
cd ga4-kpi-batch

# venv 作成 & 有効化
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# 環境変数設定
export GOOGLE_APPLICATION_CREDENTIALS=./sa-key.json
export CHATWORK_API_TOKEN=your_token
export CHATWORK_ROOM_ID=your_room_id
export TZ=Asia/Tokyo

# 実行
python main.py
```

## Cloud Run デプロイ

```bash
PROJECT_ID=your-gcp-project-id
REGION=asia-northeast1
SERVICE_NAME=ga4-kpi-report
SA_EMAIL=your-sa@${PROJECT_ID}.iam.gserviceaccount.com

# 1. Secret Manager にシークレットを作成
echo -n "YOUR_CHATWORK_TOKEN" | \
  gcloud secrets create chatwork-api-token --data-file=-

# サービスアカウント JSON も Secret に格納する場合
gcloud secrets create ga-sa-key --data-file=sa-key.json

# 2. Cloud Run にデプロイ
gcloud run deploy ${SERVICE_NAME} \
  --source . \
  --region ${REGION} \
  --service-account ${SA_EMAIL} \
  --no-allow-unauthenticated \
  --set-env-vars="GA4_PROPERTY_ID=374086323,CHATWORK_ROOM_ID=422667353,TZ=Asia/Tokyo" \
  --set-secrets="CHATWORK_API_TOKEN=chatwork-api-token:latest" \
  --set-secrets="/secrets/sa-key.json=ga-sa-key:latest" \
  --set-env-vars="GOOGLE_APPLICATION_CREDENTIALS=/secrets/sa-key.json"
```

## Cloud Scheduler 設定

```bash
# 毎朝 09:00 JST に Cloud Run を叩く
gcloud scheduler jobs create http ga4-daily-report \
  --location ${REGION} \
  --schedule "0 9 * * *" \
  --time-zone "Asia/Tokyo" \
  --uri "https://${SERVICE_NAME}-xxxx-an.a.run.app/run" \
  --http-method POST \
  --oidc-service-account-email ${SA_EMAIL}
```

## レポート構成

1. **全体 KPI** — sessions / activeUsers / screenPageViews / engagedSessions / engagementRate（前日比・7日平均比付き）
2. **チャネル Top 10** — sessionDefaultChannelGrouping 別の sessions と engagementRate
3. **LP Top 10** — landingPagePlusQueryString 別の sessions / PV / engagementRate
4. **アラート** — sessions 前日比 -15% 以下、Organic -20% 以下、engagementRate -10% 以下
5. **改善アクション** — アラートに応じた固定テンプレート（将来 LLM 化予定）

## 将来拡張

- `ga4_client.py` に `fetch_event_report()` を追加 → exchange_click / exchange_promo_view 集計
- 取引所成果 CSV 取り込み → subid/invite_code で join → 収益レポート
- LLM による改善アクションの自動生成
