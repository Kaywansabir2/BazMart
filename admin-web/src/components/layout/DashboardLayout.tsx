'use client';

import React, { useState, useEffect } from 'react';
import { useOps } from './OpsContext';
import Sidebar from './Sidebar';
import Header from './Header';
import { getTranslations } from '@/lib/i18n';

export default function DashboardLayout({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  const { selectedWarehouse, setSelectedWarehouse, activeLanguage, setActiveLanguage } = useOps();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isRtl = activeLanguage === 'ckb' || activeLanguage === 'ar';
  const t = getTranslations(activeLanguage);

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className={`flex h-screen bg-[#F8FAFC] overflow-hidden text-slate-800 font-sans ${
        isRtl ? 'font-arabic' : ''
      }`}
    >
      <Sidebar
        selectedWarehouse={selectedWarehouse}
        onSelectWarehouse={setSelectedWarehouse}
        activeLanguage={activeLanguage}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          title={title}
          subtitle={subtitle}
          activeLanguage={activeLanguage}
          onChangeLanguage={setActiveLanguage}
        />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
