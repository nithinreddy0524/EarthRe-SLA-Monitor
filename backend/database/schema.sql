-- ==================================================
-- EarthRe SLA Monitoring Database Schema
-- Target Database: earthre_sla_monitor
-- ==================================================

-- 1. Enable UUID Extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Drop existing tables if re-creating
DROP TABLE IF EXISTS monitoring_checks CASCADE;
DROP TABLE IF EXISTS upload_batches CASCADE;

-- 3. Table: upload_batches (Stores CSV upload metadata and processing status)
CREATE TABLE upload_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename VARCHAR(255) NOT NULL,
    uploaded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    total_rows INTEGER DEFAULT 0 NOT NULL,
    valid_rows INTEGER DEFAULT 0 NOT NULL,
    invalid_rows INTEGER DEFAULT 0 NOT NULL,
    duplicate_rows INTEGER DEFAULT 0 NOT NULL,
    processing_status VARCHAR(50) DEFAULT 'COMPLETED' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 4. Table: monitoring_checks (Stores normalized, cleaned, and validated monitoring checks)
CREATE TABLE monitoring_checks (
    id BIGSERIAL PRIMARY KEY,
    batch_id UUID REFERENCES upload_batches(id) ON DELETE CASCADE,
    service_id VARCHAR(100) NOT NULL,
    service_name VARCHAR(100) NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    status_code INTEGER NOT NULL,
    latency_ms INTEGER, -- NULL allowed for missing or invalid latency
    agent VARCHAR(50) NOT NULL,
    region VARCHAR(50) NOT NULL,
    is_valid BOOLEAN DEFAULT TRUE NOT NULL,
    validation_errors TEXT, -- NULL or comma-separated validation error codes
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT unique_check_record UNIQUE (service_id, timestamp, agent, region)
);

-- 5. Performance Indexes for SLA Aggregations & Log Filters
CREATE INDEX idx_monitoring_service_ts ON monitoring_checks(service_id, timestamp DESC);
CREATE INDEX idx_monitoring_batch_id ON monitoring_checks(batch_id);
CREATE INDEX idx_monitoring_valid_status ON monitoring_checks(is_valid, status_code);
CREATE INDEX idx_monitoring_agent_region ON monitoring_checks(agent, region);
