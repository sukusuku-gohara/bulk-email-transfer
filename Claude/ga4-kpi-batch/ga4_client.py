"""GA4 Data API クライアント — レポート取得関数群."""

import logging
from datetime import date, timedelta

from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import (
    DateRange,
    Dimension,
    Filter,
    FilterExpression,
    Metric,
    OrderBy,
    RunReportRequest,
)

logger = logging.getLogger(__name__)


# ── 汎用 runReport ラッパー ──────────────────────────────────
def run_report(
    property_id: str,
    start_date: str,
    end_date: str,
    dimensions: list[str],
    metrics: list[str],
    *,
    dimension_filter: FilterExpression | None = None,
    order_by: list[OrderBy] | None = None,
    limit: int = 0,
) -> list[dict]:
    """GA4 Data API の runReport を実行し、行ごとの辞書リストを返す.

    将来 exchange_click / exchange_promo_view 等のイベント集計を追加する際は
    dimension_filter に FilterExpression を渡して利用する。
    """
    client = BetaAnalyticsDataClient(transport="rest")

    request = RunReportRequest(
        property=f"properties/{property_id}",
        date_ranges=[DateRange(start_date=start_date, end_date=end_date)],
        dimensions=[Dimension(name=d) for d in dimensions],
        metrics=[Metric(name=m) for m in metrics],
    )
    if dimension_filter is not None:
        request.dimension_filter = dimension_filter
    if order_by is not None:
        request.order_bys = order_by
    if limit > 0:
        request.limit = limit

    response = client.run_report(request)

    rows: list[dict] = []
    dim_headers = [h.name for h in response.dimension_headers]
    met_headers = [h.name for h in response.metric_headers]

    for row in response.rows:
        entry: dict = {}
        for header, val in zip(dim_headers, row.dimension_values):
            entry[header] = val.value
        for header, val in zip(met_headers, row.metric_values):
            entry[header] = val.value
        rows.append(entry)

    logger.info("run_report: %s〜%s dims=%s rows=%d", start_date, end_date, dimensions, len(rows))
    return rows


# ── (1) 全体 KPI ─────────────────────────────────────────────
OVERALL_METRICS = [
    "sessions",
    "activeUsers",
    "screenPageViews",
    "engagedSessions",
    "engagementRate",
]


def fetch_overall_kpi(property_id: str, target_date: date) -> dict:
    """指定日の全体 KPI を取得して 1 行分の辞書を返す."""
    d = target_date.strftime("%Y-%m-%d")
    rows = run_report(
        property_id=property_id,
        start_date=d,
        end_date=d,
        dimensions=["date"],
        metrics=OVERALL_METRICS,
    )
    return rows[0] if rows else {}


def fetch_overall_kpi_range(property_id: str, start: date, end: date) -> list[dict]:
    """日付範囲の全体 KPI を日別で取得（7 日平均計算用）."""
    return run_report(
        property_id=property_id,
        start_date=start.strftime("%Y-%m-%d"),
        end_date=end.strftime("%Y-%m-%d"),
        dimensions=["date"],
        metrics=OVERALL_METRICS,
    )


# ── (2) チャネル別 ───────────────────────────────────────────
def fetch_channel_report(property_id: str, target_date: date, limit: int = 10) -> list[dict]:
    """チャネル別セッション（上位 N）."""
    d = target_date.strftime("%Y-%m-%d")
    return run_report(
        property_id=property_id,
        start_date=d,
        end_date=d,
        dimensions=["sessionDefaultChannelGrouping"],
        metrics=["sessions", "engagementRate"],
        order_by=[
            OrderBy(metric=OrderBy.MetricOrderBy(metric_name="sessions"), desc=True),
        ],
        limit=limit,
    )


def fetch_channel_sessions_for_date(property_id: str, target_date: date) -> dict[str, int]:
    """指定日のチャネル別セッション数を {channel: sessions} で返す（比較用）."""
    rows = fetch_channel_report(property_id, target_date, limit=0)
    return {r["sessionDefaultChannelGrouping"]: int(r["sessions"]) for r in rows}


