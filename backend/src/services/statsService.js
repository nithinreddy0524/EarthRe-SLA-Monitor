/**
 * EarthRe SLA Statistics Analytics Service
 * Calculates SLA availability percentage, latency distribution (avg, p50, p95, p99),
 * service-level metrics, and data quality indicators from PostgreSQL.
 */

const { query } = require('../db');

async function getSlaStats(filters = {}) {
  // 1. Total upload batches summary
  const batchesRes = await query(`
    SELECT 
      COUNT(*)::int as total_batches,
      COALESCE(SUM(total_rows), 0)::int as total_ingested_rows,
      COALESCE(SUM(valid_rows), 0)::int as total_valid_rows,
      COALESCE(SUM(invalid_rows), 0)::int as total_invalid_rows,
      COALESCE(SUM(duplicate_rows), 0)::int as total_duplicate_rows
    FROM upload_batches;
  `);
  const batchStats = batchesRes.rows[0];

  // 2. Global monitoring checks stats
  const checksRes = await query(`
    SELECT
      COUNT(*)::int as total_checks,
      COUNT(*) FILTER (WHERE is_valid = TRUE)::int as valid_checks,
      COUNT(*) FILTER (WHERE is_valid = FALSE)::int as invalid_checks,
      COUNT(*) FILTER (WHERE is_valid = TRUE AND status_code >= 200 AND status_code < 300)::int as successful_checks,
      COUNT(*) FILTER (WHERE status_code >= 400 OR is_valid = FALSE)::int as total_failures,
      ROUND(AVG(latency_ms::numeric) FILTER (WHERE is_valid = TRUE AND latency_ms IS NOT NULL), 2)::float as avg_latency_ms,
      PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY latency_ms::numeric) FILTER (WHERE is_valid = TRUE AND latency_ms IS NOT NULL)::float as p50_latency_ms,
      PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY latency_ms::numeric) FILTER (WHERE is_valid = TRUE AND latency_ms IS NOT NULL)::float as p95_latency_ms,
      PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY latency_ms::numeric) FILTER (WHERE is_valid = TRUE AND latency_ms IS NOT NULL)::float as p99_latency_ms
    FROM monitoring_checks;
  `);
  const globalStats = checksRes.rows[0];

  const validChecks = globalStats.valid_checks || 0;
  const successfulChecks = globalStats.successful_checks || 0;
  const availabilityPercent = validChecks > 0 ? parseFloat(((successfulChecks / validChecks) * 100).toFixed(2)) : 100.0;

  // 3. Service-level breakdowns
  const serviceRes = await query(`
    SELECT
      service_id,
      service_name,
      COUNT(*)::int as total_checks,
      COUNT(*) FILTER (WHERE is_valid = TRUE)::int as valid_checks,
      COUNT(*) FILTER (WHERE is_valid = TRUE AND status_code >= 200 AND status_code < 300)::int as successful_checks,
      COUNT(*) FILTER (WHERE status_code >= 400 OR is_valid = FALSE)::int as total_failures,
      ROUND(AVG(latency_ms::numeric) FILTER (WHERE is_valid = TRUE AND latency_ms IS NOT NULL), 2)::float as avg_latency_ms,
      PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY latency_ms::numeric) FILTER (WHERE is_valid = TRUE AND latency_ms IS NOT NULL)::float as p95_latency_ms
    FROM monitoring_checks
    GROUP BY service_id, service_name
    ORDER BY service_id;
  `);

  const servicesBreakdown = serviceRes.rows.map(svc => {
    const svcValid = svc.valid_checks || 0;
    const svcSuccess = svc.successful_checks || 0;
    const svcAvail = svcValid > 0 ? parseFloat(((svcSuccess / svcValid) * 100).toFixed(2)) : 100.0;
    return {
      serviceId: svc.service_id,
      serviceName: svc.service_name,
      totalChecks: svc.total_checks,
      validChecks: svc.valid_checks,
      successfulChecks: svc.successful_checks,
      totalFailures: svc.total_failures,
      availabilityPercent: svcAvail,
      avgLatencyMs: svc.avg_latency_ms || 0,
      p95LatencyMs: svc.p95_latency_ms || 0,
    };
  });

  // 4. Data Quality Audit Metrics
  const dataQualityRes = await query(`
    SELECT
      COUNT(*) FILTER (WHERE validation_errors LIKE '%INVALID_STATUS_CODE_999%')::int as status_999_count,
      COUNT(*) FILTER (WHERE validation_errors LIKE '%INVALID_LATENCY_NEGATIVE%')::int as negative_latency_count,
      COUNT(*) FILTER (WHERE is_valid = TRUE AND latency_ms IS NULL)::int as missing_latency_count
    FROM monitoring_checks;
  `);
  const dqStats = dataQualityRes.rows[0];

  // 5. Recent Ingestion Batches Audit Log
  const recentBatchesRes = await query(`
    SELECT
      id as batch_id,
      filename,
      uploaded_at,
      total_rows,
      valid_rows,
      invalid_rows,
      duplicate_rows,
      processing_status
    FROM upload_batches
    ORDER BY uploaded_at DESC
    LIMIT 20;
  `);

  return {
    summary: {
      totalBatches: batchStats.total_batches,
      totalIngestedRows: batchStats.total_ingested_rows,
      totalChecks: globalStats.total_checks,
      validChecks: globalStats.valid_checks,
      successfulChecks: globalStats.successful_checks,
      invalidChecks: globalStats.invalid_checks,
      duplicateRows: batchStats.total_duplicate_rows,
      availabilityPercent,
      totalFailures: globalStats.total_failures,
    },
    latency: {
      avgMs: globalStats.avg_latency_ms || 0,
      p50Ms: globalStats.p50_latency_ms ? Math.round(globalStats.p50_latency_ms) : 0,
      p95Ms: globalStats.p95_latency_ms ? Math.round(globalStats.p95_latency_ms) : 0,
      p99Ms: globalStats.p99_latency_ms ? Math.round(globalStats.p99_latency_ms) : 0,
    },
    services: servicesBreakdown,
    dataQuality: {
      status999Count: dqStats.status_999_count,
      negativeLatencyCount: dqStats.negative_latency_count,
      missingLatencyCount: dqStats.missing_latency_count,
      duplicateRowsCount: batchStats.total_duplicate_rows,
    },
    recentBatches: recentBatchesRes.rows.map(b => ({
      batchId: b.batch_id,
      filename: b.filename,
      uploadedAt: b.uploaded_at,
      totalRows: b.total_rows,
      validRows: b.valid_rows,
      invalidRows: b.invalid_rows,
      duplicateRows: b.duplicate_rows,
      processingStatus: b.processing_status,
    })),
  };
}

module.exports = {
  getSlaStats,
};
