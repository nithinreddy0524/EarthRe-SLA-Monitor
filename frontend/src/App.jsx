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
import BatchHistory from './components/BatchHistory';

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
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3.5 sm:py-4 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center justify-between sm:justify-start space-x-3">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-600/20 text-white shrink-0">
                <Activity className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-black bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-900 bg-clip-text text-transparent tracking-tight">
                  EarthRe SLA Monitor
                </h1>
                <p className="text-[11px] sm:text-xs text-slate-500 font-medium">Enterprise Service Availability & Reliability Dashboard</p>
              </div>
            </div>

            {/* Mobile Refresh Button */}
            <button
              onClick={() => { checkBackendHealth(); loadDashboardStats(); setLogsRefreshKey(prev => prev + 1); }}
              className="sm:hidden p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-emerald-700 shadow-2xs cursor-pointer shrink-0"
              title="Refresh All System Data & Metrics"
            >
              <RefreshCw className={`w-4 h-4 ${(loadingHealth || loadingStats) ? 'animate-spin text-emerald-600' : ''}`} />
            </button>
          </div>

          {/* Backend Status Indicator & Desktop Refresh Button */}
          <div className="flex items-center justify-between sm:justify-end space-x-3">
            <div className="flex items-center space-x-2 bg-emerald-50/80 border border-emerald-200/80 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[11px] sm:text-xs shadow-2xs">
              <span className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${health?.status === 'healthy' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span className="text-emerald-900 font-semibold">
                {loadingHealth ? 'Connecting...' : health?.status === 'healthy' ? 'System Online' : 'Backend Connected'}
              </span>
            </div>
            <button
              onClick={() => { checkBackendHealth(); loadDashboardStats(); setLogsRefreshKey(prev => prev + 1); }}
              className="hidden sm:flex p-2.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-300 text-slate-600 hover:text-emerald-700 transition-all shadow-2xs cursor-pointer shrink-0"
              title="Refresh All System Data & Metrics"
            >
              <RefreshCw className={`w-4 h-4 ${(loadingHealth || loadingStats) ? 'animate-spin text-emerald-600' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Dashboard Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8">

        {/* Executive Hero Banner */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-50 via-white to-teal-50/50 border border-emerald-200/80 p-5 sm:p-8 shadow-sm">
          <div className="relative z-10 max-w-3xl space-y-3 sm:space-y-4">
            <div className="inline-flex items-center space-x-2 bg-emerald-100/80 border border-emerald-200 px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold text-emerald-800 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />
              <span>Automated Telemetry Ingestion & Quality Audit</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Service Availability & Response Time Analytics
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              Upload monitoring CSV datasets to track service uptime, measure response speeds, clean invalid rows, and automatically remove duplicate check records.
            </p>
          </div>
        </section>

        {/* Dedicated Top CSV Telemetry Ingestion Section */}
        <section>
          <CsvUploader onUploadSuccess={handleUploadSuccess} />
        </section>

        {/* SLA Stats Section (Collapsible Header & Controls) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between bg-white border border-slate-200/80 px-4 sm:px-5 py-3 sm:py-3.5 rounded-2xl shadow-2xs">
            <div className="flex items-center space-x-2.5 sm:space-x-3">
              <Cpu className="w-4 h-4 text-emerald-600 shrink-0" />
              <h3 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wider">System Performance Summary</h3>
            </div>
            <button
              onClick={() => setIsStatsCollapsed(!isStatsCollapsed)}
              className="flex items-center space-x-1 sm:space-x-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 transition-all cursor-pointer whitespace-nowrap shrink-0"
            >
              <span>{isStatsCollapsed ? 'Show' : 'Hide'}</span>
              <span className="hidden sm:inline">Summary</span>
              {isStatsCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>

          {/* Collapsible Stats Content Body */}
          {!isStatsCollapsed && (
            <div className="space-y-6 animate-fadeIn">

              {/* Overview Key Metrics Cards Grid (All 6 Cards in 4-Per-Row Responsive Layout) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

                {/* Card 1: Overall SLA Uptime */}
                <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-emerald-300 transition-all group flex flex-col justify-between space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Overall SLA Uptime</span>
                    <div className="w-9 h-9 rounded-xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <div className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight min-h-[36px] flex items-center">
                      {loadingStats ? (
                        <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin" />
                      ) : hasData && stats?.summary?.availabilityPercent !== undefined ? (
                        `${stats.summary.availabilityPercent}%`
                      ) : (
                        '-- %'
                      )}
                    </div>
                    <div className="text-xs font-semibold text-emerald-700 flex items-center space-x-1 mt-1">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>Target: &ge; 99.9% Uptime</span>
                    </div>
                  </div>
                </div>

                {/* Card 2: Average Latency */}
                <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-teal-300 transition-all group flex flex-col justify-between space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Average Latency</span>
                    <div className="w-9 h-9 rounded-xl bg-teal-100/80 text-teal-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Clock className="w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <div className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight min-h-[36px] flex items-center">
                      {loadingStats ? (
                        <RefreshCw className="w-6 h-6 text-teal-600 animate-spin" />
                      ) : hasData && stats?.latency?.avgMs !== undefined ? (
                        `${stats.latency.avgMs} ms`
                      ) : (
                        '-- ms'
                      )}
                    </div>
                    <div className="text-xs font-medium text-slate-500 mt-1 font-mono">
                      p50:{hasData ? `${stats?.latency?.p50Ms}ms` : '--'} &bull; p95:{hasData ? `${stats?.latency?.p95Ms}ms` : '--'} &bull; p99:{hasData ? `${stats?.latency?.p99Ms}ms` : '--'}
                    </div>
                  </div>
                </div>

                {/* Card 3: Successful Checks (2xx Hits) */}
                <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-emerald-300 transition-all group flex flex-col justify-between space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Successful Checks</span>
                    <div className="w-9 h-9 rounded-xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <div className="text-3xl font-extrabold text-emerald-950 font-mono tracking-tight min-h-[36px] flex items-center">
                      {loadingStats ? (
                        <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin" />
                      ) : (
                        stats?.summary?.successfulChecks !== undefined
                          ? stats.summary.successfulChecks.toLocaleString()
                          : (hasData ? ((stats?.summary?.validChecks || 0) - (stats?.summary?.totalFailures || 0)).toLocaleString() : '0')
                      )}
                    </div>
                    <div className="text-xs font-medium text-emerald-700 mt-1">
                      HTTP 2xx Success Hits
                    </div>
                  </div>
                </div>

                {/* Card 4: Total Service Failures (4xx & 5xx) */}
                <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-rose-300 transition-all group flex flex-col justify-between space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Failures</span>
                    <div className="w-9 h-9 rounded-xl bg-rose-100/80 text-rose-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <div className="text-3xl font-extrabold text-rose-950 font-mono tracking-tight min-h-[36px] flex items-center">
                      {loadingStats ? (
                        <RefreshCw className="w-6 h-6 text-rose-600 animate-spin" />
                      ) : (
                        stats?.summary?.totalFailures !== undefined ? stats.summary.totalFailures.toLocaleString() : '0'
                      )}
                    </div>
                    <div className="text-xs font-medium text-rose-700 mt-1">
                      HTTP 4xx &amp; 5xx Downtime Checks
                    </div>
                  </div>
                </div>

                {/* Card 5: Ingested Telemetry & Deduplication (Spans 2 cols on md/lg) */}
                <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-cyan-300 transition-all group flex flex-col justify-between space-y-3 sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Ingested Telemetry &amp; Deduplication</span>
                    <div className="w-9 h-9 rounded-xl bg-cyan-100/80 text-cyan-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Database className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <div>
                      <div className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight min-h-[36px] flex items-center">
                        {loadingStats ? (
                          <RefreshCw className="w-6 h-6 text-cyan-600 animate-spin" />
                        ) : (
                          stats?.summary?.totalIngestedRows !== undefined ? stats.summary.totalIngestedRows.toLocaleString() : (stats?.summary?.totalChecks?.toLocaleString() || '0')
                        )}
                        <span className="text-xs font-sans font-normal text-slate-500 ml-2">Total Ingested Rows</span>
                      </div>
                      <div className="text-xs font-medium text-slate-500 mt-1">
                        {stats?.summary?.totalBatches || 0} Upload Batches &bull; {stats?.summary?.totalChecks?.toLocaleString() || 0} Unique Valid Checks
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold font-mono text-indigo-900">
                        {stats?.summary?.duplicateRows !== undefined ? stats.summary.duplicateRows.toLocaleString() : '0'}
                      </div>
                      <div className="text-[11px] font-semibold text-indigo-700">Duplicates Skipped</div>
                    </div>
                  </div>
                </div>

                {/* Card 6: Invalid & Data Quality Flags (Spans 2 cols on md/lg) */}
                <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-amber-300 transition-all group flex flex-col justify-between space-y-3 sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Invalid &amp; Data Quality Audit</span>
                    <div className="w-9 h-9 rounded-xl bg-amber-100/80 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <div>
                      <div className="text-3xl font-extrabold text-amber-950 font-mono tracking-tight min-h-[36px] flex items-center">
                        {loadingStats ? (
                          <RefreshCw className="w-6 h-6 text-amber-600 animate-spin" />
                        ) : (
                          stats?.summary?.invalidChecks !== undefined ? stats.summary.invalidChecks.toLocaleString() : '0'
                        )}
                        <span className="text-xs font-sans font-normal text-slate-500 ml-2">Invalid Flagged Rows</span>
                      </div>
                      <div className="text-xs font-medium text-amber-800 mt-1 font-mono">
                        Status 999: <strong>{stats?.dataQuality?.status999Count || 0} rows</strong> &bull; Missing Latency: <strong>{stats?.dataQuality?.missingLatencyCount || 0} rows</strong>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-block text-[10px] font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full border border-amber-200">
                        Filtered from SLA Avg
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Monitored Services SLA Breakdown (Full Width 5-Column Grid) */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
                      <Server className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Monitored Microservices Overview</h3>
                      <p className="text-xs text-slate-500">Live uptime and average response time across all 5 registered services</p>
                    </div>
                  </div>
                  {servicesList.length > 0 && (
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 whitespace-nowrap self-start sm:self-auto shrink-0">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                    {servicesList.map((svc) => {
                      const avail = parseFloat(svc.availabilityPercent || 0);
                      const isMetSla = avail >= 99.9;

                      return (
                        <div
                          key={svc.serviceId}
                          className="bg-slate-50/70 border border-slate-200/80 p-4 rounded-xl flex flex-col justify-between hover:border-emerald-300 hover:bg-emerald-50/30 transition-all space-y-3.5 shadow-2xs group"
                        >
                          {/* Card Header: Service ID & SLA Status Badge */}
                          <div className="space-y-1 border-b border-slate-200/60 pb-2.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-950 transition-colors">
                                {svc.serviceName}
                              </span>
                              {isMetSla ? (
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                                  SLA Met
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded-full border border-amber-200 shrink-0">
                                  SLA Breach
                                </span>
                              )}
                            </div>
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-mono text-emerald-800 bg-white px-1.5 py-0.5 rounded border border-slate-200 font-semibold">
                                {svc.serviceId}
                              </span>
                              <span className="text-slate-400 font-medium text-[10px]">
                                Target: &ge; 99.9%
                              </span>
                            </div>
                          </div>

                          {/* Availability Percentage & Visual Line Progress Bar */}
                          <div className="space-y-1.5">
                            <div className="flex items-baseline justify-between">
                              <span className="text-[11px] font-semibold text-slate-500">Availability</span>
                              <span className="text-xl font-extrabold font-mono text-slate-900">
                                {avail.toFixed(2)}%
                              </span>
                            </div>
                            {/* Visual Progress Bar Line (Vibrant Emerald Green) */}
                            <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden shadow-inner">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-400 shadow-sm transition-all duration-500"
                                style={{ width: `${Math.max(avail, 4)}%` }}
                              />
                            </div>
                          </div>

                          {/* Detailed Metrics Breakdown Grid */}
                          <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] font-mono border-t border-slate-200/60">
                            <div className="bg-white p-2 rounded-lg border border-slate-200/60 space-y-0.5">
                              <div className="text-[10px] text-slate-400 font-sans uppercase font-bold tracking-wider">Success</div>
                              <div className="font-bold text-emerald-700 flex items-center space-x-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                                <span>{(svc.successfulChecks || 0).toLocaleString()}</span>
                              </div>
                            </div>

                            <div className="bg-white p-2 rounded-lg border border-slate-200/60 space-y-0.5">
                              <div className="text-[10px] text-slate-400 font-sans uppercase font-bold tracking-wider">Failures</div>
                              <div className={`font-bold flex items-center space-x-1 ${svc.totalFailures > 0 ? 'text-amber-700' : 'text-slate-600'}`}>
                                <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
                                <span>{(svc.totalFailures || 0).toLocaleString()}</span>
                              </div>
                            </div>

                            <div className="bg-white p-2 rounded-lg border border-slate-200/60 space-y-0.5">
                              <div className="text-[10px] text-slate-400 font-sans uppercase font-bold tracking-wider">Avg Speed</div>
                              <div className="font-bold text-slate-800 flex items-center space-x-1">
                                <Clock className="w-3 h-3 text-teal-600 shrink-0" />
                                <span>{svc.avgLatencyMs}ms</span>
                              </div>
                            </div>

                            <div className="bg-white p-2 rounded-lg border border-slate-200/60 space-y-0.5">
                              <div className="text-[10px] text-slate-400 font-sans uppercase font-bold tracking-wider">p95 Tail</div>
                              <div className="font-bold text-cyan-800 flex items-center space-x-1">
                                <Activity className="w-3 h-3 text-cyan-600 shrink-0" />
                                <span>{svc.p95LatencyMs}ms</span>
                              </div>
                            </div>
                          </div>

                          {/* Footer Valid Checks Count */}
                          <div className="text-[10px] text-slate-400 text-center font-mono pt-1">
                            Valid Checks: <strong className="text-slate-600">{(svc.validChecks || 0).toLocaleString()}</strong> / {(svc.totalChecks || 0).toLocaleString()}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          )}
        </section>

        {/* Batch Ingestion Audit History Section */}
        <section>
          <BatchHistory batches={stats?.recentBatches || []} loading={loadingStats} />
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
