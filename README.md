# Bursa Bites — Bursa Malaysia Stock Analysis

SQITK 3073 · Business Analytic Programming · Individual Project

Beginner-friendly dashboard that analyses 5 Bursa Malaysia stocks (KPJ Healthcare, Inari Amertron, CIMB Group, Genting Malaysia, Sunway) using **yfinance** for live data, **pandas** for analysis (slicing + groupby), and **matplotlib + Recharts** for visualisation. Includes a downloadable PDF report and a multi-period selector (1W / 1M / 3M / 6M / 1Y).

---

## Project Structure

```
bursa-bites/
├── backend/                  # FastAPI + Python (yfinance + pandas + matplotlib + reportlab)
│   ├── server.py
│   ├── requirements.txt
│   └── .env
└── frontend/                 # React (CRA + Craco + Tailwind + Recharts)
    ├── src/
    │   ├── App.js
    │   ├── App.css
    │   ├── index.js
    │   ├── index.css
    │   ├── pages/StockAnalysisPage.jsx
    │   ├── components/
    │   │   ├── dashboard/   # Hero, AnalysisTable, Charts, etc.
    │   │   └── ui/          # shadcn/ui primitives
    │   └── lib/format.js
    ├── package.json
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── craco.config.js
    └── .env
```

---

## Prerequisites

- **Python** 3.10+ (3.11 recommended)
- **Node.js** 18+ and **Yarn** 1.22+
  - Install Yarn (if you don't have it): `npm install -g yarn`

---

## 1) Run the Backend (FastAPI)

Open a terminal in VS Code:

```bash
cd backend
python -m venv venv

# Activate the venv
# macOS / Linux:
source venv/bin/activate
# Windows (PowerShell):
venv\Scripts\Activate.ps1

pip install -r requirements.txt
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

Backend will run at `http://localhost:8001`. Verify with:
- `http://localhost:8001/api/` → `{"message":"Bursa Malaysia Stock Analysis API","status":"ok"}`
- `http://localhost:8001/api/stocks/analysis` → full JSON payload
- `http://localhost:8001/api/stocks/pdf` → downloads the PDF report

> First request takes ~10–30 s while yfinance fetches data. Subsequent calls are cached for 15 minutes.

---

## 2) Run the Frontend (React)

Open a **second** terminal:

```bash
cd frontend
yarn install
yarn start
```

Frontend opens at `http://localhost:3000`. It reads `REACT_APP_BACKEND_URL` from `frontend/.env` (default `http://localhost:8001`).

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/` | Health check |
| `GET` | `/api/stocks/meta` | Portfolio + period metadata |
| `GET` | `/api/stocks/analysis?period={1w\|1mo\|3mo\|6mo\|1y}&refresh=true` | Full analysis payload (DataFrame, summary, groupby, trend, discussion) |
| `GET` | `/api/stocks/pdf?period={1w\|1mo\|3mo\|6mo\|1y}` | Multi-page PDF report (reportlab + matplotlib) |

---

## Assignment Coverage (SQITK 3073)

- **Q1 (40)** — `yfinance` data → `pandas.DataFrame` with Yesterday Close, Today Close, Daily Return, Shares for RM 1,000, Estimated Total Return, Return % for all 5 stocks. Implemented in `backend/server.py → _build_analysis()`.
- **Q2a (20)** — Portfolio Summary via `df.loc[:, [...]]` slicing.
- **Q2b (15)** — `Performance Category` column added; `df.groupby('performance_category')['estimated_total_return'].mean()` aggregated.
- **Q3 (20)** — Chart 1 (line — closing price trend) + Chart 2 (bar — return %). Both rendered with `matplotlib` (PDF) and `Recharts` (frontend, interactive).
- **Q4 (5)** — Strongest performer auto-highlighted; Limitations + Other factors lists.

---

## Troubleshooting

- **`ModuleNotFoundError: yfinance`** → activate the venv and re-run `pip install -r requirements.txt`.
- **`Failed to load stock data` toast** → yfinance was rate-limited; click **Refresh data** in the hero, or hit `/api/stocks/analysis?refresh=true`.
- **CORS errors** → ensure backend `.env` has `CORS_ORIGINS=*` and the backend is running.
- **PDF download is empty** → matplotlib needs the `Agg` backend (already set in `server.py`).

---

## Tech Stack

| Layer | Stack |
|-------|-------|
| Backend | FastAPI, uvicorn, pandas, numpy, yfinance, matplotlib, reportlab |
| Frontend | React 19, CRA + Craco, TailwindCSS, shadcn/ui, Recharts, lucide-react, axios, sonner |

For learning only — past returns are not a promise of future results.
