"""レポート生成 — 比較計算・異常検知・Chatwork 向けテキスト整形."""

import logging
import math
import os
from datetime import date

logger = logging.getLogger(__name__)

# ── 比較・異常検知の閾値 ──────────────────────────────────────
ALERT_RULES: list[dict] = [
    {
        "metric": "sessions",
        "label": "Sessions",
        "prev_threshold": -15.0,
        "action": "流入減：リファラー元（SNS/広告/検索）を確認、Search Consoleで主要クエリの順位変動をチェック",
    },
    {
        "metric": "engagementRate",
        "label": "Engagement Rate",
        "prev_threshold": -10.0,
        "action": "エンゲージメント低下：直近公開ページの表示速度・コンテンツ品質を確認、離脱率の高いページを特定",
    },
]

ORGANIC_ALERT_THRESHOLD = -20.0  # Organic Search sessions 前日比


# ── ユーティリティ ────────────────────────────────────────────
def _safe_float(value: str | float | int) -> float:
    try:
        return float(value)
    except (ValueError, TypeError):
        return 0.0


def _pct_change(current: float, base: float) -> float | None:
    """パーセント変化率を返す。base が 0 なら None."""
    if base == 0:
        return None
    return round((current - base) / base * 100, 1)


def _fmt_pct(pct: float | None) -> str:
    if pct is None:
        return "N/A"
    sign = "+" if pct >= 0 else ""
    return f"{sign}{pct}%"


def _fmt_rate(value: float) -> str:
    """engagementRate は 0〜1 → % 表示."""
    return f"{value * 100:.1f}%"


# ── 7 日平均の計算 ────────────────────────────────────────────
def calc_7d_avg(rows_7d: list[dict], metrics: list[str]) -> dict[str, float]:
    """7 日分の行から各 metric の平均を算出."""
    if not rows_7d:
        return {m: 0.0 for m in metrics}
    totals = {m: 0.0 for m in metrics}
    for row in rows_7d:
        for m in metrics:
            totals[m] += _safe_float(row.get(m, 0))
    n = len(rows_7d)
    return {m: round(totals[m] / n, 4) for m in metrics}


# ── 比較データ構築 ────────────────────────────────────────────
def build_comparisons(
    yesterday: dict,
    day_before: dict,
    avg_7d: dict[str, float],
    metrics: list[str],
) -> dict[str, dict]:
    """各 metric について current / prev / 7d_avg / pct を返す."""
    result: dict[str, dict] = {}
    for m in metrics:
        cur = _safe_float(yesterday.get(m, 0))
        prev = _safe_float(day_before.get(m, 0))
        avg = avg_7d.get(m, 0.0)
        result[m] = {
            "current": cur,
            "prev": prev,
            "avg_7d": avg,
            "pct_vs_prev": _pct_change(cur, prev),
            "pct_vs_7d": _pct_change(cur, avg),
        }
    return result


# ── 異常検知 ──────────────────────────────────────────────────
def detect_alerts(
    comparisons: dict[str, dict],
    organic_sessions_yesterday: int | None = None,
    organic_sessions_day_before: int | None = None,
) -> list[str]:
    """ルールベースでアラート文字列のリストを返す."""
    alerts: list[str] = []

    for rule in ALERT_RULES:
        m = rule["metric"]
        comp = comparisons.get(m)
        if comp and comp["pct_vs_prev"] is not None:
            if comp["pct_vs_prev"] <= rule["prev_threshold"]:
                alerts.append(
                    f'{rule["label"]} が前日比 {_fmt_pct(comp["pct_vs_prev"])}（閾値 {rule["prev_threshold"]}%）'
                )

    # Organic Search sessions
    if organic_sessions_yesterday is not None and organic_sessions_day_before is not None:
        pct = _pct_change(organic_sessions_yesterday, organic_sessions_day_before)
        if pct is not None and pct <= ORGANIC_ALERT_THRESHOLD:
            alerts.append(
                f"Organic Search Sessions が前日比 {_fmt_pct(pct)}（閾値 {ORGANIC_ALERT_THRESHOLD}%）"
            )

    return alerts


