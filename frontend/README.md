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
├── vercel.json                    # Vercel SPA deployment configuration
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

## 4. Local Quick Start & Build Commands
Run commands from the `frontend/` directory:

```bash
# Start Vite Development Server
npm run dev

# Production Build
npm run build

# Preview Production Build
npm run preview
```

---

## 5. Production Vercel Deployment

1. Sign in to **[Vercel](https://vercel.com)** and click **Add New Project**.
2. Select your **`EarthRe-SLA-Monitor`** GitHub repository.
3. Configure project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
4. Add Environment Variable:
   - **Key**: `VITE_API_BASE_URL`
   - **Value**: `https://ngzv0cfefg.execute-api.ap-south-1.amazonaws.com/Prod/api`
5. Click **Deploy**!
