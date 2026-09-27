/**
 * EarthRe Monitoring Logs Query Service
 * Returns paginated, filterable monitoring check logs with search, audit flags,
 * and dynamically queried filter options from PostgreSQL.
 */

const { query } = require('../db');

async function getMonitoringLogs(queryParams = {}) {
    const {
        service_id,
        status_code,
        is_valid,
        agent,
        region,
        search,
        start_date,
        end_date,
        limit = 50,
        page = 1,
    } = queryParams;

    const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 200);
    const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
    const offset = (parsedPage - 1) * parsedLimit;

    const whereConditions = [];
    const params = [];
    let paramIndex = 1;

    if (service_id && service_id !== 'ALL') {
        whereConditions.push(`service_id = $${paramIndex}`);
        params.push(service_id);
        paramIndex++;
    }

    if (status_code && status_code !== 'ALL') {
        whereConditions.push(`status_code = $${paramIndex}`);
        params.push(parseInt(status_code, 10));
        paramIndex++;
    }

    if (is_valid !== undefined && is_valid !== '' && is_valid !== 'ALL') {
        const validBool = is_valid === 'true' || is_valid === true;
        whereConditions.push(`is_valid = $${paramIndex}`);
        params.push(validBool);
        paramIndex++;
    }

    if (agent && agent !== 'ALL') {
        whereConditions.push(`agent = $${paramIndex}`);
        params.push(agent);
        paramIndex++;
    }

    if (region && region !== 'ALL') {
        whereConditions.push(`region = $${paramIndex}`);
        params.push(region);
        paramIndex++;
    }

    if (start_date && start_date.trim() !== '') {
        whereConditions.push(`timestamp >= $${paramIndex}`);
        params.push(start_date.trim());
        paramIndex++;
    }

    if (end_date && end_date.trim() !== '') {
        const formattedEndDate = end_date.includes('T') ? end_date : `${end_date}T23:59:59.999Z`;
        whereConditions.push(`timestamp <= $${paramIndex}`);
        params.push(formattedEndDate);
        paramIndex++;
    }

    if (search && search.trim() !== '') {
        whereConditions.push(`(service_id ILIKE $${paramIndex} OR service_name ILIKE $${paramIndex} OR agent ILIKE $${paramIndex} OR region ILIKE $${paramIndex} OR validation_errors ILIKE $${paramIndex})`);
        params.push(`%${search.trim()}%`);
        paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // 1. Count total matching records
    const countSql = `SELECT COUNT(*)::int as total FROM monitoring_checks ${whereClause};`;
    const countRes = await query(countSql, params);
    const totalCount = countRes.rows[0].total;

    // 2. Query paginated data
    const dataSql = `
    SELECT
      id,
      batch_id,
      service_id,
      service_name,
      timestamp,
      status_code,
      latency_ms,
      agent,
      region,
      is_valid,
      validation_errors,
      created_at
    FROM monitoring_checks
    ${whereClause}
    ORDER BY timestamp DESC, id DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1};
  `;

    const queryParamsWithPagination = [...params, parsedLimit, offset];
    const dataRes = await query(dataSql, queryParamsWithPagination);

    // 3. Dynamically query available services and status codes in database for filters
    const availableServicesRes = await query(`
        SELECT DISTINCT service_id, service_name
        FROM monitoring_checks
        ORDER BY service_name ASC;
    `);

    const availableStatusCodesRes = await query(`
        SELECT DISTINCT status_code
        FROM monitoring_checks
        ORDER BY status_code ASC;
    `);

    const totalPages = Math.ceil(totalCount / parsedLimit) || 1;

    return {
        data: dataRes.rows,
        availableServices: availableServicesRes.rows.map(r => ({
            serviceId: r.service_id,
            serviceName: r.service_name,
        })),
        availableStatusCodes: availableStatusCodesRes.rows.map(r => r.status_code),
        pagination: {
            totalCount,
            totalPages,
            page: parsedPage,
            limit: parsedLimit,
        },
    };
}

module.exports = {
    getMonitoringLogs,
};