# ── 改善アクション（ルールベース固定文） ──────────────────────
def build_actions(
    alerts: list[str],
    sc_reports: list[dict] | None = None,
) -> list[str]:
    """アラート内容 + SC データに応じた改善アクション文を返す.

    将来は LLM でパーソナライズする予定。今回は固定テンプレート。
    """
    actions: list[str] = []

    for alert in alerts:
        if "Sessions" in alert and "Organic" not in alert:
            actions.append(
                "流入減：リファラー元（SNS/広告/検索）を確認、"
                "Search Consoleで主要クエリの順位/CTR変動をチェック"
            )
        if "Organic" in alert:
            actions.append(
                "Organic減：Search Consoleで主要クエリの順位変動を確認、"
                "落ちたLPの更新有無・インデックス状況・表示速度をチェック"
            )
        if "Engagement" in alert:
            actions.append(
                "エンゲージメント低下：直近更新ページの表示速度・コンテンツ品質を確認、"
                "離脱率の高いページを特定して内部リンク・関連記事導線を改善"
            )

    # SC データに基づく改善アクション
    if sc_reports:
        for sc in sc_reports:
            site_label = sc.get("site_url", "").replace("https://", "").rstrip("/")
            declining = sc.get("declining_queries", [])
            if declining:
                top_declined = declining[0]
                actions.append(
                    f"[{site_label}] クエリ「{top_declined['query']}」のクリック減少 "
                    f"({top_declined['clicks_prev']}→{top_declined['clicks_current']})："
                    f"該当ページのコンテンツ鮮度・タイトル/ディスクリプション・内部リンクを見直し"
                )

            # 平均順位の悪化チェック
            daily = sc.get("daily_summary", [])
            if len(daily) >= 2:
                latest_pos = daily[-1]["position"]
                prev_pos = daily[-2]["position"]
                if latest_pos - prev_pos >= 1.0:
                    actions.append(
                        f"[{site_label}] 平均順位が {prev_pos:.1f}→{latest_pos:.1f} に悪化："
                        f"インデックス状況・被リンク・コアウェブバイタルを確認"
                    )

    if not actions and not alerts:
        actions.append("大きな異常なし。定常モニタリングを継続。")

    return list(dict.fromkeys(actions))  # 重複排除（順序保持）


