/**
 * Formatting helpers used across the dashboard.
 */
export const fmtRM = (n, digits = 2) => {
    if (n === null || n === undefined || isNaN(n)) return "RM 0.00";
    const sign = n < 0 ? "-" : "";
    const abs = Math.abs(Number(n));
    return `${sign}RM ${abs.toLocaleString("en-MY", {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
    })}`;
};

export const fmtPrice = (n, digits = 4) => {
    if (n === null || n === undefined || isNaN(n)) return "—";
    return Number(n).toFixed(digits);
};

export const fmtPct = (n, digits = 2) => {
    if (n === null || n === undefined || isNaN(n)) return "0.00%";
    const v = Number(n);
    const sign = v > 0 ? "+" : "";
    return `${sign}${v.toFixed(digits)}%`;
};

export const fmtInt = (n) => {
    if (n === null || n === undefined || isNaN(n)) return "0";
    return Math.trunc(Number(n)).toLocaleString("en-MY");
};

export const categoryColor = (cat) => {
    if (cat === "High Return") return "var(--positive)";
    if (cat === "Moderate Return") return "#7BA47A";
    return "var(--negative)";
};
