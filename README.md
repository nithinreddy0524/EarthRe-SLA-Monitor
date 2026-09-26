# EarthRe SLA Monitoring Dashboard

[![Tech Stack](https://img.shields.io/badge/Stack-React_19_%7C_Vite_6_%7C_Tailwind_CSS_v4_%7C_AWS_Lambda_%7C_PostgreSQL-059669.svg)](#architecture)
[![Architecture](https://img.shields.io/badge/Architecture-Serverless_AWS_SAM-047857.svg)](#architecture)
[![Theme](https://img.shields.io/badge/Theme-White_%26_Emerald_Green_Gradient-10b981.svg)](#frontend)

**EarthRe SLA Monitoring Dashboard** is a high-performance, serverless data pipeline and real-time analytics engine designed to monitor SLA compliance, service availability %, response latency percentiles (avg, p50, p95, p99), and data quality anomalies across EarthRe's 5 microservices:
1. `svc-auth` (Authentication API)
2. `svc-payments` (Payments API)
3. `svc-search` (Search Engine)
4. `svc-reports` (Reports Generator)
5. `svc-notify` (Notify Worker)

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

---

## 🚀 Quick Start Guide (For Recruiters & Developers)

Follow these exact ordered steps to clone, configure, and run the complete serverless stack locally.

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
   - Create a database named `earthre_sla_monitor` in PostgreSQL.
   - Run the DDL migration script `database/schema.sql` against `earthre_sla_monitor`:
     ```bash
     psql -U postgres -d earthre_sla_monitor -f database/schema.sql
     ```

---

### Step 2: Backend Setup & AWS SAM API Execution

1. **Navigate to the `backend/` folder**:
   ```bash
   cd backend
   npm install
   ```

2. **Configure Backend Environment Variables (`backend/.env`)**:
   Ensure `backend/.env` exists with your PostgreSQL connection string:
   ```env
   DATABASE_URL=postgresql://postgres:postgres@host.docker.internal:5432/earthre_sla_monitor
   AWS_REGION=ap-south-1
   PORT=3000
   ```
   *(Note: `host.docker.internal` allows the AWS SAM Docker container to communicate with your Windows host PostgreSQL).*

3. **Start AWS SAM Local Serverless API**:
   Run the following commands in PowerShell (or Bash) to pass dummy AWS credentials and start SAM local API Gateway:
   
   **PowerShell**:
   ```powershell
   $env:AWS_ACCESS_KEY_ID="dummy"
   $env:AWS_SECRET_ACCESS_KEY="dummy"
   $env:AWS_DEFAULT_REGION="ap-south-1"
   sam local start-api --env-vars .env
   ```

   **Bash**:
   ```bash
   AWS_ACCESS_KEY_ID=dummy AWS_SECRET_ACCESS_KEY=dummy AWS_DEFAULT_REGION=ap-south-1 sam local start-api --env-vars .env
   ```

   *Your serverless API will mount at `http://127.0.0.1:3000`.*

---

### Step 3: Frontend Setup & Dashboard Execution

1. **Open a new terminal and navigate to `frontend/`**:
   ```bash
   cd frontend
   npm install
   ```

2. **Configure Frontend Environment Variables (`frontend/.env`)**:
   Ensure `frontend/.env` exists:
   ```env
   VITE_API_BASE_URL=http://localhost:3000/api
   ```

3. **Start Vite Development Server**:
   ```bash
   npm run dev
   ```

4. **Open Dashboard**:
   Navigate to **`http://localhost:5173`** in your browser.

---

## 🧹 7 Data Quality Cleaning Rules

The ingestion engine (`backend/src/services/csvParser.js`) automatically profiles raw monitoring data against 7 strict data quality rules:

1. **Seconds Latency Normalization**: Converts `latency_unit = 's'` to milliseconds (`* 1000`).
2. **Missing Latency**: Retains missing latency as `NULL` without failing SLA availability calculations.
3. **Negative Latency**: Sets negative values to `NULL` and flags `INVALID_LATENCY_NEGATIVE`.
4. **Unix Epoch Timestamps**: Normalizes epoch seconds (e.g., `1746938700`) to UTC ISO timestamps.
5. **Timezone Offset Timestamps**: Normalizes offset strings (e.g., `+05:30`) to UTC ISO timestamps.
6. **HTTP Status 999**: Flags `is_valid = FALSE` and `INVALID_STATUS_CODE_999`. Excluded from SLA availability %.
7. **Exact Duplicate Rows**: Filters out duplicate `(service_id, timestamp)` rows during atomic batch ingestion.

---

## 🔌 API Specification

| HTTP Method | Route | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check & PostgreSQL database connection status |
| `POST` | `/api/uploads` | Accepts CSV body for data cleaning & PostgreSQL batch storage |
| `GET` | `/api/stats` | Returns SLA availability %, latency p50/p95/p99, and service breakdowns |
| `GET` | `/api/logs` | Returns filterable monitoring check logs with multi-select & search |

---

## 🧪 Testing

To run automated backend integration tests:
```bash
cd backend
node src/e2e_integration_test.js
```

---

## 📁 Repository Structure

```
EarthRe-SLA-Monitor/
├── backend/                        # AWS SAM Serverless Backend & PostgreSQL Engine
│   ├── template.yaml               # Infrastructure-as-Code SAM Template
│   ├── .env                        # Local SAM environment variables
│   ├── package.json                # Dependencies (dotenv, pg)
│   └── src/
│       ├── app.js                  # AWS Lambda entrypoint router
│       ├── db.js                   # PostgreSQL connection pool
│       ├── e2e_integration_test.js # E2E automated test suite
│       └── services/
│           ├── csvParser.js        # CSV parsing & 7 cleaning rules
│           ├── ingestionService.js # Atomic PostgreSQL transaction batch store
│           ├── statsService.js     # SLA availability & percentiles calculator
│           └── logsService.js      # Paginated monitoring logs search engine
├── frontend/                       # React 19 + Vite 6 Dashboard
│   ├── .env                        # Frontend API base URL
│   ├── package.json                # React & Tailwind CSS dependencies
│   └── src/
│       ├── App.jsx                 # Dashboard overview & metrics cards
│       ├── api.js                  # REST API communication client
│       └── components/
│           ├── CsvUploader.jsx     # Interactive CSV file upload dropzone
│           └── LogsTable.jsx       # Filterable monitoring check logs table
├── database/
│   └── schema.sql                  # PostgreSQL DDL script
└── sample_data/                    # EarthRe official CSV dataset files
```
