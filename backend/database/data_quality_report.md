# EarthRe SLA Monitoring Dataset - Data Quality Inspection & Profiling Report

## 1. Executive Summary
A systematic profiling scan was conducted across all **5 provided CSV dataset files** (totaling **44,652 monitoring checks** across up to 30 days of data for 5 core services).

---

## 2. Dataset Overview
- **Total Records Analyzed**: 44,652
- **Services Monitored (5)**: `svc-auth`, `svc-notify`, `svc-payments`, `svc-reports`, `svc-search`
- **Agents Monitored (2)**: `agent-1`, `agent-2`
- **Region**: `ap-south-1`

### File Breakdown
| File Name | Row Count |
| :--- | :--- |
| `monitoring_checks_9d_seed101.csv` | 4,672 |
| `monitoring_checks_12d_seed505.csv` | 6,230 |
| `monitoring_checks_14d_seed202.csv` | 7,269 |
| `monitoring_checks_21d_seed303.csv` | 10,904 |
| `monitoring_checks_30d_seed404.csv` | 15,577 |
| **Total** | **44,652** |

---

## 3. Discovered Data Quality Issues & Proposed Cleaning Rules

### Issue 1: Mixed Latency Units (`s` vs `ms`)
- **Discovered**: 8,944 records have `latency_unit = 's'` with values like `0.717` seconds.
- **Count**: 8,944 records.
- **Handling Rule**: Convert all seconds (`s`) to milliseconds (`ms`) by multiplying by 1,000 (e.g. `0.717s` -> `717ms`). Store `latency_ms` uniformly in milliseconds.

### Issue 2: Missing Latency Values
- **Discovered**: 533 records have an empty/missing latency field (e.g. `200,,ms`).
- **Count**: 533 records.
- **Handling Rule**: Retain record with `latency_ms = NULL` and set `is_valid = TRUE` (if status code is valid). For latency statistics (avg/percentiles), exclude NULL latency records; for SLA availability calculations, count them as valid checks based on HTTP status.

### Issue 3: Negative Latency
- **Discovered**: 5 records contain negative latency values (e.g., `-500`).
- **Count**: 5 records.
- **Handling Rule**: Treat negative latency as physically impossible. Flag with `validation_errors = 'INVALID_LATENCY_NEGATIVE'` and set `latency_ms = NULL`.

### Issue 4: Inconsistent Timestamp Formats (Epoch & Timezone Offsets)
- **Discovered**: 
  - **668 records** use Unix epoch timestamps (seconds, e.g. `1746938700`).
  - **310 records** use ISO strings with timezone offsets (e.g. `2025-05-13T02:00:00+05:30`).
  - **43,674 records** use ISO UTC (`Z`).
- **Handling Rule**: Parse all valid timestamp formats (Epoch numbers, ISO offsets) and convert uniformly to UTC timestamp (`TIMESTAMPTZ`) in PostgreSQL.

### Issue 5: Invalid HTTP Status Code (`999`)
- **Discovered**: 5 records contain HTTP status code `999` (non-standard dummy HTTP code).
- **Count**: 5 records.
- **Handling Rule**: Flag record as invalid (`is_valid = FALSE`, `validation_errors = 'INVALID_STATUS_CODE_999'`). Exclude from SLA availability calculations (since 999 is not a real HTTP response).

### Issue 6: Exact Duplicate Rows
- **Discovered**: 184 exact duplicate rows across all 8 columns exist across files.
- **Count**: 184 records.
- **Handling Rule**: Deduplicate exact duplicate rows during ingestion. Only insert 1 copy into the database.

### Issue 7: Multi-Agent Concurrent Monitoring Checks
- **Discovered**: 17,187 checks share the same `service_id` and `timestamp`, but were reported by different agents (`agent-1` vs `agent-2`).
- **Handling Rule**: **Do NOT deduplicate**. Different agents legitimately monitor the same service at the same timestamp. Deduplication identity MUST include `(service_id, timestamp, agent)`.

---

## 4. Summary Table of Rules & Decisions

| Issue | Affected Count | Decision | Exclusion from SLA? |
| :--- | :--- | :--- | :--- |
| Latency in Seconds (`s`) | 8,944 | Convert to ms (`* 1000`) | No (valid) |
| Missing Latency | 533 | Retain record, `latency_ms = NULL` | Excluded from Latency Avg; Included in Availability |
| Negative Latency | 5 | Set `latency_ms = NULL`, flag error | Excluded from Latency Stats |
| Unix Epoch Timestamps | 668 | Convert to UTC timestamp | No (valid) |
| Timezone Offset Timestamps | 310 | Convert to UTC timestamp | No (valid) |
| Status Code `999` | 5 | Flag `is_valid = FALSE` | Excluded from SLA Availability |
| Exact Duplicate Rows | 184 | Deduplicate (Keep 1 copy) | Excluded duplicate copies |
| Multi-Agent Checks | 17,187 | Retain both (Different agents) | No (both valid) |
