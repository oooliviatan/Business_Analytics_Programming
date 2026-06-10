import React from "react";
import { Info, TrendingUp, TrendingDown } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { fmtPrice, fmtRM, fmtPct, fmtInt } from "@/lib/format";

const HeaderCell = ({ children, hint, testid }) => (
    <th
        className="py-4 px-4 text-sm font-medium text-left whitespace-nowrap"
        style={{
            color: "var(--text-secondary)",
            borderBottom: "1px solid var(--border)",
        }}
        data-testid={testid}
    >
        <div className="inline-flex items-center gap-1.5">
            <span>{children}</span>
            {hint && (
                <TooltipProvider delayDuration={120}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                type="button"
                                className="opacity-60 hover:opacity-100"
                                aria-label="More info"
                            >
                                <Info size={14} />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent
                            side="top"
                            className="max-w-xs text-sm"
                            style={{
                                background: "var(--text-primary)",
                                color: "#fff",
                                border: "none",
                            }}
                        >
                            {hint}
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            )}
        </div>
    </th>
);

const ReturnBadge = ({ value, suffix }) => {
    const positive = value > 0;
    const negative = value < 0;
    const cls = positive ? "badge-pos" : negative ? "badge-neg" : "badge-neutral";
    const Icon = positive ? TrendingUp : negative ? TrendingDown : null;
    return (
        <span className={cls}>
            {Icon && <Icon size={14} />}
            {suffix === "RM"
                ? fmtRM(value)
                : suffix === "%"
                  ? fmtPct(value)
                  : value}
        </span>
    );
};

const AnalysisTable = ({ stocks, capital }) => {
    if (!stocks?.length) return null;
    return (
        <section
            id="analysis"
            className="max-w-6xl mx-auto px-6 md:px-10 py-16 md:py-24"
            data-testid="analysis-section"
        >
            <div className="max-w-3xl">
                <span className="label-eyebrow">
                    03 · The analysis (Question 1)
                </span>
                <h2 className="font-heading mt-3 text-3xl sm:text-4xl font-medium tracking-tight">
                    What RM {capital?.toLocaleString("en-MY") || "1,000"}{" "}
                    actually did
                </h2>
                <p
                    className="mt-4 text-base leading-relaxed"
                    style={{ color: "var(--text-secondary)" }}
                >
                    We assume you invested RM
                    {capital?.toLocaleString("en-MY") || "1,000"} in each stock
                    on the previous trading day. The table below shows
                    yesterday vs today&apos;s closing price, how many shares your
                    capital could buy, and the resulting gain or loss.
                </p>
            </div>

            <div
                className="card-soft mt-10 overflow-x-auto"
                data-testid="analysis-table-wrapper"
            >
                <table
                    className="w-full"
                    style={{ borderCollapse: "collapse" }}
                    data-testid="analysis-table"
                >
                    <thead>
                        <tr>
                            <HeaderCell testid="th-stock">Stock</HeaderCell>
                            <HeaderCell
                                testid="th-yesterday"
                                hint="The official closing market price from the previous trading day."
                            >
                                Yesterday Close (RM)
                            </HeaderCell>
                            <HeaderCell
                                testid="th-today"
                                hint="The latest closing market price."
                            >
                                Today Close (RM)
                            </HeaderCell>
                            <HeaderCell
                                testid="th-daily"
                                hint="Today's close minus yesterday's close — how much the price moved in one trading day."
                            >
                                Daily Return (RM)
                            </HeaderCell>
                            <HeaderCell
                                testid="th-shares"
                                hint="How many whole shares RM1,000 could buy at yesterday's closing price."
                            >
                                Shares for RM 1,000
                            </HeaderCell>
                            <HeaderCell
                                testid="th-est-return"
                                hint="Shares × daily price change — the ringgit gain or loss on your simulated RM1,000."
                            >
                                Est. Total Return (RM)
                            </HeaderCell>
                            <HeaderCell
                                testid="th-return-pct"
                                hint="Estimated return divided by RM1,000, expressed as a percentage."
                            >
                                Return %
                            </HeaderCell>
                        </tr>
                    </thead>
                    <tbody>
                        {stocks.map((s) => (
                            <tr
                                key={s.ticker}
                                className="hover:bg-[var(--positive-bg)]/40 transition-colors"
                                data-testid={`row-${s.ticker}`}
                            >
                                <td
                                    className="py-4 px-4"
                                    style={{
                                        borderBottom: "1px solid var(--border)",
                                    }}
                                >
                                    <div className="font-heading font-medium">
                                        {s.name}
                                    </div>
                                    <div
                                        className="text-xs mt-0.5"
                                        style={{
                                            color: "var(--text-secondary)",
                                        }}
                                    >
                                        {s.ticker} · {s.sector}
                                    </div>
                                </td>
                                <td
                                    className="py-4 px-4 text-base"
                                    style={{
                                        borderBottom: "1px solid var(--border)",
                                    }}
                                    data-testid={`cell-yesterday-${s.ticker}`}
                                >
                                    {fmtPrice(s.yesterday_close, 4)}
                                </td>
                                <td
                                    className="py-4 px-4 text-base"
                                    style={{
                                        borderBottom: "1px solid var(--border)",
                                    }}
                                    data-testid={`cell-today-${s.ticker}`}
                                >
                                    {fmtPrice(s.today_close, 4)}
                                </td>
                                <td
                                    className="py-4 px-4"
                                    style={{
                                        borderBottom: "1px solid var(--border)",
                                    }}
                                    data-testid={`cell-daily-${s.ticker}`}
                                >
                                    <span
                                        style={{
                                            color:
                                                s.daily_return >= 0
                                                    ? "var(--positive)"
                                                    : "var(--negative)",
                                            fontWeight: 500,
                                        }}
                                    >
                                        {s.daily_return >= 0 ? "+" : ""}
                                        {fmtPrice(s.daily_return, 4)}
                                    </span>
                                </td>
                                <td
                                    className="py-4 px-4 text-base"
                                    style={{
                                        borderBottom: "1px solid var(--border)",
                                    }}
                                    data-testid={`cell-shares-${s.ticker}`}
                                >
                                    {fmtInt(s.shares_purchasable)}
                                </td>
                                <td
                                    className="py-4 px-4"
                                    style={{
                                        borderBottom: "1px solid var(--border)",
                                    }}
                                    data-testid={`cell-est-return-${s.ticker}`}
                                >
                                    <ReturnBadge
                                        value={s.estimated_total_return}
                                        suffix="RM"
                                    />
                                </td>
                                <td
                                    className="py-4 px-4"
                                    style={{
                                        borderBottom: "1px solid var(--border)",
                                    }}
                                    data-testid={`cell-return-pct-${s.ticker}`}
                                >
                                    <ReturnBadge
                                        value={s.return_percentage}
                                        suffix="%"
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <p
                className="mt-4 text-sm"
                style={{ color: "var(--text-secondary)" }}
            >
                Stored as a <code>pandas.DataFrame</code> on the server. The
                same DataFrame is reused for the next two analyses.
            </p>
        </section>
    );
};

export default AnalysisTable;
