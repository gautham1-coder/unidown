'use client';

import React from 'react';
import {
  X,
  Video,
  Globe,
  Music,
  Tv,
  FileDown,
  Sparkles,
} from 'lucide-react';

interface SupportedSitesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const YoutubeIcon = () => (
  <svg className="w-4 h-4 fill-red-500" viewBox="0 0 24 24">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg className="w-4 h-4 fill-fuchsia-400" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const TwitterIcon = () => (
  <svg className="w-4 h-4 fill-sky-400" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const SUPPORTED_PLATFORMS = [
  {
    name: 'YouTube',
    icon: YoutubeIcon,
    color: 'text-red-400',
    description: 'Videos, Shorts, 4K/1080p, audio MP3',
  },
  {
    name: 'TikTok',
    icon: Video,
    color: 'text-pink-400',
    description: 'Watermark-free videos, slideshows, audio',
  },
  {
    name: 'Instagram',
    icon: InstagramIcon,
    color: 'text-fuchsia-400',
    description: 'Reels, Posts, Carousels, IGTV',
  },
  {
    name: 'Twitter / X',
    icon: TwitterIcon,
    color: 'text-sky-400',
    description: 'Videos, GIFs, high-res photo albums',
  },
  {
    name: 'Reddit',
    icon: Globe,
    color: 'text-orange-400',
    description: 'Videos with audio tracks, galleries, GIFs',
  },
  {
    name: 'SoundCloud',
    icon: Music,
    color: 'text-amber-400',
    description: 'High quality audio tracks & playlists',
  },
  {
    name: 'Pinterest',
    icon: Globe,
    color: 'text-rose-400',
    description: 'Video pins, high-resolution original images',
  },
  {
    name: 'Vimeo & Dailymotion',
    icon: Tv,
    color: 'text-blue-400',
    description: 'High definition streams, original resolutions',
  },
  {
    name: 'Twitch Clips',
    icon: Tv,
    color: 'text-purple-400',
    description: 'Direct clip streams and highlights',
  },
];

export function SupportedSitesModal({ isOpen, onClose }: SupportedSitesModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-3xl glass-panel border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
            <h3 className="font-bold text-slate-900 dark:text-slate-100">Supported Sources & Formats</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Universal Any-Site Scraper Highlight */}
          <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 space-y-2">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h4 className="font-bold text-sm text-indigo-900 dark:text-indigo-300">
                Universal Any-Site Web Inspector
              </h4>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              UniDown can inspect <strong>any public website URL</strong> (news websites, blogs, personal portfolios, wikis, media hosting). It automatically discovers embedded HTML5 <code>&lt;video&gt;</code>, <code>&lt;audio&gt;</code>, OpenGraph media, structured JSON-LD schemas, high-res images, and downloadable document links!
            </p>
          </div>

          {/* Social & Streaming Platforms */}
          <div>
            <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-400 uppercase tracking-wider mb-3">
              Popular Social & Video Platforms
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SUPPORTED_PLATFORMS.map((platform, idx) => {
                const Icon = platform.icon;
                return (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 flex items-start gap-3"
                  >
                    <div className="p-2 rounded-lg bg-white dark:bg-black/40 border border-slate-200 dark:border-white/5 shrink-0 shadow-sm">
                      <Icon className={`w-4 h-4 ${platform.color}`} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-200">
                        {platform.name}
                      </p>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400">
                        {platform.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Direct File Links */}
          <div>
            <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-400 uppercase tracking-wider mb-3">
              Direct File & Media Streams
            </h4>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 space-y-2">
              <div className="flex items-center gap-2">
                <FileDown className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-bold text-slate-900 dark:text-slate-200">
                  Direct Media & Archive Links
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Paste any direct link to download directly or via our built-in CORS streaming proxy:
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  '.mp4', '.mkv', '.webm', '.mov',
                  '.mp3', '.wav', '.ogg', '.m4a', '.flac',
                  '.pdf', '.zip', '.rar', '.7z', '.apk', '.dmg', '.iso',
                  '.jpg', '.png', '.webp', '.gif'
                ].map((ext) => (
                  <span
                    key={ext}
                    className="px-2 py-0.5 rounded bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 text-[10px] font-mono text-slate-800 dark:text-slate-300 shadow-sm"
                  >
                    {ext}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
