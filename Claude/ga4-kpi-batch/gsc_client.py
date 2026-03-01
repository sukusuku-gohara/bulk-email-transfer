"""Google Search Console API クライアント — 検索パフォーマンス取得."""

import logging
from datetime import date, timedelta

from google.oauth2 import service_account
from googleapiclient.discovery import build

logger = logging.getLogger(__name__)

# SC データは通常 2〜3 日遅れで反映されるため、最新確定日を自動判定する
SC_DATA_LAG_DAYS = 3  # 安全マージン


def _build_service(credentials_path: str):
    """Search Console API サービスを構築."""
    creds = service_account.Credentials.from_service_account_file(
        credentials_path,
        scopes=["https://www.googleapis.com/auth/webmasters.readonly"],
    )
    return build("searchconsole", "v1", credentials=creds, cache_discovery=False)


# ── サイト別サマリ（日別） ────────────────────────────────────
def fetch_daily_summary(
    credentials_path: str,
    site_url: str,
    start_date: date,
    end_date: date,
) -> list[dict]:
    """日別の clicks / impressions / ctr / position を取得."""
    service = _build_service(credentials_path)
    resp = service.searchanalytics().query(
        siteUrl=site_url,
        body={
            "startDate": start_date.isoformat(),
            "endDate": end_date.isoformat(),
            "dimensions": ["date"],
            "rowLimit": 30,
        },
    ).execute()

    rows = []
    for row in resp.get("rows", []):
        rows.append({
            "date": row["keys"][0],
            "clicks": row["clicks"],
            "impressions": row["impressions"],
            "ctr": row["ctr"],
            "position": row["position"],
        })

    logger.info("GSC daily_summary: %s %s〜%s rows=%d", site_url, start_date, end_date, len(rows))
    return rows


# ── クエリ Top N ──────────────────────────────────────────────
def fetch_top_queries(
    credentials_path: str,
    site_url: str,
    start_date: date,
    end_date: date,
    limit: int = 15,
) -> list[dict]:
    """クリック数順でクエリ Top N を取得."""
    service = _build_service(credentials_path)
    resp = service.searchanalytics().query(
        siteUrl=site_url,
        body={
            "startDate": start_date.isoformat(),
            "endDate": end_date.isoformat(),
            "dimensions": ["query"],
            "rowLimit": limit,
            "orderBy": [{"fieldName": "clicks", "sortOrder": "DESCENDING"}],
        },
    ).execute()

    rows = []
    for row in resp.get("rows", []):
        rows.append({
            "query": row["keys"][0],
            "clicks": row["clicks"],
            "impressions": row["impressions"],
            "ctr": row["ctr"],
            "position": row["position"],
        })

    logger.info("GSC top_queries: %s %s〜%s rows=%d", site_url, start_date, end_date, len(rows))
    return rows


# ── クエリ比較（2期間） ──────────────────────────────────────
def fetch_query_comparison(
    credentials_path: str,
    site_url: str,
    current_start: date,
    current_end: date,
    prev_start: date,
    prev_end: date,
    limit: int = 100,
) -> list[dict]:
    """2 期間のクエリデータを取得し、クリック差分が大きい順に返す."""
    service = _build_service(credentials_path)

    periods = {
        "current": (current_start, current_end),
        "prev": (prev_start, prev_end),
    }
    data: dict[str, dict[str, dict]] = {}

    for key, (s, e) in periods.items():
        resp = service.searchanalytics().query(
            siteUrl=site_url,
            body={
                "startDate": s.isoformat(),
                "endDate": e.isoformat(),
                "dimensions": ["query"],
                "rowLimit": limit,
            },
        ).execute()
        data[key] = {row["keys"][0]: row for row in resp.get("rows", [])}

    # 差分計算
    all_queries = set(data["current"].keys()) | set(data["prev"].keys())
    diffs: list[dict] = []
    for q in all_queries:
        cur = data["current"].get(q, {"clicks": 0, "impressions": 0, "ctr": 0, "position": 0})
        prev = data["prev"].get(q, {"clicks": 0, "impressions": 0, "ctr": 0, "position": 0})
        click_diff = cur["clicks"] - prev["clicks"]
        diffs.append({
            "query": q,
            "clicks_current": cur["clicks"],
            "clicks_prev": prev["clicks"],
            "click_diff": click_diff,
            "position_current": cur.get("position", 0),
            "position_prev": prev.get("position", 0),
        })

    # クリック減少が大きい順
    diffs.sort(key=lambda x: x["click_diff"])
    logger.info("GSC query_comparison: %s rows=%d", site_url, len(diffs))
    return diffs


