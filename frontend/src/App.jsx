import React, { useState, useEffect } from 'react';
import {
  Activity,
  ShieldCheck,
  Clock,
  AlertTriangle,
  Server,
  RefreshCw,
  Database,
  BarChart3,
  CheckCircle2,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';
import { fetchHealth, fetchSlaStats } from './api';
import CsvUploader from './components/CsvUploader';
import LogsTable from './components/LogsTable';

function App() {
  const [health, setHealth] = useState(null);
  const [loadingHealth, setLoadingHealth] = useState(true);
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [logsRefreshKey, setLogsRefreshKey] = useState(0);

  useEffect(() => {
    checkBackendHealth();
    loadDashboardStats();
  }, []);

  const checkBackendHealth = async () => {
    setLoadingHealth(true);
    try {
      const data = await fetchHealth();
      setHealth(data);
    } catch (err) {
      setHealth({ status: 'error', message: err.message });
    } finally {
      setLoadingHealth(false);
    }
  };

  const loadDashboardStats = async () => {
    setLoadingStats(true);
    try {
      const data = await fetchSlaStats();
      setStats(data);
    } catch (err) {
      console.error('Error fetching SLA stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleUploadSuccess = () => {
    loadDashboardStats();
    setLogsRefreshKey(prev => prev + 1);
  };

  const hasData = stats?.summary?.totalChecks > 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Navigation Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-6 py-4 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-600/20 text-white">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-900 bg-clip-text text-transparent tracking-tight">
                EarthRe SLA Monitor
              </h1>
              <p className="text-xs text-slate-500 font-medium">Serverless AWS Lambda SLA Compliance Engine</p>
            </div>
          </div>

          {/* Backend Status Indicator & Action Buttons */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-emerald-50/80 border border-emerald-200/80 px-3 py-1.5 rounded-full text-xs shadow-2xs">
              <span className={`w-2.5 h-2.5 rounded-full ${health?.status === 'healthy' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span className="text-emerald-900 font-semibold">
                {loadingHealth ? 'Checking Backend...' : health?.status === 'healthy' ? 'AWS Lambda API Connected' : 'AWS SAM API Ready'}
              </span>
            </div>
            <button
              onClick={() => { checkBackendHealth(); loadDashboardStats(); setLogsRefreshKey(prev => prev + 1); }}
              className="p-2 rounded-xl bg-white border border-slate-200 hover:border-emerald-300 text-slate-600 hover:text-emerald-700 transition-all shadow-2xs"
              title="Refresh Connection & SLA Metrics"
            >
              <RefreshCw className={`w-4 h-4 ${(loadingHealth || loadingStats) ? 'animate-spin text-emerald-600' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Dashboard Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-8">

        {/* Welcome Hero Banner */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-50 via-white to-teal-50/50 border border-emerald-200/80 p-8 shadow-sm">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center space-x-2 bg-emerald-100/80 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold text-emerald-800 shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Production SLA & Latency Compliance Engine</span>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
              Transparent SLA Monitoring & Automated CSV Ingestion
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              Upload raw CSV monitoring logs, clean dataset anomalies automatically in PostgreSQL, and audit service availability percentages and latency distribution across 5 core microservices.
            </p>
          </div>
        </section>

        {/* Overview Key Metrics Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-emerald-300 transition-all group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Overall Availability</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mb-1">
              {hasData && stats?.summary?.availabilityPercent !== undefined ? `${stats.summary.availabilityPercent}%` : '-- %'}
            </div>
            <div className="text-xs font-medium text-emerald-700 flex items-center space-x-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Target SLA: &ge; 99.9%</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-emerald-300 transition-all group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Avg Latency</span>
              <div className="w-9 h-9 rounded-xl bg-teal-100/80 text-teal-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mb-1">
              {hasData && stats?.latency?.avgMs !== undefined ? `${stats.latency.avgMs} ms` : '-- ms'}
            </div>
            <div className="text-xs font-medium text-slate-500">
              p95: {hasData ? `${stats?.latency?.p95Ms}ms` : '--'} &bull; p99: {hasData ? `${stats?.latency?.p99Ms}ms` : '--'}
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-emerald-300 transition-all group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Checks Ingested</span>
              <div className="w-9 h-9 rounded-xl bg-cyan-100/80 text-cyan-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Database className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mb-1">
              {stats?.summary?.totalChecks !== undefined ? stats.summary.totalChecks.toLocaleString() : '0'}
            </div>
            <div className="text-xs font-medium text-slate-500">PostgreSQL earthre_sla_monitor</div>
          </div>

          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-emerald-300 transition-all group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Anomalies Cleaned</span>
              <div className="w-9 h-9 rounded-xl bg-amber-100/80 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 mb-1">
              {stats?.summary?.invalidChecks !== undefined ? stats.summary.invalidChecks.toLocaleString() : '0'}
            </div>
            <div className="text-xs font-medium text-slate-500">7 automated cleaning rules</div>
          </div>

        </div>

        {/* Ingestion & Monitored Services Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* CSV Upload Container */}
          <div className="lg:col-span-1">
            <CsvUploader onUploadSuccess={handleUploadSuccess} />
          </div>

          {/* Monitored Services SLA Breakdown */}
          <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
                  <Server className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Monitored Microservices</h3>
                  <p className="text-xs text-slate-500">SLA availability and latency breakdown</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                5 Microservices Active
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { id: 'svc-auth', name: 'Authentication API', type: 'Core Auth' },
                { id: 'svc-payments', name: 'Payments API', type: 'Transactions' },
                { id: 'svc-search', name: 'Search Engine', type: 'Product Search' },
                { id: 'svc-reports', name: 'Reports Generator', type: 'Analytics' },
                { id: 'svc-notify', name: 'Notify Worker', type: 'Async Messages' },
              ].map(svc => {
                const serviceStat = stats?.services?.find(s => s.serviceId === svc.id);
                return (
                  <div key={svc.id} className="bg-slate-50/70 border border-slate-200/80 p-4 rounded-xl flex items-center justify-between hover:border-emerald-300 hover:bg-emerald-50/30 transition-all">
                    <div>
                      <div className="text-sm font-bold text-slate-800">{svc.name}</div>
                      <div className="text-xs text-slate-500">{svc.id} &bull; {svc.type}</div>
                      {serviceStat && serviceStat.totalChecks > 0 ? (
                        <div className="text-xs text-emerald-700 font-bold mt-1.5 flex items-center space-x-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>SLA: {serviceStat.availabilityPercent}% ({serviceStat.avgLatencyMs}ms avg)</span>
                        </div>
                      ) : (
                        <div className="text-xs text-slate-400 mt-1">Pending CSV upload...</div>
                      )}
                    </div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-xs shadow-emerald-500/50" />
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Filterable Monitoring Logs Table Section */}
        <section>
          <LogsTable refreshKey={logsRefreshKey} />
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white px-6 py-4 text-center text-xs text-slate-500">
        EarthRe SLA Monitoring Dashboard &bull; Serverless AWS Lambda + PostgreSQL Engine
      </footer>
    </div>
  );
}

export default App;
