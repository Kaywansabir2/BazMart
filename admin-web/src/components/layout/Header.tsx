'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Sparkles } from 'lucide-react';
import { getTranslations, SupportedLanguage } from '@/lib/i18n';

export default function Header({
  title,
  subtitle,
  activeLanguage,
  onChangeLanguage,
}: {
  title: string;
  subtitle?: string;
  activeLanguage: SupportedLanguage;
  onChangeLanguage: (lang: SupportedLanguage) => void;
}) {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [mounted, setMounted] = useState(false);
  const t = getTranslations(activeLanguage);
  const isRtl = activeLanguage === 'ckb' || activeLanguage === 'ar';

  useEffect(() => {
    setMounted(true);
    const update = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      setCurrentTime(`${h}:${m}`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 shadow-sm">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-lg font-bold text-slate-800 tracking-tight">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500 font-medium">{subtitle}</p>}
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-4 space-x-reverse">
        {/* Market Badge */}
        <div className="hidden sm:flex items-center space-x-1.5 space-x-reverse px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>{t.header.marketBadge}</span>
        </div>

        {/* Trilingual Language Selector */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-bold">
          <button
            onClick={() => onChangeLanguage('en')}
            className={`px-2 py-1 rounded transition ${
              activeLanguage === 'en'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => onChangeLanguage('ckb')}
            className={`px-2 py-1 rounded transition font-arabic ${
              activeLanguage === 'ckb'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            کوردی
          </button>
          <button
            onClick={() => onChangeLanguage('ar')}
            className={`px-2 py-1 rounded transition font-arabic ${
              activeLanguage === 'ar'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            عربي
          </button>
        </div>

        {/* Live Clock (Client-Mount Protected) */}
        <div
          suppressHydrationWarning
          className="text-xs font-mono font-semibold text-slate-600 bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200 min-w-[110px] text-center"
        >
          {mounted && currentTime ? `${currentTime} (GMT+3)` : '00:00 (GMT+3)'}
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#FF5A00] ring-2 ring-white"></span>
        </button>

        {/* User Avatar */}
        <div className={`flex items-center space-x-2 space-x-reverse ${isRtl ? 'pr-2 border-r' : 'pl-2 border-l'} border-slate-200`}>
          <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs shadow">
            BM
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-bold text-slate-800 leading-tight">{t.header.darkStoreOps}</p>
            <p className="text-[10px] text-slate-400 font-medium">{t.header.superAdmin}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
