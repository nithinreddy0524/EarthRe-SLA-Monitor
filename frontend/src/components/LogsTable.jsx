import React, { useState, useEffect } from 'react';
import {
    ListFilter,
    Search,
    RefreshCw,
    CheckCircle2,
    AlertTriangle,
    ChevronLeft,
    ChevronRight,
    Calendar,
    X
} from 'lucide-react';
import { fetchMonitoringLogs } from '../api';

export default function LogsTable({ refreshKey }) {
    const [logs, setLogs] = useState([]);
    const [availableServices, setAvailableServices] = useState([]);
    const [availableStatusCodes, setAvailableStatusCodes] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1, totalRecords: 0 });
    const [loading, setLoading] = useState(true);

    // Filters state
    const [serviceId, setServiceId] = useState('');
    const [statusCode, setStatusCode] = useState('');
    const [isValid, setIsValid] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage] = useState(1);

    // Debounce search input (500ms delay to limit API request frequency)
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 500);

        return () => clearTimeout(timer);
    }, [search]);

    // Fetch logs whenever active filters, debounced search, or pagination changes
    useEffect(() => {
        loadLogs();
    }, [serviceId, statusCode, isValid, startDate, endDate, debouncedSearch, page, refreshKey]);

    const loadLogs = async () => {
        setLoading(true);
        try {
            const params = { page, limit: 10 };
            if (serviceId) params.service_id = serviceId;
            if (statusCode) params.status_code = statusCode;
            if (isValid !== '') params.is_valid = isValid;
            if (startDate) params.start_date = startDate;
            if (endDate) params.end_date = endDate;
            if (debouncedSearch) params.search = debouncedSearch;

            const response = await fetchMonitoringLogs(params);
            setLogs(response.data || []);
            if (response.availableServices && response.availableServices.length > 0) {
                setAvailableServices(response.availableServices);
            }
            if (response.availableStatusCodes && response.availableStatusCodes.length > 0) {
                setAvailableStatusCodes(response.availableStatusCodes);
            }
            if (response.pagination) {
                setPagination(response.pagination);
            }
        } catch (err) {
            console.error('Error fetching logs:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleClearFilters = () => {
        setServiceId('');
        setStatusCode('');
        setIsValid('');
        setStartDate('');
        setEndDate('');
        setSearch('');
        setDebouncedSearch('');
        setPage(1);
    };

    const getStatusBadge = (code) => {
        if (code === 200) {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    200 OK
                </span>
            );
        }
        if (code === 999) {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    999 INVALID
                </span>
            );
        }
        return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                {code} ERROR
            </span>
        );
    };

    const getLatencyBadge = (latencyMs) => {
        if (latencyMs === null || latencyMs === undefined) {
            return <span className="text-slate-400 italic text-xs">-- ms</span>;
        }
        if (latencyMs < 500) {
            return (
                <span className="inline-flex items-center text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/80">
                    {latencyMs} ms
                </span>
            );
        }
        if (latencyMs <= 1000) {
            return (
                <span className="inline-flex items-center text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/80">
                    {latencyMs} ms
                </span>
            );
        }
        return (
            <span className="inline-flex items-center text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200/80">
                {latencyMs} ms
            </span>
        );
    };

    const hasActiveFilters = serviceId || statusCode || isValid !== '' || startDate || endDate || search;

    return (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
                        <ListFilter className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">Filterable Monitoring Logs</h3>
                        <p className="text-xs text-slate-500">Audit individual service check records, date ranges & data quality flags</p>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <button
                        onClick={loadLogs}
                        className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition-all text-xs font-medium flex items-center space-x-1 cursor-pointer"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
                        <span>Refresh Logs</span>
                    </button>
                    {hasActiveFilters && (
                        <button
                            onClick={handleClearFilters}
                            className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-all text-xs font-medium flex items-center space-x-1 cursor-pointer"
                        >
                            <X className="w-3.5 h-3.5" />
                            <span>Clear Filters</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Filter Controls Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">

                {/* Search Input */}
                <div className="relative flex items-center lg:col-span-2">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search service, region, agent..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-3 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                    />
                    {search !== debouncedSearch && (
                        <span className="absolute right-3 text-[10px] text-emerald-600 font-medium animate-pulse">Searching...</span>
                    )}
                </div>

                {/* Service Filter (100% Dynamic from Database) */}
                <div>
                    <select
                        value={serviceId}
                        onChange={(e) => { setServiceId(e.target.value); setPage(1); }}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all cursor-pointer font-medium"
                    >
                        <option value="">All Services</option>
                        {availableServices.map((svc) => (
                            <option key={svc.serviceId} value={svc.serviceId}>
                                {svc.serviceName} ({svc.serviceId})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Status Code Filter (100% Dynamic from Database) */}
                <div>
                    <select
                        value={statusCode}
                        onChange={(e) => { setStatusCode(e.target.value); setPage(1); }}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all cursor-pointer font-medium"
                    >
                        <option value="">All Status Codes</option>
                        {availableStatusCodes.map((code) => (
                            <option key={code} value={code}>
                                HTTP {code} {code === 200 ? 'OK' : code === 999 ? 'INVALID' : 'ERROR'}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Start Date Picker (Clear 'From Date' Label) */}
                <div className="relative flex items-center">
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-2 rounded-l-xl border-r-0 shrink-0">
                        From:
                    </span>
                    <div className="relative w-full flex items-center">
                        <Calendar className="w-3 h-3 text-slate-400 absolute left-2 pointer-events-none" />
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                            className="w-full bg-white border border-slate-200 rounded-r-xl pl-7 pr-2 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all cursor-pointer font-medium"
                            title="Filter logs starting from this date"
                        />
                    </div>
                </div>

                {/* End Date Picker (Clear 'To Date' Label) */}
                <div className="relative flex items-center">
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-2 rounded-l-xl border-r-0 shrink-0">
                        To:
                    </span>
                    <div className="relative w-full flex items-center">
                        <Calendar className="w-3 h-3 text-slate-400 absolute left-2 pointer-events-none" />
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                            className="w-full bg-white border border-slate-200 rounded-r-xl pl-7 pr-2 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all cursor-pointer font-medium"
                            title="Filter logs up to this date"
                        />
                    </div>
                </div>

            </div>

            {/* Logs Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200/80">
                <table className="w-full text-left border-collapse text-xs">
                    <thead>
                        <tr className="bg-slate-100/80 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                            <th className="py-3 px-4">Timestamp (UTC)</th>
                            <th className="py-3 px-4">Service</th>
                            <th className="py-3 px-4">Status Code</th>
                            <th className="py-3 px-4">Latency</th>
                            <th className="py-3 px-4">Agent / Region</th>
                            <th className="py-3 px-4">Data Quality</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="py-8 text-center text-slate-500 font-medium">
                                    <RefreshCw className="w-6 h-6 animate-spin text-emerald-600 mx-auto mb-2" />
                                    Loading monitoring check logs...
                                </td>
                            </tr>
                        ) : logs.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="py-10 text-center text-slate-500">
                                    {hasActiveFilters ? (
                                        <div className="space-y-1">
                                            <div className="font-bold text-slate-700 text-xs">No Matching Records</div>
                                            <p className="text-xs text-slate-400 max-w-md mx-auto">
                                                No logs match your active filter criteria. Try adjusting or clearing your filters.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-1">
                                            <div className="font-bold text-slate-700 text-xs">No Monitoring Records</div>
                                            <p className="text-xs text-slate-400 max-w-md mx-auto">
                                                Upload a CSV dataset above to start tracking service telemetry.
                                            </p>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ) : (
                            logs.map((row) => (
                                <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                                        {new Date(row.timestamp).toISOString().replace('T', ' ').slice(0, 19)}
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="font-semibold text-slate-800">{row.service_name}</div>
                                        <div className="text-[11px] text-slate-400 font-mono">{row.service_id}</div>
                                    </td>
                                    <td className="py-3 px-4">
                                        {getStatusBadge(row.status_code)}
                                    </td>
                                    <td className="py-3 px-4">
                                        {getLatencyBadge(row.latency_ms)}
                                    </td>
                                    <td className="py-3 px-4 text-slate-600">
                                        <span className="font-medium text-slate-700">{row.agent}</span> &bull; <span className="text-slate-400">{row.region}</span>
                                    </td>
                                    <td className="py-3 px-4">
                                        {row.is_valid ? (
                                            <span className="inline-flex items-center space-x-1 text-emerald-700 font-semibold text-xs">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                                <span>Valid</span>
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center space-x-1 text-amber-700 font-semibold text-xs bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                                                <span>{row.validation_errors || 'Flagged'}</span>
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Footer Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 pt-2">
                <div>
                    Showing page <span className="font-bold text-slate-800">{pagination.page}</span> of <span className="font-bold text-slate-800">{pagination.totalPages}</span> ({pagination.totalRecords} total checks)
                </div>

                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1 || loading}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white text-slate-700 font-medium transition-all flex items-center space-x-1 shadow-2xs cursor-pointer"
                    >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        <span>Previous</span>
                    </button>
                    <button
                        onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                        disabled={page >= pagination.totalPages || loading}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white text-slate-700 font-medium transition-all flex items-center space-x-1 shadow-2xs cursor-pointer"
                    >
                        <span>Next</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
