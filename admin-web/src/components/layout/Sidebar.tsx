'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  PackageOpen,
  RefreshCw,
  Megaphone,
  Truck,
  Smartphone,
  Settings,
  Store,
  Ticket,
  Users,
  Star,
  TrendingUp,
  Boxes,
  LifeBuoy,
  ShieldCheck,
  ScanLine,
  Handshake,
} from 'lucide-react';
import { getTranslations, SupportedLanguage } from '@/lib/i18n';

export default function Sidebar({
  selectedWarehouse,
  onSelectWarehouse,
  activeLanguage = 'en',
}: {
  selectedWarehouse: string;
  onSelectWarehouse: (id: string) => void;
  activeLanguage?: SupportedLanguage;
}) {
  const pathname = usePathname();
  const t = getTranslations(activeLanguage);
  const isRtl = activeLanguage === 'ckb' || activeLanguage === 'ar';

  const NAV_ITEMS = [
    { href: '/', label: t.nav.overview, icon: LayoutDashboard },
    { href: '/orders', label: t.nav.orders, icon: ShoppingBag, badge: t.badges.live },
    { href: '/supply-chain', label: t.nav.supplyChain, icon: Boxes, badge: t.badges.fefo },
    { href: '/support', label: t.nav.support, icon: LifeBuoy, badge: t.badges.help },
    { href: '/finance', label: t.nav.finance, icon: TrendingUp, badge: t.badges.pnl },
    { href: '/ratings', label: t.nav.ratings, icon: Star, badge: t.badges.live },
    { href: '/customers', label: t.nav.customers, icon: Users, badge: t.badges.auth },
    { href: '/coupons', label: t.nav.coupons, icon: Ticket, badge: t.badges.promo },
    { href: '/catalog', label: t.nav.catalog, icon: PackageOpen },
    { href: '/erp-sync', label: t.nav.erpSync, icon: RefreshCw },
    { href: '/campaigns', label: t.nav.campaigns, icon: Megaphone },
    { href: '/fleet', label: t.nav.fleet, icon: Truck },
    { href: '/driver-portal', label: t.nav.driverPortal, icon: Smartphone, badge: t.badges.rider },
    { href: '/picker-portal', label: t.nav.pickerPortal, icon: ScanLine, badge: t.badges.live },
    { href: '/partner-portal', label: t.nav.partnerPortal, icon: Handshake, badge: t.badges.pnl },
    { href: '/staff', label: t.nav.staff, icon: ShieldCheck, badge: t.badges.rbac },
    { href: '/settings', label: t.nav.settings, icon: Settings },
  ];

  return (
    <aside
      className={`w-64 bg-slate-900 text-slate-200 flex flex-col shrink-0 select-none ${
        isRtl ? 'border-l border-slate-800' : 'border-r border-slate-800'
      }`}
    >
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FF5A00] to-[#FF8A00] flex items-center justify-center shadow-lg shadow-orange-500/20 shrink-0">
            <Store className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5 space-x-reverse">
              <span className="font-extrabold text-white text-lg tracking-tight">
                {t.appName}
              </span>
              <span className="text-[10px] font-bold bg-[#FF5A00] text-white px-1.5 py-0.5 rounded uppercase tracking-wider">
                OPS
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">{t.appSubtitle}</p>
          </div>
        </div>
      </div>

      {/* Warehouse Switcher */}
      <div className="p-4 border-b border-slate-800">
        <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
          {t.activeStore}
        </label>
        <select
          value={selectedWarehouse}
          onChange={(e) => onSelectWarehouse(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-2.5 py-2 text-xs font-medium focus:outline-none focus:border-[#FF5A00] transition"
        >
          <option value="all">{t.allStores}</option>
          <option value="erbil-central-darkstore">{t.erbilStore}</option>
          <option value="suly-main-darkstore">{t.sulyStore}</option>
        </select>
      </div>

      {/* Navigation Links */}
      <nav
        className="flex-1 p-3 overflow-y-auto custom-dark-scrollbar"
        style={{ direction: 'ltr' }}
      >
        <div style={{ direction: isRtl ? 'rtl' : 'ltr' }} className="space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-2">
            {t.operations}
          </div>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition ${
                  isActive
                    ? 'bg-[#FF5A00] text-white shadow-md shadow-orange-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center space-x-3 space-x-reverse">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded tracking-wide ${
                      isActive
                        ? 'bg-black/25 text-white'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* System Footer Info */}
      <div className="p-4 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
        <div className="flex items-center space-x-2 space-x-reverse">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span>Dark Store v16.0 Enterprise</span>
        </div>
        <span className="font-mono text-[10px] text-slate-600">:4002</span>
      </div>
    </aside>
  );
}
