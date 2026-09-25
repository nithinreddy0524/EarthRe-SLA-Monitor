const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/earthre_sla_monitor';

const pool = new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
    console.error('Unexpected database client error on idle pool connection:', err);
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool,
};
