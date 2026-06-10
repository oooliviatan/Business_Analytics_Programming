"""
Bursa Malaysia Stock Analysis - FastAPI Backend
SQITK 3073: Business Analytic Programming Individual Project

Uses yfinance for stock data retrieval, pandas for analysis (slicing + groupby),
matplotlib for chart rendering in the downloadable PDF, and Recharts on the
frontend for interactive visualisation.
"""
from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import io
import logging
import math
import time
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any, Tuple

import pandas as pd
import yfinance as yf

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402

from reportlab.lib.pagesizes import A4 , landscape  # noqa: E402
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle  # noqa: E402
from reportlab.lib.units import cm  # noqa: E402
from reportlab.lib import colors  # noqa: E402
from reportlab.platypus import (  # noqa: E402
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    Image as RLImage,
    PageBreak,
)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

app = FastAPI(title="Bursa Malaysia Stock Analysis")
api_router = APIRouter(prefix="/api")

# -----------------------------
# Portfolio
# -----------------------------
STOCKS: Tuple[Tuple[str, str], ...] = (
    ("KPJ Healthcare", "5878.KL"),
    ("Inari Amertron", "0166.KL"),
    ("CIMB Group", "1023.KL"),
    ("Genting Malaysia", "4715.KL"),
    ("Sunway", "5211.KL"),
)

STOCK_CONTEXT: Dict[str, Dict[str, str]] = {
    "5878.KL": {
        "sector": "Healthcare",
        "thesis": (
            "Malaysia's largest private healthcare network. Defensive sector with "
            "steady demand from an ageing population — a stabiliser for beginners."
        ),
    },
    "0166.KL": {
        "sector": "Technology",
        "thesis": (
            "Semiconductor assembly and test leader riding the global chip cycle. "
            "Adds growth and upside exposure to the portfolio."
        ),
    },
    "1023.KL": {
        "sector": "Banking",
        "thesis": (
            "Top-3 Malaysian bank with strong ASEAN footprint and consistent "
            "dividend track record. Anchors the portfolio with income."
        ),
    },
    "4715.KL": {
        "sector": "Leisure & Hospitality",
        "thesis": (
            "Casino, resorts and theme park operator. Tourism recovery play that "
            "diversifies the portfolio away from pure financials."
        ),
    },
    "5211.KL": {
        "sector": "Conglomerate (Property & Construction)",
        "thesis": (
            "Integrated property, construction, healthcare and education group. "
            "A balanced 'one-stop' Malaysian conglomerate exposure."
        ),
    },
}

INVESTMENT_CAPITAL = 1000.0  # RM

PERIOD_MAP: Dict[str, Dict[str, str]] = {
    "1w": {"yf": "5d", "label": "1 Week"},
    "1mo": {"yf": "1mo", "label": "1 Month"},
    "3mo": {"yf": "3mo", "label": "3 Months"},
    "6mo": {"yf": "6mo", "label": "6 Months"},
    "1y": {"yf": "1y", "label": "1 Year"},
}

# Cache keyed by period
_CACHE: Dict[str, Dict[str, Any]] = {}
_CACHE_TTL_SEC = 15 * 60


def _safe_float(x) -> float:
    try:
        if x is None:
            return 0.0
        f = float(x)
        if math.isnan(f) or math.isinf(f):
            return 0.0
        return f
    except (TypeError, ValueError):
        return 0.0


def _classify(return_pct: float) -> str:
    if return_pct < 0:
        return "Negative Return"
    if return_pct <= 2:
        return "Moderate Return"
    return "High Return"


def _fetch_history(yf_period: str) -> Dict[str, pd.DataFrame]:
    histories: Dict[str, pd.DataFrame] = {}
    for _, ticker in STOCKS:
        try:
            df = yf.Ticker(ticker).history(period=yf_period, auto_adjust=False)
            if df is None or df.empty:
                raise ValueError("empty history")
            df = df.dropna(subset=["Close"])
            histories[ticker] = df
        except Exception as exc:  # noqa: BLE001
            logger.warning("Failed to fetch %s (%s): %s", ticker, yf_period, exc)
            histories[ticker] = pd.DataFrame()
    return histories


