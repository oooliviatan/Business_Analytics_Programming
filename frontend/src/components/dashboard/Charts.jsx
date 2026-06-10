import React from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell,
    LabelList,
} from "recharts";
import { fmtPct, fmtRM } from "@/lib/format";

const CHART_COLORS = ["#2C4C3B", "#4A7C59", "#D96C5B", "#F2A65A", "#8E9BAE"];

const LineTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div
            className="card-soft p-3"
            style={{
                background: "#FFFFFF",
                borderColor: "var(--border)",
            }}
        >
            <div
                className="text-xs uppercase tracking-widest"
                style={{ color: "var(--text-secondary)" }}
            >
                {label}
            </div>
            <ul className="mt-2 space-y-1">
                {payload.map((p) => (
                    <li
                        key={p.dataKey}
                        className="flex items-center gap-2 text-sm"
                    >
                        <span
                            style={{
                                width: 10,
                                height: 10,
                                borderRadius: 9999,
                                background: p.stroke,
                                display: "inline-block",
                            }}
                        />
                        <span style={{ color: "var(--text-primary)" }}>
                            {p.dataKey}
                        </span>
                        <span
                            className="ml-auto font-medium"
                            style={{ color: "var(--text-primary)" }}
                        >
                            RM {Number(p.value).toFixed(3)}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export const ClosingPriceTrendChart = ({ trend, stocks, periodLabel }) => {
    if (!trend?.length) return null;
    return (
        <div
            className="card-soft p-6 md:p-8"
            data-testid="chart-closing-trend-card"
        >
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <span className="label-eyebrow">
                        Chart 1 · Closing price trend
                    </span>
                    <h3 className="font-heading mt-2 text-xl sm:text-2xl font-medium">
                        How each stock moved over the last{" "}
                        {periodLabel?.toLowerCase() || "month"}
                    </h3>
                    <p
                        className="text-sm mt-1"
                        style={{ color: "var(--text-secondary)" }}
                    >
                        X-axis: trading date · Y-axis: daily closing price
                        (RM). One line per stock.
                    </p>
                </div>
            </div>
            <div className="mt-6 h-[360px]" data-testid="chart-closing-trend">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={trend}
                        margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                    >
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#E6E9E6"
                        />
                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 12, fill: "#5A6D63" }}
                            tickFormatter={(d) => d.slice(5)}
                        />
                        <YAxis
                            tick={{ fontSize: 12, fill: "#5A6D63" }}
                            domain={["auto", "auto"]}
                            label={{
                                value: "Closing Price (RM)",
                                angle: -90,
                                position: "insideLeft",
                                style: {
                                    fill: "#5A6D63",
                                    fontSize: 12,
                                },
                                offset: 10,
                            }}
                        />
                        <Tooltip content={<LineTooltip />} />
                        <Legend
                            wrapperStyle={{
                                fontSize: 12,
                                paddingTop: 8,
                            }}
                        />
                        {stocks.map((s, i) => (
                            <Line
                                key={s.ticker}
                                type="monotone"
                                dataKey={s.ticker}
                                name={`${s.ticker} · ${s.name}`}
                                stroke={CHART_COLORS[i % CHART_COLORS.length]}
                                strokeWidth={2.5}
                                dot={false}
                                activeDot={{ r: 4 }}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

const BarTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const row = payload[0].payload;
    return (
        <div className="card-soft p-3" style={{ background: "#FFFFFF" }}>
            <div
                className="text-xs uppercase tracking-widest"
                style={{ color: "var(--text-secondary)" }}
            >
                {row.ticker} · {row.name}
            </div>
            <div className="mt-1 text-sm">
                Return: <strong>{fmtPct(row.return_percentage)}</strong>
            </div>
            <div className="text-sm">
                Est. P/L: <strong>{fmtRM(row.estimated_total_return)}</strong>
            </div>
        </div>
    );
};

export const ReturnComparisonChart = ({ stocks }) => {
    if (!stocks?.length) return null;
    const data = [...stocks]
        .sort((a, b) => b.return_percentage - a.return_percentage)
        .map((s) => ({
            ticker: s.ticker,
            name: s.name,
            return_percentage: s.return_percentage,
            estimated_total_return: s.estimated_total_return,
        }));

    return (
        <div
            className="card-soft p-6 md:p-8"
            data-testid="chart-return-comparison-card"
        >
            <div>
                <span className="label-eyebrow">
                    Chart 2 · Portfolio performance comparison
                </span>
                <h3 className="font-heading mt-2 text-xl sm:text-2xl font-medium">
                    Return % on RM 1,000 — side by side
                </h3>
                <p
                    className="text-sm mt-1"
                    style={{ color: "var(--text-secondary)" }}
                >
                    Sorted best to worst. Green = gain, terracotta = loss.
                </p>
            </div>
            <div
                className="mt-6 h-[360px]"
                data-testid="chart-return-comparison"
            >
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{ top: 24, right: 20, left: 0, bottom: 0 }}
                    >
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#E6E9E6"
                        />
                        <XAxis
                            dataKey="ticker"
                            tick={{ fontSize: 12, fill: "#5A6D63" }}
                        />
                        <YAxis
                            tick={{ fontSize: 12, fill: "#5A6D63" }}
                            tickFormatter={(v) => `${v}%`}
                            label={{
                                value: "Return %",
                                angle: -90,
                                position: "insideLeft",
                                style: { fill: "#5A6D63", fontSize: 12 },
                                offset: 10,
                            }}
                        />
                        <Tooltip
                            cursor={{ fill: "rgba(44,76,59,0.05)" }}
                            content={<BarTooltip />}
                        />
                        <Bar
                            dataKey="return_percentage"
                            radius={[8, 8, 0, 0]}
                            name="Return %"
                        >
                            {data.map((entry, i) => (
                                <Cell
                                    key={i}
                                    fill={
                                        entry.return_percentage >= 0
                                            ? "#4A7C59"
                                            : "#D96C5B"
                                    }
                                />
                            ))}
                            <LabelList
                                dataKey="return_percentage"
                                position="top"
                                formatter={(v) => fmtPct(v, 2)}
                                style={{
                                    fill: "#1C2621",
                                    fontSize: 11,
                                    fontWeight: 500,
                                }}
                            />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

const Charts = ({ trend, stocks, periodLabel }) => {
    return (
        <section
            id="charts"
            className="max-w-6xl mx-auto px-6 md:px-10 py-16 md:py-24"
            data-testid="charts-section"
        >
            <div className="max-w-3xl">
                <span className="label-eyebrow">
                    06 · Visualisation (Question 3)
                </span>
                <h2 className="font-heading mt-3 text-3xl sm:text-4xl font-medium tracking-tight">
                    Pictures over paragraphs
                </h2>
                <p
                    className="mt-4 text-base leading-relaxed"
                    style={{ color: "var(--text-secondary)" }}
                >
                    Two charts to read the portfolio at a glance — first the
                    daily price journey, then the head-to-head return
                    comparison on your RM 1,000.
                </p>
            </div>
            <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ClosingPriceTrendChart
                    trend={trend}
                    stocks={stocks}
                    periodLabel={periodLabel}
                />
                <ReturnComparisonChart stocks={stocks} />
            </div>
        </section>
    );
};

export default Charts;
