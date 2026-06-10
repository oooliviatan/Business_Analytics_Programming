import React from "react";
import {
    Trophy,
    AlertTriangle,
    Compass,
    BookOpen,
    Github,
    ArrowDown,
} from "lucide-react";
import { fmtRM, fmtPct } from "@/lib/format";

const Discussion = ({ discussion }) => {
    if (!discussion) return null;
    const { strongest, weakest, limitations, other_factors } = discussion;
    return (
        <section
            id="discussion"
            className="max-w-6xl mx-auto px-6 md:px-10 py-16 md:py-24"
            data-testid="discussion-section"
        >
            <div className="max-w-3xl">
                <span className="label-eyebrow">
                    07 · Discussion (Question 4)
                </span>
                <h2 className="font-heading mt-3 text-3xl sm:text-4xl font-medium tracking-tight">
                    So… should you actually buy any of these?
                </h2>
                <p
                    className="mt-4 text-base leading-relaxed"
                    style={{ color: "var(--text-secondary)" }}
                >
                    Honest answer for a beginner: this analysis is a starting
                    point, not a recommendation. Here is what the numbers say
                    today, and what they cannot tell you.
                </p>
            </div>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                <article
                    className="card-soft p-7"
                    data-testid="discussion-strongest"
                >
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-2xl flex items-center justify-center"
                            style={{
                                background: "var(--positive-bg)",
                                color: "var(--positive)",
                            }}
                        >
                            <Trophy size={20} />
                        </div>
                        <span className="label-eyebrow">
                            Strongest performer (1-day)
                        </span>
                    </div>
                    <h3 className="font-heading mt-4 text-2xl font-medium">
                        {strongest.name}{" "}
                        <span
                            className="text-base font-normal"
                            style={{ color: "var(--text-secondary)" }}
                        >
                            ({strongest.ticker})
                        </span>
                    </h3>
                    <div className="mt-4 grid grid-cols-2 gap-4">
                        <div>
                            <div
                                className="text-xs uppercase tracking-widest"
                                style={{ color: "var(--text-secondary)" }}
                            >
                                Return %
                            </div>
                            <div
                                className="font-heading text-2xl mt-1 font-semibold"
                                style={{ color: "var(--positive)" }}
                            >
                                {fmtPct(strongest.return_percentage)}
                            </div>
                        </div>
                        <div>
                            <div
                                className="text-xs uppercase tracking-widest"
                                style={{ color: "var(--text-secondary)" }}
                            >
                                Est. P/L on RM 1,000
                            </div>
                            <div
                                className="font-heading text-2xl mt-1 font-semibold"
                                style={{ color: "var(--positive)" }}
                            >
                                {fmtRM(strongest.estimated_total_return)}
                            </div>
                        </div>
                    </div>
                    <p
                        className="mt-4 text-sm leading-relaxed"
                        style={{ color: "var(--text-secondary)" }}
                    >
                        Why it led today: a positive daily move combined with
                        a low share price meant your RM 1,000 bought more
                        shares — so the ringgit gain was bigger. Remember,
                        leadership on a single day rotates often.
                    </p>
                </article>

                <article
                    className="card-soft p-7"
                    data-testid="discussion-weakest"
                >
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-2xl flex items-center justify-center"
                            style={{
                                background: "var(--negative-bg)",
                                color: "var(--negative)",
                            }}
                        >
                            <ArrowDown size={20} />
                        </div>
                        <span className="label-eyebrow">Weakest today</span>
                    </div>
                    <h3 className="font-heading mt-4 text-2xl font-medium">
                        {weakest.name}{" "}
                        <span
                            className="text-base font-normal"
                            style={{ color: "var(--text-secondary)" }}
                        >
                            ({weakest.ticker})
                        </span>
                    </h3>
                    <div className="mt-4 grid grid-cols-2 gap-4">
                        <div>
                            <div
                                className="text-xs uppercase tracking-widest"
                                style={{ color: "var(--text-secondary)" }}
                            >
                                Return %
                            </div>
                            <div
                                className="font-heading text-2xl mt-1 font-semibold"
                                style={{ color: "var(--negative)" }}
                            >
                                {fmtPct(weakest.return_percentage)}
                            </div>
                        </div>
                        <div>
                            <div
                                className="text-xs uppercase tracking-widest"
                                style={{ color: "var(--text-secondary)" }}
                            >
                                Est. P/L on RM 1,000
                            </div>
                            <div
                                className="font-heading text-2xl mt-1 font-semibold"
                                style={{ color: "var(--negative)" }}
                            >
                                {fmtRM(weakest.estimated_total_return)}
                            </div>
                        </div>
                    </div>
                    <p
                        className="mt-4 text-sm leading-relaxed"
                        style={{ color: "var(--text-secondary)" }}
                    >
                        A red day does not equal a bad company. Check the
                        1-month trend chart above before drawing a conclusion.
                    </p>
                </article>
            </div>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                <article
                    className="card-soft p-7"
                    data-testid="discussion-limitations"
                >
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-2xl flex items-center justify-center"
                            style={{
                                background: "#F0ECE4",
                                color: "var(--text-primary)",
                            }}
                        >
                            <AlertTriangle size={20} />
                        </div>
                        <h3 className="font-heading text-xl font-medium">
                            Limitations of this analysis
                        </h3>
                    </div>
                    <ul className="mt-5 space-y-3">
                        {limitations.map((lim, i) => (
                            <li
                                key={i}
                                className="flex gap-3 text-sm leading-relaxed"
                                style={{ color: "var(--text-secondary)" }}
                            >
                                <span
                                    className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                                    style={{
                                        background: "var(--negative)",
                                    }}
                                />
                                <span>{lim}</span>
                            </li>
                        ))}
                    </ul>
                </article>

                <article
                    className="card-soft p-7"
                    data-testid="discussion-factors"
                >
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-2xl flex items-center justify-center"
                            style={{
                                background: "var(--positive-bg)",
                                color: "var(--primary)",
                            }}
                        >
                            <Compass size={20} />
                        </div>
                        <h3 className="font-heading text-xl font-medium">
                            Other factors to consider
                        </h3>
                    </div>
                    <ul className="mt-5 space-y-3">
                        {other_factors.map((f, i) => (
                            <li
                                key={i}
                                className="flex gap-3 text-sm leading-relaxed"
                                style={{ color: "var(--text-secondary)" }}
                            >
                                <span
                                    className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                                    style={{ background: "var(--positive)" }}
                                />
                                <span>{f}</span>
                            </li>
                        ))}
                    </ul>
                </article>
            </div>

            <div
                className="mt-10 card-soft p-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                data-testid="discussion-footer"
            >
                <div className="flex items-start gap-3">
                    <BookOpen
                        size={22}
                        style={{ color: "var(--primary)", marginTop: 2 }}
                    />
                    <p
                        className="text-sm leading-relaxed max-w-xl"
                        style={{ color: "var(--text-secondary)" }}
                    >
                        <strong style={{ color: "var(--text-primary)" }}>
                            For learning only.
                        </strong>{" "}
                        This project was built for SQITK 3073 (Business
                        Analytic Programming) and uses Python, pandas,
                        yfinance and matplotlib-equivalent visualisations.
                        Past returns are not a promise of future results.
                    </p>
                </div>
                <a
                    href="https://github.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary"
                    data-testid="discussion-github-link"
                >
                    <Github size={16} />
                    View source on GitHub
                </a>
            </div>
        </section>
    );
};

export default Discussion;