# ── (3) LP 別 ────────────────────────────────────────────────
def fetch_lp_report(
    property_id: str,
    target_date: date,
    limit: int = 10,
    *,
    path_contains: str | None = None,
) -> list[dict]:
    """LP 別セッション（上位 N）.

    path_contains を渡すと landingPagePlusQueryString に contains フィルタを適用。
    戻り値の各 dict には pageTitle キーも含まれる（最多セッションのタイトルを採用）。
    """
    d = target_date.strftime("%Y-%m-%d")

    dim_filter = None
    if path_contains:
        dim_filter = FilterExpression(
            filter=Filter(
                field_name="landingPagePlusQueryString",
                string_filter=Filter.StringFilter(
                    match_type=Filter.StringFilter.MatchType.CONTAINS,
                    value=path_contains,
                ),
            )
        )

    # 1) パスのみでセッション集計（正確な集計値）
    lp_rows = run_report(
        property_id=property_id,
        start_date=d,
        end_date=d,
        dimensions=["landingPagePlusQueryString"],
        metrics=["sessions", "screenPageViews", "engagementRate"],
        dimension_filter=dim_filter,
        order_by=[
            OrderBy(metric=OrderBy.MetricOrderBy(metric_name="sessions"), desc=True),
        ],
        limit=limit,
    )

    # 2) パス + タイトルでタイトル対応表を取得（セッション降順→同一パス内で最多タイトルが先頭）
    lp_title_rows = run_report(
        property_id=property_id,
        start_date=d,
        end_date=d,
        dimensions=["landingPagePlusQueryString", "pageTitle"],
        metrics=["sessions"],
        dimension_filter=dim_filter,
        order_by=[
            OrderBy(metric=OrderBy.MetricOrderBy(metric_name="sessions"), desc=True),
        ],
        limit=200,  # タイトル分割で行が増えるため多めに取得
    )

    # パス → タイトル のマッピング（最もセッションが多いタイトルを採用）
    path_to_title: dict[str, str] = {}
    for row in lp_title_rows:
        path = row.get("landingPagePlusQueryString", "")
        if path not in path_to_title:
            path_to_title[path] = row.get("pageTitle", "")

    # 3) タイトルをマージ
    for row in lp_rows:
        path = row.get("landingPagePlusQueryString", "")
        row["pageTitle"] = path_to_title.get(path, "")

    return lp_rows


# ── (4) LP デルタ ─────────────────────────────────────────────
def _fetch_lp_sessions_dict(
    property_id: str,
    target_date: date,
    limit: int = 50,
) -> dict[str, dict]:
    """LP 別セッション/PV/ER を {path: row} で返す（内部ヘルパー）."""
    d = target_date.strftime("%Y-%m-%d")
    rows = run_report(
        property_id=property_id,
        start_date=d,
        end_date=d,
        dimensions=["landingPagePlusQueryString"],
        metrics=["sessions", "screenPageViews", "engagementRate"],
        order_by=[
            OrderBy(metric=OrderBy.MetricOrderBy(metric_name="sessions"), desc=True),
        ],
        limit=limit,
    )
    return {r["landingPagePlusQueryString"]: r for r in rows}


