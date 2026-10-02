'use client';

import React, { useState } from 'react';
import { X, Server, Video, Music, Save, CheckCircle, ExternalLink, RefreshCw } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: {
    customBackendUrl: string;
    preferredQuality: string;
    preferredAudioFormat: string;
  };
  onSave: (newSettings: {
    customBackendUrl: string;
    preferredQuality: string;
    preferredAudioFormat: string;
  }) => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  settings,
  onSave,
}: SettingsModalProps) {
  const [customBackendUrl, setCustomBackendUrl] = useState(settings.customBackendUrl);
  const [preferredQuality, setPreferredQuality] = useState(settings.preferredQuality);
  const [preferredAudioFormat, setPreferredAudioFormat] = useState(settings.preferredAudioFormat);
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({
      customBackendUrl: customBackendUrl.trim(),
      preferredQuality,
      preferredAudioFormat,
    });
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl glass-panel border border-white/10 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-slate-100">Downloader Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          {/* Custom Backend Instance URL */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Server className="w-4 h-4 text-indigo-400" />
                Backend Engine Instance
              </label>
              <a
                href="https://instances.cobalt.best"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-indigo-400 hover:underline flex items-center gap-1"
              >
                Find Public Instances <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <input
              type="url"
              value={customBackendUrl}
              onChange={(e) => setCustomBackendUrl(e.target.value)}
              placeholder="e.g. https://api.cobalt.tools or self-hosted URL"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
            <p className="text-[11px] text-slate-400">
              Leave blank to automatically use high-availability community fallbacks. If you run your own private Cobalt backend, paste the base URL here.
            </p>
          </div>

          {/* Preferred Video Resolution */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Video className="w-4 h-4 text-indigo-400" />
              Default Video Quality
            </label>
            <select
              value={preferredQuality}
              onChange={(e) => setPreferredQuality(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition"
            >
              <option value="max">Maximum Available (4K / 2K / 1080p)</option>
              <option value="1080">1080p Full HD</option>
              <option value="720">720p HD</option>
              <option value="480">480p Standard</option>
              <option value="360">360p Data Saver</option>
            </select>
          </div>

          {/* Preferred Audio Format */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Music className="w-4 h-4 text-amber-400" />
              Default Audio Format (for Audio Extraction)
            </label>
            <select
              value={preferredAudioFormat}
              onChange={(e) => setPreferredAudioFormat(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition"
            >
              <option value="mp3">MP3 (Universal compatibility)</option>
              <option value="opus">Opus (Highest quality compression)</option>
              <option value="wav">WAV (Uncompressed lossless)</option>
              <option value="ogg">OGG Vorbis</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-white/10 flex items-center justify-end gap-3 bg-white/[0.02]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 flex items-center gap-1.5 shadow-lg shadow-indigo-500/25 transition"
          >
            {isSaved ? (
              <>
                <CheckCircle className="w-4 h-4 text-emerald-300" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Preferences</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
