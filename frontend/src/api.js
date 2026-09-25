/**
 * EarthRe SLA Dashboard API Client
 * Connects React frontend to AWS Lambda / local API Gateway endpoints.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

async function handleResponse(response) {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `HTTP error! Status: ${response.status}`);
    }
    return response.json();
}

export async function fetchHealth() {
    const response = await fetch(`${API_BASE_URL}/health`);
    return handleResponse(response);
}

export async function uploadCsv(csvContent, filename = 'uploaded_data.csv') {
    const response = await fetch(`${API_BASE_URL}/uploads`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ csvContent, filename }),
    });
    return handleResponse(response);
}

export async function fetchSlaStats(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${API_BASE_URL}/stats?${query}` : `${API_BASE_URL}/stats`;
    const response = await fetch(url);
    return handleResponse(response);
}

export async function fetchMonitoringLogs(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${API_BASE_URL}/logs?${query}` : `${API_BASE_URL}/logs`;
    const response = await fetch(url);
    return handleResponse(response);
}
