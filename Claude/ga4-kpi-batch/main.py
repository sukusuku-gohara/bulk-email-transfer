"""GA4 日次レポートバッチ — エントリーポイント.

ローカル実行:
    python main.py

AWS Lambda:
    lambda_handler.py から呼び出される
"""

import logging
import os
import sys
from datetime import date, timedelta

from google.api_core.exceptions import PermissionDenied
from google.auth.exceptions import DefaultCredentialsError

from chatwork_client import ChatworkError, send_message
from ga4_client import (
    OVERALL_METRICS,
    fetch_channel_report,
    fetch_channel_sessions_for_date,
    fetch_lp_channel_delta,
    fetch_lp_delta,
    fetch_lp_7d_avg,
    fetch_lp_report,
    fetch_overall_kpi,
    fetch_overall_kpi_range,
)
from gsc_client import fetch_sc_report
from report_builder import (
    build_article_health,
    build_comparisons,
    build_tasks,
    calc_7d_avg,
    detect_alerts,
    format_chatwork_summary_v2,
)

# ── ログ設定 ──────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

# ── 環境変数 ──────────────────────────────────────────────────
GA4_PROPERTY_ID   = os.environ.get("GA4_PROPERTY_ID", "374086323")
CHATWORK_API_TOKEN = os.environ.get("CHATWORK_API_TOKEN", "")
CHATWORK_ROOM_ID  = os.environ.get("CHATWORK_ROOM_ID", "")
SC_SITE_URLS      = os.environ.get("SC_SITE_URLS", "")
SC_CREDENTIALS    = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS", "")
OUTPUT_SHEET_ID   = os.environ.get("OUTPUT_SHEET_ID", "")
MAX_CHATWORK_CHARS = int(os.environ.get("MAX_CHATWORK_CHARS", "6000"))