# ── Chatwork 投稿用テキスト整形 ───────────────────────────────
def format_report(
    report_date: date,
    comparisons: dict[str, dict],
    channel_rows: list[dict],
    lp_rows: list[dict],
    alerts: list[str],
    actions: list[str],
    sc_reports: list[dict] | None = None,
) -> str:
    """Chatwork 投稿用のテキストを生成."""

    lines: list[str] = []

    # ヘッダ
    lines.append(f"[info][title]【GA4 日次レポート】{report_date.isoformat()}（JST）[/title]")

    # ■全体KPI
    lines.append("■全体KPI（昨日）")

    metric_labels = {
        "sessions": "Sessions",
        "activeUsers": "Users",
        "screenPageViews": "PV",
        "engagedSessions": "Engaged Sessions",
        "engagementRate": "Engagement Rate",
    }

    for m, label in metric_labels.items():
        comp = comparisons.get(m, {})
        cur = comp.get("current", 0)
        pct_prev = _fmt_pct(comp.get("pct_vs_prev"))
        pct_7d = _fmt_pct(comp.get("pct_vs_7d"))

        if m == "engagementRate":
            val_str = _fmt_rate(cur)
        else:
            val_str = f"{int(cur):,}"

        lines.append(f"  - {label}: {val_str}（前日比 {pct_prev} / 7日平均比 {pct_7d}）")

    # ■チャネル Top
    lines.append("")
    lines.append("■チャネル Top（Sessions）")
    for i, row in enumerate(channel_rows, 1):
        ch = row.get("sessionDefaultChannelGrouping", "?")
        sess = int(_safe_float(row.get("sessions", 0)))
        er = _fmt_rate(_safe_float(row.get("engagementRate", 0)))
        lines.append(f"  {i}) {ch}: {sess:,}（ER {er}）")

    # ■LP Top
    lines.append("")
    lines.append("■LP Top（Sessions）")
    for i, row in enumerate(lp_rows, 1):
        lp = row.get("landingPagePlusQueryString", "?")
        title = row.get("pageTitle", "")
        sess = int(_safe_float(row.get("sessions", 0)))
        pv = int(_safe_float(row.get("screenPageViews", 0)))
        er = _fmt_rate(_safe_float(row.get("engagementRate", 0)))
        # タイトルが長すぎる場合は40文字で切る
        title_short = (title[:40] + "…") if len(title) > 40 else title
        display_title = f"「{title_short}」" if title_short else ""
        lines.append(f"  {i}) {lp} {display_title}: {sess:,}（PV {pv:,} / ER {er}）")

    # ■Search Console
    if sc_reports:
        lines.append("")
        lines.append("■Search Console（検索パフォーマンス）")
        for sc in sc_reports:
            site_url = sc.get("site_url", "")
            latest = sc.get("latest_date")
            # サイト名を短縮表示
            site_label = site_url.replace("https://", "").rstrip("/")

            if latest is None:
                lines.append(f"  [{site_label}] データ未反映")
                continue

            lines.append(f"  [{site_label}] データ: {latest.isoformat()}")

            # 日別サマリ（直近3日）
            daily = sc.get("daily_summary", [])
            if daily:
                recent = daily[-3:] if len(daily) >= 3 else daily
                for d in recent:
                    lines.append(
                        f"    {d['date']}: clicks={d['clicks']:,}  "
                        f"imp={d['impressions']:,}  "
                        f"CTR={d['ctr']:.1%}  "
                        f"順位={d['position']:.1f}"
                    )

            # クエリ Top 10
            top_q = sc.get("top_queries", [])
            if top_q:
                lines.append(f"  [{site_label}] クエリ Top 10")
                for i, q in enumerate(top_q[:10], 1):
                    lines.append(
                        f"    {i:2}) \"{q['query']}\"  "
                        f"clicks={q['clicks']}  "
                        f"CTR={q['ctr']:.1%}  "
                        f"順位={q['position']:.1f}"
                    )

            # クリック減少クエリ
            declining = sc.get("declining_queries", [])
            if declining:
                lines.append(f"  [{site_label}] クリック減少クエリ")
                for d in declining[:5]:
                    lines.append(
                        f"    \"{d['query']}\"  "
                        f"{d['clicks_prev']}→{d['clicks_current']}（{d['click_diff']:+d}）"
                    )

    # ■アラート
    if alerts:
        lines.append("")
        lines.append("■アラート")
        for a in alerts:
            lines.append(f"  ⚠ {a}")

    # ■今日の改善アクション
    lines.append("")
    lines.append("■今日の改善アクション")
    for act in actions:
        lines.append(f"  - {act}")

    lines.append("[/info]")

    return "\n".join(lines)


# ═══════════════════════════════════════════════════════════════
# v2: 意思決定レポート（健康診断・タスク・LP デルタ）
# ═══════════════════════════════════════════════════════════════

# ── 健康診断の閾値（定数で調整可） ────────────────────────────
HEALTH_HIGH_SESSIONS: int = 20   # sessions ≥ → "高sessions"
HEALTH_HIGH_ER: float = 0.45     # engagementRate ≥ → "高ER"

# ── GSC ノイズフィルタ閾値 ─────────────────────────────────────
MIN_GSC_IMP        = int(os.environ.get("MIN_GSC_IMP",        "100"))
MIN_GSC_CLICKS_SUM = int(os.environ.get("MIN_GSC_CLICKS_SUM", "3"))
MIN_GSC_CLICK_DIFF = int(os.environ.get("MIN_GSC_CLICK_DIFF", "2"))

# ── GA4 急落フィルタ閾値 ──────────────────────────────────────
MIN_GA4_SESSIONS = int(os.environ.get("MIN_GA4_SESSIONS",  "20"))
MIN_GA4_7D_AVG   = int(os.environ.get("MIN_GA4_7D_AVG",    "50"))
DROP_RATIO       = float(os.environ.get("DROP_RATIO",      "0.6"))
MIN_GA4_ABS_DROP = int(os.environ.get("MIN_GA4_ABS_DROP",  "30"))

