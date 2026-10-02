'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { UrlInput } from '@/components/UrlInput';
import { MediaResult } from '@/components/MediaResult';
import { DownloadHistory } from '@/components/DownloadHistory';
import { SettingsModal } from '@/components/SettingsModal';
import { SupportedSitesModal } from '@/components/SupportedSitesModal';
import { VercelDeployBanner } from '@/components/VercelDeployBanner';
import {
  DownloadCloud,
  ShieldCheck,
  Zap,
  Globe,
  Layers,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import {
  DownloadHistoryItem,
  ExtractionRequest,
  ExtractionResponse,
  MediaFormat,
  MediaItem,
} from '@/lib/types';

export default function Home() {
  const [darkMode, setDarkMode] = useState(true);
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ExtractionResponse | null>(null);

  // Modals
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSitesOpen, setIsSitesOpen] = useState(false);

  // Stored state
  const [history, setHistory] = useState<DownloadHistoryItem[]>([]);
  const [settings, setSettings] = useState({
    customBackendUrl: '',
    preferredQuality: '1080',
    preferredAudioFormat: 'mp3',
  });

  // Load history and settings from localStorage
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('unidown_history');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
      const savedSettings = localStorage.getItem('unidown_settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
      const savedTheme = localStorage.getItem('unidown_theme');
      if (savedTheme) {
        setDarkMode(savedTheme === 'dark');
      }
    } catch {
      // Ignore localStorage read errors
    }
  }, []);

  // Update theme class on HTML element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('unidown_theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const handleSaveSettings = (newSettings: typeof settings) => {
    setSettings(newSettings);
    localStorage.setItem('unidown_settings', JSON.stringify(newSettings));
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('unidown_history');
  };

  const handleDownloadStarted = (item: MediaItem, format: MediaFormat) => {
    const historyItem: DownloadHistoryItem = {
      id: `${item.id}-${Date.now()}`,
      title: item.title,
      url: item.url,
      downloadUrl: format.url,
      type: item.type,
      thumbnail: item.thumbnail,
      timestamp: Date.now(),
      sourceDomain: item.sourceDomain,
      formatLabel: `${format.label} (.${format.ext})`,
    };

    setHistory((prev) => {
      const updated = [historyItem, ...prev.filter((h) => h.url !== item.url)].slice(0, 50);
      localStorage.setItem('unidown_history', JSON.stringify(updated));
      return updated;
    });
  };

  const handleExtract = async (overrideUrl?: string) => {
    const targetUrl = (overrideUrl || url).trim();
    if (!targetUrl) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const payload: ExtractionRequest = {
        url: targetUrl,
        videoQuality: settings.preferredQuality as any,
        audioFormat: settings.preferredAudioFormat as any,
        customBackendUrl: settings.customBackendUrl || undefined,
      };

      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data: ExtractionResponse = await res.json();

      if (!res.ok || !data.success) {
        setError(
          data.error ||
            'Could not extract downloadable media from this link. Please check the URL or try our CORS proxy mode.'
        );
      } else {
        setResult(data);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Connection failed';
      setError(`Failed to connect to extraction service: ${msg}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Top Navigation */}
      <Navbar
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenSites={() => setIsSitesOpen(true)}
        historyCount={history.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-14 space-y-10">
        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold">
            <Zap className="w-3.5 h-3.5" />
            <span>Universal Media & Stream Extractor</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-100">
            Download from{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              Any Website
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Extract videos, music, images, and files from popular social platforms, streaming portals, or inspect any web page. Hosted 100% serverless on Vercel.
          </p>
        </div>

        {/* URL Input Form */}
        <UrlInput
          url={url}
          setUrl={setUrl}
          onSubmit={handleExtract}
          isLoading={isLoading}
        />

        {/* Error Alert */}
        {error && (
          <div className="w-full max-w-3xl mx-auto p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-start gap-3 animate-in fade-in duration-200">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" />
            <div className="space-y-1 text-xs sm:text-sm">
              <p className="font-semibold text-rose-200">Extraction Notice</p>
              <p>{error}</p>
              <p className="text-[11px] text-rose-300/80 pt-1">
                Tip: If the platform blocks datacenter IPs, check your backend instance in Settings or verify that the link is publicly accessible.
              </p>
            </div>
          </div>
        )}

        {/* Extraction Result Section */}
        {result && (
          <MediaResult
            item={result.item}
            picker={result.picker}
            engineUsed={result.engineUsed}
            onDownloadStarted={handleDownloadStarted}
          />
        )}

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-10">
          <div className="p-5 rounded-2xl glass-panel border border-white/5 space-y-2">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 w-fit text-indigo-400">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-200">Universal Scraper</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Scrapes any webpage for embedded HTML5 videos, audio tracks, openGraph media, and high-res images automatically.
            </p>
          </div>

          <div className="p-5 rounded-2xl glass-panel border border-white/5 space-y-2">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 w-fit text-purple-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-200">CORS-Free Proxy</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Built-in streaming proxy ensures direct downloads without cross-origin blocks, with proper filenames and resumable ranges.
            </p>
          </div>

          <div className="p-5 rounded-2xl glass-panel border border-white/5 space-y-2">
            <div className="p-2.5 rounded-xl bg-pink-500/10 border border-pink-500/20 w-fit text-pink-400">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-200">100% Vercel Ready</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Zero heavy ffmpeg binaries or server dependencies required. Runs effortlessly on Vercel Hobby & Pro tiers.
            </p>
          </div>
        </div>

        {/* Vercel Deployment Guide Banner */}
        <VercelDeployBanner />
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/10 mt-16 py-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>UniDown &copy; {new Date().getFullYear()} &bull; Universal Media & File Downloader</p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSitesOpen(true)}
              className="hover:text-slate-300 transition"
            >
              Supported Sites
            </button>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="hover:text-slate-300 transition"
            >
              Configuration
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <DownloadHistory
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onClearHistory={handleClearHistory}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />

      <SupportedSitesModal
        isOpen={isSitesOpen}
        onClose={() => setIsSitesOpen(false)}
      />
    </div>
  );
}