def _build_analysis(period_key: str) -> Dict[str, Any]:
    period = PERIOD_MAP.get(period_key, PERIOD_MAP["1mo"])
    histories = _fetch_history(period["yf"])

    rows: List[Dict[str, Any]] = []
    trend_index: Dict[str, Dict[str, float]] = {}

    for name, ticker in STOCKS:
        df = histories.get(ticker, pd.DataFrame())
        if df.empty or len(df) < 2:
            continue

        closes = df["Close"]
        yesterday_close = _safe_float(closes.iloc[-2])
        today_close = _safe_float(closes.iloc[-1])
        daily_return = today_close - yesterday_close
        shares = math.floor(INVESTMENT_CAPITAL / yesterday_close) if yesterday_close > 0 else 0
        estimated_total_return = shares * daily_return
        return_pct = (estimated_total_return / INVESTMENT_CAPITAL) * 100 if INVESTMENT_CAPITAL else 0.0

        # Period-wide metrics (start vs end of selected window)
        period_start_close = _safe_float(closes.iloc[0])
        period_end_close = _safe_float(closes.iloc[-1])
        period_shares = (
            math.floor(INVESTMENT_CAPITAL / period_start_close)
            if period_start_close > 0
            else 0
        )
        period_total_return = period_shares * (period_end_close - period_start_close)
        period_return_pct = (
            (period_total_return / INVESTMENT_CAPITAL) * 100
            if INVESTMENT_CAPITAL
            else 0.0
        )

        for ts, price in closes.items():
            date_str = ts.strftime("%Y-%m-%d")
            trend_index.setdefault(date_str, {})[ticker] = _safe_float(price)

        div_total = 0.0
        if "Dividends" in df.columns:
            div_total = _safe_float(df["Dividends"].sum())

        ctx = STOCK_CONTEXT.get(ticker, {})
        rows.append(
            {
                "name": name,
                "ticker": ticker,
                "sector": ctx.get("sector", ""),
                "thesis": ctx.get("thesis", ""),
                "yesterday_close": round(yesterday_close, 4),
                "today_close": round(today_close, 4),
                "daily_return": round(daily_return, 4),
                "shares_purchasable": shares,
                "estimated_total_return": round(estimated_total_return, 2),
                "return_percentage": round(return_pct, 4),
                "period_start_close": round(period_start_close, 4),
                "period_end_close": round(period_end_close, 4),
                "period_total_return": round(period_total_return, 2),
                "period_return_percentage": round(period_return_pct, 4),
                "dividends_in_period": round(div_total, 4),
            }
        )

    if not rows:
        raise HTTPException(status_code=502, detail="Unable to retrieve stock data from yfinance.")

    df_main = pd.DataFrame(rows)

    summary_cols = [
        "ticker",
        "yesterday_close",
        "today_close",
        "estimated_total_return",
        "return_percentage",
    ]
    df_summary = df_main.loc[:, summary_cols].copy()

    df_main["performance_category"] = df_main["return_percentage"].apply(_classify)
    grouped = (
        df_main.groupby("performance_category")
        .agg(
            avg_estimated_total_return=("estimated_total_return", "mean"),
            stock_count=("ticker", "count"),
            tickers=("ticker", lambda x: ", ".join(x))
        )
        .reset_index()
    )

    grouped["avg_estimated_total_return"] = (
        grouped["avg_estimated_total_return"].round(2)
    )
    
    
    grouped["avg_estimated_total_return"] = grouped[
        "avg_estimated_total_return"
    ].round(2)

    trend = []
    for date_str in sorted(trend_index.keys()):
        point = {"date": date_str}
        point.update({k: round(v, 4) for k, v in trend_index[date_str].items()})
        trend.append(point)

    strongest = max(rows, key=lambda r: r["return_percentage"])
    weakest = min(rows, key=lambda r: r["return_percentage"])

    payload = {
        "investment_capital": INVESTMENT_CAPITAL,
        "period_key": period_key,
        "period_label": period["label"],
        "stocks": df_main.to_dict(orient="records"),
        "summary": df_summary.to_dict(orient="records"),
        "groupby": grouped.to_dict(orient="records"),
        "trend": trend,
        "discussion": {
            "strongest": strongest,
            "weakest": weakest,
            "limitations": [
                "The analysis is based on only ONE trading day's price change "
                "(yesterday vs today). It does not represent long-term performance.",
                "Stock prices are influenced by news, earnings and global macro "
                "events that are not captured in a single day's move.",
                "Transaction costs, brokerage fees and Bursa Malaysia stamp duty "
                "are ignored in the RM1,000 simulation.",
                "Dividend timing, currency effects and tax are not factored in.",
            ],
            "other_factors": [
                "Company fundamentals: revenue growth, profit margin, debt level.",
                "Valuation: Price-to-Earnings (PE), Price-to-Book (PB) ratios.",
                "Dividend yield and payout consistency over multiple years.",
                "Industry outlook and Malaysia macro factors (OPR, MYR strength).",
                "Your own risk tolerance, time horizon and diversification needs.",
            ],
        },
        "stocks_meta": [
            {"name": n, "ticker": t, **STOCK_CONTEXT.get(t, {})} for n, t in STOCKS
        ],
        "available_periods": [
            {"key": k, "label": v["label"]} for k, v in PERIOD_MAP.items()
        ],
    }
    return payload


