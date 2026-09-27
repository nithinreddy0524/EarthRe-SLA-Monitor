import React, { useState } from 'react';
import {
    History,
    Copy,
    CheckCircle2,
    RefreshCw,
    ChevronDown,
    ChevronUp,
    FileSpreadsheet
} from 'lucide-react';

export default function BatchHistory({ batches = [], loading = false }) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [copiedBatchId, setCopiedBatchId] = useState(null);

    const copyBatchId = (batchId) => {
        navigator.clipboard.writeText(batchId);
        setCopiedBatchId(batchId);
        setTimeout(() => setCopiedBatchId(null), 2000);
    };

    const getBatchStatusBadge = (status) => {
        if (!status) return null;
        if (status.includes('COMPLETED')) {
            return (
                <span className="inline-flex items-center space-x-1 text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-200 whitespace-nowrap">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>Completed</span>
                </span>
            );
        }
        return (
            <span className="inline-flex items-center space-x-1 text-[10px] font-bold bg-slate-100 text-slate-800 px-2.5 py-1 rounded-full border border-slate-200 whitespace-nowrap">
                <span>{status}</span>
            </span>
        );
    };

    return (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
            {/* Header Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center shrink-0">
                        <History className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="text-sm sm:text-base font-bold text-slate-900">Ingestion Batch History</h3>
                        <p className="text-[11px] sm:text-xs text-slate-500">Audit log of CSV telemetry datasets ingested into database</p>
                    </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end space-x-2">
                    {batches.length > 0 && (
                        <span className="text-[11px] sm:text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200 whitespace-nowrap">
                            {batches.length} Ingested Batch{batches.length === 1 ? '' : 'es'}
                        </span>
                    )}
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex items-center space-x-1 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 transition-all cursor-pointer whitespace-nowrap shrink-0"
                    >
                        <span>{isExpanded ? 'Collapse' : 'Expand'}</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {/* Collapsible Content */}
            {isExpanded && (
                <div>
                    {loading ? (
                        <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-6 sm:p-8 text-center space-y-3">
                            <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin mx-auto" />
                            <div className="text-xs font-semibold text-slate-600">Loading batch audit logs...</div>
                        </div>
                    ) : batches.length === 0 ? (
                        <div className="bg-slate-50/70 border border-dashed border-slate-200 rounded-xl p-6 sm:p-8 text-center space-y-2">
                            <FileSpreadsheet className="w-8 h-8 text-slate-300 mx-auto" />
                            <div className="text-xs font-bold text-slate-700">No Ingestion Batches Yet</div>
                            <p className="text-xs text-slate-500 max-w-sm mx-auto">
                                Upload a CSV dataset above to create your first ingestion batch record.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-xl border border-slate-200/80 max-w-full">
                            <table className="w-full text-left border-collapse text-xs min-w-[640px]">
                                <thead>
                                    <tr className="bg-slate-100/80 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                                        <th className="py-3 px-4 text-left">Batch ID</th>
                                        <th className="py-3 px-4 text-left">Uploaded At (UTC)</th>
                                        <th className="py-3 px-4 text-left">Total Rows</th>
                                        <th className="py-3 px-4 text-left">Valid Rows</th>
                                        <th className="py-3 px-4 text-left">Invalid Flagged</th>
                                        <th className="py-3 px-4 text-left">Duplicates Skipped</th>
                                        <th className="py-3 px-4 text-left">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {batches.map((batch) => (
                                        <tr key={batch.batchId} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="py-3 px-4 text-left font-mono text-[11px] text-slate-700">
                                                <div className="flex items-center space-x-1.5">
                                                    <span>{batch.batchId?.slice(0, 16)}...</span>
                                                    <button
                                                        onClick={() => copyBatchId(batch.batchId)}
                                                        className="text-slate-400 hover:text-emerald-600 transition-colors p-1 cursor-pointer"
                                                        title="Copy full Batch ID"
                                                    >
                                                        <Copy className="w-3 h-3" />
                                                    </button>
                                                    {copiedBatchId === batch.batchId && (
                                                        <span className="text-[10px] text-emerald-600 font-bold">Copied!</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-left font-mono text-slate-500 text-[11px] whitespace-nowrap">
                                                {batch.uploadedAt ? new Date(batch.uploadedAt).toISOString().replace('T', ' ').slice(0, 19) : '--'}
                                            </td>
                                            <td className="py-3 px-4 text-left font-bold text-slate-800">
                                                {batch.totalRows?.toLocaleString()}
                                            </td>
                                            <td className="py-3 px-4 text-left font-bold text-emerald-700 bg-emerald-50/50">
                                                {batch.validRows?.toLocaleString()}
                                            </td>
                                            <td className="py-3 px-4 text-left font-bold text-amber-700 bg-amber-50/50">
                                                {batch.invalidRows?.toLocaleString()}
                                            </td>
                                            <td className="py-3 px-4 text-left font-bold text-indigo-700 bg-indigo-50/50">
                                                {batch.duplicateRows?.toLocaleString()}
                                            </td>
                                            <td className="py-3 px-4 text-left">
                                                {getBatchStatusBadge(batch.processingStatus)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