# ── CTR改善チャンス閾値 ────────────────────────────────────────
CTR_OPP_MIN_IMP = int(os.environ.get("CTR_OPP_MIN_IMP",  "500"))
CTR_OPP_POS_MIN = float(os.environ.get("CTR_OPP_POS_MIN", "2"))
CTR_OPP_POS_MAX = float(os.environ.get("CTR_OPP_POS_MAX", "10"))

# ── 期待 CTR テーブル ──────────────────────────────────────────
EXPECTED_CTR: dict[int, float] = {
    1: 0.28, 2: 0.16, 3: 0.11, 4: 0.08, 5: 0.06,
    6: 0.05, 7: 0.04, 8: 0.035, 9: 0.03, 10: 0.025,
}
_EXPECTED_CTR_DEFAULT = 0.02  # 11位以降


def _expected_ctr(position: float) -> float:
    """掲載順位から期待 CTR を返す."""
    pos_int = max(1, min(10, round(position)))
    return EXPECTED_CTR.get(pos_int, _EXPECTED_CTR_DEFAULT)


def _lp_label(path: str, title: str, max_path: int = 25, max_title: int = 25) -> str:
    """LP 表示ラベルを組み立てる（path + タイトル短縮）."""
    short_path = (path[:max_path] + "…") if len(path) > max_path else path
    if title:
        short_title = (title[:max_title] + "…") if len(title) > max_title else title
        return f"{short_path}「{short_title}」"
    return short_path


def build_article_health(lp_rows: list[dict]) -> dict:
    """LP をルールベースで S/A/B/C に健康分類.

    S=win  (高sessions & 高ER) → 勝ち記事
    A=rewrite     (高sessions & 低ER) → 要リライト
    B=distribute  (低sessions & 高ER) → 露出改善
    C=zombie      (低sessions & 低ER) → 整理候補

    Returns: {"win": [...], "rewrite": [...], "distribute": [...], "zombie": [...]}
    """
    result: dict[str, list] = {"win": [], "rewrite": [], "distribute": [], "zombie": []}
    for row in lp_rows:
        sess = int(float(row.get("sessions", 0)))
        er = float(row.get("engagementRate", 0))
        high_sess = sess >= HEALTH_HIGH_SESSIONS
        high_er = er >= HEALTH_HIGH_ER
        if high_sess and high_er:
            result["win"].append(row)
        elif high_sess:
            result["rewrite"].append(row)
        elif high_er:
            result["distribute"].append(row)
        else:
            result["zombie"].append(row)
    return result


