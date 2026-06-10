import React from "react";
import { fmtRM } from "@/lib/format";
import { categoryColor } from "@/lib/format";

const PerformanceGroupBy = ({ stocks, groupby }) => {
    if (!groupby?.length) return null;

    const stocksByCat = stocks.reduce((acc, s) => {
        acc[s.performance_category] = acc[s.performance_category] || [];
        acc[s.performance_category].push(s);
        return acc;
    }, {});

    const orderedCats = ["High Return", "Moderate Return", "Negative Return"];
    const sortedGroupby = [...groupby].sort(
        (a, b) =>
            orderedCats.indexOf(a.performance_category) -
            orderedCats.indexOf(b.performance_category),
    );

    return (
        <section
            id="groupby"
            className="max-w-6xl mx-auto px-6 md:px-10 py-16 md:py-24"
            data-testid="groupby-section"
        >
            <div className="max-w-3xl">
                <span className="label-eyebrow">
                    05 · Performance category (Question 2b)
                </span>
                <h2 className="font-heading mt-3 text-3xl sm:text-4xl font-medium tracking-tight">
                    Sorting winners, drifters and losers
                </h2>
                <p
                    className="mt-4 text-base leading-relaxed"
                    style={{ color: "var(--text-secondary)" }}
                >
                    A new <code>Performance Category</code> column is added to
                    the DataFrame, then we{" "}
                    <code>df.groupby(&quot;Performance Category&quot;)</code> and take
                    the mean of the estimated return. Beginners get a
                    one-glance view of how the portfolio is leaning.
                </p>
            </div>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
                {sortedGroupby.map((g) => (
                    <article
                        key={g.performance_category}
                        className="card-soft p-7"
                        data-testid={`groupby-card-${g.performance_category.replace(/ /g, "-")}`}
                    >
                        <div className="flex items-center justify-between">
                            <span
                                className="label-eyebrow"
                                style={{
                                    color: categoryColor(
                                        g.performance_category,
                                    ),
                                }}
                            >
                                {g.performance_category}
                            </span>
                            <span className="badge-neutral">
                                {g.stock_count} stock
                                {g.stock_count > 1 ? "s" : ""}
                            </span>
                        </div>
                        <div className="mt-6">
                            <div
                                className="text-xs uppercase tracking-widest"
                                style={{ color: "var(--text-secondary)" }}
                            >
                                Average est. return
                            </div>
                            <div
                                className="font-heading mt-2 text-3xl font-semibold"
                                style={{
                                    color: categoryColor(
                                        g.performance_category,
                                    ),
                                }}
                            >
                                {fmtRM(g.avg_estimated_total_return)}
                            </div>
                        </div>
                        <div className="mt-6">
                            <div
                                className="text-xs uppercase tracking-widest mb-2"
                                style={{ color: "var(--text-secondary)" }}
                            >
                                Stocks in this group
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {(stocksByCat[g.performance_category] || []).map(
                                    (s) => (
                                        <span
                                            key={s.ticker}
                                            className="badge-neutral"
                                        >
                                            {s.ticker}
                                        </span>
                                    ),
                                )}
                            </div>
                        </div>
                    </article>
                ))}
            </div>

            <p
                className="mt-6 text-sm"
                style={{ color: "var(--text-secondary)" }}
            >
                Rule used: Return % &lt; 0 → Negative Return · 0%–2% →
                Moderate Return · &gt; 2% → High Return.
            </p>
        </section>
    );
};

export default PerformanceGroupBy;
