/**
 * EarthRe Database Ingestion Service
 * Handles PostgreSQL batch transactions with multi-layer deduplication
 * to guarantee zero SQL constraint violation errors.
 */

const { pool } = require('../db');
const { parseAndCleanCSV } = require('./csvParser');

async function ingestCSVBatch(filename, csvContent) {
    const { batchSummary, cleanedRecords } = parseAndCleanCSV(csvContent);

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        let recordsToInsert = cleanedRecords;
        let skippedDbDuplicates = 0;

        // 1. Application-Level Pre-Query Deduplication
        if (cleanedRecords.length > 0) {
            let minTs = cleanedRecords[0].timestamp;
            let maxTs = cleanedRecords[0].timestamp;

            cleanedRecords.forEach(r => {
                if (r.timestamp < minTs) minTs = r.timestamp;
                if (r.timestamp > maxTs) maxTs = r.timestamp;
            });

            const existingQuery = `
                SELECT service_id, timestamp, agent, region
                FROM monitoring_checks
                WHERE timestamp >= $1 AND timestamp <= $2;
            `;
            const existingRes = await client.query(existingQuery, [minTs, maxTs]);

            const existingDbKeys = new Set();
            existingRes.rows.forEach(row => {
                const tsIso = new Date(row.timestamp).toISOString();
                const key = `${(row.service_id || '').trim().toLowerCase()}|${tsIso}|${(row.agent || '').trim().toLowerCase()}|${(row.region || '').trim().toLowerCase()}`;
                existingDbKeys.add(key);
            });

            const filteredRecords = [];
            cleanedRecords.forEach(record => {
                const tsIso = new Date(record.timestamp).toISOString();
                const recordKey = `${(record.service_id || '').trim().toLowerCase()}|${tsIso}|${(record.agent || '').trim().toLowerCase()}|${(record.region || '').trim().toLowerCase()}`;

                if (existingDbKeys.has(recordKey)) {
                    skippedDbDuplicates++;
                } else {
                    existingDbKeys.add(recordKey);
                    filteredRecords.push(record);
                }
            });

            recordsToInsert = filteredRecords;
        }

        let newlyInsertedCount = 0;
        const totalDuplicateRows = batchSummary.duplicateRows + skippedDbDuplicates;
        const processingStatus = totalDuplicateRows > 0 ? 'COMPLETED_WITH_SKIPPED_DUPLICATES' : 'COMPLETED';

        // 2. Insert upload_batches metadata record
        const batchInsertQuery = `
            INSERT INTO upload_batches (
                filename, total_rows, valid_rows, invalid_rows, duplicate_rows, processing_status
            ) VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, filename, uploaded_at, total_rows, valid_rows, invalid_rows, duplicate_rows, processing_status;
        `;

        const batchResult = await client.query(batchInsertQuery, [
            filename || 'uploaded_data.csv',
            batchSummary.totalRows,
            batchSummary.validRows,
            batchSummary.invalidRows,
            totalDuplicateRows,
            processingStatus,
        ]);

        const batchRecord = batchResult.rows[0];
        const batchId = batchRecord.id;

        // 3. Bulk Insert unique recordsToInsert in chunks of 500 with ON CONFLICT DO NOTHING
        if (recordsToInsert.length > 0) {
            const chunkSize = 500;
            for (let i = 0; i < recordsToInsert.length; i += chunkSize) {
                const chunk = recordsToInsert.slice(i, i + chunkSize);

                const valueRows = [];
                const params = [];
                let paramIndex = 1;

                chunk.forEach(record => {
                    valueRows.push(
                        `($${paramIndex}, $${paramIndex + 1}, $${paramIndex + 2}, $${paramIndex + 3}, $${paramIndex + 4}, $${paramIndex + 5}, $${paramIndex + 6}, $${paramIndex + 7}, $${paramIndex + 8}, $${paramIndex + 9})`
                    );
                    params.push(
                        batchId,
                        record.service_id,
                        record.service_name,
                        record.timestamp,
                        record.status_code,
                        record.latency_ms,
                        record.agent,
                        record.region,
                        record.is_valid,
                        record.validation_errors
                    );
                    paramIndex += 10;
                });

                const bulkInsertQuery = `
                    INSERT INTO monitoring_checks (
                        batch_id, service_id, service_name, timestamp, status_code,
                        latency_ms, agent, region, is_valid, validation_errors
                    ) VALUES ${valueRows.join(', ')}
                    ON CONFLICT (service_id, timestamp, agent, region) DO NOTHING
                    RETURNING id;
                `;

                const insertRes = await client.query(bulkInsertQuery, params);
                newlyInsertedCount += (insertRes.rowCount || 0);
            }
        }

        await client.query('COMMIT');

        return {
            success: true,
            batchId: batchRecord.id,
            filename: batchRecord.filename,
            uploadedAt: batchRecord.uploaded_at,
            totalRows: batchRecord.total_rows,
            validRows: batchSummary.validRows,
            invalidRows: batchSummary.invalidRows,
            duplicateRows: totalDuplicateRows,
            newlyInsertedRows: newlyInsertedCount,
            skippedDuplicatesCount: skippedDbDuplicates,
            processingStatus,
        };
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Ingestion transaction failed, rolled back:', error);
        throw error;
    } finally {
        client.release();
    }
}

module.exports = {
    ingestCSVBatch,
};
