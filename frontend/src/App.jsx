import React, { useState, useEffect } from 'react';
import {
  Activity,
  ShieldCheck,
  Clock,
  AlertTriangle,
  Server,
  RefreshCw,
  Database,
  CheckCircle2,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Cpu
} from 'lucide-react';
import { fetchHealth, fetchSlaStats } from './api';
import CsvUploader from './components/CsvUploader';
import LogsTable from './components/LogsTable';
import AboutSection from './components/AboutSection';

function App() {
  const [health, setHealth] = useState(null);
  const [loadingHealth, setLoadingHealth] = useState(true);
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [logsRefreshKey, setLogsRefreshKey] = useState(0);
  const [isStatsCollapsed, setIsStatsCollapsed] = useState(false);

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
  const servicesList = stats?.services || [];

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
              <p className="text-xs text-slate-500 font-medium">Enterprise Service Availability & Reliability Dashboard</p>
            </div>
          </div>

          {/* Backend Status Indicator & Refresh Button */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-emerald-50/80 border border-emerald-200/80 px-3.5 py-1.5 rounded-full text-xs shadow-2xs">
              <span className={`w-2.5 h-2.5 rounded-full ${health?.status === 'healthy' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span className="text-emerald-900 font-semibold">
                {loadingHealth ? 'Connecting Backend...' : health?.status === 'healthy' ? 'System Online' : 'Backend Connected'}
              </span>
            </div>
            <button
              onClick={() => { checkBackendHealth(); loadDashboardStats(); setLogsRefreshKey(prev => prev + 1); }}
              className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-300 text-slate-600 hover:text-emerald-700 transition-all shadow-2xs cursor-pointer"
              title="Refresh All System Data & Metrics"
            >
              <RefreshCw className={`w-4 h-4 ${(loadingHealth || loadingStats) ? 'animate-spin text-emerald-600' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Dashboard Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-8">

        {/* Executive Hero Banner */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-50 via-white to-teal-50/50 border border-emerald-200/80 p-8 shadow-sm">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center space-x-2 bg-emerald-100/80 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold text-emerald-800 shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Automated Telemetry Ingestion & Quality Audit</span>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
              Service Availability & Response Time Analytics
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              Upload monitoring CSV datasets to track service uptime, measure response speeds, clean invalid rows, and automatically remove duplicate check records.
            </p>
          </div>
        </section>

        {/* SLA Stats Section (Collapsible Header & Controls) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between bg-white border border-slate-200/80 px-5 py-3.5 rounded-2xl shadow-2xs">
            <div className="flex items-center space-x-3">
              <Cpu className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">System Performance Summary</h3>
            </div>
            <button
              onClick={() => setIsStatsCollapsed(!isStatsCollapsed)}
              className="flex items-center space-x-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-1.5 rounded-xl border border-emerald-200 transition-all cursor-pointer"
            >
              <span>{isStatsCollapsed ? 'Show Summary' : 'Hide Summary'}</span>
              {isStatsCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>

          {/* Collapsible Stats Content Body */}
          {!isStatsCollapsed && (
            <div className="space-y-8 animate-fadeIn">

              {/* Overview Key Metrics Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

                <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-emerald-300 transition-all group">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Overall SLA Uptime</span>
                    <div className="w-9 h-9 rounded-xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-3xl font-extrabold text-slate-900 mb-1 min-h-[36px] flex items-center">
                    {loadingStats ? (
                      <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin my-1" />
                    ) : hasData && stats?.summary?.availabilityPercent !== undefined ? (
                      `${stats.summary.availabilityPercent}%`
                    ) : (
                      '-- %'
                    )}
                  </div>
                  <div className="text-xs font-medium text-emerald-700 flex items-center space-x-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Target: &ge; 99.9% Uptime</span>
                  </div>
                </div>

                <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-emerald-300 transition-all group">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Average Latency</span>
                    <div className="w-9 h-9 rounded-xl bg-teal-100/80 text-teal-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Clock className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-3xl font-extrabold text-slate-900 mb-1 min-h-[36px] flex items-center">
                    {loadingStats ? (
                      <RefreshCw className="w-6 h-6 text-teal-600 animate-spin my-1" />
                    ) : hasData && stats?.latency?.avgMs !== undefined ? (
                      `${stats.latency.avgMs} ms`
                    ) : (
                      '-- ms'
                    )}
                  </div>
                  <div className="text-xs font-medium text-slate-500">
                    p95: {hasData ? `${stats?.latency?.p95Ms}ms` : '--'} &bull; p99: {hasData ? `${stats?.latency?.p99Ms}ms` : '--'}
                  </div>
                </div>

                <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-emerald-300 transition-all group">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Checks Logged</span>
                    <div className="w-9 h-9 rounded-xl bg-cyan-100/80 text-cyan-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Database className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-3xl font-extrabold text-slate-900 mb-1 min-h-[36px] flex items-center">
                    {loadingStats ? (
                      <RefreshCw className="w-6 h-6 text-cyan-600 animate-spin my-1" />
                    ) : (
                      stats?.summary?.totalChecks !== undefined ? stats.summary.totalChecks.toLocaleString() : '0'
                    )}
                  </div>
                  <div className="text-xs font-medium text-slate-500">Centralized Database Repository</div>
                </div>

                <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-emerald-300 transition-all group">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Invalid Checks Flagged</span>
                    <div className="w-9 h-9 rounded-xl bg-amber-100/80 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-3xl font-extrabold text-slate-900 mb-1 min-h-[36px] flex items-center">
                    {loadingStats ? (
                      <RefreshCw className="w-6 h-6 text-amber-600 animate-spin my-1" />
                    ) : (
                      stats?.summary?.invalidChecks !== undefined ? stats.summary.invalidChecks.toLocaleString() : '0'
                    )}
                  </div>
                  <div className="text-xs font-medium text-slate-500">Rows flagged during ingestion</div>
                </div>

              </div>

              {/* Ingestion & Monitored Services Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

                {/* CSV Upload Container (40% width) */}
                <div className="lg:col-span-2">
                  <CsvUploader onUploadSuccess={handleUploadSuccess} />
                </div>

                {/* Monitored Services SLA Breakdown (60% width) */}
                <div className="lg:col-span-3 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
                        <Server className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900">Monitored Microservices</h3>
                        <p className="text-xs text-slate-500">Uptime and average response time for each service</p>
                      </div>
                    </div>
                    {servicesList.length > 0 && (
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        {servicesList.length} Active Service{servicesList.length === 1 ? '' : 's'}
                      </span>
                    )}
                  </div>

                  {loadingStats ? (
                    <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-8 text-center space-y-3">
                      <RefreshCw className="w-7 h-7 text-emerald-600 animate-spin mx-auto" />
                      <div className="text-sm font-semibold text-slate-700">Loading service metrics...</div>
                    </div>
                  ) : servicesList.length === 0 ? (
                    <div className="bg-slate-50/70 border border-dashed border-slate-200 rounded-xl p-8 text-center space-y-2">
                      <Server className="w-8 h-8 text-slate-300 mx-auto" />
                      <div className="text-sm font-semibold text-slate-700">No Services Logged Yet</div>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        Upload a monitoring CSV dataset to automatically parse, clean, and display service availability and latency analytics.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {servicesList.map((svc) => (
                        <div key={svc.serviceId} className="bg-slate-50/70 border border-slate-200/80 p-4 rounded-xl flex items-center justify-between hover:border-emerald-300 hover:bg-emerald-50/30 transition-all">
                          <div>
                            <div className="text-sm font-bold text-slate-800">{svc.serviceName}</div>
                            <div className="text-xs text-slate-500 font-mono">{svc.serviceId}</div>
                            <div className="text-xs text-emerald-700 font-bold mt-1.5 flex items-center space-x-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Uptime: {svc.availabilityPercent}% ({svc.avgLatencyMs}ms avg)</span>
                            </div>
                          </div>
                          <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-xs shadow-emerald-500/50" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}
        </section>

        {/* Filterable Monitoring Logs Table Section */}
        <section>
          <LogsTable refreshKey={logsRefreshKey} />
        </section>

        {/* Executive About Project Architecture Section */}
        <section>
          <AboutSection />
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white px-6 py-4 text-center text-xs text-slate-500">
        EarthRe SLA Monitoring Dashboard &bull; Real-Time Service Availability & Reliability Platform
      </footer>
    </div>
  );
}

export default App;
