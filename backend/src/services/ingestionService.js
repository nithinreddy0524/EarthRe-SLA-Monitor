/**
 * EarthRe Database Ingestion Service
 * Handles PostgreSQL batch transactions, inserting upload_batches metadata
 * and bulk inserting cleaned monitoring_checks records.
 */

const { pool } = require('../db');
const { parseAndCleanCSV } = require('./csvParser');

async function ingestCSVBatch(filename, csvContent) {
    const { batchSummary, cleanedRecords } = parseAndCleanCSV(csvContent);

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Insert upload_batches record
        const batchInsertQuery = `
      INSERT INTO upload_batches (
        filename, total_rows, valid_rows, invalid_rows, duplicate_rows, processing_status
      ) VALUES ($1, $2, $3, $4, $5, 'COMPLETED')
      RETURNING id, filename, uploaded_at, total_rows, valid_rows, invalid_rows, duplicate_rows, processing_status;
    `;

        const batchResult = await client.query(batchInsertQuery, [
            filename || 'uploaded_data.csv',
            batchSummary.totalRows,
            batchSummary.validRows,
            batchSummary.invalidRows,
            batchSummary.duplicateRows,
        ]);

        const batchRecord = batchResult.rows[0];
        const batchId = batchRecord.id;

        // 2. Bulk Insert monitoring_checks records in chunks of 500
        if (cleanedRecords.length > 0) {
            const chunkSize = 500;
            for (let i = 0; i < cleanedRecords.length; i += chunkSize) {
                const chunk = cleanedRecords.slice(i, i + chunkSize);

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
          ) VALUES ${valueRows.join(', ')};
        `;

                await client.query(bulkInsertQuery, params);
            }
        }

        await client.query('COMMIT');

        return {
            success: true,
            batchId: batchRecord.id,
            filename: batchRecord.filename,
            uploadedAt: batchRecord.uploaded_at,
            totalRows: batchRecord.total_rows,
            validRows: batchRecord.valid_rows,
            invalidRows: batchRecord.invalid_rows,
            duplicateRows: batchRecord.duplicate_rows,
            processingStatus: batchRecord.processing_status,
            insertedChecksCount: cleanedRecords.length,
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
