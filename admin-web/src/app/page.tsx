'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ExecutiveCharts from '@/components/dashboard/ExecutiveCharts';
import { useOps } from '@/components/layout/OpsContext';
import { api } from '@/lib/api';
import { AnalyticsOverview } from '@/lib/types';
import { getTranslations } from '@/lib/i18n';
import { formatIqd, formatNumber } from '@/lib/format';
import {
  DollarSign,
  ShoppingBag,
  Clock,
  Bike,
  Banknote,
  RefreshCw,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

function OverviewContent() {
  const { selectedWarehouse, activeLanguage } = useOps();
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const t = getTranslations(activeLanguage);
  const isRtl = activeLanguage === 'ckb' || activeLanguage === 'ar';

  const loadData = async (warehouseId?: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getAnalytics(warehouseId);
      setData(res);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(selectedWarehouse);
    const interval = setInterval(() => loadData(selectedWarehouse), 10000);
    return () => clearInterval(interval);
  }, [selectedWarehouse]);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-3 space-x-reverse text-slate-500 font-medium">
          <RefreshCw className="w-5 h-5 animate-spin text-[#FF5A00]" />
          <span>{activeLanguage === 'ckb' ? 'بارکردنی داتاکانی دارکستۆر...' : 'Loading Dark Store KPIs...'}</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700 space-y-2">
        <div className="font-bold flex items-center space-x-2 space-x-reverse">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <span>{activeLanguage === 'ckb' ? 'ئاگاداری پەیوەندی بە سێرڤەر' : 'Backend Connection Notice'}</span>
        </div>
        <p className="text-sm">{error}</p>
        <button
          onClick={() => loadData(selectedWarehouse)}
          className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition"
        >
          {activeLanguage === 'ckb' ? 'دووبارە هەوڵدانەوە' : 'Retry Connection'}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top 6 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* GMV Today */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {t.overview.gmvToday}
            </span>
            <div className="w-7 h-7 rounded-lg bg-orange-50 text-[#FF5A00] flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-lg font-extrabold text-slate-900 tracking-tight">
              {formatIqd(data?.gmvTodayIqd ?? 0)}
            </div>
            <span className="text-[10px] text-emerald-600 font-bold flex items-center space-x-0.5 space-x-reverse mt-0.5">
              <TrendingUp className="w-3 h-3" />
              <span>{t.overview.vsYesterday}</span>
            </span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {t.overview.totalOrders}
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-lg font-extrabold text-slate-900 tracking-tight">
              {data?.totalOrders ?? 0} {activeLanguage === 'ckb' ? 'داواکاری' : 'Orders'}
            </div>
            <span className="text-[10px] text-slate-500 font-medium mt-0.5 block">
              {t.overview.avgBasket}: {formatIqd(data?.avgBasketIqd ?? 0)}
            </span>
          </div>
        </div>

        {/* Packing Speed Under 3 Mins */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {t.overview.packedUnder3Min}
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-lg font-extrabold text-emerald-600 tracking-tight">
              {data?.ordersPackedUnder3MinsPercent ?? 0}%
            </div>
            <span className="text-[10px] text-slate-500 font-medium mt-0.5 block">
              {t.overview.avgDelivery}: {data?.avgDeliveryTimeMinutes ?? 0} {activeLanguage === 'ckb' ? 'خولەک' : 'm'}
            </span>
          </div>
        </div>

        {/* Active Riders */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {t.overview.activeFleet}
            </span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Bike className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-lg font-extrabold text-slate-900 tracking-tight">
              {data?.activeRiders ?? 0} / {data?.totalRiders ?? 0} {activeLanguage === 'ckb' ? 'شۆفێر' : 'Riders'}
            </div>
            <span className="text-[10px] text-purple-600 font-bold mt-0.5 block">
              {t.overview.inHouseFleet}
            </span>
          </div>
        </div>

        {/* Pending COD Cash */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {t.overview.codInField}
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Banknote className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-lg font-extrabold text-slate-900 tracking-tight">
              {formatIqd(data?.pendingCodCashInFieldIqd ?? 0)}
            </div>
            <Link
              href="/fleet"
              className="text-[10px] text-amber-600 font-bold hover:underline mt-0.5 block"
            >
              {t.overview.settleShiftCash}
            </Link>
          </div>
        </div>

        {/* ERP Sync Health */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {t.overview.erpSync}
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <RefreshCw className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-sm font-extrabold text-emerald-600 flex items-center space-x-1.5 space-x-reverse">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{data?.erpSyncHealth?.status ?? 'ONLINE'}</span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium mt-0.5 block truncate">
              {data?.erpSyncHealth?.syncedSkusCount ?? 0} {activeLanguage === 'ckb' ? 'کاڵای چالاک' : 'SKUs Active'}
            </span>
          </div>
        </div>
      </div>

      {/* Executive Responsive Data Charts */}
      <ExecutiveCharts activeLanguage={activeLanguage} />

      {/* Kanban Pipeline Snapshot */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              {t.overview.pipelineTitle}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {t.overview.pipelineSubtitle}
            </p>
          </div>
          <Link
            href="/orders"
            className="inline-flex items-center space-x-1.5 space-x-reverse text-xs font-bold text-[#FF5A00] hover:text-[#E04F00] transition"
          >
            <span>{t.overview.openDispatch}</span>
            <ArrowRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* 1. Placed */}
          <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900 flex items-center space-x-1.5 space-x-reverse">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>{t.overview.statusPlaced}</span>
              </span>
              <span className="text-xs font-extrabold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                {data?.ordersByStatus?.PLACED || 0}
              </span>
            </div>
            <p className="text-[11px] text-amber-800/80">
              {activeLanguage === 'ckb' ? 'چاوەڕوانی سکانی باڕکۆدە' : 'Awaiting picker barcode scan'}
            </p>
          </div>

          {/* 2. Packing in Dark Store */}
          <div className="bg-blue-50/60 border border-blue-200/80 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-900 flex items-center space-x-1.5 space-x-reverse">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                <span>{t.overview.statusPacking}</span>
              </span>
              <span className="text-xs font-extrabold bg-blue-200 text-blue-900 px-2 py-0.5 rounded-full">
                {(data?.ordersByStatus?.PACKING_IN_DARKSTORE || 0) + (data?.ordersByStatus?.READY_FOR_PICKUP || 0)}
              </span>
            </div>
            <p className="text-[11px] text-blue-800/80">
              {activeLanguage === 'ckb' ? 'ستاف خەریکی پێچانەوەی کاڵاکانە' : 'Staff verifying item checklist'}
            </p>
          </div>

          {/* 3. Out for Delivery */}
          <div className="bg-purple-50/60 border border-purple-200/80 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-900 flex items-center space-x-1.5 space-x-reverse">
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
                <span>{t.overview.statusOutForDelivery}</span>
              </span>
              <span className="text-xs font-extrabold bg-purple-200 text-purple-900 px-2 py-0.5 rounded-full">
                {data?.ordersByStatus?.OUT_FOR_DELIVERY || 0}
              </span>
            </div>
            <p className="text-[11px] text-purple-800/80">
              {activeLanguage === 'ckb' ? 'شۆفێر لە ڕێگایە بۆ کڕیار' : 'Rider navigating to customer'}
            </p>
          </div>

          {/* 4. Delivered */}
          <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-900 flex items-center space-x-1.5 space-x-reverse">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>{t.overview.statusDelivered}</span>
              </span>
              <span className="text-xs font-extrabold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full">
                {data?.ordersByStatus?.DELIVERED || 0}
              </span>
            </div>
            <p className="text-[11px] text-emerald-800/80">
              {activeLanguage === 'ckb' ? 'تەواوبوو و کاش وەرگیراوە' : 'Completed & cash collected'}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Row: Top Selling Products & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Products */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 space-x-reverse">
              <TrendingUp className="w-4 h-4 text-[#FF5A00]" />
              <h3 className="text-sm font-bold text-slate-800">{t.overview.topVelocity}</h3>
            </div>
            <Link href="/catalog" className="text-xs text-[#FF5A00] font-bold hover:underline">
              {t.overview.viewCatalog}
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {data?.topSellingProducts && data.topSellingProducts.length > 0 ? (
              data.topSellingProducts.map((item, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <span className="w-5 text-slate-400 font-bold">{idx + 1}.</span>
                    <div>
                      <div className="font-bold text-slate-800">
                        {activeLanguage === 'ckb'
                          ? item.product?.titleCkb || item.product?.titleEn
                          : activeLanguage === 'ar'
                          ? item.product?.titleAr || item.product?.titleEn
                          : item.product?.titleEn}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {item.product?.barcode || item.product?.externalErpId}
                      </span>
                    </div>
                  </div>
                  <div className={isRtl ? 'text-left' : 'text-right'}>
                    <span className="font-extrabold text-slate-900">
                      {item.unitsSold} {activeLanguage === 'ckb' ? 'دانە' : 'units'}
                    </span>
                    <span className="block text-[10px] text-slate-500 font-medium">
                      {formatIqd(item.revenueIqd ?? 0)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">
                {activeLanguage === 'ckb' ? 'تا ئێستا هیچ فرۆشێک تۆمار نەکراوە.' : 'No sales recorded yet.'}
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 space-x-reverse">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-800">{t.overview.lowStockAlerts}</h3>
              <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">
                {data?.lowStockAlertsCount || 0}
              </span>
            </div>
            <Link href="/erp-sync" className="text-xs text-[#FF5A00] font-bold hover:underline">
              {t.overview.syncErp}
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {data?.lowStockAlerts && data.lowStockAlerts.length > 0 ? (
              data.lowStockAlerts.slice(0, 5).map((alert, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2.5 space-x-reverse">
                    <div className="w-2 h-2 rounded-full bg-red-500 shrink-0"></div>
                    <div>
                      <span className="font-bold text-slate-800 block">
                        {alert.productTitle}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {alert.warehouseName}
                      </span>
                    </div>
                  </div>
                  <div className={isRtl ? 'text-left' : 'text-right'}>
                    <span className="font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded text-[11px]">
                      {alert.availableStock} {activeLanguage === 'ckb' ? 'ماوە' : 'left'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-xs text-emerald-600 flex items-center justify-center space-x-1.5 space-x-reverse">
                <CheckCircle2 className="w-4 h-4" />
                <span>{t.overview.optimalStock}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OverviewPage() {
  const { activeLanguage } = useOps();
  const t = getTranslations(activeLanguage);

  return (
    <DashboardLayout
      title={t.overview.title}
      subtitle={t.overview.subtitle}
    >
      <OverviewContent />
    </DashboardLayout>
  );
}
