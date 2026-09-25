# EarthRe SLA Monitoring - Serverless Backend

## 1. Overview
The **EarthRe SLA Backend** is a high-performance, serverless data pipeline and REST API built with AWS SAM (Serverless Application Model), AWS Lambda (Node.js 20.x runtime), API Gateway, and PostgreSQL.

It ingests CSV monitoring data across 5 core services, cleans and normalizes messy dataset anomalies, stores records in PostgreSQL (`earthre_sla_monitor`), and exposes REST endpoints for transparent SLA metrics calculation and log filtering.

---

## 2. Architecture & Tech Stack
- **Compute**: AWS Lambda (Serverless Node.js 20.x runtime)
- **API Gateway**: AWS API Gateway (HTTP Proxy Router for Lambda)
- **Database**: PostgreSQL (`earthre_sla_monitor` database)
- **Infrastructure-as-Code**: AWS SAM (`template.yaml`)
- **DB Client**: `pg` (Node.js PostgreSQL Connection Pool)

---

## 3. Directory Structure
```
backend/
├── template.yaml                  # AWS SAM Infrastructure-as-Code template
├── package.json                   # Backend Node.js package manifest
├── .env.local                     # Local PostgreSQL environment configuration
├── database/
│   ├── schema.sql                 # DDL script for upload_batches & monitoring_checks
│   └── scripts/
│       ├── profile_dataset.js     # Data quality profiler script
│       ├── test_ingestion.js      # CSV batch ingestion test runner
│       └── test_apis.js           # API Gateway handler test runner
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

## 4. Database Schema
Defined in `backend/database/schema.sql`:

### `upload_batches` Table
Tracks metadata for every CSV file uploaded.
- `id`: UUID (Primary Key, default `uuid_generate_v4()`)
- `filename`: VARCHAR(255)
- `uploaded_at`: TIMESTAMPTZ (Default CURRENT_TIMESTAMP)
- `total_rows`, `valid_rows`, `invalid_rows`, `duplicate_rows`: INTEGER
- `processing_status`: VARCHAR(50) ('COMPLETED')

### `monitoring_checks` Table
Stores individual monitoring records after cleaning & validation.
- `id`: BIGSERIAL (Primary Key)
- `batch_id`: UUID (Foreign Key -> `upload_batches.id` ON DELETE CASCADE)
- `service_id`: VARCHAR(100) (`svc-auth`, `svc-payments`, etc.)
- `service_name`: VARCHAR(100)
- `timestamp`: TIMESTAMPTZ (Normalized to UTC)
- `status_code`: INTEGER (200, 500, 502, 503, 999)
- `latency_ms`: INTEGER (Normalized to milliseconds, NULL if missing/invalid)
- `agent`: VARCHAR(50) (`agent-1`, `agent-2`)
- `region`: VARCHAR(50) (`ap-south-1`)
- `is_valid`: BOOLEAN
- `validation_errors`: TEXT (Comma-separated error flags)

---

## 5. Data Quality & Cleaning Pipeline Rules
Implements 7 automated data cleaning rules in `src/services/csvParser.js`:
1. **Seconds Latency Normalization**: Converts `latency_unit = 's'` to milliseconds (`* 1000`).
2. **Missing Latency**: Retains missing latency as `NULL` without failing SLA availability.
3. **Negative Latency**: Sets negative values to `NULL`, flags `INVALID_LATENCY_NEGATIVE`.
4. **Unix Epoch Timestamps**: Normalizes epoch seconds (e.g. `1746938700`) to UTC ISO timestamps.
5. **Timezone Offset Timestamps**: Normalizes offset strings (e.g. `+05:30`) to UTC ISO timestamps.
6. **HTTP Status 999**: Flags `is_valid = FALSE` and `INVALID_STATUS_CODE_999`. Excluded from SLA availability.
7. **Exact Duplicate Rows**: Filters exact duplicate rows during ingestion.

---

## 6. Backend API Endpoints
| HTTP Method | Route | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check & PostgreSQL connection status |
| `POST` | `/api/uploads` | Accepts CSV body for data ingestion & bulk storage |
| `GET` | `/api/stats` | Returns SLA availability %, latency p50/p95/p99, and service breakdowns |
| `GET` | `/api/logs` | Returns filterable monitoring check logs with search & pagination |

---

## 7. Local Testing Commands
Run commands from the `backend/` folder:

```bash
# 1. Profile CSV Dataset (44,652 rows scan)
node database/scripts/profile_dataset.js

# 2. Test CSV Batch Ingestion Pipeline
node database/scripts/test_ingestion.js

# 3. Test API Gateway Endpoints
node database/scripts/test_apis.js
```
