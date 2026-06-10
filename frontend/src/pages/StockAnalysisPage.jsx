import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Loader2, BarChart3 } from "lucide-react";

import Hero from "@/components/dashboard/Hero";
import WhyTheseStocks from "@/components/dashboard/WhyTheseStocks";
import AnalysisTable from "@/components/dashboard/AnalysisTable";
import PortfolioSummary from "@/components/dashboard/PortfolioSummary";
import PerformanceGroupBy from "@/components/dashboard/PerformanceGroupBy";
import Charts from "@/components/dashboard/Charts";
import Discussion from "@/components/dashboard/Discussion";
import { Toaster, toast } from "sonner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Nav = () => (
    <header
        className="sticky top-0 z-50"
        style={{
            backdropFilter: "blur(16px)",
            background: "rgba(253,251,247,0.8)",
            borderBottom: "1px solid var(--border)",
        }}
        data-testid="nav"
    >
        <div className="max-w-6xl mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{
                        background: "var(--primary)",
                        color: "#fdfbf7",
                    }}
                >
                    <BarChart3 size={18} />
                </div>
                <span
                    className="font-heading font-semibold"
                    data-testid="nav-brand"
                >
                    Bursa Bites
                </span>
            </div>
            <nav className="hidden md:flex items-center gap-7 text-sm">
                {[
                    ["Portfolio", "portfolio"],
                    ["Analysis", "analysis"],
                    ["Summary", "summary"],
                    ["Categories", "groupby"],
                    ["Charts", "charts"],
                    ["Insights", "discussion"],
                ].map(([label, id]) => (
                    <a
                        key={id}
                        href={`#${id}`}
                        className="hover:underline underline-offset-4"
                        style={{ color: "var(--text-secondary)" }}
                        data-testid={`nav-link-${id}`}
                    >
                        {label}
                    </a>
                ))}
            </nav>
        </div>
    </header>
);

const Footer = () => (
    <footer
        className="mt-16 border-t"
        style={{ borderColor: "var(--border)" }}
        data-testid="footer"
    >
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-10 text-sm flex flex-col md:flex-row gap-3 justify-between">
            <div style={{ color: "var(--text-secondary)" }}>
                Built for SQITK 3073 · Business Analytic Programming · Python
                · pandas · yfinance · matplotlib-style charts via Recharts.
            </div>
            <div style={{ color: "var(--text-secondary)" }}>
                © {new Date().getFullYear()} Bursa Bites — educational use
                only.
            </div>
        </div>
    </footer>
);

const LoadingState = () => (
    <div
        className="min-h-screen flex flex-col items-center justify-center gap-4"
        data-testid="loading-state"
    >
        <Loader2
            className="animate-spin"
            size={36}
            style={{ color: "var(--primary)" }}
        />
        <div
            className="font-heading text-lg"
            style={{ color: "var(--text-primary)" }}
        >
            Fetching live Bursa Malaysia data…
        </div>
        <div
            className="text-sm max-w-md text-center"
            style={{ color: "var(--text-secondary)" }}
        >
            yfinance is pulling the last month of price history for 5 stocks.
            This usually takes a few seconds.
        </div>
    </div>
);

const ErrorState = ({ message, onRetry }) => (
    <div
        className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center"
        data-testid="error-state"
    >
        <div
            className="font-heading text-2xl"
            style={{ color: "var(--negative)" }}
        >
            Couldn&apos;t load the data
        </div>
        <p
            className="max-w-md text-sm"
            style={{ color: "var(--text-secondary)" }}
        >
            {message ||
                "yfinance didn't respond in time. Please retry — it's usually back on the second attempt."}
        </p>
        <button
            type="button"
            onClick={onRetry}
            className="btn-primary"
            data-testid="error-retry"
        >
            Try again
        </button>
    </div>
);

const StockAnalysisPage = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [downloadingPdf, setDownloadingPdf] = useState(false);
    const [error, setError] = useState(null);
    const [asOf, setAsOf] = useState(null);
    const [period, setPeriod] = useState("1mo");

    const fetchData = useCallback(
        async (refresh = false, nextPeriod = null) => {
            const usePeriod = nextPeriod || period;
            if (refresh) setRefreshing(true);
            else setLoading(true);
            setError(null);
            try {
                const res = await axios.get(`${API}/stocks/analysis`, {
                    params: {
                        period: usePeriod,
                        refresh: refresh ? "true" : "false",
                    },
                    timeout: 90000,
                });
                setData(res.data);
                const now = new Date();
                setAsOf(
                    now.toLocaleString("en-MY", {
                        timeZone: "Asia/Kuala_Lumpur",
                        dateStyle: "medium",
                        timeStyle: "short",
                    }),
                );
                if (refresh) toast.success("Live data refreshed.");
            } catch (e) {
                const msg =
                    e?.response?.data?.detail ||
                    e?.message ||
                    "Unknown error fetching stock data.";
                setError(msg);
                toast.error("Failed to load stock data");
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        [period],
    );

    useEffect(() => {
        let cancelled = false;
        const run = async () => {
            if (cancelled) return;
            await fetchData(false);
        };
        run();
        return () => {
            cancelled = true;
        };
    }, [fetchData]);

    const handlePeriodChange = (next) => {
        if (!next || next === period) return;
        setPeriod(next);
        // fetchData runs on next render via useEffect (period dep through useCallback)
    };

    const handleDownloadPdf = async () => {
        try {
            setDownloadingPdf(true);
            const res = await axios.get(`${API}/stocks/pdf`, {
                params: { period },
                responseType: "blob",
                timeout: 120000,
            });
            const url = window.URL.createObjectURL(
                new Blob([res.data], { type: "application/pdf" }),
            );
            const a = document.createElement("a");
            a.href = url;
            a.download = `bursa-analysis-${period}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            toast.success("PDF report downloaded.");
        } catch (e) {
            toast.error("PDF download failed. Please try again.");
        } finally {
            setDownloadingPdf(false);
        }
    };

    if (loading) return <LoadingState />;
    if (error && !data)
        return <ErrorState message={error} onRetry={() => fetchData(false)} />;

    return (
        <div className="App" data-testid="stock-page">
            <Toaster richColors position="top-right" />
            <Nav />
            <Hero
                onRefresh={() => fetchData(true)}
                refreshing={refreshing}
                capital={data?.investment_capital}
                asOf={asOf}
                periods={data?.available_periods}
                period={period}
                onPeriodChange={handlePeriodChange}
                periodLabel={data?.period_label}
                onDownloadPdf={handleDownloadPdf}
                downloadingPdf={downloadingPdf}
            />
            <WhyTheseStocks stocks={data?.stocks_meta} />
            <AnalysisTable
                stocks={data?.stocks}
                capital={data?.investment_capital}
            />
            <PortfolioSummary summary={data?.summary} />
            <PerformanceGroupBy
                stocks={data?.stocks}
                groupby={data?.groupby}
            />
            <Charts
                trend={data?.trend}
                stocks={data?.stocks}
                periodLabel={data?.period_label}
            />
            <Discussion discussion={data?.discussion} />
            <Footer />
        </div>
    );
};

export default StockAnalysisPage;
