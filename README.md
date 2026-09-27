# EarthRe SLA Monitoring Dashboard

[![Tech Stack](https://img.shields.io/badge/Stack-React_19_%7C_Vite_6_%7C_Tailwind_CSS_v4_%7C_AWS_Lambda_%7C_PostgreSQL-059669.svg)](#architecture)
[![Architecture](https://img.shields.io/badge/Architecture-Serverless_AWS_SAM-047857.svg)](#architecture)
[![Theme](https://img.shields.io/badge/Theme-White_%26_Emerald_Green_Gradient-10b981.svg)](#frontend)

**EarthRe SLA Monitoring Dashboard** is an enterprise-grade, serverless data pipeline and real-time SLA analytics platform engineered to track service availability %, measure response latency percentiles (`avg`, `p50`, `p95`, `p99`), execute multi-layer deduplication, and audit telemetry anomalies across EarthRe's 5 core microservices:
1. `svc-auth` (Authentication API)
2. `svc-payments` (Payments API)
3. `svc-search` (Search Engine)
4. `svc-reports` (Reports Generator)
5. `svc-notify` (Notify Worker)

---

## 🌟 Recruiter & Executive Highlights

- **Stateless Cloud Function Ingestion (AWS Lambda + API Gateway)**: Deployed serverless parsing engine built with AWS SAM (Node.js 20.x runtime) that ingests, validates, and cleans multi-day CSV datasets statelessly in cloud memory with zero cold-start bottlenecks.
- **PostgreSQL Database Persistence & SLA SQL Aggregations**: Permanent relational storage on Neon Cloud (`earthre_sla_monitor`) executing fast indexed window aggregations (`PERCENTILE_CONT`) to compute overall SLA Availability % (`(HTTP 2xx / Valid Checks) * 100`) and latency tail percentiles (`avg`, `p50`, `p95`, `p99`).
- **Single-Screen Executive Dashboard (React 19 + Tailwind CSS v4)**: A unified dashboard featuring a 6-card executive performance summary (Uptime %, Latency Percentiles, Successful 2xx Hits, Total 4xx/5xx Failures, Telemetry Deduplication, and Data Quality Audit), individual microservice cards with emerald green availability progress bars, an ingestion batch audit history log, an interactive architecture section, and a filterable logs table.
- **7 Automated Data Cleaning & Anomaly Profiling Rules**: Automated normalization of mixed latency units (`s` to `ms`), missing latencies (`NULL`), negative latencies (`INVALID_LATENCY_NEGATIVE`), Unix epoch timestamps, timezone offsets (`+05:30`), HTTP 999 exclusion (`INVALID_STATUS_CODE_999`), and duplicate check entries.
- **Multi-Layer Deduplication Engine**: In-memory composite key normalization (`csvParser.js`) paired with database-level `ON CONFLICT (service_id, timestamp) DO NOTHING` atomic batch transactions (`ingestionService.js`)—guaranteeing zero primary key or unique constraint violations.
- **Microservices SLA Health Breakdown**: Grid-based breakdown for EarthRe's 5 core microservices displaying total failures, successful checks, valid check ratio, average speed, p95 tail latency, SLA Met/Breach pill badges, and visual emerald green availability line bars.
- **Batch Ingestion Audit History**: Built-in audit tracking table (`upload_batches` schema) displaying upload timestamps, Total Rows, Valid Rows, Invalid Flagged Rows, Duplicates Skipped, and execution status badges for every CSV dataset ingested.
- **Mobile-First Responsive UX**: Thoughtfully designed interface supporting all screen viewports (mobile to ultra-wide desktop) with single-line status badges, context-aware dual empty states, loading spinners, and debounced live search.

---

## 📸 Overview & Architecture

```
                               ┌─────────────────────────┐
                               │   React 19 + Vite 6     │
                               │  White & Emerald Green  │
                               └────────────┬────────────┘
                                            │ HTTP REST API
                                            ▼
                               ┌─────────────────────────┐
                               │ AWS SAM API Gateway     │
                               │  (http://127.0.0.1:3000)│
                               └────────────┬────────────┘
                                            │
                                            ▼
                               ┌─────────────────────────┐
                               │ AWS Lambda Function     │
                               │  (Node.js 20.x Handler) │
                               └────────────┬────────────┘
                                            │
                                            ▼
                               ┌─────────────────────────┐
                               │ PostgreSQL Database     │
                               │  (earthre_sla_monitor)  │
                               └─────────────────────────┘
```

### Key Architectural Decisions:
- **AWS Lambda + API Gateway**: Fully serverless, stateless parsing engine that auto-scales on demand with zero idle cost.
- **PostgreSQL (Neon Cloud)**: Relational schema enabling fast indexed window aggregations (`PERCENTILE_CONT`) for SLA percentiles.
- **React 19 + Tailwind CSS v4**: Responsive single-screen dashboard with collapsable SLA stats cards, batch history audit log, interactive about section, and instant filterable logs table.

---

## 🔍 Data Findings & Automated Quality Rules

During automated profiling across 44,652+ monitoring checks, 7 critical data quality anomalies were identified and handled:

| # | Data Quality Issue | Discovered Anomaly | Automated Cleaning Strategy |
| :-: | :--- | :--- | :--- |
| 1 | **Mixed Latency Units** | Latencies reported in seconds (`s`) instead of milliseconds (`ms`). | Converted `latency_unit = 's'` values to milliseconds (`* 1000`). |
| 2 | **Missing Latency Values** | Latency fields omitted or `NULL`. | Retained missing latency as `NULL` without penalizing availability %. |
| 3 | **Negative Latency Values** | Anomalous negative numbers (e.g., `-50.0ms`). | Set latency to `NULL` and flagged `INVALID_LATENCY_NEGATIVE`. |
| 4 | **Unix Epoch Timestamps** | Timestamps recorded in raw Unix seconds (e.g., `1746938700`). | Normalized epoch seconds to UTC ISO 8601 strings. |
| 5 | **Timezone Offsets** | Local offset timestamps (e.g., `2026-03-01T15:30:00+05:30`). | Converted all local offset timestamps to UTC ISO strings. |
| 6 | **HTTP Status 999** | Invalid non-standard status code `999`. | Marked `is_valid = FALSE` and flagged `INVALID_STATUS_CODE_999`. Excluded from SLA availability %. |
| 7 | **Exact Duplicate Checks** | Duplicate `(service_id, timestamp)` entries. | Filtered duplicate checks during atomic database ingestion with `ON CONFLICT DO NOTHING`. |

---

## 💡 Assumptions & Design Choices

1. **SLA Availability Definition**:
   - **Formula**: `(Successful Checks [HTTP 2xx] / Valid Checks) * 100`
   - **HTTP 2xx Status Codes**: Counted as successful SLA uptime checks.
   - **HTTP 4xx & 5xx Status Codes**: Counted as SLA downtime failures (client/auth errors, server crashes, connection timeouts).
   - **HTTP Status 999**: Excluded as invalid monitoring pings to prevent metric skew.
2. **Latency Percentiles Selection**:
   - Calculated **Average**, **p50 (Median)**, **p95**, and **p99** using PostgreSQL `PERCENTILE_CONT` to provide billing and engineering teams clear insight into response tail latencies.
3. **Single-Screen Executive Dashboard Layout**:
   - Implemented collapsible top SLA performance summary cards, batch ingestion audit history table, about platform architecture component, and bottom logs view with live text search and multi-criteria filters on a single screen.

---

## 🚀 Quick Start Guide (For Recruiters & Developers)

### 📋 Prerequisites
- **Node.js**: v18.x or v20.x+
- **PostgreSQL**: Local installation or [Neon.tech](https://neon.tech) serverless cloud database
- **Docker Desktop**: Required for local AWS SAM CLI Lambda container execution
- **AWS SAM CLI**: Installed (`sam --version`)

---

### Step 1: Clone Repository & Database Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/nithinreddy0524/EarthRe-SLA-Monitor.git
   cd EarthRe-SLA-Monitor
   ```

2. **Set up PostgreSQL Database**:
   - Create a database named `earthre_sla_monitor` in PostgreSQL or Neon Cloud.
   - Run the DDL migration script `backend/database/schema.sql` against `earthre_sla_monitor`:
     ```bash
     psql -U postgres -d earthre_sla_monitor -f backend/database/schema.sql
     ```

---

### Step 2: Backend Setup & AWS SAM API Execution

1. **Navigate to `backend/`**:
   ```bash
   cd backend
   npm install
   ```

2. **Configure Environment Variables (`backend/.env`)**:
   ```env
   DATABASE_URL=postgresql://postgres:postgres@host.docker.internal:5432/earthre_sla_monitor
   AWS_REGION=ap-south-1
   PORT=3000
   ```

3. **Start AWS SAM Local Serverless API**:
   ```powershell
   $env:AWS_ACCESS_KEY_ID="dummy"
   $env:AWS_SECRET_ACCESS_KEY="dummy"
   $env:AWS_DEFAULT_REGION="ap-south-1"
   sam local start-api --env-vars .env
   ```
   *API will mount at `http://127.0.0.1:3000`.*

---

### Step 3: Frontend Setup & Dashboard Execution

1. **Navigate to `frontend/`**:
   ```bash
   cd frontend
   npm install
   ```

2. **Configure Environment Variables (`frontend/.env`)**:
   ```env
   VITE_API_BASE_URL=http://localhost:3000/api
   ```

3. **Start Vite Development Server**:
   ```bash
   npm run dev
   ```
   *Navigate to **`http://localhost:5173`**.*

---

## 🌐 Production Cloud Deployment Guide

### 1. Serverless Backend (AWS Lambda + API Gateway)
```bash
cd backend
sam build
sam deploy --guided
```
- **Stack Name**: `earthre-sla-monitor-backend`
- **AWS Region**: `ap-south-1`
- **Parameter DatabaseUrl**: Enter your Neon Cloud PostgreSQL link.

### 2. Frontend Dashboard (Vercel)
1. Import `EarthRe-SLA-Monitor` repository into [Vercel](https://vercel.com).
2. Set **Root Directory** to `frontend`.
3. Add Environment Variable `VITE_API_BASE_URL` = `https://ngzv0cfefg.execute-api.ap-south-1.amazonaws.com/Prod/api`.
4. Deploy!

---

## 🔌 API Specification

| HTTP Method | Route | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check & PostgreSQL database connection status |
| `POST` | `/api/uploads` | Accepts CSV body for data cleaning, deduplication & bulk storage |
| `GET` | `/api/stats` | Returns SLA availability %, latency p50/p95/p99, service breakdown, and recent batches |
| `GET` | `/api/logs` | Returns filterable monitoring check logs with dynamic dropdowns, search & pagination |

---

## 🔮 What I'd Do Differently With More Time

1. **Automated S3 Bucket Trigger**:
   Configure AWS S3 bucket event notifications to invoke AWS Lambda automatically upon CSV upload instead of direct HTTP payload streaming.
2. **WebSocket Real-Time Ingestion**:
   Implement AWS API Gateway WebSockets to stream chunked upload processing status in real time.
3. **Automated SLA Credit Alerts**:
   Integrate Amazon SNS / Slack webhook notifications when monthly availability drops below the 99.9% SLA threshold.

---

## 📁 Repository Structure

```
EarthRe-SLA-Monitor/
├── backend/                        # AWS SAM Serverless Backend & PostgreSQL Engine
│   ├── template.yaml               # Infrastructure-as-Code SAM Template
│   ├── .env                        # Local SAM environment variables
│   ├── package.json                # Dependencies (dotenv, pg)
│   ├── database/
│   │   └── schema.sql              # PostgreSQL DDL migration script (upload_batches & monitoring_checks)
│   └── src/
│       ├── app.js                  # AWS Lambda entrypoint router
│       ├── db.js                   # PostgreSQL connection pool
│       └── services/
│           ├── csvParser.js        # CSV parsing & 7 data quality rules
│           ├── ingestionService.js # Atomic PostgreSQL transaction batch store & deduplication
│           ├── statsService.js     # SLA availability & percentiles calculator
│           └── logsService.js      # Paginated monitoring logs search engine
├── frontend/                       # React 19 + Vite 6 Dashboard
│   ├── .env                        # Frontend API base URL
│   ├── vercel.json                 # Vercel SPA deployment configuration
│   ├── package.json                # React & Tailwind CSS dependencies
│   └── src/
│       ├── App.jsx                 # Primary Dashboard overview & metrics layout
│       ├── api.js                  # REST API communication client
│       └── components/
│           ├── CsvUploader.jsx     # Executive CSV drag-and-drop uploader
│           ├── BatchHistory.jsx    # Ingestion batch audit log history table
│           ├── AboutSection.jsx    # Collapsible system architecture breakdown
│           └── LogsTable.jsx       # Filterable monitoring check logs table
└── sample_data/                    # EarthRe official CSV dataset files
```
