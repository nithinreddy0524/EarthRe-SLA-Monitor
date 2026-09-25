const { handler } = require('../../src/app');

async function testApiEndpoints() {
    console.log('Testing Backend API Routes against earthre_sla_monitor database...\n');

    // Test 1: GET /api/stats
    console.log('--- 1. Testing GET /api/stats ---');
    const statsResponse = await handler({
        httpMethod: 'GET',
        path: '/api/stats',
    });
    console.log('Status Code:', statsResponse.statusCode);
    console.log('Stats Body:', JSON.stringify(JSON.parse(statsResponse.body), null, 2));

    // Test 2: GET /api/logs
    console.log('\n--- 2. Testing GET /api/logs (Limit 5) ---');
    const logsResponse = await handler({
        httpMethod: 'GET',
        path: '/api/logs',
        queryStringParameters: { limit: '5', page: '1' },
    });
    console.log('Status Code:', logsResponse.statusCode);
    const logsData = JSON.parse(logsResponse.body);
    console.log('Pagination:', logsData.pagination);
    console.log('Sample Log Item:', logsData.data[0]);

    process.exit(0);
}

testApiEndpoints().catch(err => {
    console.error('API Test Error:', err);
    process.exit(1);
});