def build_tasks(
    lp_rows: list[dict],
    lp_delta: list[dict],
    sc_reports: list[dict],
    health: dict,
    lp_7d_avg: dict[str, float] | None = None,
) -> list[dict]:
    """改善タスクリストをスコアリング（影響度×信頼度）で生成.

    タスク種別（優先順）:
        (1) CTR改善チャンス (P0) — GSC imp高×順位2-10×CTR<期待値
        (2) 強いページの急落  (P0) — GA4 7日平均比で大きく下落
        (3) 順位押し上げ      (P1) — GSC imp高×順位8-20×clicks高

    戻り値: P0スコア降順 + P1スコア降順
    Chatwork表示は _build_cw_v2 にて P0[:2]+P1[:3] に絞る
    """
    _lp7d = lp_7d_avg or {}
    candidates: list[dict] = []

    # ─ (1) CTR改善チャンス (P0) ─────────────────────────────────
    for sc in sc_reports:
        site = sc.get("site_url", "").rstrip("/")
        for d in sc.get("query_page_delta", {}).get("opportunities", []):
            imp = d.get("impressions", 0)
            pos = d.get("position", 99.0)
            ctr = d.get("ctr", 0.0)
            clicks_sum = d.get("clicks_current", 0) + d.get("clicks_prev", 0)

            if imp < CTR_OPP_MIN_IMP:
                continue
            if not (CTR_OPP_POS_MIN <= pos <= CTR_OPP_POS_MAX):
                continue
            exp_ctr = _expected_ctr(pos)
            if ctr >= exp_ctr:
                continue

            impact     = imp * max(0.0, exp_ctr - ctr)
            confidence = math.log1p(imp) * min(1.0, clicks_sum / 10.0)
            score      = impact * confidence
            if score <= 0:
                continue

            path = d["page"].replace(site, "") or "/"
            candidates.append({
                "priority": "P0", "_score": score,
                "est_minutes": 30,
                "target_url": path,
                "reason": (
                    f"imp {imp:,} / 順位 {pos:.1f} / CTR {ctr:.1%}"
                    f"（期待値 {exp_ctr:.1%}）"
                ),
                "checklist": [
                    "タイトルに検索意図キーワードを追加",
                    "ディスクリプションをクリック訴求力のある文に",
                    "冒頭に検索クエリへの回答を明示",
                    "FAQ・構造化データを追加",
                ],
                "title": f"CTR改善: {d['query'][:28]}",
            })

    # ─ (2) 強いページの急落 (P0) ─────────────────────────────────
    for d in lp_delta:
        path  = d["path"]
        s_cur = d["sessions_cur"]
        s_7d  = _lp7d.get(path, 0.0)

        if s_cur < MIN_GA4_SESSIONS:
            continue
        if s_7d < MIN_GA4_7D_AVG:
            continue
        abs_drop = s_7d - s_cur
        if abs_drop < MIN_GA4_ABS_DROP:
            continue
        if s_cur >= DROP_RATIO * s_7d:
            continue

        impact     = abs_drop
        confidence = math.log1p(s_7d)
        score      = impact * confidence

        ch    = d.get("top_channel", "")
        title = d.get("pageTitle", "")
        candidates.append({
            "priority": "P0", "_score": score,
            "est_minutes": 30,
            "target_url": path,
            "reason": (
                f"昨日 {s_cur}sess（7日平均 {s_7d:.0f} / {s_cur / s_7d:.0%}）"
                + (f" / {ch}" if ch else "")
            ),
            "checklist": [
                "Search Consoleでクリック/imp/順位変動を確認",
                "インデックス・クロール状況を確認",
                "外部リンク・SNS流入の変動を確認",
                "ページ表示速度・リンク切れを確認",
            ],
            "title": f"急落調査: {_lp_label(path, title, max_path=30, max_title=20)}",
        })

    # ─ (3) 順位押し上げ (P1) ─────────────────────────────────────
    for sc in sc_reports:
        site = sc.get("site_url", "").rstrip("/")
        for d in sc.get("query_page_delta", {}).get("opportunities", []):
            imp        = d.get("impressions", 0)
            pos        = d.get("position", 99.0)
            ctr        = d.get("ctr", 0.0)
            clicks_sum = d.get("clicks_current", 0) + d.get("clicks_prev", 0)

            if imp < MIN_GSC_IMP:
                continue
            if not (8.0 <= pos <= 20.0):
                continue
            if clicks_sum < MIN_GSC_CLICKS_SUM:
                continue

            exp_ctr    = _expected_ctr(min(pos, 10.0))
            impact     = imp * max(0.0, exp_ctr - ctr)
            confidence = math.log1p(imp) * min(1.0, clicks_sum / 10.0)
            score      = impact * confidence
            if score <= 0:
                continue

            path = d["page"].replace(site, "") or "/"
            candidates.append({
                "priority": "P1", "_score": score,
                "est_minutes": 45,
                "target_url": path,
                "reason": (
                    f"imp {imp:,} / 順位 {pos:.1f} / クリック計 {clicks_sum}"
                ),
                "checklist": [
                    "見出し(h2/h3)にクエリ関連キーワードを追加",
                    "検索意図の不足コンテンツを補完",
                    "内部リンク増・関連FAQ追加",
                ],
                "title": f"順位改善: {d['query'][:28]}",
            })

    # ─ スコア降順で URL 重複排除（先勝ち） ──────────────────────
    candidates.sort(key=lambda t: -t["_score"])
    seen: set[str] = set()
    deduped: list[dict] = []
    for t in candidates:
        if t["target_url"] not in seen:
            seen.add(t["target_url"])
            deduped.append(t)

    # ─ P0 スコア降順 + P1 スコア降順 で返す ─────────────────────
    def _clean(t: dict) -> dict:
        return {k: v for k, v in t.items() if not k.startswith("_")}

    p0 = sorted([t for t in deduped if t["priority"] == "P0"], key=lambda t: -t["_score"])
    p1 = sorted([t for t in deduped if t["priority"] == "P1"], key=lambda t: -t["_score"])
    result = [_clean(t) for t in p0] + [_clean(t) for t in p1]
    logger.info("build_tasks: P0=%d P1=%d", len(p0), len(p1))
    return result