# ── 最新データ確定日を取得 ────────────────────────────────────
def get_latest_available_date(
    credentials_path: str,
    site_url: str,
) -> date | None:
    """SC で実際にデータが存在する最新日を返す."""
    service = _build_service(credentials_path)
    today = date.today()

    # 直近 5 日間を試して、データがある最新日を探す
    for lag in range(1, 6):
        d = today - timedelta(days=lag)
        resp = service.searchanalytics().query(
            siteUrl=site_url,
            body={
                "startDate": d.isoformat(),
                "endDate": d.isoformat(),
                "dimensions": ["date"],
                "rowLimit": 1,
            },
        ).execute()
        if resp.get("rows"):
            logger.info("GSC latest_date: %s → %s", site_url, d.isoformat())
            return d

    logger.warning("GSC latest_date: %s → データなし", site_url)
    return None


# ── query × page 比較 ────────────────────────────────────────
def fetch_query_page_comparison(
    credentials_path: str,
    site_url: str,
    current_date: date,
    prev_date: date,
    limit: int = 300,
) -> dict:
    """dimensions=["query","page"] で 2 日分を比較し、差分を返す.

    Returns:
        {
            "increases":    list[dict],   # click_diff > 0, desc
            "decreases":    list[dict],   # click_diff < 0, asc
            "opportunities": list[dict], # imp多×順位4-15×CTR低
        }
    """
    service = _build_service(credentials_path)

    def _fetch(d: date) -> dict[tuple, dict]:
        resp = service.searchanalytics().query(
            siteUrl=site_url,
            body={
                "startDate": d.isoformat(),
                "endDate": d.isoformat(),
                "dimensions": ["query", "page"],
                "rowLimit": limit,
            },
        ).execute()
        return {
            (row["keys"][0], row["keys"][1]): {
                "clicks": row["clicks"],
                "impressions": row["impressions"],
                "ctr": row["ctr"],
                "position": row["position"],
            }
            for row in resp.get("rows", [])
        }

    cur = _fetch(current_date)
    prev = _fetch(prev_date)

    diffs: list[dict] = []
    for query, page in set(cur.keys()) | set(prev.keys()):
        c = cur.get((query, page), {"clicks": 0, "impressions": 0, "ctr": 0.0, "position": 0.0})
        p = prev.get((query, page), {"clicks": 0, "impressions": 0, "ctr": 0.0, "position": 0.0})
        diffs.append({
            "query": query,
            "page": page,
            "clicks_current": c["clicks"],
            "clicks_prev": p["clicks"],
            "click_diff": c["clicks"] - p["clicks"],
            "impressions": c["impressions"],
            "ctr": c["ctr"],
            "position": c["position"],
        })

    increases = sorted([d for d in diffs if d["click_diff"] > 0], key=lambda x: -x["click_diff"])
    decreases = sorted([d for d in diffs if d["click_diff"] < 0], key=lambda x: x["click_diff"])
    # 広めに取得（pos 2-20, imp>=30）し、report_builder 側でスコアリングして絞り込む
    opportunities = sorted(
        [
            d for d in diffs
            if d["impressions"] >= 30 and 2.0 <= d["position"] <= 20.0
        ],
        key=lambda x: -x["impressions"],
    )

    logger.info(
        "GSC query_page_comparison: %s cur=%s diffs=%d inc=%d dec=%d opp=%d",
        site_url, current_date, len(diffs), len(increases), len(decreases), len(opportunities),
    )
    return {
        "increases": increases[:20],
        "decreases": decreases[:20],
        "opportunities": opportunities[:50],
    }


# ── まとめて取得する便利関数 ──────────────────────────────────
def fetch_sc_report(
    credentials_path: str,
    site_url: str,
) -> dict:
    """SC の日次レポートに必要なデータをまとめて取得.

    Returns:
        {
            "site_url": str,
            "latest_date": date | None,
            "daily_summary": list[dict],         # 直近7日の日別
            "top_queries": list[dict],            # 最新日のクエリ Top 15
            "declining_queries": list[dict],      # クリック減少クエリ Top 10
            "query_page_delta": dict,             # {increases, decreases, opportunities}
        }
    """
    latest = get_latest_available_date(credentials_path, site_url)
    _empty_qp = {"increases": [], "decreases": [], "opportunities": []}
    if latest is None:
        return {
            "site_url": site_url,
            "latest_date": None,
            "daily_summary": [],
            "top_queries": [],
            "declining_queries": [],
            "query_page_delta": _empty_qp,
        }

    prev_day = latest - timedelta(days=1)
    week_start = latest - timedelta(days=6)

    daily = fetch_daily_summary(credentials_path, site_url, week_start, latest)
    top_q = fetch_top_queries(credentials_path, site_url, latest, latest, limit=15)
    declining = fetch_query_comparison(
        credentials_path, site_url,
        current_start=latest, current_end=latest,
        prev_start=prev_day, prev_end=prev_day,
        limit=100,
    )
    qp_delta = fetch_query_page_comparison(
        credentials_path, site_url,
        current_date=latest,
        prev_date=prev_day,
        limit=300,
    )

    return {
        "site_url": site_url,
        "latest_date": latest,
        "daily_summary": daily,
        "top_queries": top_q,
        "declining_queries": [d for d in declining if d["click_diff"] < 0][:10],
        "query_page_delta": qp_delta,
    }
