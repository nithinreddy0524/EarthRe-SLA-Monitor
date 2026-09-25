# EarthRe SLA Monitoring - React Frontend

## 1. Overview
The **EarthRe SLA Frontend** is a modern, responsive single-page web dashboard built with **React**, **Vite**, and **Tailwind CSS v4**.

It provides real-time SLA availability percentage metrics, latency statistics (avg, p50, p95, p99), CSV drag-and-drop upload feedback, and filterable monitoring check logs across EarthRe's 5 microservices.

---

## 2. Tech Stack & Architecture
- **Framework**: React 19 + Vite 6
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite` plugin)
- **Icons**: Lucide Icons (`lucide-react`)
- **API Client**: REST API Client (`src/api.js`) connecting to AWS Lambda / local API Gateway.
- **Theme**: Premium Dark Glassmorphism Palette (Deep Slate `#020617`, Earth Emerald `#22c55e`, Cyan, and Amber accents).

---

## 3. Directory Structure
```
frontend/
├── index.html                     # Main HTML template
├── vite.config.js                 # Vite 6 + Tailwind CSS v4 plugin configuration
├── package.json                   # React & Tailwind dependencies
├── .env.local                     # Environment variables (VITE_API_BASE_URL)
└── src/
    ├── main.jsx                   # React DOM root entrypoint
    ├── App.jsx                    # Primary Dashboard layout & views
    ├── index.css                  # Global Tailwind CSS @import directives
    └── api.js                     # REST API client module (uploads, stats, logs)
```

---

## 4. Key Components & Layout
1. **Header Navigation**: Shows EarthRe branding, system status badge, and backend connection indicator.
2. **Hero Banner**: Explains transparent SLA monitoring & automated CSV data cleaning.
3. **Metrics Overview Cards**: Displays Availability %, Avg Latency, Ingested Record Counts, and Cleaned Data Quality Anomalies.
4. **CSV Upload Container**: Interactive file drag & drop dropzone for uploading monitoring CSV dataset files.
5. **Monitored Microservices Status**: Overview cards for `svc-auth`, `svc-payments`, `svc-search`, `svc-reports`, and `svc-notify`.

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
