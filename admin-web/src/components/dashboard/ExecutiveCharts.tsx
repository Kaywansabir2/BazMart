'use client';

import React, { useState } from 'react';
import { TrendingUp, Layers, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { formatIqd } from '@/lib/format';

interface ExecutiveChartsProps {
  activeLanguage?: string;
}

export default function ExecutiveCharts({ activeLanguage = 'en' }: ExecutiveChartsProps) {
  const isRtl = activeLanguage === 'ckb' || activeLanguage === 'ar';
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);

  // 7-Day Performance Data
  const weeklyData = [
    { day: isRtl ? '٦ ڕۆژ پێش' : 'Day -6', shelfSales: 210000, commission3pct: 6300, orders: 11 },
    { day: isRtl ? '٥ ڕۆژ پێش' : 'Day -5', shelfSales: 280000, commission3pct: 8400, orders: 15 },
    { day: isRtl ? '٤ ڕۆژ پێش' : 'Day -4', shelfSales: 340000, commission3pct: 10200, orders: 18 },
    { day: isRtl ? '٣ ڕۆژ پێش' : 'Day -3', shelfSales: 310000, commission3pct: 9300, orders: 16 },
    { day: isRtl ? 'پێش دوێنێ' : 'Day -2', shelfSales: 420000, commission3pct: 12600, orders: 22 },
    { day: isRtl ? 'دوێنێ' : 'Yesterday', shelfSales: 480000, commission3pct: 14400, orders: 25 },
    { day: isRtl ? 'ئەمڕۆ' : 'Today', shelfSales: 525000, commission3pct: 15750, orders: 28 },
  ];

  const maxSales = 550000;

  // Top Categories breakdown
  const categoryBreakdown = [
    { name: isRtl ? 'شیر و بەرهەمە سپییەکان (Dairy & Eggs)' : 'Dairy & Fresh Eggs', percent: 35, iqd: 183750, color: 'bg-amber-500' },
    { name: isRtl ? 'مریشک و گۆشتی فرێش (Fresh Meat)' : 'Fresh Poultry & Meat', percent: 25, iqd: 131250, color: 'bg-red-500' },
    { name: isRtl ? 'میوە و سەوزەی تەڕ (Produce)' : 'Fresh Produce & Greens', percent: 18, iqd: 94500, color: 'bg-emerald-500' },
    { name: isRtl ? 'خواردنەوە و سۆدا (Beverages)' : 'Beverages & Soft Drinks', percent: 12, iqd: 63000, color: 'bg-blue-500' },
    { name: isRtl ? 'نانەواخانە و پسکیت (Bakery)' : 'Bakery & Snacks', percent: 10, iqd: 52500, color: 'bg-purple-500' },
  ];

  // SLA Funnel Stages
  const funnelStages = [
    { label: isRtl ? 'داواکاری نوێ' : 'Received', count: 28, percent: 100, color: 'bg-slate-700' },
    { label: isRtl ? 'کۆکردنەوە' : 'Picked', count: 26, percent: 93, color: 'bg-blue-600' },
    { label: isRtl ? 'پێچانەوە' : 'Packed <3m', count: 25, percent: 89, color: 'bg-amber-500' },
    { label: isRtl ? 'بەڕێکردن' : 'Dispatched', count: 24, percent: 86, color: 'bg-purple-600' },
    { label: isRtl ? 'گەیاندن (١٥ خولەک)' : 'Delivered (SLA)', count: 23, percent: 82, color: 'bg-emerald-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Chart 1: 7-Day Supermarket Shelf Sales vs BazMart 3% Commission */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2 space-x-reverse">
              <TrendingUp className="w-4 h-4 text-[#FF5A00]" />
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                {isRtl ? 'داھاتی ٧ ڕۆژی سوپەرمارکێت بەرامبەر ٣٪ پشکی بازمارت' : '7-Day Supermarket Sales vs. BazMart 3% Commission'}
              </h3>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {isRtl ? '١٠٠٪ هاوتای نرخی ڕەفەی هاوبەش + پشکی جێگیری ٣٪ بەبێ هیچ زیادکردنێک' : '100% Shelf-Price Parity Guaranteed (Fixed 3% Commercial Commission Engine)'}
            </p>
          </div>

          <div className="flex items-center space-x-4 space-x-reverse text-xs font-bold">
            <div className="flex items-center space-x-1.5 space-x-reverse">
              <span className="w-3 h-3 rounded bg-slate-800"></span>
              <span className="text-slate-600">{isRtl ? 'داھاتی ڕەفە (١٠٠٪)' : 'Shelf Sales (100%)'}</span>
            </div>
            <div className="flex items-center space-x-1.5 space-x-reverse">
              <span className="w-3 h-3 rounded bg-[#FF5A00]"></span>
              <span className="text-slate-600">{isRtl ? 'پشکی بازمارت (٣٪)' : 'BazMart 3% Comm.'}</span>
            </div>
          </div>
        </div>

        {/* Responsive SVG Bar/Area Chart */}
        <div className="h-56 w-full relative pt-2">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 700 180" preserveAspectRatio="none">
            {/* Horizontal Grid lines */}
            <line x1="0" y1="20" x2="700" y2="20" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="0" y1="65" x2="700" y2="65" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="0" y1="110" x2="700" y2="110" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="0" y1="155" x2="700" y2="155" stroke="#E2E8F0" strokeWidth="1.5" />

            {/* Bars for each day */}
            {weeklyData.map((d, i) => {
              const xCenter = 50 + i * 95;
              const barWidth = 36;
              const barHeight = (d.shelfSales / maxSales) * 135;
              const yTop = 155 - barHeight;
              const commHeight = Math.max(6, (d.commission3pct / maxSales) * 135 * 4); // Visually scaled for clear 3% pill accent
              const isHovered = hoveredDay === i;

              return (
                <g
                  key={i}
                  className="cursor-pointer transition-all duration-200"
                  onMouseEnter={() => setHoveredDay(i)}
                  onMouseLeave={() => setHoveredDay(null)}
                >
                  {/* Background Shelf Sales Bar */}
                  <rect
                    x={xCenter - barWidth / 2}
                    y={yTop}
                    width={barWidth}
                    height={barHeight}
                    rx="6"
                    fill={isHovered ? '#1E293B' : '#334155'}
                    className="transition-colors"
                  />

                  {/* Highlighted 3% Commission Top Cap */}
                  <rect
                    x={xCenter - barWidth / 2}
                    y={yTop}
                    width={barWidth}
                    height={commHeight}
                    rx="4"
                    fill="#FF5A00"
                  />

                  {/* Day Label */}
                  <text
                    x={xCenter}
                    y="172"
                    textAnchor="middle"
                    fill="#64748B"
                    fontSize="11"
                    fontWeight={isHovered ? 'bold' : 'normal'}
                  >
                    {d.day}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Dynamic Tooltip on Hover */}
          {hoveredDay !== null && (
            <div
              className="absolute top-2 bg-slate-900 text-white text-xs rounded-lg p-2.5 shadow-xl border border-slate-700 pointer-events-none transition-all z-10"
              style={{
                left: `${(hoveredDay / 6) * 75 + 10}%`,
              }}
            >
              <div className="font-bold text-[#FF5A00] mb-1">{weeklyData[hoveredDay].day}</div>
              <div>{isRtl ? 'فرۆشی ڕەفە:' : 'Shelf Sales:'} <strong>{formatIqd(weeklyData[hoveredDay].shelfSales)}</strong></div>
              <div>{isRtl ? 'پشکی ٣٪ بازمارت:' : 'BazMart 3%:'} <strong className="text-emerald-400">{formatIqd(weeklyData[hoveredDay].commission3pct)}</strong></div>
              <div className="text-[10px] text-slate-400 mt-1">{weeklyData[hoveredDay].orders} {isRtl ? 'داواکاری تەواوبوو' : 'Orders Settled'}</div>
            </div>
          )}
        </div>
      </div>

      {/* Row with Charts 2 & 3: Top Categories Breakdown + Dark Store Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 2: Top Categories Revenue & Volume Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 space-x-reverse">
              <Layers className="w-4 h-4 text-[#FF5A00]" />
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                {isRtl ? 'داھاتی بەشە سەرەکییەکان' : 'Top Categories Revenue & Volume'}
              </h3>
            </div>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              {isRtl ? '١٠٠٪ هاوتای نرخی ڕەفە' : '100% Shelf Parity'}
            </span>
          </div>

          <div className="space-y-3.5 pt-1">
            {categoryBreakdown.map((cat, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-800">{cat.name}</span>
                  <div className="space-x-2 space-x-reverse text-slate-500">
                    <span className="font-bold text-slate-800">{formatIqd(cat.iqd)}</span>
                    <span className="text-[11px] text-slate-400 font-bold">({cat.percent}%)</span>
                  </div>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${cat.color} rounded-full transition-all duration-500`}
                    style={{ width: `${cat.percent}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 3: Dark Store Fulfillment SLA & Order Pipeline Funnel */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 space-x-reverse">
              <Zap className="w-4 h-4 text-emerald-500" />
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                {isRtl ? 'ئاستی خێرایی و گەیاندنی دارکستۆر (SLA)' : 'Dark Store Fulfillment & SLA Funnel'}
              </h3>
            </div>
            <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
              {isRtl ? '١٥-٢٠ خولەک' : '15-20 Min SLA'}
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {funnelStages.map((stage, idx) => (
              <div key={idx} className="flex items-center space-x-3 space-x-reverse">
                <span className="w-28 text-xs font-bold text-slate-700 shrink-0 truncate">
                  {stage.label}
                </span>
                <div className="flex-1 h-6 bg-slate-100 rounded-lg overflow-hidden flex items-center p-0.5">
                  <div
                    className={`h-full ${stage.color} rounded-md flex items-center justify-end px-2 text-[10px] font-extrabold text-white transition-all duration-500`}
                    style={{ width: `${stage.percent}%` }}
                  >
                    {stage.count} ({stage.percent}%)
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-emerald-50/70 border border-emerald-200/60 rounded-xl flex items-center space-x-3 space-x-reverse text-xs text-emerald-900">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              {isRtl
                ? '٩٨.٤٪ ی داواکارییەکان لە خوار ١٥ خولەک بەسەرکەوتوویی دەگەیەندرێنە کڕیار.'
                : '98.4% of orders fulfilled and delivered under 15 minutes, beating SLA target.'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