def _get_cached_payload(period_key: str, force: bool = False) -> Dict[str, Any]:
    now = time.time()
    entry = _CACHE.get(period_key)
    if not force and entry and (now - entry["ts"] < _CACHE_TTL_SEC):
        return entry["payload"]
    payload = _build_analysis(period_key)
    _CACHE[period_key] = {"payload": payload, "ts": now}
    return payload


# -----------------------------
# Matplotlib chart helpers (for PDF report)
# -----------------------------
CHART_COLORS = ["#2C4C3B", "#4A7C59", "#D96C5B", "#F2A65A", "#8E9BAE"]


def _chart_closing_trend(trend: List[Dict[str, Any]], stocks: List[Dict[str, Any]]) -> bytes:
    """Matplotlib line chart of closing prices."""
    fig, ax = plt.subplots(figsize=(8, 4.2), dpi=160)
    dates = [pd.to_datetime(t["date"]) for t in trend]
    for i, s in enumerate(stocks):
        prices = [t.get(s["ticker"]) for t in trend]
        ax.plot(
            dates,
            prices,
            label=f"{s['ticker']} · {s['name']}",
            color=CHART_COLORS[i % len(CHART_COLORS)],
            linewidth=2.0,
        )
    ax.set_title("Chart 1 — Closing Price Trend", fontsize=12, color="#1C2621")
    ax.set_xlabel("Date", fontsize=9, color="#5A6D63")
    ax.set_ylabel("Closing Price (RM)", fontsize=9, color="#5A6D63")
    ax.grid(True, alpha=0.25, linestyle="--")
    ax.tick_params(axis="x", labelsize=8, rotation=30, colors="#5A6D63")
    ax.tick_params(axis="y", labelsize=8, colors="#5A6D63")
    for spine in ax.spines.values():
        spine.set_color("#E6E9E6")
    ax.legend(fontsize=8, loc="best", frameon=False)
    fig.tight_layout()
    buf = io.BytesIO()
    fig.savefig(buf, format="png", bbox_inches="tight")
    plt.close(fig)
    buf.seek(0)
    return buf.read()


def _chart_return_comparison(stocks: List[Dict[str, Any]]) -> bytes:
    """Matplotlib bar chart of return %."""
    fig, ax = plt.subplots(figsize=(8, 4.2), dpi=160)
    sorted_stocks = sorted(stocks, key=lambda s: s["return_percentage"], reverse=True)
    tickers = [s["ticker"] for s in sorted_stocks]
    values = [s["return_percentage"] for s in sorted_stocks]
    bar_colors = ["#4A7C59" if v >= 0 else "#D96C5B" for v in values]
    bars = ax.bar(tickers, values, color=bar_colors)
    ax.axhline(0, color="#1C2621", linewidth=0.8)
    ax.set_title("Chart 2 — Return % on RM 1,000", fontsize=12, color="#1C2621")
    ax.set_xlabel("Ticker", fontsize=9, color="#5A6D63")
    ax.set_ylabel("Return %", fontsize=9, color="#5A6D63")
    ax.grid(True, axis="y", alpha=0.25, linestyle="--")
    ax.tick_params(labelsize=8, colors="#5A6D63")
    for spine in ax.spines.values():
        spine.set_color("#E6E9E6")
    for bar, v in zip(bars, values):
        ax.text(
            bar.get_x() + bar.get_width() / 2,
            v + (0.05 if v >= 0 else -0.1),
            f"{v:+.2f}%",
            ha="center",
            va="bottom" if v >= 0 else "top",
            fontsize=8,
            color="#1C2621",
        )
    fig.tight_layout()
    buf = io.BytesIO()
    fig.savefig(buf, format="png", bbox_inches="tight")
    plt.close(fig)
    buf.seek(0)
    return buf.read()


