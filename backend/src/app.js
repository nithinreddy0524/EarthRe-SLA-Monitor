const { query } = require('./db');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

/**
 * Helper to build API Gateway HTTP response object
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

    // Handle CORS preflight OPTIONS request
    const httpMethod = event.httpMethod || (event.requestContext && event.requestContext.http && event.requestContext.http.method) || 'GET';

    if (httpMethod === 'OPTIONS') {
        return buildResponse(200, { message: 'CORS Preflight OK' });
    }

    const rawPath = event.path || event.rawPath || '/';

    try {
        // Health Check Endpoint: GET /api/health or GET /
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

        return buildResponse(404, { error: `Route not found: ${httpMethod} ${rawPath}` });
    } catch (error) {
        console.error('API Lambda Execution Error:', error);
        return buildResponse(500, {
            error: 'Internal Server Error',
            message: error.message,
        });
    }
};
