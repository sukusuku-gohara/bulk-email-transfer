"""AWS Lambda ハンドラー — GA4 日次レポートの Lambda 実行用エントリーポイント.

Lambda 環境で実行される際のエントリーポイント。
EventBridge のスケジュールトリガーから毎日9時に実行される。
"""

import json
import logging
import os
import sys

# Lambda が実行される環境を示す環境変数を設定
# これを GOOGLE_APPLICATION_CREDENTIALS の処理で使用
ENVIRONMENT = os.environ.get("ENVIRONMENT", "lambda")

# ── ログ設定 ──────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


def setup_google_credentials() -> str:
    """Lambda 環境変数から Google サービスアカウント認証情報を取得し、
    一時ファイルとして /tmp/ に書き込む.

    Returns:
        str: 書き込まれた認証情報ファイルのパス
    """
    # Lambda 環境変数から JSON 文字列を取得
    credentials_json_str = os.environ.get("GOOGLE_CREDENTIALS_JSON", "")

    if not credentials_json_str:
        raise ValueError(
            "環境変数 GOOGLE_CREDENTIALS_JSON が設定されていません。"
            "Lambda コンソールで sa-key.json の内容を JSON 文字列として設定してください。"
        )

    # JSON 文字列を解析（バリデーション）
    try:
        credentials_dict = json.loads(credentials_json_str)
    except json.JSONDecodeError as e:
        raise ValueError(f"GOOGLE_CREDENTIALS_JSON の JSON 解析に失敗しました: {e}") from e

    # /tmp/ ディレクトリに一時ファイルとして書き込み
    creds_path = "/tmp/sa-key.json"
    try:
        with open(creds_path, "w", encoding="utf-8") as f:
            json.dump(credentials_dict, f)
        logger.info("認証情報を一時ファイルに書き込みました: %s", creds_path)
    except IOError as e:
        raise IOError(f"認証情報ファイルの書き込みに失敗しました: {e}") from e

    return creds_path


def lambda_handler(event: dict, context: object) -> dict:
    """AWS Lambda ハンドラー関数.

    Args:
        event: EventBridge から送信されるイベント（実際には使用しない）
        context: Lambda コンテキストオブジェクト

    Returns:
        dict: Lambda が期待するレスポンス形式 {statusCode, body}
    """
    logger.info("=== Lambda ハンドラー起動 ===")
    logger.info("Request ID: %s", context.request_id if context else "N/A")

    try:
        # ── 1. Google 認証情報をセットアップ ───────────────────
        logger.info("(1) Google 認証情報をセットアップ中...")
        creds_path = setup_google_credentials()

        # 環境変数 GOOGLE_APPLICATION_CREDENTIALS を設定
        os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = creds_path
        logger.info("GOOGLE_APPLICATION_CREDENTIALS を設定しました: %s", creds_path)

        # ── 2. main.py の処理を実行 ─────────────────────────────
        logger.info("(2) GA4 日次レポート処理を実行中...")

        # main.py から関数をインポート（動的インポート可能にするため）
        from main import run_daily_report

        run_daily_report()

        logger.info("=== Lambda ハンドラー完了（正常） ===")

        return {
            "statusCode": 200,
            "body": json.dumps({"message": "GA4 daily report generated successfully"}),
        }

    except ValueError as e:
        logger.error("[環境設定エラー] %s", e)
        return {
            "statusCode": 400,
            "body": json.dumps({"error": f"環境設定エラー: {str(e)}"}),
        }
    except IOError as e:
        logger.error("[ファイル操作エラー] %s", e)
        return {
            "statusCode": 500,
            "body": json.dumps({"error": f"ファイル操作エラー: {str(e)}"}),
        }
    except Exception as e:
        logger.exception("[予期しないエラー] %s", str(e))
        return {
            "statusCode": 500,
            "body": json.dumps({"error": f"エラーが発生しました: {str(e)}"}),
        }
    finally:
        # ── 3. クリーンアップ ─────────────────────────────────
        creds_path = "/tmp/sa-key.json"
        if os.path.exists(creds_path):
            try:
                os.remove(creds_path)
                logger.info("一時認証情報ファイルを削除しました")
            except OSError as e:
                logger.warning("一時認証情報ファイルの削除に失敗しました: %s", e)


# ── ローカル実行用（開発・デバッグ用） ───────────────────────
if __name__ == "__main__":
    # ローカルテスト用：GOOGLE_CREDENTIALS_JSON を設定して実行
    # 例：
    #   GOOGLE_CREDENTIALS_JSON='{"type":"service_account",...}' python lambda_handler.py

    class MockContext:
        """Lambda コンテキストのモック（ローカル実行用）."""

        request_id = "local-test-request-id"

    result = lambda_handler({}, MockContext())
    print(json.dumps(result, indent=2, ensure_ascii=False))
    sys.exit(0 if result["statusCode"] == 200 else 1)
