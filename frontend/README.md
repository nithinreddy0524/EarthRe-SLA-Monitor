# EarthRe SLA Monitoring - React Frontend

## 1. Overview
The **EarthRe SLA Frontend** is a modern, responsive single-page web dashboard built with **React 19**, **Vite 6**, and **Tailwind CSS v4**.

It provides real-time SLA availability percentage metrics, latency statistics (avg, p50, p95, p99), CSV drag-and-drop upload feedback, and filterable monitoring check logs across EarthRe's 5 microservices.

---

## 2. Tech Stack & Architecture
- **Framework**: React 19 + Vite 6
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite` plugin)
- **Icons**: Lucide Icons (`lucide-react`)
- **API Client**: REST API Client (`src/api.js`) connecting to AWS Lambda / local API Gateway.
- **Theme**: Clean White & Emerald Green Gradient Palette (`#059669`, `#10b981`, `#022c22`).

---

## 3. Directory Structure
```
frontend/
├── index.html                     # Main HTML template
├── vite.config.js                 # Vite 6 + Tailwind CSS v4 plugin configuration
├── package.json                   # React & Tailwind dependencies
├── .env                           # Environment variables (VITE_API_BASE_URL)
└── src/
    ├── main.jsx                   # React DOM root entrypoint
    ├── App.jsx                    # Primary Dashboard layout & views
    ├── index.css                  # Global Tailwind CSS directives
    ├── api.js                     # REST API client module (uploads, stats, logs)
    └── components/
        ├── CsvUploader.jsx        # Interactive CSV drag-and-drop uploader
        └── LogsTable.jsx          # Filterable monitoring logs table
```

---

## 4. Key Components & Layout
1. **Header Navigation**: Shows EarthRe branding, system status badge, and backend connection indicator.
2. **Hero Banner**: Explains transparent SLA monitoring & automated CSV data cleaning.
3. **Overview Metrics Cards**: Displays Availability %, Avg Latency, Ingested Record Counts, and Cleaned Data Quality Anomalies.
4. **CSV Upload Container**: Interactive file drag & drop dropzone for uploading monitoring CSV dataset files.
5. **Monitored Microservices Breakdown**: SLA availability % and average latency breakdown cards for `svc-auth`, `svc-payments`, `svc-search`, `svc-reports`, and `svc-notify`.
6. **Filterable Logs Table**: Search box, service filter, status code filter, quality status filter, and pagination.

---

## 5. Development & Build Commands
Run commands from the `frontend/` directory:

```bash
# Start Vite Development Server
npm run dev

# Production Build
npm run build

# Preview Production Build
npm run preview
```
