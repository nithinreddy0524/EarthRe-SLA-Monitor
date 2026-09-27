import React, { useState, useRef } from 'react';
import {
    UploadCloud,
    FileText,
    CheckCircle2,
    AlertCircle,
    RefreshCw,
    Copy,
    Sparkles
} from 'lucide-react';
import { uploadCsv } from '../api';

export default function CsvUploader({ onUploadSuccess }) {
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);
    const [copiedBatchId, setCopiedBatchId] = useState(false);
    const fileInputRef = useRef(null);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            processFile(files[0]);
        }
    };

    const handleFileSelect = (e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            processFile(files[0]);
        }
    };

    const processFile = (file) => {
        if (!file.name.endsWith('.csv')) {
            setErrorMessage('Please select a valid CSV file (.csv format)');
            return;
        }

        setErrorMessage(null);
        setUploadResult(null);
        setUploading(true);

        const reader = new FileReader();
        reader.onload = async (event) => {
            const content = event.target.result;
            try {
                const result = await uploadCsv(content, file.name);
                setUploadResult(result);
                if (onUploadSuccess) onUploadSuccess(result);
            } catch (err) {
                setErrorMessage(err.message || 'Failed to upload and parse CSV file');
            } finally {
                setUploading(false);
            }
        };
        reader.onerror = () => {
            setErrorMessage('Error reading file from disk');
            setUploading(false);
        };
        reader.readAsText(file);
    };

    const copyBatchId = (batchId) => {
        navigator.clipboard.writeText(batchId);
        setCopiedBatchId(true);
        setTimeout(() => setCopiedBatchId(false), 2000);
    };

    return (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow space-y-5">
            {/* Header */}
            <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
                    <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-base font-bold text-slate-900">Upload CSV Dataset</h3>
                    <p className="text-xs text-slate-500">Upload your SLA monitoring CSV file</p>
                </div>
            </div>

            {/* Drag & Drop Dropzone */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all cursor-pointer ${isDragging
                    ? 'border-emerald-500 bg-emerald-50 scale-[1.01]'
                    : 'border-slate-200 hover:border-emerald-400 bg-slate-50/50 hover:bg-white'
                    }`}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept=".csv"
                    className="hidden"
                />

                {uploading ? (
                    <div className="space-y-2.5 py-2">
                        <RefreshCw className="w-7 h-7 text-emerald-600 animate-spin mx-auto" />
                        <div className="text-sm font-semibold text-slate-800">
                            Cleaning & Ingesting Data...
                        </div>
                        <div className="text-xs text-slate-500">
                            Executing data quality & deduplication rules
                        </div>
                    </div>
                ) : (
                    <div className="space-y-2.5">
                        <div className="w-10 h-10 rounded-full bg-emerald-100/80 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600 shadow-sm">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-sm font-semibold text-slate-800">
                                Click to select or drag & drop CSV file
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">
                                Supports all SLA monitoring CSV files
                            </div>
                        </div>
                        <button className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer">
                            Select CSV File
                        </button>
                    </div>
                )}
            </div>

            {/* Error Feedback Alert */}
            {errorMessage && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>{errorMessage}</span>
                </div>
            )}

            {/* Ingestion Processing Feedback Card (Clean Single-Line Header) */}
            {uploadResult && (
                <div className="bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/40 border border-emerald-200/90 rounded-xl p-4 space-y-3.5 shadow-2xs">

                    {/* Top Executive Header & Success Badge (Mobile Responsive) */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200/60 pb-2.5">
                        <div className="flex items-center space-x-2 text-emerald-950 font-bold text-xs">
                            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>Batch Ingestion Completed</span>
                        </div>
                        <span className="inline-flex items-center space-x-1.5 text-[10px] font-bold bg-emerald-700 text-white px-2.5 py-1 rounded-full shadow-2xs whitespace-nowrap self-start sm:self-auto shrink-0">
                            <CheckCircle2 className="w-3 h-3 text-white" />
                            <span>Successfully Processed</span>
                        </span>
                    </div>

                    {/* Batch ID Copy Bar */}
                    <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50/90 px-3 py-2 rounded-lg border border-slate-200/80">
                        <span className="font-mono text-[11px] text-slate-700 truncate pr-2">Batch ID: {uploadResult.batchId?.slice(0, 18)}...</span>
                        <button
                            onClick={() => copyBatchId(uploadResult.batchId)}
                            className="flex items-center space-x-1 text-emerald-700 hover:text-emerald-900 font-medium shrink-0 transition-colors cursor-pointer"
                        >
                            <Copy className="w-3 h-3" />
                            <span className="text-[10px]">{copiedBatchId ? 'Copied' : 'Copy'}</span>
                        </button>
                    </div>

                    {/* Executive 4-Card Data Audit Grid */}
                    <div className="grid grid-cols-2 gap-2 text-center pt-0.5">
                        <div className="bg-white border border-slate-200 p-2.5 rounded-lg shadow-2xs">
                            <div className="text-slate-400 text-[9px] uppercase font-bold tracking-wider">Total Rows</div>
                            <div className="text-slate-900 font-extrabold text-sm mt-0.5">{uploadResult.totalRows.toLocaleString()}</div>
                        </div>
                        <div className="bg-emerald-50/80 border border-emerald-200 p-2.5 rounded-lg shadow-2xs">
                            <div className="text-emerald-700 text-[9px] uppercase font-bold tracking-wider">Valid Rows</div>
                            <div className="text-emerald-900 font-extrabold text-sm mt-0.5">{(uploadResult.newlyInsertedRows ?? uploadResult.validRows).toLocaleString()}</div>
                        </div>
                        <div className="bg-amber-50/80 border border-amber-200 p-2.5 rounded-lg shadow-2xs">
                            <div className="text-amber-700 text-[9px] uppercase font-bold tracking-wider">Invalid Flagged</div>
                            <div className="text-amber-900 font-extrabold text-base mt-0.5">{uploadResult.invalidRows.toLocaleString()}</div>
                        </div>
                        <div className="bg-indigo-50/80 border border-indigo-200 p-2.5 rounded-lg shadow-2xs">
                            <div className="text-indigo-700 text-[9px] uppercase font-bold tracking-wider">Duplicates Skipped</div>
                            <div className="text-indigo-900 font-extrabold text-base mt-0.5">{uploadResult.duplicateRows.toLocaleString()}</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
