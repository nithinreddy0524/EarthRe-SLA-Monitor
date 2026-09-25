import React, { useState, useEffect } from 'react';
import {
  Activity,
  UploadCloud,
  ShieldCheck,
  Clock,
  AlertTriangle,
  Server,
  RefreshCw,
  FileText,
  Database
} from 'lucide-react';
import { fetchHealth } from './api';

function App() {
  const [health, setHealth] = useState(null);
  const [loadingHealth, setLoadingHealth] = useState(true);

  useEffect(() => {
    checkBackendHealth();
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-400">
      {/* Top Navigation Header */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-950/50">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                EarthRe SLA Monitor
              </h1>
              <p className="text-xs text-slate-400 font-medium">Serverless Microservice SLA Engine</p>
            </div>
          </div>

          {/* Backend Status Indicator */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-slate-950/60 border border-slate-800 px-3 py-1.5 rounded-full text-xs">
              <span className={`w-2 h-2 rounded-full ${health?.status === 'healthy' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span className="text-slate-300 font-medium">
                {loadingHealth ? 'Checking Backend...' : health?.status === 'healthy' ? 'AWS Lambda API Connected' : 'Local Backend Ready'}
              </span>
            </div>
            <button
              onClick={checkBackendHealth}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Refresh Connection"
            >
              <RefreshCw className={`w-4 h-4 ${loadingHealth ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Dashboard Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-8">

        {/* Welcome Hero Banner */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/30 border border-slate-800 p-8 shadow-2xl">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-semibold text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Production SLA & Latency Compliance Engine</span>
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
              Transparent SLA Monitoring & Messy Data Ingestion
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Upload raw CSV monitoring logs, clean dataset anomalies automatically in PostgreSQL, and audit service availability percentages and latency distribution across 5 core microservices.
            </p>
          </div>
        </section>

        {/* Overview Key Metrics Cards Placeholder */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 p-5 rounded-2xl shadow-xl hover:border-slate-700 transition-all group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Overall Availability</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-1">-- %</div>
            <div className="text-xs text-slate-500">Target SLA: &ge; 99.9%</div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 p-5 rounded-2xl shadow-xl hover:border-slate-700 transition-all group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Avg Latency</span>
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-1">-- ms</div>
            <div className="text-xs text-slate-500">p95 / p99 percentiles</div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 p-5 rounded-2xl shadow-xl hover:border-slate-700 transition-all group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Ingested Checks</span>
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Database className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-1">--</div>
            <div className="text-xs text-slate-500">PostgreSQL earthre_sla_monitor</div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 p-5 rounded-2xl shadow-xl hover:border-slate-700 transition-all group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Data Anomalies Cleaned</span>
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-1">--</div>
            <div className="text-xs text-slate-500">7 cleaning rules applied</div>
          </div>

        </div>

        {/* Ingestion & Dashboard Section Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* CSV Upload Container */}
          <div className="lg:col-span-1 bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center space-x-2">
              <UploadCloud className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-bold text-white">CSV Upload & Ingestion</h3>
            </div>
            <p className="text-xs text-slate-400">
              Drag & drop EarthRe monitoring CSV files (`monitoring_checks_*.csv`) to trigger automated data validation.
            </p>

            <div className="border-2 border-dashed border-slate-800 hover:border-emerald-500/50 bg-slate-950/40 rounded-xl p-8 text-center space-y-3 cursor-pointer transition-colors">
              <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center mx-auto text-slate-400">
                <FileText className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="text-sm font-medium text-slate-300">
                Select CSV file or drag here
              </div>
              <div className="text-xs text-slate-500">
                Supports all 5 EarthRe dataset files (up to 30 days)
              </div>
            </div>
          </div>

          {/* Monitored Services SLA Preview */}
          <div className="lg:col-span-2 bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Server className="w-5 h-5 text-teal-400" />
                <h3 className="text-lg font-bold text-white">Monitored Microservices</h3>
              </div>
              <span className="text-xs text-slate-400">5 Services Tracked</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { id: 'svc-auth', name: 'Authentication API', type: 'Core Auth' },
                { id: 'svc-payments', name: 'Payments API', type: 'Transactions' },
                { id: 'svc-search', name: 'Search Engine', type: 'Product Search' },
                { id: 'svc-reports', name: 'Reports Generator', type: 'Analytics' },
                { id: 'svc-notify', name: 'Notify Worker', type: 'Async Messages' },
              ].map(svc => (
                <div key={svc.id} className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-slate-200">{svc.name}</div>
                    <div className="text-xs text-slate-500">{svc.id} &bull; {svc.type}</div>
                  </div>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                </div>
              ))}
            </div>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 bg-slate-950 px-6 py-4 text-center text-xs text-slate-500">
        EarthRe SLA Monitoring Dashboard &bull; Serverless AWS Lambda + PostgreSQL Engine
      </footer>
    </div>
  );
}

export default App;
