'use client';

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-[#F8FAFC] min-h-screen flex items-center justify-center p-6 text-slate-800 font-sans">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-200 text-[#FF5A00] flex items-center justify-center mx-auto shadow-inner">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Application Recovery
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              An unexpected root layout error occurred. Click below to reload the session safely.
            </p>
          </div>

          <button
            onClick={() => reset()}
            className="w-full inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-[#FF5A00] hover:bg-[#E04F00] text-white text-xs font-bold rounded-xl shadow-lg shadow-orange-500/20 transition"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reload Application</span>
          </button>
        </div>
      </body>
    </html>
  );
}

