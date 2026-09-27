# EarthRe SLA Monitoring - Serverless Backend

## 1. Overview
The **EarthRe SLA Backend** is a high-performance, serverless data pipeline and REST API built with AWS SAM (Serverless Application Model), AWS Lambda (Node.js 20.x runtime), API Gateway, and PostgreSQL.

It ingests CSV monitoring data across 5 core services, cleans and normalizes messy dataset anomalies, stores records in PostgreSQL (`earthre_sla_monitor`), and exposes REST endpoints for transparent SLA metrics calculation and log filtering.

---

## 2. Architecture & Tech Stack
- **Compute**: AWS Lambda (Serverless Node.js 20.x runtime handler)
- **API Gateway**: AWS API Gateway (HTTP Proxy Router)
- **Database**: PostgreSQL (`earthre_sla_monitor` database or Neon Cloud PostgreSQL)
- **Infrastructure-as-Code**: AWS SAM (`template.yaml`)
- **DB Client**: `pg` (Node.js PostgreSQL Connection Pool)

---

## 3. Directory Structure
```
backend/
├── template.yaml                  # AWS SAM Infrastructure-as-Code template
├── package.json                   # Backend Node.js package manifest
├── .env                           # Local PostgreSQL environment configuration
├── database/
│   └── schema.sql                 # DDL migration script for upload_batches & monitoring_checks
└── src/
    ├── app.js                     # AWS Lambda entrypoint router
    ├── db.js                      # PostgreSQL pool connection helper
    └── services/
        ├── csvParser.js           # CSV parsing & 7-rule data cleaning engine
        ├── ingestionService.js    # PostgreSQL batch transaction service
        ├── statsService.js        # SLA availability & latency percentiles calculator
        └── logsService.js         # Paginated monitoring logs query engine
```

---

## 4. Local Quick Start

1. **Install Dependencies**:
   ```bash
   cd backend
   npm install
   ```

2. **Set Environment Variables (`backend/.env`)**:
   ```env
   DATABASE_URL=postgresql://postgres:postgres@host.docker.internal:5432/earthre_sla_monitor
   AWS_REGION=ap-south-1
   PORT=3000
   ```

3. **Start AWS SAM Local Serverless API Gateway**:
   ```powershell
   $env:AWS_ACCESS_KEY_ID="dummy"
   $env:AWS_SECRET_ACCESS_KEY="dummy"
   $env:AWS_DEFAULT_REGION="ap-south-1"
   sam local start-api --env-vars .env
   ```

---

## 5. Production AWS Lambda Deployment

1. **Build SAM Package**:
   ```powershell
   sam build
   ```

2. **Deploy to AWS Cloud**:
   ```powershell
   sam deploy --guided
   ```
   - **Stack Name**: `earthre-sla-monitor-backend`
   - **AWS Region**: `ap-south-1`
   - **Parameter DatabaseUrl**: Enter your Neon Cloud PostgreSQL link (`postgresql://neondb_owner:pass@ep-xyz.neon.tech/earthre_sla_monitor?sslmode=require`)
   - **Confirm changes**: `Y`
   - **Allow IAM role creation**: `Y`

3. **Outputs**: SAM will return your live API Gateway URL (e.g., `https://ngzv0cfefg.execute-api.ap-south-1.amazonaws.com/Prod/api`).

---

## 6. 7 Data Quality & Cleaning Pipeline Rules
Implements 7 automated data cleaning rules in `src/services/csvParser.js`:
1. **Seconds Latency Normalization**: Converts `latency_unit = 's'` to milliseconds (`* 1000`).
2. **Missing Latency**: Retains missing latency as `NULL` without failing SLA availability.
3. **Negative Latency**: Sets negative values to `NULL`, flags `INVALID_LATENCY_NEGATIVE`.
4. **Unix Epoch Timestamps**: Normalizes epoch seconds (e.g. `1746938700`) to UTC ISO timestamps.
5. **Timezone Offset Timestamps**: Normalizes offset strings (e.g. `+05:30`) to UTC ISO timestamps.
6. **HTTP Status 999**: Flags `is_valid = FALSE` and `INVALID_STATUS_CODE_999`. Excluded from SLA availability.
7. **Exact Duplicate Rows**: Filters exact duplicate rows during ingestion.

---

## 7. Backend API Endpoints
| HTTP Method | Route | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check & PostgreSQL connection status |
| `POST` | `/api/uploads` | Accepts CSV body for data ingestion & bulk storage |
| `GET` | `/api/stats` | Returns SLA availability %, latency p50/p95/p99, and service breakdowns |
| `GET` | `/api/logs` | Returns filterable monitoring check logs with search & pagination |
