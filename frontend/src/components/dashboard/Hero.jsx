import React from "react";
import { ArrowUpRight, RefreshCw, FileDown } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const Hero = ({
    onRefresh,
    refreshing,
    capital,
    asOf,
    periods,
    period,
    onPeriodChange,
    periodLabel,
    onDownloadPdf,
    downloadingPdf,
}) => {
    return (
        <section
            className="relative overflow-hidden grain"
            data-testid="hero-section"
        >
            {/* Background image (Kuala Lumpur skyline) */}
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage:
                        "url(https://images.unsplash.com/photo-1470217957101-da7150b9b681?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTZ8MHwxfHNlYXJjaHwxfHxrdWFsYSUyMGx1bXB1ciUyMHNreWxpbmUlMjBzdW5yaXNlfGVufDB8fHx8MTc4MTExMTI3OXww&ixlib=rb-4.1.0&q=85)",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    opacity: 0.18,
                }}
            />
            <div
                className="absolute inset-0"
                style={{
                    background:
                        "linear-gradient(180deg, rgba(253,251,247,0.65) 0%, rgba(253,251,247,0.9) 60%, #FDFBF7 100%)",
                }}
            />

            <div className="relative max-w-6xl mx-auto px-6 md:px-10 pt-20 md:pt-28 pb-16 md:pb-20">
                <div className="reveal">
                    <span className="label-eyebrow" data-testid="hero-eyebrow">
                        Bursa Malaysia · SQITK 3073 Project
                    </span>
                </div>

                <h1
                    className="font-heading reveal reveal-delay-1 mt-4 text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight"
                    style={{ color: "var(--text-primary)" }}
                    data-testid="hero-title"
                >
                    What if RM{" "}
                    <span style={{ color: "var(--primary)" }}>
                        {capital?.toLocaleString("en-MY") || "1,000"}
                    </span>{" "}
                    bought you a piece of Malaysia?
                </h1>

                <p
                    className="reveal reveal-delay-2 mt-6 max-w-2xl text-lg leading-relaxed"
                    style={{ color: "var(--text-secondary)" }}
                    data-testid="hero-subtitle"
                >
                    A beginner-friendly walk-through of 5 Bursa Malaysia stocks
                    across healthcare, tech, banking, leisure and
                    conglomerates. We use live data from{" "}
                    <code
                        style={{
                            background: "#F0ECE4",
                            padding: "2px 6px",
                            borderRadius: "6px",
                        }}
                    >
                        yfinance
                    </code>{" "}
                    and analyse it with{" "}
                    <code
                        style={{
                            background: "#F0ECE4",
                            padding: "2px 6px",
                            borderRadius: "6px",
                        }}
                    >
                        pandas
                    </code>{" "}
                    so you can read the numbers like a story — not a
                    spreadsheet.
                </p>

                <div className="reveal reveal-delay-3 mt-10 flex flex-wrap items-center gap-4">
                    <a
                        href="#analysis"
                        className="btn-primary"
                        data-testid="hero-cta-explore"
                    >
                        See the analysis
                        <ArrowUpRight size={18} />
                    </a>
                    <button
                        type="button"
                        onClick={onRefresh}
                        className="btn-secondary"
                        disabled={refreshing}
                        data-testid="hero-cta-refresh"
                    >
                        <RefreshCw
                            size={16}
                            className={refreshing ? "animate-spin" : ""}
                        />
                        {refreshing ? "Refreshing live data…" : "Refresh data"}
                    </button>
                    <button
                        type="button"
                        onClick={onDownloadPdf}
                        className="btn-secondary"
                        disabled={downloadingPdf}
                        data-testid="hero-cta-pdf"
                    >
                        <FileDown
                            size={16}
                            className={downloadingPdf ? "animate-pulse" : ""}
                        />
                        {downloadingPdf ? "Building PDF…" : "Download PDF report"}
                    </button>

                    <div
                        className="flex items-center gap-2 ml-auto"
                        data-testid="hero-period-control"
                    >
                        <span
                            className="text-xs uppercase tracking-widest"
                            style={{ color: "var(--text-secondary)" }}
                        >
                            Period
                        </span>
                        <Select
                            value={period}
                            onValueChange={onPeriodChange}
                        >
                            <SelectTrigger
                                className="h-10 rounded-full bg-white border-[color:var(--border)] px-4 w-[160px]"
                                style={{ color: "var(--text-primary)" }}
                                data-testid="hero-period-trigger"
                            >
                                <SelectValue
                                    placeholder={periodLabel || "Period"}
                                />
                            </SelectTrigger>
                            <SelectContent
                                className="rounded-2xl"
                                data-testid="hero-period-content"
                            >
                                {(periods || []).map((p) => (
                                    <SelectItem
                                        key={p.key}
                                        value={p.key}
                                        data-testid={`hero-period-option-${p.key}`}
                                    >
                                        {p.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {asOf && (
                        <span
                            className="text-sm w-full md:w-auto"
                            style={{ color: "var(--text-secondary)" }}
                            data-testid="hero-as-of"
                        >
                            Data as of {asOf}
                        </span>
                    )}
                </div>

                <div className="reveal reveal-delay-4 mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                        { k: "Stocks", v: "5" },
                        { k: "Capital", v: "RM 1,000" },
                        { k: "Window", v: periodLabel || "1 Month" },
                        { k: "Data", v: "Live · yfinance" },
                    ].map((item) => (
                        <div
                            key={item.k}
                            className="card-soft p-5"
                            data-testid={`hero-stat-${item.k.toLowerCase()}`}
                        >
                            <div className="label-eyebrow">{item.k}</div>
                            <div className="font-heading mt-2 text-2xl font-semibold">
                                {item.v}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Hero;
