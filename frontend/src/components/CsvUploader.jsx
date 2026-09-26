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
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-sm">
                        <UploadCloud className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-slate-900">CSV Ingestion Engine</h3>
                        <p className="text-xs text-slate-500">Upload EarthRe monitoring CSV datasets</p>
                    </div>
                </div>
            </div>

            {/* Drag & Drop Dropzone */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${isDragging
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
                    <div className="space-y-3 py-3">
                        <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
                        <div className="text-sm font-semibold text-slate-800">
                            Cleaning & Ingesting Dataset...
                        </div>
                        <div className="text-xs text-slate-500">
                            Running 7 data quality rules in PostgreSQL
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className="w-12 h-12 rounded-full bg-emerald-100/80 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600 shadow-sm">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-sm font-semibold text-slate-800">
                                Click to browse or drag & drop CSV file
                            </div>
                            <div className="text-xs text-slate-500 mt-1">
                                Supports all `monitoring_checks_*.csv` datasets
                            </div>
                        </div>
                        <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium text-xs shadow-md shadow-emerald-600/20 transition-all">
                            Select Local CSV File
                        </button>
                    </div>
                )}
            </div>

            {/* Error Feedback Alert */}
            {errorMessage && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-xl text-xs flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>{errorMessage}</span>
                </div>
            )}

            {/* Ingestion Processing Metrics Feedback */}
            {uploadResult && (
                <div className="bg-gradient-to-br from-emerald-50/60 to-teal-50/30 border border-emerald-200 rounded-xl p-4 space-y-3.5 shadow-sm">
                    <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2.5">
                        <div className="flex items-center space-x-2 text-emerald-800 font-semibold text-xs">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Batch Ingestion Successful</span>
                        </div>
                        <span className="text-[10px] font-mono bg-emerald-600 text-white border border-emerald-700 px-2 py-0.5 rounded-full font-bold uppercase shadow-xs">
                            {uploadResult.processingStatus}
                        </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200/80 shadow-2xs">
                        <span className="font-mono text-[11px] text-slate-700">Batch ID: {uploadResult.batchId?.slice(0, 18)}...</span>
                        <button
                            onClick={() => copyBatchId(uploadResult.batchId)}
                            className="flex items-center space-x-1 text-emerald-700 hover:text-emerald-900 font-medium transition-colors"
                        >
                            <Copy className="w-3.5 h-3.5" />
                            <span className="text-[10px]">{copiedBatchId ? 'Copied!' : 'Copy'}</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-center">
                        <div className="bg-white border border-slate-200 p-2.5 rounded-xl shadow-2xs">
                            <div className="text-slate-400 text-[10px] uppercase font-semibold">Total Rows</div>
                            <div className="text-slate-900 font-bold text-sm mt-0.5">{uploadResult.totalRows}</div>
                        </div>
                        <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl shadow-2xs">
                            <div className="text-emerald-700 text-[10px] uppercase font-semibold">Valid Rows</div>
                            <div className="text-emerald-800 font-bold text-sm mt-0.5">{uploadResult.validRows}</div>
                        </div>
                        <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl shadow-2xs">
                            <div className="text-amber-700 text-[10px] uppercase font-semibold">Invalid Flagged</div>
                            <div className="text-amber-800 font-bold text-sm mt-0.5">{uploadResult.invalidRows}</div>
                        </div>
                        <div className="bg-indigo-50 border border-indigo-200 p-2.5 rounded-xl shadow-2xs">
                            <div className="text-indigo-700 text-[10px] uppercase font-semibold">Duplicates Filtered</div>
                            <div className="text-indigo-800 font-bold text-sm mt-0.5">{uploadResult.duplicateRows}</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
