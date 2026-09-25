const fs = require('fs');
const path = require('path');
const { ingestCSVBatch } = require('../../src/services/ingestionService');

async function runTest() {
    console.log('Testing CSV ingestion pipeline against sample data...');
    const sampleFilePath = path.resolve(__dirname, '../../../sample_data/monitoring_checks_9d_seed101.csv');

    if (!fs.existsSync(sampleFilePath)) {
        console.error('Sample CSV file not found:', sampleFilePath);
        process.exit(1);
    }

    const csvContent = fs.readFileSync(sampleFilePath, 'utf8');
    console.log('File loaded. Ingesting batch into PostgreSQL database earthre_sla_monitor...');

    const startTime = Date.now();
    const result = await ingestCSVBatch('monitoring_checks_9d_seed101.csv', csvContent);
    const duration = Date.now() - startTime;

    console.log('\n==================================================');
    console.log('       INGESTION PIPELINE TEST RESULTS           ');
    console.log('==================================================');
    console.log(JSON.stringify(result, null, 2));
    console.log(`Ingestion completed in ${duration} ms.`);
    process.exit(0);
}

runTest().catch(err => {
    console.error('Test ingestion failed:', err);
    process.exit(1);
});
