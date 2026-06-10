import React from "react";
import {
    HeartPulse,
    Cpu,
    Landmark,
    Dices,
    Building2,
    Sparkles,
} from "lucide-react";

const sectorIcon = {
    Healthcare: HeartPulse,
    Technology: Cpu,
    Banking: Landmark,
    "Leisure & Hospitality": Dices,
    "Conglomerate (Property & Construction)": Building2,
};

const WhyTheseStocks = ({ stocks }) => {
    if (!stocks?.length) return null;

    return (
        <section
            id="portfolio"
            className="max-w-6xl mx-auto px-6 md:px-10 py-16 md:py-24"
            data-testid="why-stocks-section"
        >
            <div className="max-w-3xl">
                <span className="label-eyebrow">02 · The portfolio</span>
                <h2 className="font-heading mt-3 text-3xl sm:text-4xl font-medium tracking-tight">
                    Why these 5 stocks?
                </h2>
                <p
                    className="mt-4 text-base leading-relaxed"
                    style={{ color: "var(--text-secondary)" }}
                >
                    A beginner portfolio should not bet everything on one
                    sector. We picked one large, liquid name from five
                    different parts of the Malaysian economy — so a slump in
                    one area is cushioned by another. Each one trades well
                    above RM 0.50 and is not a distressed penny stock.
                </p>
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stocks.map((s, idx) => {
                    const Icon = sectorIcon[s.sector] || Sparkles;
                    return (
                        <article
                            key={s.ticker}
                            className="card-soft p-7 flex flex-col gap-4 reveal"
                            style={{ animationDelay: `${idx * 0.06}s` }}
                            data-testid={`stock-card-${s.ticker}`}
                        >
                            <div className="flex items-center justify-between">
                                <div
                                    className="w-12 h-12 rounded-2xl flex items-center justify-center"
                                    style={{
                                        background: "var(--positive-bg)",
                                        color: "var(--primary)",
                                    }}
                                >
                                    <Icon size={22} />
                                </div>
                                <span className="badge-neutral">
                                    {s.ticker}
                                </span>
                            </div>
                            <div>
                                <div className="label-eyebrow">{s.sector}</div>
                                <h3 className="font-heading mt-2 text-xl font-medium">
                                    {s.name}
                                </h3>
                            </div>
                            <p
                                className="text-sm leading-relaxed"
                                style={{ color: "var(--text-secondary)" }}
                            >
                                {s.thesis}
                            </p>
                        </article>
                    );
                })}
            </div>
        </section>
    );
};

export default WhyTheseStocks;
