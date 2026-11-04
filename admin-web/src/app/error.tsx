'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('BazMart Ops Portal Client Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 text-slate-800">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-8 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-200 text-[#FF5A00] flex items-center justify-center mx-auto shadow-inner">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Client Component Exception
          </h2>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            A safe recovery boundary intercepted an unexpected client state. You can reset the active component or refresh the view.
          </p>
        </div>

        {error.message && (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-left">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Diagnostics
            </span>
            <p className="text-xs font-mono text-slate-700 break-words line-clamp-3">
              {error.message}
            </p>
          </div>
        )}

        <div className="flex items-center space-x-3 pt-2">
          <button
            onClick={() => reset()}
            className="flex-1 inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-[#FF5A00] hover:bg-[#E04F00] text-white text-xs font-bold rounded-xl shadow-lg shadow-orange-500/20 transition"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
          >
            <Home className="w-4 h-4" />
            <span>Dashboard</span>
          </a>
        </div>
      </div>
    </div>
  );
}

