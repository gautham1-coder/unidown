'use client';

import React from 'react';
import { DownloadCloud, Globe, History, Settings, Sun, Moon, TriangleAlert } from 'lucide-react';

interface NavbarProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onOpenHistory: () => void;
  onOpenSettings: () => void;
  onOpenSites: () => void;
  historyCount: number;
}

export function Navbar({
  darkMode,
  setDarkMode,
  onOpenHistory,
  onOpenSettings,
  onOpenSites,
  historyCount,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 glass-panel">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <DownloadCloud className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg sm:text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-300 to-indigo-200">
                UniDown
              </span>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Universal
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Any site &bull; Media &bull; Direct Streams
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Supported Sites */}
          <button
            onClick={onOpenSites}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition border border-transparent hover:border-slate-200 dark:hover:border-white/10"
            title="Supported Platforms & Sites"
          >
            <Globe className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
            <span className="hidden sm:inline">Supported Sites</span>
          </button>

          {/* History */}
          <button
            onClick={onOpenHistory}
            className="relative flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition border border-transparent hover:border-slate-200 dark:hover:border-white/10"
            title="Download History"
          >
            <History className="w-4 h-4 text-purple-500 dark:text-purple-400" />
            <span className="hidden sm:inline">History</span>
            {historyCount > 0 && (
              <span className="h-4 min-w-4 px-1 rounded-full bg-purple-500/20 text-purple-700 dark:text-purple-300 text-[10px] flex items-center justify-center font-bold border border-purple-500/30">
                {historyCount}
              </span>
            )}
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition border border-transparent hover:border-slate-200 dark:hover:border-white/10"
            title="Settings & Backend Config"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition border border-transparent hover:border-slate-200 dark:hover:border-white/10"
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>
        </div>
      </div>
    </header>
  );
}