# ── コア処理 ──────────────────────────────────────────────────
def run_daily_report() -> None:
    """GA4 + GSC からデータを取得し、レポートを生成して Chatwork に投稿する."""

    yesterday  = date.today() - timedelta(days=1)
    day_before = yesterday - timedelta(days=1)
    week_start = yesterday - timedelta(days=7)
    week_end   = yesterday - timedelta(days=1)  # 直近7日 = 2〜8日前

    logger.info("=== GA4 日次レポート開始: %s ===", yesterday.isoformat())

    # ── 1. GA4 全体 KPI ───────────────────────────────────────
    logger.info("(1) 全体 KPI 取得中...")
    kpi_yesterday = fetch_overall_kpi(GA4_PROPERTY_ID, yesterday)
    kpi_day_before = fetch_overall_kpi(GA4_PROPERTY_ID, day_before)
    kpi_7d_rows = fetch_overall_kpi_range(GA4_PROPERTY_ID, week_start, week_end)

    # ── 2. チャネル別 ─────────────────────────────────────────
    logger.info("(2) チャネル別取得中...")
    channel_rows = fetch_channel_report(GA4_PROPERTY_ID, yesterday, limit=10)
    channel_day_before = fetch_channel_sessions_for_date(GA4_PROPERTY_ID, day_before)

    # ── 3. LP 別 ──────────────────────────────────────────────
    logger.info("(3) LP 別取得中...")
    lp_rows = fetch_lp_report(GA4_PROPERTY_ID, yesterday, limit=10)

    # ── 3b. LP 7日平均（急落検知用） ──────────────────────────
    logger.info("(3b) LP 7日平均取得中...")
    lp_7d_avg = fetch_lp_7d_avg(GA4_PROPERTY_ID, week_start, week_end, limit=200)

    # ── 4. LP デルタ ──────────────────────────────────────────
    logger.info("(4) LP デルタ取得中...")
    lp_delta = fetch_lp_delta(GA4_PROPERTY_ID, yesterday, day_before, limit=50)

    # ── 5. LP × チャネル デルタ ───────────────────────────────
    logger.info("(5) LP × チャネル デルタ取得中...")
    lp_ch_map = fetch_lp_channel_delta(GA4_PROPERTY_ID, yesterday, day_before, limit=100)

    # top_channel / pageTitle を lp_delta に補完
    path_title_from_lp = {
        r.get("landingPagePlusQueryString", ""): r.get("pageTitle", "")
        for r in lp_rows
    }
    for row in lp_delta:
        row["top_channel"] = lp_ch_map.get(row["path"], "")
        row["pageTitle"]   = path_title_from_lp.get(row["path"], "")

    # ── 6. Search Console ─────────────────────────────────────
    sc_reports: list[dict] = []
    if SC_SITE_URLS and SC_CREDENTIALS:
        for site_url in [u.strip() for u in SC_SITE_URLS.split(",") if u.strip()]:
            logger.info("(6) Search Console 取得中: %s", site_url)
            try:
                sc_reports.append(fetch_sc_report(SC_CREDENTIALS, site_url))
            except Exception as e:
                logger.warning("Search Console 取得失敗 (%s): %s", site_url, e)
    else:
        logger.info("SC_SITE_URLS 未設定。Search Console セクションをスキップ。")

    # ── 7. 比較・異常検知 ─────────────────────────────────────
    avg_7d = calc_7d_avg(kpi_7d_rows, OVERALL_METRICS)
    comparisons = build_comparisons(kpi_yesterday, kpi_day_before, avg_7d, OVERALL_METRICS)

    organic_yesterday: int | None = None
    organic_day_before: int | None = None
    for row in channel_rows:
        if row.get("sessionDefaultChannelGrouping") == "Organic Search":
            organic_yesterday = int(float(row.get("sessions", 0)))
            break
    organic_day_before = channel_day_before.get("Organic Search")
    alerts = detect_alerts(comparisons, organic_yesterday, organic_day_before)

    # ── 8. 健康診断・タスク生成 ───────────────────────────────
    health = build_article_health(lp_rows)
    tasks  = build_tasks(lp_rows, lp_delta, sc_reports, health, lp_7d_avg=lp_7d_avg)

    # ── 9. Spreadsheet 出力（任意）────────────────────────────
    sheet_url: str | None = None
    if OUTPUT_SHEET_ID and SC_CREDENTIALS:
        try:
            from sheets_client import write_daily_report as write_sheets
            sheet_url = write_sheets(
                sheet_id=OUTPUT_SHEET_ID,
                credentials_path=SC_CREDENTIALS,
                report_date=yesterday,
                lp_delta=lp_delta,
                health=health,
                sc_reports=sc_reports,
                tasks=tasks,
            )
            logger.info("Spreadsheet 出力完了: %s", sheet_url)
        except Exception as e:
            logger.warning("Spreadsheet 出力失敗（スキップ）: %s", e)

    # ── 10. レポート整形（v2）────────────────────────────────
    report_text = format_chatwork_summary_v2(
        report_date=yesterday,
        comparisons=comparisons,
        lp_rows=lp_rows,
        lp_delta=lp_delta,
        tasks=tasks,
        health=health,
        sc_reports=sc_reports if sc_reports else None,
        sheet_url=sheet_url,
        max_chars=MAX_CHATWORK_CHARS,
    )
    logger.info("レポート生成完了（%d 文字）", len(report_text))
    print(report_text)

    # ── 11. Chatwork 送信 ─────────────────────────────────────
    if not CHATWORK_API_TOKEN or not CHATWORK_ROOM_ID:
        logger.warning("CHATWORK_API_TOKEN / CHATWORK_ROOM_ID が未設定。送信スキップ。")
        return

    send_message(CHATWORK_API_TOKEN, CHATWORK_ROOM_ID, report_text)
    logger.info("=== GA4 日次レポート完了 ===")


# ── エントリーポイント ────────────────────────────────────────
if __name__ == "__main__":
    try:
        run_daily_report()
    except DefaultCredentialsError as e:
        logger.error("[認証エラー] サービスアカウントの認証情報が見つかりません: %s", e)
        sys.exit(1)
    except PermissionDenied as e:
        logger.error("[権限エラー] GA4 プロパティへのアクセスが拒否されました: %s", e)
        sys.exit(1)
    except ChatworkError as e:
        logger.error("[Chatwork送信エラー] %s", e)
        sys.exit(1)
    except Exception as e:
        logger.error("[予期しないエラー] %s: %s", type(e).__name__, e)
        sys.exit(1)