def _build_cw_v2(
    report_date: date,
    comparisons: dict[str, dict],
    lp_rows: list[dict],
    lp_delta: list[dict],
    tasks: list[dict],
    health: dict,
    sc_reports: list[dict] | None,
    sheet_url: str | None,
    *,
    show_examples: bool = True,
    gsc_up_count: int = 3,
    lp_delta_count: int = 3,
    p1_count: int = 3,
) -> str:
    """Chatwork v2 テンプレートの組み立て（内部関数）."""
    lines: list[str] = []

    # ヘッダ
    if sc_reports:
        hosts = [
            sc.get("site_url", "").replace("https://", "").rstrip("/")
            for sc in sc_reports
        ]
        site_group = " / ".join(hosts[:2])
    else:
        site_group = "GA4"
    lines.append(
        f"[info][title]📊 デイリーレポート（{report_date.isoformat()} / {site_group}）[/title]"
    )

    # ── KPI ショートカット ─────────────────────────────────────
    def _c(m: str) -> dict:
        return comparisons.get(m, {})

    pv_cur = int(_c("screenPageViews").get("current", 0))
    pv_dod = _fmt_pct(_c("screenPageViews").get("pct_vs_prev"))
    pv_7d  = _fmt_pct(_c("screenPageViews").get("pct_vs_7d"))
    er_cur = _fmt_rate(_c("engagementRate").get("current", 0))
    er_dod = _fmt_pct(_c("engagementRate").get("pct_vs_prev"))

    # ── path→title マップ ─────────────────────────────────────
    path_title = {
        r.get("landingPagePlusQueryString", ""): r.get("pageTitle", "")
        for r in lp_rows
    }

    increases = [d for d in lp_delta if d["delta_sessions"] > 0]
    decreases = sorted(
        [d for d in lp_delta if d["delta_sessions"] < 0],
        key=lambda x: x["delta_sessions"],
    )

    def _driver_label(d: dict) -> str:
        title = d.get("pageTitle") or path_title.get(d["path"], "")
        label = _lp_label(d["path"], title, max_path=20, max_title=18)
        ch = d.get("top_channel", "")
        return f"{label}（{d['delta_sessions']:+d}{' / ' + ch if ch else ''}）"

    # ── ■ 結論 ─────────────────────────────────────────────────
    lines.append("■ 結論（今日の最優先）")
    lines.append(
        f"- ✅ PV {pv_cur:,}（前日比 {pv_dod} / 7日平均比 {pv_7d}）｜ER {er_cur}（{er_dod}）"
    )
    driver_parts = [_driver_label(increases[i]) for i in range(min(2, len(increases)))]
    lines.append(f"- 🔍 伸びた要因：{' / '.join(driver_parts) if driver_parts else '（増加なし）'}")
    lines.append(f"- ⚠️ 直近リスク：{_driver_label(decreases[0]) if decreases else '（リスクなし）'}")
    lines.append("")

    # ── ■ ① KPI サマリ ─────────────────────────────────────────
    lines.append("■ ① KPIサマリ（Yesterday）")
    for m, label in [
        ("sessions",        "Sessions"),
        ("activeUsers",     "Users"),
        ("screenPageViews", "PV"),
        ("engagedSessions", "Engaged"),
        ("engagementRate",  "ER"),
    ]:
        comp = comparisons.get(m, {})
        cur_val = comp.get("current", 0)
        val_str = _fmt_rate(cur_val) if m == "engagementRate" else f"{int(cur_val):,}"
        lines.append(
            f"- {label} {val_str}"
            f"（{_fmt_pct(comp.get('pct_vs_prev'))} / {_fmt_pct(comp.get('pct_vs_7d'))}）"
        )
    lines.append("")

    # ── ■ ② PV 増加/減少の原因 ────────────────────────────────
    lines.append("■ ② PV増加/減少の原因（記事×チャネル / Δ）")
    lines.append(f"【PV増加の主因 Top{lp_delta_count}（LP）】")
    for i, d in enumerate(increases[:lp_delta_count], 1):
        title = d.get("pageTitle") or path_title.get(d["path"], "")
        label = _lp_label(d["path"], title)
        ch = d.get("top_channel", "N/A")
        lines.append(
            f"{i}) {label}"
            f"（ΔSess {d['delta_sessions']:+d} / ΔPV {d['delta_pv']:+d}｜主因: {ch}）"
        )
    if not increases:
        lines.append("  （増加なし）")

    lines.append("【PV減少の主因 Top2（LP）】")
    for d in decreases[:2]:
        title = d.get("pageTitle") or path_title.get(d["path"], "")
        label = _lp_label(d["path"], title)
        ch = d.get("top_channel", "N/A")
        lines.append(f"- {label}（ΔSess {d['delta_sessions']:+d}｜{ch}）")
    if not decreases:
        lines.append("  （減少なし）")
    lines.append("")

    # ── ■ ③ GSC ────────────────────────────────────────────────
    lines.append("■ ③ 検索（GSC）異常値とチャンス（query→page）")
    if not sc_reports:
        lines.append("  未取得（SC_SITE_URLS 未設定）")
    else:
        # 全サイトのデータをマージしてソート
        all_inc: list[dict] = []
        all_dec: list[dict] = []
        all_opp: list[dict] = []
        for sc in sc_reports:
            site = sc.get("site_url", "").rstrip("/")
            qp = sc.get("query_page_delta", {})
            for d in qp.get("increases", []):
                all_inc.append({**d, "_site": site})
            for d in qp.get("decreases", []):
                all_dec.append({**d, "_site": site})
            for d in qp.get("opportunities", []):
                all_opp.append({**d, "_site": site})
        all_inc.sort(key=lambda x: -x["click_diff"])
        all_dec.sort(key=lambda x: x["click_diff"])
        all_opp.sort(key=lambda x: -x["impressions"])

        def _page_path(d: dict) -> str:
            return d["page"].replace(d.get("_site", ""), "") or "/"

        lines.append(f"【クリック増 Top{gsc_up_count}】")
        for d in all_inc[:gsc_up_count]:
            lines.append(
                f"- +{d['click_diff']} \"{d['query'][:25]}\" → {_page_path(d)}"
                f"（imp {d['impressions']:,} / CTR {d['ctr']:.1%} / pos {d['position']:.1f}）"
            )
        if not all_inc:
            lines.append("  （データなし）")

        lines.append("【クリック減 Top3（要対応）】")
        for d in all_dec[:3]:
            lines.append(
                f"- \"{d['query'][:25]}\" → {_page_path(d)}"
                f"（{d['clicks_prev']}→{d['clicks_current']} / Δ{d['click_diff']:+d}）"
            )
        if not all_dec:
            lines.append("  （データなし）")

        lines.append(
            f"【CTR改善チャンス（順位{int(CTR_OPP_POS_MIN)}-{int(CTR_OPP_POS_MAX)}"
            f"×imp≥{CTR_OPP_MIN_IMP:,}×CTR<期待値）】"
        )
        for d in all_opp[:1]:
            lines.append(
                f"- \"{d['query'][:25]}\" → {_page_path(d)}"
                f"（imp {d['impressions']:,} / CTR {d['ctr']:.1%} / pos {d['position']:.1f}）"
            )
        if not all_opp:
            lines.append("  （なし）")
    lines.append("")

    # ── ■ ④ 健康診断 ───────────────────────────────────────────
    lines.append("■ ④ 記事の健康診断（今日見るべきものだけ）")

    def _health_ex(rows: list[dict]) -> str:
        if not rows:
            return "なし"
        path = rows[0].get("landingPagePlusQueryString", "")
        title = rows[0].get("pageTitle", "")[:18]
        return f"{path}「{title}…」" if title else path

    win_n   = len(health.get("win", []))
    rew_n   = len(health.get("rewrite", []))
    dist_n  = len(health.get("distribute", []))
    zomb_n  = len(health.get("zombie", []))

    if show_examples:
        lines.append(
            f"- 🟢 勝ち記事（伸ばす）：{win_n}件"
            f"（例: {_health_ex(health.get('win', []))}）"
        )
        lines.append(
            f"- 🟡 要リライト（需要はあるが質弱）：{rew_n}件"
            f"（例: {_health_ex(health.get('rewrite', []))}）"
        )
        lines.append(
            f"- 🔵 露出改善（質は高いが流入弱）：{dist_n}件"
            f"（例: {_health_ex(health.get('distribute', []))}）"
        )
        lines.append(
            f"- ⚫ 整理候補：{zomb_n}件"
            f"（例: {_health_ex(health.get('zombie', []))}）"
        )
    else:
        lines.append(
            f"- 🟢 勝ち:{win_n} 🟡 リライト:{rew_n}"
            f" 🔵 露出改善:{dist_n} ⚫ 整理:{zomb_n}"
        )
    lines.append("")

    # ── ■ ⑤ タスク ─────────────────────────────────────────────
    lines.append("■ ⑤ 今日のタスク（上位5件だけ／担当つけて回す）")
    p0 = [t for t in tasks if t["priority"] == "P0"][:2]
    p1 = [t for t in tasks if t["priority"] == "P1"][:p1_count]

    lines.append("【P0（今日中）】")
    if p0:
        for i, t in enumerate(p0, 1):
            lines.append(f"{i}) {t['title']}（{t['est_minutes']}分）対象: {t['target_url']}")
            lines.append(f"   - 根拠: {t['reason']}")
            lines.append(f"   - 手順: {' / '.join(t['checklist'][:2])}")
    else:
        lines.append("  特になし")

    if p1:
        lines.append("【P1（余力あれば）】")
        for i, t in enumerate(p1, len(p0) + 1):
            reason_short = t["reason"][:55]
            lines.append(
                f"{i}) {t['title']}（{t['est_minutes']}分）"
                f"対象: {t['target_url']}｜{reason_short}"
            )
    lines.append("")

    # ── ■ 詳細 ─────────────────────────────────────────────────
    lines.append("■ 詳細（Spreadsheet）")
    if sheet_url:
        lines.append(f"- LP増減分析 / 記事健康診断 / 検索クエリ増減 / タスク：{sheet_url}")
    else:
        lines.append("- LP増減分析 / 記事健康診断 / 検索クエリ増減 / タスク：（未設定）")

    lines.append("[/info]")
    return "\n".join(lines)


