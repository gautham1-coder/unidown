'use client';

import React, { useState } from 'react';
import {
  Download,
  ExternalLink,
  Copy,
  Check,
  Film,
  Music,
  Image as ImageIcon,
  FileText,
  Play,
  Layers,
  Sparkles,
  ShieldCheck,
  Maximize2,
} from 'lucide-react';
import { MediaFormat, MediaItem, MediaType } from '@/lib/types';

interface MediaResultProps {
  item?: MediaItem;
  picker?: MediaItem[];
  engineUsed?: string;
  onDownloadStarted?: (item: MediaItem, format: MediaFormat) => void;
}

export function MediaResult({
  item,
  picker,
  engineUsed,
  onDownloadStarted,
}: MediaResultProps) {
  const [selectedFormatId, setSelectedFormatId] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [useProxy, setUseProxy] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'all' | 'video' | 'audio' | 'image' | 'file'>('all');

  if (!item && (!picker || picker.length === 0)) {
    return null;
  }

  // Handle single item
  const activeItem = item;
  const formats = activeItem?.formats || [];
  const currentFormat =
    formats.find((f) => f.id === selectedFormatId) || formats[0];

  const handleCopyLink = (urlToCopy: string, id: string) => {
    navigator.clipboard.writeText(urlToCopy);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getDownloadUrl = (targetUrl: string, filename: string) => {
    if (useProxy) {
      return `/api/download?url=${encodeURIComponent(targetUrl)}&filename=${encodeURIComponent(filename)}`;
    }
    return targetUrl;
  };

  const triggerDownload = (targetItem: MediaItem, format: MediaFormat) => {
    const filename = `${targetItem.title}.${format.ext}`;
    const url = getDownloadUrl(format.url, filename);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    if (onDownloadStarted) {
      onDownloadStarted(targetItem, format);
    }
  };

  const renderTypeIcon = (type: MediaType) => {
    switch (type) {
      case 'video':
        return <Film className="w-4 h-4 text-indigo-400" />;
      case 'audio':
        return <Music className="w-4 h-4 text-amber-400" />;
      case 'image':
        return <ImageIcon className="w-4 h-4 text-pink-400" />;
      default:
        return <FileText className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 space-y-6">
      {/* Engine & Success Status Badge */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-2 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Extraction Complete</span>
          {engineUsed && (
            <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300 font-mono text-[11px]">
              {engineUsed}
            </span>
          )}
        </div>

        {/* Proxy vs Direct switch */}
        <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300 hover:text-white">
          <input
            type="checkbox"
            checked={useProxy}
            onChange={(e) => setUseProxy(e.target.checked)}
            className="rounded border-white/20 text-indigo-600 focus:ring-indigo-500 bg-black/40"
          />
          <span className="text-[11px]">Bypass CORS (Safe Stream)</span>
        </label>
      </div>

      {/* Case 1: Single Media Item Result */}
      {activeItem && (
        <div className="p-6 rounded-3xl glass-panel border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Thumbnail / Media Preview */}
            <div className="md:col-span-5 relative rounded-2xl overflow-hidden bg-slate-900 border border-white/10 aspect-video flex items-center justify-center group">
              {activeItem.thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={activeItem.thumbnail}
                  alt={activeItem.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-slate-500">
                  {renderTypeIcon(activeItem.type)}
                  <span className="text-xs uppercase font-medium tracking-wider">
                    {activeItem.type}
                  </span>
                </div>
              )}

              {/* Type Badge */}
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-[11px] font-medium flex items-center gap-1.5 text-white">
                {renderTypeIcon(activeItem.type)}
                <span className="capitalize">{activeItem.type}</span>
              </div>

              {/* Duration Badge */}
              {activeItem.durationFormatted && (
                <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[11px] font-mono text-white">
                  {activeItem.durationFormatted}
                </div>
              )}
            </div>

            {/* Media Information & Download Controls */}
            <div className="md:col-span-7 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {activeItem.sourceDomain}
                  </span>
                  {activeItem.author && (
                    <span className="text-xs text-slate-400">
                      by {activeItem.author.name}
                    </span>
                  )}
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 line-clamp-2">
                  {activeItem.title}
                </h2>
                {activeItem.description && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                    {activeItem.description}
                  </p>
                )}
              </div>

              {/* Format / Resolution Selector */}
              {formats.length > 1 && (
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-700 dark:text-slate-400 font-medium">
                    Available Formats & Resolutions:
                  </label>
                  <select
                    value={currentFormat?.id}
                    onChange={(e) => setSelectedFormatId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-white/10 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500 transition"
                  >
                    {formats.map((fmt) => (
                      <option key={fmt.id} value={fmt.id}>
                        {fmt.label} {fmt.filesizeFormatted ? `(${fmt.filesizeFormatted})` : ''} - .{fmt.ext.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Primary Download Button & Actions */}
              {currentFormat && (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                  <button
                    onClick={() => triggerDownload(activeItem, currentFormat)}
                    className="flex-1 py-3 px-5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download {currentFormat.quality || 'Now'} (.{currentFormat.ext})</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyLink(currentFormat.url, currentFormat.id)}
                      className="p-3 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition flex items-center justify-center"
                      title="Copy stream link"
                    >
                      {copiedId === currentFormat.id ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>

                    <a
                      href={currentFormat.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition flex items-center justify-center"
                      title="Open source in new tab"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Case 2: Multi-Item Picker / Scraped Page Gallery */}
      {picker && picker.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
              <h3 className="font-semibold text-slate-900 dark:text-slate-200">
                Found {picker.length} Media Items on Page
              </h3>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs">
              {(['all', 'video', 'image', 'audio', 'file'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1 rounded-lg capitalize transition ${
                    activeTab === tab
                      ? 'bg-indigo-600 text-white font-medium shadow'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {picker
              .filter((p) => (activeTab === 'all' ? true : p.type === activeTab))
              .map((p, idx) => {
                const pFormat = p.formats[0];
                return (
                  <div
                    key={p.id || idx}
                    className="p-4 rounded-2xl glass-panel border border-slate-200 dark:border-white/10 hover:border-indigo-400 dark:hover:border-indigo-500/40 transition flex flex-col justify-between space-y-3"
                  >
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/5 flex items-center justify-center">
                      {p.thumbnail ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.thumbnail}
                          alt={p.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-1.5 text-slate-500">
                          {renderTypeIcon(p.type)}
                          <span className="text-[10px] uppercase">{p.type}</span>
                        </div>
                      )}

                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-[10px] text-white flex items-center gap-1">
                        {renderTypeIcon(p.type)}
                        <span className="capitalize">{p.type}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-slate-900 dark:text-slate-200 truncate">
                        {p.title}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {pFormat?.label || p.type}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => triggerDownload(p, pFormat)}
                        className="flex-1 py-2 px-3 rounded-lg text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 transition flex items-center justify-center gap-1.5 shadow"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </button>

                      <button
                        onClick={() => handleCopyLink(pFormat.url, p.id)}
                        className="p-2 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition"
                        title="Copy link"
                      >
                        {copiedId === p.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
