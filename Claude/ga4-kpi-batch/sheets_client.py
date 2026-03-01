"""Google Sheets クライアント — 日次レポート詳細の書き込み.

OUTPUT_SHEET_ID 環境変数が設定されている場合のみ呼び出される。
サービスアカウントに対象スプレッドシートの「編集者」権限が必要。
"""

import logging
from datetime import date

from google.oauth2 import service_account
from googleapiclient.discovery import build

logger = logging.getLogger(__name__)

_SCOPE = "https://www.googleapis.com/auth/spreadsheets"


def _build_service(credentials_path: str):
    creds = service_account.Credentials.from_service_account_file(
        credentials_path, scopes=[_SCOPE]
    )
    return build("sheets", "v4", credentials=creds, cache_discovery=False)


def _ensure_tab(service, sheet_id: str, tab_name: str) -> None:
    """タブが存在しない場合は作成する."""
    meta = service.spreadsheets().get(spreadsheetId=sheet_id).execute()
    existing = {s["properties"]["title"] for s in meta.get("sheets", [])}
    if tab_name not in existing:
        service.spreadsheets().batchUpdate(
            spreadsheetId=sheet_id,
            body={"requests": [{"addSheet": {"properties": {"title": tab_name}}}]},
        ).execute()
        logger.info("Sheets: タブ作成 '%s'", tab_name)


def append_rows(
    sheet_id: str,
    tab_name: str,
    header: list[str],
    rows: list[list],
    credentials_path: str,
) -> None:
    """指定タブに行を追加。タブが空の場合はヘッダ行も先頭に追加する."""
    if not rows:
        return

    service = _build_service(credentials_path)
    _ensure_tab(service, sheet_id, tab_name)

    # A1 が空 → ヘッダを先頭に付加
    existing = service.spreadsheets().values().get(
        spreadsheetId=sheet_id,
        range=f"{tab_name}!A1",
    ).execute()
    payload = ([header] + rows) if not existing.get("values") else rows

    service.spreadsheets().values().append(
        spreadsheetId=sheet_id,
        range=f"{tab_name}!A1",
        valueInputOption="USER_ENTERED",
        insertDataOption="INSERT_ROWS",
        body={"values": payload},
    ).execute()
    logger.info("Sheets: '%s' に %d 行追記", tab_name, len(payload))


def write_daily_report(
    sheet_id: str,
    credentials_path: str,
    report_date: date,
    lp_delta: list[dict],
    health: dict,
    sc_reports: list[dict],
    tasks: list[dict],
) -> str:
    """4 タブ（LP増減分析 / 記事健康診断 / 検索クエリ増減 / タスク）に書き込む.

    Returns: スプレッドシートの URL
    """
    ds = report_date.isoformat()

    # ── LP増減分析 ─────────────────────────────────────────────
    append_rows(
        sheet_id, "LP増減分析",
        header=[
            "日付", "パス", "セッション(当日)", "セッション(前日)", "Δセッション",
            "PV(当日)", "PV(前日)", "ΔPV", "ER(当日)", "主要チャネル", "記事タイトル",
        ],
        rows=[
            [
                ds, r["path"],
                r["sessions_cur"], r["sessions_prev"], r["delta_sessions"],
                r["pv_cur"], r["pv_prev"], r["delta_pv"],
                f"{r['er_cur']:.4f}",
                r.get("top_channel", ""),
                r.get("pageTitle", "")[:80],
            ]
            for r in lp_delta
        ],
        credentials_path=credentials_path,
    )

    # ── 記事健康診断 ───────────────────────────────────────────
    health_rows: list[list] = []
    for category, rows in health.items():
        for r in rows:
            health_rows.append([
                ds, category,
                r.get("landingPagePlusQueryString", ""),
                r.get("pageTitle", "")[:80],
                int(float(r.get("sessions", 0))),
                f"{float(r.get('engagementRate', 0)):.4f}",
            ])
    append_rows(
        sheet_id, "記事健康診断",
        header=["日付", "カテゴリ", "パス", "記事タイトル", "セッション", "ER"],
        rows=health_rows,
        credentials_path=credentials_path,
    )

    # ── 検索クエリ増減 ─────────────────────────────────────────
    qp_rows: list[list] = []
    for sc in sc_reports:
        site = sc.get("site_url", "")
        qp = sc.get("query_page_delta", {})
        for entry in qp.get("increases", [])[:20] + qp.get("decreases", [])[:20]:
            qp_rows.append([
                ds, site,
                entry.get("query", ""),
                entry.get("page", ""),
                entry.get("clicks_current", 0),
                entry.get("clicks_prev", 0),
                entry.get("click_diff", 0),
                entry.get("impressions", 0),
                f"{entry.get('ctr', 0):.4f}",
                f"{entry.get('position', 0):.1f}",
            ])
    append_rows(
        sheet_id, "検索クエリ増減",
        header=[
            "日付", "サイト", "クエリ", "ページ",
            "クリック(当日)", "クリック(前日)", "Δクリック",
            "インプレッション", "CTR", "掲載順位",
        ],
        rows=qp_rows,
        credentials_path=credentials_path,
    )

    # ── タスク ─────────────────────────────────────────────────
    append_rows(
        sheet_id, "タスク",
        header=[
            "日付", "優先度", "所要時間(分)",
            "対象URL", "理由", "チェックリスト", "タイトル",
        ],
        rows=[
            [
                ds,
                t["priority"],
                t["est_minutes"],
                t["target_url"],
                t["reason"],
                " / ".join(t.get("checklist", [])),
                t.get("title", ""),
            ]
            for t in tasks
        ],
        credentials_path=credentials_path,
    )

    return f"https://docs.google.com/spreadsheets/d/{sheet_id}"