def fetch_lp_delta(
    property_id: str,
    yesterday: date,
    day_before: date,
    limit: int = 50,
) -> list[dict]:
    """昨日 vs 一昨日の LP 別 Δsessions/ΔPV を返す（Δsessions 降順）.

    各 row: {path, sessions_cur, sessions_prev, delta_sessions,
              pv_cur, pv_prev, delta_pv, er_cur, top_channel, pageTitle}
    top_channel / pageTitle は呼び出し元で補完する。
    """
    cur_map = _fetch_lp_sessions_dict(property_id, yesterday, limit=limit)
    prev_map = _fetch_lp_sessions_dict(property_id, day_before, limit=limit)

    deltas: list[dict] = []
    for path in set(cur_map.keys()) | set(prev_map.keys()):
        cur = cur_map.get(path, {})
        prev = prev_map.get(path, {})
        s_cur = int(float(cur.get("sessions", 0)))
        s_prev = int(float(prev.get("sessions", 0)))
        pv_cur = int(float(cur.get("screenPageViews", 0)))
        pv_prev = int(float(prev.get("screenPageViews", 0)))
        er_cur = float(cur.get("engagementRate", 0))
        deltas.append({
            "path": path,
            "sessions_cur": s_cur,
            "sessions_prev": s_prev,
            "delta_sessions": s_cur - s_prev,
            "pv_cur": pv_cur,
            "pv_prev": pv_prev,
            "delta_pv": pv_cur - pv_prev,
            "er_cur": er_cur,
            "top_channel": "",   # main.py で fetch_lp_channel_delta から補完
            "pageTitle": "",     # main.py で lp_rows から補完
        })

    deltas.sort(key=lambda x: x["delta_sessions"], reverse=True)
    return deltas


def fetch_lp_channel_delta(
    property_id: str,
    yesterday: date,
    day_before: date,
    limit: int = 100,
) -> dict[str, str]:
    """各 LP で Δsessions が最大のチャネル名を返す. Returns: {path: channel_name}"""

    def _fetch(d: date) -> dict[tuple, int]:
        ds = d.strftime("%Y-%m-%d")
        rows = run_report(
            property_id=property_id,
            start_date=ds,
            end_date=ds,
            dimensions=["landingPagePlusQueryString", "sessionDefaultChannelGrouping"],
            metrics=["sessions"],
            limit=limit,
        )
        return {
            (r["landingPagePlusQueryString"], r["sessionDefaultChannelGrouping"]): int(float(r.get("sessions", 0)))
            for r in rows
        }

    cur = _fetch(yesterday)
    prev = _fetch(day_before)

    path_ch_delta: dict[str, dict[str, int]] = {}
    for path, ch in set(cur.keys()) | set(prev.keys()):
        delta = cur.get((path, ch), 0) - prev.get((path, ch), 0)
        path_ch_delta.setdefault(path, {})[ch] = delta

    return {
        path: max(ch_map, key=lambda c: ch_map[c])
        for path, ch_map in path_ch_delta.items()
    }


# ── (5) LP 7日平均セッション ─────────────────────────────────
def fetch_lp_7d_avg(
    property_id: str,
    start_date: date,
    end_date: date,
    limit: int = 200,
) -> dict[str, float]:
    """7 日間の LP 別平均セッション数を返す. Returns: {path: avg_sessions_per_day}"""
    n_days = max(1, (end_date - start_date).days + 1)
    rows = run_report(
        property_id=property_id,
        start_date=start_date.strftime("%Y-%m-%d"),
        end_date=end_date.strftime("%Y-%m-%d"),
        dimensions=["landingPagePlusQueryString"],
        metrics=["sessions"],
        order_by=[
            OrderBy(metric=OrderBy.MetricOrderBy(metric_name="sessions"), desc=True),
        ],
        limit=limit,
    )
    result = {
        r["landingPagePlusQueryString"]: round(float(r.get("sessions", 0)) / n_days, 2)
        for r in rows
    }
    logger.info("fetch_lp_7d_avg: %s〜%s rows=%d", start_date, end_date, len(result))
    return result


# ── 将来拡張: イベント集計 ────────────────────────────────────
# def fetch_event_report(property_id, target_date, event_name, ...):
#     """exchange_click / exchange_promo_view 等のイベント集計.
#
#     dimension_filter で eventName == event_name を指定し、
#     customEvent:exchange_id 等のカスタム dimension で分割する。
#     """
#     pass
#
# def fetch_exchange_revenue_report(...):
#     """取引所成果CSV取り込み後、subid/invite_code で join して
#     EPC / CVR / 取引高 / 報酬をまとめるレポート（次フェーズ）。
#     """
#     pass
