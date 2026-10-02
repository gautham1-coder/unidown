'use client';

import React, { useState, useEffect } from 'react';
import {
  Link as LinkIcon,
  Clipboard,
  X,
  ArrowRight,
  Loader2,
  Sparkles,
  Video,
  FileDown,
  Globe,
  Music,
  Tv,
} from 'lucide-react';
import { detectPlatform } from '@/lib/utils';

interface UrlInputProps {
  url: string;
  setUrl: (val: string) => void;
  onSubmit: (targetUrl?: string) => void;
  isLoading: boolean;
}

const SAMPLE_URLS = [
  {
    label: 'Direct WebM Video',
    url: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c0/Big_Buck_Bunny_4K.webm/Big_Buck_Bunny_4K.webm.360p.vp9.webm',
    type: 'direct',
  },
  {
    label: 'Reddit Video Post',
    url: 'https://www.reddit.com/r/NatureIsFuckingLit/comments/',
    type: 'social',
  },
  {
    label: 'Sample MP3 Audio',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    type: 'direct',
  },
  {
    label: 'Web Page Scraper',
    url: 'https://en.wikipedia.org/wiki/Aurora',
    type: 'web',
  },
];

export function UrlInput({ url, setUrl, onSubmit, isLoading }: UrlInputProps) {
  const [platformInfo, setPlatformInfo] = useState<{
    platform: string;
    category: 'social' | 'direct' | 'generic';
    iconName: string;
  } | null>(null);

  useEffect(() => {
    if (url.trim()) {
      setPlatformInfo(detectPlatform(url.trim()));
    } else {
      setPlatformInfo(null);
    }
  }, [url]);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text);
      }
    } catch {
      // Clipboard read may be blocked by user browser permissions
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading && url.trim()) {
      onSubmit();
    }
  };

  const renderPlatformIcon = (iconName: string) => {
    switch (iconName) {
      case 'Youtube':
        return (
          <svg className="w-3.5 h-3.5 fill-red-500" viewBox="0 0 24 24">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
        );
      case 'Video':
        return <Video className="w-3.5 h-3.5 text-pink-400" />;
      case 'Instagram':
        return (
          <svg className="w-3.5 h-3.5 fill-fuchsia-400" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
        );
      case 'Twitter':
        return (
          <svg className="w-3.5 h-3.5 fill-sky-400" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        );
      case 'Music':
        return <Music className="w-3.5 h-3.5 text-amber-400" />;
      case 'Tv':
        return <Tv className="w-3.5 h-3.5 text-purple-400" />;
      case 'FileDown':
        return <FileDown className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <Globe className="w-3.5 h-3.5 text-indigo-400" />;
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      {/* Main Search / Input Container */}
      <div className="relative group">
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-25 blur-lg group-hover:opacity-40 transition duration-500" />

        <div className="relative flex flex-col sm:flex-row items-center gap-2 p-2 rounded-2xl glass-panel border border-white/10 shadow-2xl">
          {/* Input field with icon */}
          <div className="flex items-center w-full px-3 gap-2">
            <LinkIcon className="w-5 h-5 text-indigo-400 shrink-0" />
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Paste any link: YouTube, TikTok, Reddit, Instagram, or any webpage..."
              disabled={isLoading}
              className="w-full py-3 bg-transparent text-sm sm:text-base text-slate-100 placeholder-slate-400 focus:outline-none"
            />

            {/* Clear Button */}
            {url && (
              <button
                onClick={() => setUrl('')}
                disabled={isLoading}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition shrink-0"
                title="Clear input"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Paste Button */}
            {!url && (
              <button
                type="button"
                onClick={handlePaste}
                disabled={isLoading}
                className="flex items-center gap-1 text-xs text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition shrink-0"
                title="Paste from clipboard"
              >
                <Clipboard className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Paste</span>
              </button>
            )}
          </div>

          {/* Submit Button */}
          <button
            onClick={() => onSubmit()}
            disabled={isLoading || !url.trim()}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-medium text-sm text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition duration-200 shrink-0"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>Extract Media</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Detection Badge */}
      {platformInfo && (
        <div className="flex items-center justify-between px-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Target Detected:</span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium">
              {renderPlatformIcon(platformInfo.iconName)}
              {platformInfo.platform}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[10px]">Enter ↵</kbd> to inspect
          </span>
        </div>
      )}

      {/* Quick Test Samples */}
      <div className="pt-2">
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Quick test with samples:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_URLS.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setUrl(sample.url);
                onSubmit(sample.url);
              }}
              disabled={isLoading}
              className="text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-indigo-500/20 text-slate-300 hover:text-indigo-200 border border-white/10 hover:border-indigo-500/30 transition text-left"
            >
              {sample.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
