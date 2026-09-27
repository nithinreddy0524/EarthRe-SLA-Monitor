import React, { useState } from 'react';
import {
    Info,
    ShieldCheck,
    Cpu,
    Database,
    Zap,
    ChevronDown,
    ChevronUp,
    Server,
    Layers
} from 'lucide-react';

export default function AboutSection() {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <section className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
            {/* Top Bar Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
                        <Info className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-slate-900">About EarthRe SLA Monitor</h3>
                        <p className="text-xs text-slate-500">Enterprise Service Availability & Reliability Platform Architecture</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center space-x-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-1.5 rounded-xl border border-emerald-200 transition-all cursor-pointer"
                >
                    <span>{isExpanded ? 'Hide Details' : 'View Architecture'}</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
            </div>

            {/* Quick Summary Banner */}
            <div className="bg-gradient-to-r from-emerald-50/80 via-slate-50 to-teal-50/50 p-4 rounded-xl border border-emerald-100 text-xs leading-relaxed text-slate-600">
                <span className="font-bold text-slate-800">EarthRe SLA Monitor</span> is a production-ready telemetry auditing platform engineered to track microservice availability, calculate response latency percentiles (<span className="font-mono text-emerald-800">p95</span>, <span className="font-mono text-emerald-800">p99</span>), and guarantee zero database constraint violations using a multi-layer deduplication engine.
            </div>

            {/* Expandable Project Details & Capabilities Grid */}
            {isExpanded && (
                <div className="space-y-6 animate-fadeIn pt-2">
                    {/* 4 Capability Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                        <div className="bg-slate-50/70 border border-slate-200/80 p-4 rounded-xl space-y-2">
                            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                                <Zap className="w-4 h-4" />
                            </div>
                            <div className="text-xs font-bold text-slate-800">Telemetry Ingestion</div>
                            <p className="text-[11px] text-slate-500 leading-normal">
                                Parses and normalizes incoming CSV telemetry, cleans formatting inconsistencies, and flags invalid records.
                            </p>
                        </div>

                        <div className="bg-slate-50/70 border border-slate-200/80 p-4 rounded-xl space-y-2">
                            <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                                <ShieldCheck className="w-4 h-4" />
                            </div>
                            <div className="text-xs font-bold text-slate-800">Multi-Layer Deduplication</div>
                            <p className="text-[11px] text-slate-500 leading-normal">
                                Application-level composite key pre-query coupled with database <code className="font-mono text-[10px] bg-white border border-slate-200 px-1 py-0.5 rounded">ON CONFLICT DO NOTHING</code>.
                            </p>
                        </div>

                        <div className="bg-slate-50/70 border border-slate-200/80 p-4 rounded-xl space-y-2">
                            <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold">
                                <Cpu className="w-4 h-4" />
                            </div>
                            <div className="text-xs font-bold text-slate-800">Real-Time SLA Metrics</div>
                            <p className="text-[11px] text-slate-500 leading-normal">
                                Computes system availability uptime percentages and latency percentiles dynamically per microservice.
                            </p>
                        </div>

                        <div className="bg-slate-50/70 border border-slate-200/80 p-4 rounded-xl space-y-2">
                            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                                <Database className="w-4 h-4" />
                            </div>
                            <div className="text-xs font-bold text-slate-800">Database-Driven Filters</div>
                            <p className="text-[11px] text-slate-500 leading-normal">
                                Paginated monitoring logs table with dynamic service dropdowns, status codes, date ranges, and debounced search.
                            </p>
                        </div>

                    </div>

                    {/* Tech Stack & Architecture Badges */}
                    <div className="bg-white border border-slate-200/80 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="flex items-center space-x-2 text-slate-700 font-bold">
                            <Layers className="w-4 h-4 text-emerald-600" />
                            <span>Technology Stack & Serverless Infrastructure</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            <span className="bg-slate-100 border border-slate-200 text-slate-700 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-semibold">React 19</span>
                            <span className="bg-slate-100 border border-slate-200 text-slate-700 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-semibold">Tailwind CSS</span>
                            <span className="bg-slate-100 border border-slate-200 text-slate-700 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-semibold">AWS SAM Serverless</span>
                            <span className="bg-slate-100 border border-slate-200 text-slate-700 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-semibold">AWS Lambda</span>
                            <span className="bg-slate-100 border border-slate-200 text-slate-700 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-semibold">PostgreSQL (Neon Cloud)</span>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
