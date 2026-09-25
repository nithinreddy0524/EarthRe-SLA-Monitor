/**
 * EarthRe SLA Dataset Data Quality Profiler
 * Usage: node backend/database/scripts/profile_dataset.js
 */

const fs = require('fs');
const path = require('path');

// Resolve path to sample_data directory
const sampleDir = path.resolve(__dirname, '../../../sample_data');

if (!fs.existsSync(sampleDir)) {
    console.error(`Sample data directory not found at: ${sampleDir}`);
    process.exit(1);
}

const files = fs.readdirSync(sampleDir).filter(f => f.endsWith('.csv'));
console.log(`Found ${files.length} CSV files to profile in sample_data:`, files);

const stats = {
    totalRows: 0,
    fileBreakdown: {},
    services: new Set(),
    agents: new Set(),
    regions: new Set(),
    statusCodes: {},
    latencyUnits: {},
    missingLatencyCount: 0,
    negativeLatencyCount: 0,
    latencyInSecondsCount: 0,
    latencyInMsCount: 0,
    epochTimestampCount: 0,
    timezoneOffsetTimestampCount: 0,
    isoUtcTimestampCount: 0,
    invalidTimestampCount: 0,
    exactDuplicateRowsCount: 0,
    multiAgentSameTimestampCount: 0,
    statusCode999Count: 0,
    malformedRowCount: 0,
    missingValuesPerCol: {
        service_id: 0, service_name: 0, timestamp: 0, status_code: 0,
        latency: 0, latency_unit: 0, agent: 0, region: 0
    }
};

const seenRows = new Set();
const seenServiceTimestamps = new Map();

files.forEach(file => {
    const filePath = path.join(sampleDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split(/\r?\n/).filter(line => line.trim() !== '');

    if (lines.length === 0) return;
    const header = lines[0].split(',').map(h => h.trim());
    stats.fileBreakdown[file] = lines.length - 1;

    for (let i = 1; i < lines.length; i++) {
        const rawLine = lines[i].trim();
        if (!rawLine) continue;
        stats.totalRows++;

        // Check exact duplicate row
        if (seenRows.has(rawLine)) {
            stats.exactDuplicateRowsCount++;
        } else {
            seenRows.add(rawLine);
        }

        const parts = rawLine.split(',').map(p => p.trim());
        if (parts.length !== header.length) {
            stats.malformedRowCount++;
            continue;
        }

        const row = {};
        header.forEach((h, idx) => { row[h] = parts[idx]; });

        // Track missing values
        Object.keys(stats.missingValuesPerCol).forEach(col => {
            if (!row[col] || row[col] === '') {
                stats.missingValuesPerCol[col]++;
            }
        });

        if (row.service_id) stats.services.add(row.service_id);
        if (row.agent) stats.agents.add(row.agent);
        if (row.region) stats.regions.add(row.region);

        // Status code stats
        const statusCode = row.status_code;
        stats.statusCodes[statusCode] = (stats.statusCodes[statusCode] || 0) + 1;
        if (statusCode === '999') stats.statusCode999Count++;

        // Latency stats
        const unit = row.latency_unit;
        stats.latencyUnits[unit] = (stats.latencyUnits[unit] || 0) + 1;

        if (!row.latency || row.latency === '') {
            stats.missingLatencyCount++;
        } else {
            const latNum = parseFloat(row.latency);
            if (latNum < 0) {
                stats.negativeLatencyCount++;
            } else if (unit === 's') {
                stats.latencyInSecondsCount++;
            } else {
                stats.latencyInMsCount++;
            }
        }

        // Timestamp stats
        const ts = row.timestamp;
        if (!ts) {
            stats.invalidTimestampCount++;
        } else if (/^\d+$/.test(ts)) {
            stats.epochTimestampCount++;
        } else if (ts.includes('+') || (ts.includes('-') && !ts.endsWith('Z') && ts.length > 19)) {
            stats.timezoneOffsetTimestampCount++;
        } else if (ts.endsWith('Z')) {
            stats.isoUtcTimestampCount++;
        } else {
            stats.invalidTimestampCount++;
        }

        // Multi-agent timestamp check
        const serviceTsKey = `${row.service_id}|${row.timestamp}`;
        if (!seenServiceTimestamps.has(serviceTsKey)) {
            seenServiceTimestamps.set(serviceTsKey, [row.agent]);
        } else {
            seenServiceTimestamps.get(serviceTsKey).push(row.agent);
            stats.multiAgentSameTimestampCount++;
        }
    }
});

const report = {
    totalRows: stats.totalRows,
    fileBreakdown: stats.fileBreakdown,
    services: Array.from(stats.services),
    agents: Array.from(stats.agents),
    regions: Array.from(stats.regions),
    statusCodes: stats.statusCodes,
    latencyUnits: stats.latencyUnits,
    missingLatencyCount: stats.missingLatencyCount,
    negativeLatencyCount: stats.negativeLatencyCount,
    latencyInSecondsCount: stats.latencyInSecondsCount,
    latencyInMsCount: stats.latencyInMsCount,
    epochTimestampCount: stats.epochTimestampCount,
    timezoneOffsetTimestampCount: stats.timezoneOffsetTimestampCount,
    isoUtcTimestampCount: stats.isoUtcTimestampCount,
    exactDuplicateRowsCount: stats.exactDuplicateRowsCount,
    multiAgentSameTimestampCount: stats.multiAgentSameTimestampCount,
    statusCode999Count: stats.statusCode999Count,
    missingValuesPerCol: stats.missingValuesPerCol
};

console.log('\n==================================================');
console.log('       EARTHRE DATASET PROFILING RESULTS         ');
console.log('==================================================');
console.log(JSON.stringify(report, null, 2));
