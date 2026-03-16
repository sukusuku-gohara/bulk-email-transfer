#!/bin/bash
# AWS Lambda 環境変数をセットアップするスクリプト
# 使用方法: bash setup_lambda_env.sh

set -e

# 設定値
LAMBDA_FUNCTION_NAME="ga4-kpi-batch"
CHATWORK_API_TOKEN="${CHATWORK_API_TOKEN}"  # 環境変数から取得
GA4_PROPERTY_ID="374086323"
SC_SITE_URLS="https://blockchaingame.jp/,https://news.blockchaingame.jp/"
OUTPUT_SHEET_ID="12W1b-BDg-smRWYqKmGqdmoKOswagbDQrlY7AKJ0BG-Q"

# sa-key.json を JSON 文字列に変換
GOOGLE_CREDENTIALS_JSON=$(cat sa-key.json | jq -c '.')

# JSON を 1行の文字列として正しくエスケープ
GOOGLE_CREDENTIALS_JSON_ESCAPED=$(echo "$GOOGLE_CREDENTIALS_JSON" | jq -Rs .)

echo "=== AWS Lambda 環境変数をセットアップ ==="
echo ""
echo "Lambda 関数: $LAMBDA_FUNCTION_NAME"
echo "GA4 プロパティ ID: $GA4_PROPERTY_ID"
echo ""

# 確認プロンプト
read -p "CHATWORK_API_TOKEN を入力してください: " CHATWORK_API_TOKEN

if [ -z "$CHATWORK_API_TOKEN" ]; then
  echo "❌ エラー: CHATWORK_API_TOKEN が指定されていません"
  exit 1
fi

# AWS CLI で環境変数を設定
aws lambda update-function-configuration \
  --function-name "$LAMBDA_FUNCTION_NAME" \
  --environment "Variables={
    GOOGLE_CREDENTIALS_JSON=$GOOGLE_CREDENTIALS_JSON,
    CHATWORK_API_TOKEN=$CHATWORK_API_TOKEN,
    CHATWORK_ROOM_ID=421983199,
    GA4_PROPERTY_ID=$GA4_PROPERTY_ID,
    SC_SITE_URLS=$SC_SITE_URLS,
    OUTPUT_SHEET_ID=$OUTPUT_SHEET_ID,
    TZ=Asia/Tokyo,
    MAX_CHATWORK_CHARS=6000,
    MIN_GSC_IMP=30,
    MIN_GSC_CLICKS_SUM=2,
    MIN_GSC_CLICK_DIFF=1,
    MIN_GA4_SESSIONS=5,
    MIN_GA4_7D_AVG=15,
    DROP_RATIO=0.6,
    MIN_GA4_ABS_DROP=5,
    CTR_OPP_MIN_IMP=30,
    CTR_OPP_POS_MIN=2,
    CTR_OPP_POS_MAX=10
  }"

echo ""
echo "✅ Lambda 環境変数を設定しました！"
echo ""
echo "確認："
aws lambda get-function-configuration \
  --function-name "$LAMBDA_FUNCTION_NAME" \
  | jq '.Environment.Variables'
