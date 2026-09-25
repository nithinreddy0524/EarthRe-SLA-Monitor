const { query } = require('./db');
const { ingestCSVBatch } = require('./services/ingestionService');
const { getSlaStats } = require('./services/statsService');
const { getMonitoringLogs } = require('./services/logsService');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

/**
 * Helper to build API Gateway HTTP response object with CORS headers
 */
function buildResponse(statusCode, body, headers = {}) {
    return {
        statusCode,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization',
            'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
            ...headers,
        },
        body: typeof body === 'string' ? body : JSON.stringify(body),
    };
}

/**
 * AWS Lambda Handler for API Gateway requests
 */
exports.handler = async (event, context) => {
    console.log('Incoming Request Event:', JSON.stringify(event));

    const httpMethod = event.httpMethod || (event.requestContext && event.requestContext.http && event.requestContext.http.method) || 'GET';
    const rawPath = event.path || event.rawPath || '/';

    // Handle CORS preflight OPTIONS request
    if (httpMethod === 'OPTIONS') {
        return buildResponse(200, { message: 'CORS Preflight OK' });
    }

    const queryParams = event.queryStringParameters || {};

    try {
        // 1. Health Check Endpoint: GET /api/health or GET /
        if (httpMethod === 'GET' && (rawPath === '/api/health' || rawPath === '/' || rawPath.endsWith('/api/health'))) {
            const dbResult = await query('SELECT NOW() as current_time, current_database() as database_name');
            return buildResponse(200, {
                status: 'healthy',
                service: 'EarthRe SLA Monitoring Backend API',
                database: {
                    connected: true,
                    name: dbResult.rows[0].database_name,
                    time: dbResult.rows[0].current_time,
                },
                timestamp: new Date().toISOString(),
            });
        }

        // 2. CSV Upload Ingestion Endpoint: POST /api/uploads
        if (httpMethod === 'POST' && (rawPath === '/api/uploads' || rawPath.endsWith('/api/uploads'))) {
            let csvContent = '';
            let filename = 'uploaded_monitoring_data.csv';

            if (!event.body) {
                return buildResponse(400, { error: 'Missing request body. CSV file content required.' });
            }

            // Handle base64 encoded body if sent by API Gateway
            if (event.isBase64Encoded) {
                csvContent = Buffer.from(event.body, 'base64').toString('utf8');
            } else if (typeof event.body === 'string') {
                // If JSON wrapped body
                try {
                    const parsedJson = JSON.parse(event.body);
                    if (parsedJson.csvContent) {
                        csvContent = parsedJson.csvContent;
                        filename = parsedJson.filename || filename;
                    } else {
                        csvContent = event.body;
                    }
                } catch (e) {
                    csvContent = event.body;
                }
            }

            if (!csvContent || csvContent.trim() === '') {
                return buildResponse(400, { error: 'CSV file content cannot be empty.' });
            }

            const ingestionResult = await ingestCSVBatch(filename, csvContent);
            return buildResponse(201, ingestionResult);
        }

        // 3. SLA Stats & Metrics Endpoint: GET /api/stats
        if (httpMethod === 'GET' && (rawPath === '/api/stats' || rawPath.endsWith('/api/stats'))) {
            const stats = await getSlaStats(queryParams);
            return buildResponse(200, stats);
        }

        // 4. Monitoring Logs Endpoint: GET /api/logs
        if (httpMethod === 'GET' && (rawPath === '/api/logs' || rawPath.endsWith('/api/logs'))) {
            const logs = await getMonitoringLogs(queryParams);
            return buildResponse(200, logs);
        }

        return buildResponse(404, { error: `Route not found: ${httpMethod} ${rawPath}` });
    } catch (error) {
        console.error('API Lambda Execution Error:', error);
        return buildResponse(500, {
            error: 'Internal Server Error',
            message: error.message,
        });
    }
};