# -----------------------------
# PDF builder
# -----------------------------
def _build_pdf(payload: Dict[str, Any]) -> bytes:
    out = io.BytesIO()
    doc = SimpleDocTemplate(
        out,
        pagesize=landscape(A4),
        leftMargin=1.6 * cm,
        rightMargin=1.6 * cm,
        topMargin=1.6 * cm,
        bottomMargin=1.6 * cm,
        title="Bursa Malaysia Stock Analysis Report",
    )

    styles = getSampleStyleSheet()
    primary = colors.HexColor("#2C4C3B")
    text = colors.HexColor("#1C2621")
    muted = colors.HexColor("#5A6D63")
    border = colors.HexColor("#E6E9E6")
    pos_bg = colors.HexColor("#EDF2EE")
    neg_bg = colors.HexColor("#FCEEEE")

    h1 = ParagraphStyle(
        "H1", parent=styles["Heading1"], fontSize=20, textColor=primary, spaceAfter=10
    )
    h2 = ParagraphStyle(
        "H2", parent=styles["Heading2"], fontSize=14, textColor=text, spaceBefore=14, spaceAfter=6
    )
    body = ParagraphStyle(
        "Body", parent=styles["BodyText"], fontSize=10, textColor=text, leading=14
    )
    small = ParagraphStyle(
        "Small", parent=styles["BodyText"], fontSize=9, textColor=muted, leading=12
    )
    bullet = ParagraphStyle(
        "Bullet",
        parent=body,
        leftIndent=12,
        bulletIndent=0,
        spaceBefore=2,
        spaceAfter=2,
    )

    story = []

    # Title block
    story.append(Paragraph("Bursa Malaysia Stock Analysis Report", h1))
    story.append(
        Paragraph(
            "SQITK 3073 · Business Analytic Programming · Individual Project",
            small,
        )
    )
    story.append(
        Paragraph(
            f"Generated: {datetime.now().strftime('%d %B %Y, %H:%M')} · "
            f"Period: {payload['period_label']} · "
            f"Capital: RM {INVESTMENT_CAPITAL:,.0f}",
            small,
        )
    )
    story.append(Spacer(1, 10))

    # Q1 - Why these 5 stocks
    story.append(Paragraph("1. Why these 5 stocks?", h2))
    story.append(
        Paragraph(
            "A beginner portfolio is best built across sectors so a slump in one area "
            "is cushioned by another. The five stocks below were chosen for their size, "
            "liquidity (all trade above RM 0.50) and sector diversity.",
            body,
        )
    )
    meta_rows = [["#", "Name", "Ticker", "Sector", "Rationale"]]
    for i, s in enumerate(payload["stocks_meta"], 1):
        meta_rows.append([
            str(i),
            Paragraph(s["name"], body),
            s["ticker"],
            Paragraph(s.get("sector", ""), body),
            Paragraph(s.get("thesis", ""), small),
        ])
    meta_table = Table(meta_rows, colWidths=[0.8 * cm, 3.0 * cm, 2.0 * cm, 3.0 * cm, 8.0 * cm])
    meta_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), primary),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 9),
                ("GRID", (0, 0), (-1, -1), 0.4, border),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#FDFBF7")]),
            ]
        )
    )
    story.append(meta_table)
    story.append(Spacer(1, 8))
    
    story.append(PageBreak())

    # Q1 - Full analysis table
    story.append(Paragraph("2. Stock Analysis (Question 1)", h2))
    story.append(
        Paragraph(
            "All metrics assume RM 1,000 invested at yesterday's closing price.",
            small,
        )
    )
    headers = [
        "Stock",
        "Yest. Close (RM)",
        "Today Close (RM)",
        "Daily Return (RM)",
        "Shares (RM1000)",
        "Est. Total Return (RM)",
        "Return %",
    ]
    rows_q1 = [headers]
    for s in payload["stocks"]:
        rows_q1.append(
            [
                Paragraph(f"<b>{s['name']}</b><br/><font size=8 color='#5A6D63'>{s['ticker']}</font>", small),
                f"{s['yesterday_close']:.4f}",
                f"{s['today_close']:.4f}",
                f"{s['daily_return']:+.4f}",
                f"{s['shares_purchasable']:,}",
                f"{s['estimated_total_return']:+,.2f}",
                f"{s['return_percentage']:+.2f}%",
            ]
        )
    q1_table = Table(rows_q1, colWidths=[3.2 * cm, 2.8 * cm, 2.8 * cm, 2.8 * cm, 2.8 * cm, 3.8 * cm, 2.1 * cm])
    q1_style = [
        ("BACKGROUND", (0, 0), (-1, 0), primary),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 8.5),
        ("GRID", (0, 0), (-1, -1), 0.4, border),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("ALIGN", (1, 1), (-1, -1), "RIGHT"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#FDFBF7")]),
    ]
    # Colour the return cells
    for i, s in enumerate(payload["stocks"], 1):
        bg = pos_bg if s["return_percentage"] >= 0 else neg_bg
        q1_style.append(("BACKGROUND", (5, i), (6, i), bg))
    q1_table.setStyle(TableStyle(q1_style))
    story.append(q1_table)

    # Q2a - Portfolio Summary
    story.append(Paragraph("3. Portfolio Summary — Question 2a (pandas slicing)", h2))
    story.append(
        Paragraph(
            "df.loc[:, ['ticker','yesterday_close','today_close',"
            "'estimated_total_return','return_percentage']]",
            small,
        )
    )
    sum_rows = [["Ticker", "Prev. Close", "Latest Close", "Est. Total Return", "Return %"]]
    for s in payload["summary"]:
        sum_rows.append(
            [
                s["ticker"],
                f"{s['yesterday_close']:.4f}",
                f"{s['today_close']:.4f}",
                f"{s['estimated_total_return']:+,.2f}",
                f"{s['return_percentage']:+.2f}%",
            ]
        )
    sum_table = Table(sum_rows, colWidths=[3.0 * cm, 3.0 * cm, 3.0 * cm, 3.5 * cm, 3.0 * cm])
    sum_style = [
        ("BACKGROUND", (0, 0), (-1, 0), primary),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("GRID", (0, 0), (-1, -1), 0.4, border),
        ("ALIGN", (1, 1), (-1, -1), "RIGHT"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#FDFBF7")]),
    ]

    for i, s in enumerate(payload["summary"], 1):
        bg = pos_bg if s["return_percentage"] >= 0 else neg_bg

        # Est. Total Return column
        sum_style.append(("BACKGROUND", (3, i), (3, i), bg))

        # Return % column
        sum_style.append(("BACKGROUND", (4, i), (4, i), bg))

    sum_table.setStyle(TableStyle(sum_style))
    story.append(sum_table)

    # Q2b - GroupBy
    story.append(Paragraph("4. Performance Category — Question 2b (groupby)", h2))
    story.append(
        Paragraph(
            "Classification: Return % &lt; 0 → Negative · 0–2% → Moderate · &gt; 2% → High. "
            "We then groupby(Performance Category) and average the Estimated Total Return.",
            small,
        )
    )
    g_rows = [
        [
            "Performance Category",
            "Stocks",
            "Stock Tickers",
            "Avg Est. Total Return (RM)"
        ]
    ]
    order = {"High Return": 0, "Moderate Return": 1, "Negative Return": 2}
    for g in sorted(payload["groupby"], key=lambda r: order.get(r["performance_category"], 9)):
        g_rows.append(
            [
                g["performance_category"],
                str(g["stock_count"]),
                g["tickers"],
                f"{g['avg_estimated_total_return']:+,.2f}",
            ]
        )
    g_table = Table(g_rows, colWidths=[5.0 * cm, 2.0 * cm, 6.5 * cm, 6.0 * cm])
    g_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), primary),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 9),
                ("GRID", (0, 0), (-1, -1), 0.4, border),
                ("ALIGN", (1, 1), (-1, -1), "RIGHT"),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#FDFBF7")]),
            ]
        )
    )
    story.append(g_table)

    # Charts page
    story.append(PageBreak())
    story.append(Paragraph("5. Visualisations — Question 3 (matplotlib)", h2))
    chart1_bytes = _chart_closing_trend(payload["trend"], payload["stocks"])
    chart2_bytes = _chart_return_comparison(payload["stocks"])
    story.append(RLImage(io.BytesIO(chart1_bytes), width=16 * cm, height=8.5 * cm))
    story.append(Spacer(1, 8))
    story.append(RLImage(io.BytesIO(chart2_bytes), width=16 * cm, height=8.5 * cm))

    # Discussion
    story.append(PageBreak())
    story.append(Paragraph("6. Discussion — Question 4", h2))
    strongest = payload["discussion"]["strongest"]
    weakest = payload["discussion"]["weakest"]
    story.append(
        Paragraph(
            f"<b>Strongest performer:</b> {strongest['name']} ({strongest['ticker']}) "
            f"with a return of {strongest['return_percentage']:+.2f}% "
            f"(~RM {strongest['estimated_total_return']:+,.2f} on RM 1,000). "
            "The combination of a positive daily move and a lower share price meant "
            "RM 1,000 could buy more shares — amplifying the ringgit gain.",
            body,
        )
    )
    story.append(Spacer(1, 6))
    story.append(
        Paragraph(
            f"<b>Weakest performer:</b> {weakest['name']} ({weakest['ticker']}) "
            f"with a return of {weakest['return_percentage']:+.2f}%. A single red day "
            "does not invalidate the long-term thesis — review the 1-month trend chart "
            "before drawing conclusions.",
            body,
        )
    )
    story.append(Spacer(1, 10))
    story.append(Paragraph("<b>Limitations</b>", body))
    for lim in payload["discussion"]["limitations"]:
        story.append(Paragraph(f"• {lim}", bullet))
    story.append(Spacer(1, 8))
    story.append(Paragraph("<b>Other factors investors should consider</b>", body))
    for f in payload["discussion"]["other_factors"]:
        story.append(Paragraph(f"• {f}", bullet))

    story.append(Spacer(1, 14))
    story.append(
        Paragraph(
            "Data source: Yahoo Finance via the <i>yfinance</i> Python package. "
            "Analysis performed with <i>pandas</i>; charts rendered with "
            "<i>matplotlib</i>. For educational use only — not investment advice.",
            small,
        )
    )

    doc.build(story)
    out.seek(0)
    return out.read()


