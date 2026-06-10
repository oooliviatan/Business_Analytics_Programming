import React from "react";
import { fmtPrice, fmtRM, fmtPct } from "@/lib/format";

const PortfolioSummary = ({ summary }) => {
    if (!summary?.length) return null;
    return (
        <section
            id="summary"
            className="max-w-6xl mx-auto px-6 md:px-10 py-16 md:py-24"
            data-testid="summary-section"
        >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-5">
                    <span className="label-eyebrow">
                        04 · Portfolio summary (Question 2a)
                    </span>
                    <h2 className="font-heading mt-3 text-3xl sm:text-4xl font-medium tracking-tight">
                        The view that matters most
                    </h2>
                    <p
                        className="mt-4 text-base leading-relaxed"
                        style={{ color: "var(--text-secondary)" }}
                    >
                        Using pandas slicing (
                        <code>df.loc[:, [...]]</code>), we strip the table down
                        to the five columns an investor actually compares: the
                        ticker, yesterday&apos;s price, today&apos;s price, the ringgit
                        gain/loss and the return %. Less noise, faster
                        decisions.
                    </p>
                    <ul
                        className="mt-6 space-y-3 text-sm"
                        style={{ color: "var(--text-secondary)" }}
                    >
                        <li>
                            <strong style={{ color: "var(--text-primary)" }}>
                                Apples to apples:
                            </strong>{" "}
                            every stock is measured with the same RM1,000
                            assumption.
                        </li>
                        <li>
                            <strong style={{ color: "var(--text-primary)" }}>
                                Quick winners/losers:
                            </strong>{" "}
                            the green / terracotta badges scan instantly.
                        </li>
                        <li>
                            <strong style={{ color: "var(--text-primary)" }}>
                                Beginner friendly:
                            </strong>{" "}
                            no jargon, no ratios — just the numbers your
                            wallet feels.
                        </li>
                    </ul>
                </div>

                <div
                    className="lg:col-span-7 card-soft overflow-x-auto"
                    data-testid="summary-table-wrapper"
                >
                    <table className="w-full" data-testid="summary-table">
                        <thead>
                            <tr>
                                {[
                                    "Ticker",
                                    "Prev. Close (RM)",
                                    "Latest Close (RM)",
                                    "Est. Total Return",
                                    "Return %",
                                ].map((h, i) => (
                                    <th
                                        key={h}
                                        className="py-4 px-4 text-sm font-medium text-left"
                                        style={{
                                            color: "var(--text-secondary)",
                                            borderBottom:
                                                "1px solid var(--border)",
                                        }}
                                        data-testid={`summary-th-${i}`}
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {summary.map((s) => (
                                <tr
                                    key={s.ticker}
                                    data-testid={`summary-row-${s.ticker}`}
                                >
                                    <td
                                        className="py-4 px-4 font-heading font-medium"
                                        style={{
                                            borderBottom:
                                                "1px solid var(--border)",
                                        }}
                                    >
                                        {s.ticker}
                                    </td>
                                    <td
                                        className="py-4 px-4"
                                        style={{
                                            borderBottom:
                                                "1px solid var(--border)",
                                        }}
                                    >
                                        {fmtPrice(s.yesterday_close, 4)}
                                    </td>
                                    <td
                                        className="py-4 px-4"
                                        style={{
                                            borderBottom:
                                                "1px solid var(--border)",
                                        }}
                                    >
                                        {fmtPrice(s.today_close, 4)}
                                    </td>
                                    <td
                                        className="py-4 px-4"
                                        style={{
                                            color:
                                                s.estimated_total_return >= 0
                                                    ? "var(--positive)"
                                                    : "var(--negative)",
                                            fontWeight: 500,
                                            borderBottom:
                                                "1px solid var(--border)",
                                        }}
                                    >
                                        {fmtRM(s.estimated_total_return)}
                                    </td>
                                    <td
                                        className="py-4 px-4"
                                        style={{
                                            color:
                                                s.return_percentage >= 0
                                                    ? "var(--positive)"
                                                    : "var(--negative)",
                                            fontWeight: 500,
                                            borderBottom:
                                                "1px solid var(--border)",
                                        }}
                                    >
                                        {fmtPct(s.return_percentage)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
};

export default PortfolioSummary;