def format_chatwork_summary_v2(
    report_date: date,
    comparisons: dict[str, dict],
    lp_rows: list[dict],
    lp_delta: list[dict],
    tasks: list[dict],
    health: dict,
    sc_reports: list[dict] | None = None,
    sheet_url: str | None = None,
    max_chars: int = 6000,
) -> str:
    """Chatwork 投稿テキスト（v2）を生成。文字数超過時は自動縮退。"""
    kwargs: dict = dict(
        report_date=report_date,
        comparisons=comparisons,
        lp_rows=lp_rows,
        lp_delta=lp_delta,
        tasks=tasks,
        health=health,
        sc_reports=sc_reports,
        sheet_url=sheet_url,
    )
    # 縮退ステップ: examples削除 → 件数削減 → P1削減 → 最小
    for params in [
        dict(show_examples=True,  gsc_up_count=3, lp_delta_count=3, p1_count=3),
        dict(show_examples=False, gsc_up_count=3, lp_delta_count=3, p1_count=3),
        dict(show_examples=False, gsc_up_count=2, lp_delta_count=2, p1_count=3),
        dict(show_examples=False, gsc_up_count=2, lp_delta_count=2, p1_count=2),
        dict(show_examples=False, gsc_up_count=1, lp_delta_count=1, p1_count=2),
    ]:
        text = _build_cw_v2(**kwargs, **params)
        if len(text) <= max_chars:
            return text
    return text  # 最後の試行結果をそのまま返す
