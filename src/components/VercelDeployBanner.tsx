'use client';

import React, { useState } from 'react';
import { ExternalLink, Terminal, Check, Copy, ChevronDown, ChevronUp } from 'lucide-react';

export function VercelDeployBanner() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);

  const handleCopyCmd = () => {
    navigator.clipboard.writeText('npx vercel');
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-12 p-5 rounded-3xl glass-panel border border-white/10 shadow-lg text-slate-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-black border border-white/20 flex items-center justify-center shrink-0">
            {/* Vercel Triangle Logo */}
            <svg
              className="w-5 h-5 text-white"
              viewBox="0 0 1155 1000"
              fill="currentColor"
            >
              <path d="m577.3 0 577.4 1000H0z" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              Ready to Host on Your Vercel
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                100% Serverless
              </span>
            </h4>
            <p className="text-xs text-slate-400">
              Zero configuration required &bull; Free Hobby tier compatible &bull; Next.js 15
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition flex items-center gap-1.5"
          >
            <span>{isExpanded ? 'Hide Guide' : 'Deployment Guide'}</span>
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          <a
            href="https://vercel.com/new"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold px-4 py-2 rounded-xl bg-white text-black hover:bg-slate-200 transition flex items-center gap-1.5 shadow"
          >
            <span>Deploy to Vercel</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-white/10 space-y-4 animate-in fade-in duration-200 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Method 1: Git Push */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
              <span className="font-bold text-slate-200">
                Method 1: Connect GitHub / GitLab (Recommended)
              </span>
              <ol className="list-decimal list-inside space-y-1.5 text-slate-400">
                <li>Push this repository to your GitHub: <code>git push origin main</code></li>
                <li>Go to <a href="https://vercel.com/new" target="_blank" className="text-indigo-400 underline">vercel.com/new</a></li>
                <li>Import your <code>unidown</code> repository</li>
                <li>Click <strong>Deploy</strong> (Framework preset: Next.js is auto-detected!)</li>
              </ol>
            </div>

            {/* Method 2: Vercel CLI */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
              <span className="font-bold text-slate-200">
                Method 2: One-Command CLI Deploy
              </span>
              <p className="text-slate-400">
                In your terminal, navigate to this project folder and run:
              </p>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-white/10 font-mono text-[11px] text-indigo-300">
                <span className="flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-slate-500" />
                  npx vercel
                </span>
                <button
                  onClick={handleCopyCmd}
                  className="p-1 hover:text-white transition"
                  title="Copy command"
                >
                  {copiedCmd ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                Follow the 3 prompts and your app will be live with an <code>.vercel.app</code> SSL domain in under 60 seconds!
              </p>
            </div>
          </div>

          {/* Optional Environment Variables */}
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-[11px] text-slate-400">
            <span className="font-semibold text-slate-300">Optional Environment Variables (Vercel Project Settings):</span>
            <ul className="list-disc list-inside mt-1 space-y-0.5">
              <li><code>COBALT_API_URL</code>: Custom self-hosted Cobalt engine URL (leave empty to use high-availability community instances).</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
