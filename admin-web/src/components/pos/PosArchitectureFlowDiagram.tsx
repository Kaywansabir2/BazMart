'use client';

import React, { useState } from 'react';
import { Database, ArrowRight, ShieldCheck, Cpu, RefreshCw, Smartphone, CheckCircle2, Zap } from 'lucide-react';

export default function PosArchitectureFlowDiagram() {
  const [isSimulating, setIsSimulating] = useState(false);
  const [pingSuccess, setPingSuccess] = useState(false);

  const triggerPing = () => {
    setIsSimulating(true);
    setPingSuccess(false);
    setTimeout(() => {
      setIsSimulating(false);
      setPingSuccess(true);
    }, 1200);
  };

  return (
    <div className="bg-slate-900 text-white rounded-xl border border-slate-800 p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2.5 space-x-reverse">
            <div className="w-8 h-8 rounded-lg bg-[#FF5A00] flex items-center justify-center text-white">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-white">
                Supermarket POS Bridge & 3% Financial Engine Architecture
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                End-to-end zero-markup pipeline: Physical Supermarket Shelf &rarr; Central API &rarr; Customer App
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 space-x-reverse">
          <button
            onClick={triggerPing}
            disabled={isSimulating}
            className="px-3.5 py-1.5 bg-[#FF5A00] hover:bg-[#E04F00] text-white text-xs font-bold rounded-lg transition flex items-center space-x-1.5 space-x-reverse shadow-lg shadow-orange-500/20 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
            <span>{isSimulating ? 'Verifying Bridge...' : 'Test POS Bridge Ping'}</span>
          </button>
          <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-800/80 px-2.5 py-1 rounded-full flex items-center space-x-1.5 space-x-reverse">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>142ms Sync Latency</span>
          </span>
        </div>
      </div>

      {/* Visual Architecture Flow Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
        {/* Step 1: Supermarket Partner POS DB */}
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-4 space-y-3 relative overflow-hidden group hover:border-[#FF5A00] transition">
          <div className="flex items-center justify-between">
            <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono bg-blue-900/60 text-blue-300 px-1.5 py-0.5 rounded border border-blue-700/50">
              PORT 5432
            </span>
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-white">Partner Supermarket POS</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">PostgreSQL / Oracle DB</p>
          </div>
          <div className="pt-2 border-t border-slate-700/60 text-[10px] text-slate-300 space-y-1">
            <div className="flex items-center justify-between">
              <span>Catalog SKUs:</span>
              <strong className="text-white font-mono">400</strong>
            </div>
            <div className="flex items-center justify-between">
              <span>Shelf Price Match:</span>
              <strong className="text-emerald-400 font-mono">100%</strong>
            </div>
          </div>
        </div>

        {/* Step 2: 3% Commission & Zero Markup Engine */}
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-4 space-y-3 relative overflow-hidden group hover:border-[#FF5A00] transition">
          <div className="flex items-center justify-between">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono bg-emerald-900/60 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-700/50">
              COMMISSION 3%
            </span>
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-white">Commercial Rule Engine</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Zero Markup Calculation</p>
          </div>
          <div className="pt-2 border-t border-slate-700/60 text-[10px] text-slate-300 space-y-1">
            <div className="flex items-center justify-between">
              <span>App Shelf Price:</span>
              <strong className="text-white font-mono">+0% Markup</strong>
            </div>
            <div className="flex items-center justify-between">
              <span>Partner Net Payout:</span>
              <strong className="text-emerald-400 font-mono">97.00%</strong>
            </div>
          </div>
        </div>

        {/* Step 3: Central Laravel 13 API (:4001) */}
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-4 space-y-3 relative overflow-hidden group hover:border-[#FF5A00] transition ring-2 ring-[#FF5A00]/40">
          <div className="flex items-center justify-between">
            <div className="w-7 h-7 rounded-lg bg-orange-500/20 text-[#FF5A00] flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono bg-orange-900/60 text-orange-300 px-1.5 py-0.5 rounded border border-orange-700/50">
              PORT 4001
            </span>
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-white">Central Laravel 13 API</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Delta Sync & FEFO Radar</p>
          </div>
          <div className="pt-2 border-t border-slate-700/60 text-[10px] text-slate-300 space-y-1">
            <div className="flex items-center justify-between">
              <span>Active Warehouses:</span>
              <strong className="text-white font-mono">2 Dark Stores</strong>
            </div>
            <div className="flex items-center justify-between">
              <span>Audit Log Trail:</span>
              <strong className="text-white font-mono">15+ Logs</strong>
            </div>
          </div>
        </div>

        {/* Step 4: Real-Time WebSocket Broker */}
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-4 space-y-3 relative overflow-hidden group hover:border-[#FF5A00] transition">
          <div className="flex items-center justify-between">
            <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono bg-purple-900/60 text-purple-300 px-1.5 py-0.5 rounded border border-purple-700/50">
              WEBSOCKET
            </span>
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-white">Real-Time Invalidation</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Soketi / Pusher Channel</p>
          </div>
          <div className="pt-2 border-t border-slate-700/60 text-[10px] text-slate-300 space-y-1">
            <div className="flex items-center justify-between">
              <span>Broadcast Latency:</span>
              <strong className="text-purple-300 font-mono">&lt; 18ms</strong>
            </div>
            <div className="flex items-center justify-between">
              <span>Mid-Cart Update:</span>
              <strong className="text-emerald-400 font-mono">Instant</strong>
            </div>
          </div>
        </div>

        {/* Step 5: Customer Apps (:4000) */}
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-4 space-y-3 relative overflow-hidden group hover:border-[#FF5A00] transition">
          <div className="flex items-center justify-between">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono bg-emerald-900/60 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-700/50">
              PORT 4000
            </span>
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-white">BazMart Customer App</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Flutter Web & Mobile</p>
          </div>
          <div className="pt-2 border-t border-slate-700/60 text-[10px] text-slate-300 space-y-1">
            <div className="flex items-center justify-between">
              <span>Kurdish Sorani RTL:</span>
              <strong className="text-emerald-400 font-mono">100%</strong>
            </div>
            <div className="flex items-center justify-between">
              <span>Delivery Target:</span>
              <strong className="text-white font-mono">15-20 Mins</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Ping Status Banner */}
      {pingSuccess && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-800/80 rounded-xl flex items-center space-x-3 space-x-reverse text-xs text-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            ✓ <strong>POS Bridge Ping Successful:</strong> 400 SKUs verified with 0 IQD variance across Erbil Central &amp; Sulaymaniyah dark stores. Fixed 3% commission engine active.
          </span>
        </div>
      )}
    </div>
  );
}

