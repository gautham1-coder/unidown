'use client';

import React from 'react';
import { X, Trash2, Download, ExternalLink, Clock, FileText } from 'lucide-react';
import { DownloadHistoryItem } from '@/lib/types';

interface DownloadHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  history: DownloadHistoryItem[];
  onClearHistory: () => void;
}

export function DownloadHistory({
  isOpen,
  onClose,
  history,
  onClearHistory,
}: DownloadHistoryProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl glass-panel border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-500 dark:text-purple-400" />
            <h3 className="font-bold text-slate-900 dark:text-slate-100">Download History</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-400">
              {history.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                onClick={onClearHistory}
                className="p-1.5 text-xs text-rose-500 dark:text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition flex items-center gap-1"
                title="Clear all history"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List Content */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          {history.length === 0 ? (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400 space-y-2">
              <Clock className="w-8 h-8 mx-auto text-slate-400 dark:text-slate-600" />
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">No downloads yet</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Downloaded media links will appear here for quick access.
              </p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 transition flex items-center justify-between gap-3 shadow-sm"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  {item.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-12 h-12 rounded-xl object-cover shrink-0 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/5"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-200 dark:border-white/5">
                      <FileText className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-900 dark:text-slate-200 truncate">
                      {item.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-600 dark:text-slate-400">
                      <span className="text-indigo-600 dark:text-indigo-400 font-medium">{item.sourceDomain}</span>
                      <span>&bull;</span>
                      <span>{item.formatLabel}</span>
                      <span>&bull;</span>
                      <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <a
                    href={item.downloadUrl}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-sm"
                    title="Download again"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
                    title="Open original page"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