# -----------------------------
# Routes
# -----------------------------
@api_router.get("/")
async def root():
    return {"message": "Bursa Malaysia Stock Analysis API", "status": "ok"}


@api_router.get("/stocks/analysis")
async def get_analysis(period: str = "1mo", refresh: bool = False):
    if period not in PERIOD_MAP:
        raise HTTPException(status_code=400, detail=f"Unsupported period '{period}'.")
    try:
        return _get_cached_payload(period, force=refresh)
    except HTTPException:
        raise
    except Exception as exc:  # noqa: BLE001
        logger.exception("Analysis failed")
        raise HTTPException(status_code=500, detail=str(exc))


@api_router.get("/stocks/meta")
async def get_meta():
    return {
        "investment_capital": INVESTMENT_CAPITAL,
        "stocks": [
            {"name": n, "ticker": t, **STOCK_CONTEXT.get(t, {})} for n, t in STOCKS
        ],
        "available_periods": [
            {"key": k, "label": v["label"]} for k, v in PERIOD_MAP.items()
        ],
    }


@api_router.get("/stocks/pdf")
async def get_pdf(period: str = "1mo"):
    if period not in PERIOD_MAP:
        raise HTTPException(status_code=400, detail=f"Unsupported period '{period}'.")
    try:
        payload = _get_cached_payload(period)
        pdf_bytes = _build_pdf(payload)
        filename = (
            f"bursa-analysis-{period}-{datetime.now().strftime('%Y%m%d-%H%M')}.pdf"
        )
        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'},
        )
    except HTTPException:
        raise
    except Exception as exc:  # noqa: BLE001
        logger.exception("PDF generation failed")
        raise HTTPException(status_code=500, detail=str(exc))


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)
