/**
 * EarthRe SLA Monitoring Data Cleaning & Parsing Service
 * Normalizes timestamps, converts latency to ms, handles invalid HTTP codes,
 * flags negative/missing latency, and deduplicates exact duplicate rows.
 */

function parseAndCleanCSV(csvContent) {
    if (!csvContent || typeof csvContent !== 'string') {
        throw new Error('CSV content must be a non-empty string');
    }

    const lines = csvContent.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length === 0) {
        throw new Error('CSV content is empty');
    }

    const headerLine = lines[0];
    const headers = headerLine.split(',').map(h => h.trim());

    const expectedHeaders = ['service_id', 'service_name', 'timestamp', 'status_code', 'latency', 'latency_unit', 'agent', 'region'];
    const missingHeaders = expectedHeaders.filter(h => !headers.includes(h));
    if (missingHeaders.length > 0) {
        throw new Error(`CSV is missing required header columns: ${missingHeaders.join(', ')}`);
    }

    const seenExactRows = new Set();
    const cleanedRecords = [];

    let totalRows = 0;
    let validRows = 0;
    let invalidRows = 0;
    let duplicateRows = 0;

    for (let i = 1; i < lines.length; i++) {
        const rawLine = lines[i].trim();
        if (!rawLine) continue;

        totalRows++;

        // 1. Exact Duplicate Row Check
        if (seenExactRows.has(rawLine)) {
            duplicateRows++;
            continue; // Skip inserting exact duplicate row
        }
        seenExactRows.add(rawLine);

        const parts = rawLine.split(',').map(p => p.trim());
        const row = {};
        headers.forEach((h, idx) => { row[h] = parts[idx] || ''; });

        const validationErrors = [];
        let isValid = true;

        // 2. Timestamp Normalization (Epoch numbers vs ISO strings vs offsets)
        let parsedTimestamp = null;
        const rawTs = row.timestamp;

        if (!rawTs) {
            isValid = false;
            validationErrors.push('MISSING_TIMESTAMP');
        } else if (/^\d+$/.test(rawTs)) {
            // Unix epoch timestamp (seconds)
            const dateObj = new Date(parseInt(rawTs, 10) * 1000);
            if (isNaN(dateObj.getTime())) {
                isValid = false;
                validationErrors.push('INVALID_TIMESTAMP');
            } else {
                parsedTimestamp = dateObj.toISOString();
            }
        } else {
            const dateObj = new Date(rawTs);
            if (isNaN(dateObj.getTime())) {
                isValid = false;
                validationErrors.push('INVALID_TIMESTAMP');
            } else {
                parsedTimestamp = dateObj.toISOString();
            }
        }

        // 3. HTTP Status Code Validation (HTTP 999 vs 200/500/502/503)
        let statusCode = parseInt(row.status_code, 10);
        if (isNaN(statusCode)) {
            isValid = false;
            validationErrors.push('INVALID_STATUS_CODE_FORMAT');
        } else if (statusCode === 999) {
            isValid = false;
            validationErrors.push('INVALID_STATUS_CODE_999');
        } else if (statusCode < 100 || statusCode > 599) {
            isValid = false;
            validationErrors.push('INVALID_STATUS_CODE');
        }

        // 4. Latency Normalization & Validation (Seconds vs MS, Missing, Negative)
        let latencyMs = null;
        const rawLatency = row.latency;
        const unit = (row.latency_unit || 'ms').toLowerCase();

        if (rawLatency !== '') {
            const latNum = parseFloat(rawLatency);
            if (isNaN(latNum)) {
                validationErrors.push('INVALID_LATENCY_FORMAT');
            } else if (latNum < 0) {
                // Negative latency
                latencyMs = null;
                validationErrors.push('INVALID_LATENCY_NEGATIVE');
            } else if (unit === 's') {
                // Convert seconds to milliseconds
                latencyMs = Math.round(latNum * 1000);
            } else {
                // Milliseconds
                latencyMs = Math.round(latNum);
            }
        } else {
            // Missing latency: Keep NULL
            latencyMs = null;
        }

        if (isValid) {
            validRows++;
        } else {
            invalidRows++;
        }

        cleanedRecords.push({
            service_id: row.service_id,
            service_name: row.service_name,
            timestamp: parsedTimestamp || new Date().toISOString(),
            status_code: statusCode || 0,
            latency_ms: latencyMs,
            agent: row.agent || 'unknown',
            region: row.region || 'ap-south-1',
            is_valid: isValid,
            validation_errors: validationErrors.length > 0 ? validationErrors.join(', ') : null,
        });
    }

    return {
        batchSummary: {
            totalRows,
            validRows,
            invalidRows,
            duplicateRows,
        },
        cleanedRecords,
    };
}

module.exports = {
    parseAndCleanCSV,
};
