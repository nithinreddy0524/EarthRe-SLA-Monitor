# EarthRe SLA Monitoring Dashboard - Backend First

A trustworthy serverless data ingestion pipeline and SLA analytics engine for monitoring 5 core services.

## Architecture & Focus (Backend First)
1. **Data Inspection & Cleaning**: Inspect raw CSVs, handle messy fields (negative latency, invalid HTTP 999, epoch timestamps, missing values).
2. **PostgreSQL Database**: Schema & tables (`upload_batches`, `monitoring_checks`) with strict data validation.
3. **AWS Lambda + API Gateway**: Ingestion & SLA aggregation endpoints.
4. **React Dashboard**: UI dashboard (to be built after backend logic is established & verified).

## Status
Step 1: Backend-First Foundation Initialized.
