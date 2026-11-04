'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useOps } from '@/components/layout/OpsContext';
import { api } from '@/lib/api';
import { formatIqd, formatNumber, formatDateSafe } from '@/lib/format';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Receipt,
  Download,
  Printer,
  Trash2,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Percent,
} from 'lucide-react';

function FinanceContent() {
  const [warehouseId, setWarehouseId] = useState('all');
  const [period, setPeriod] = useState('7days');
  const [activeTab, setActiveTab] = useState<'daily' | 'categories' | 'skus' | 'ledger' | 'settlements'>('daily');
  const [loading, setLoading] = useState(true);

  // Data states
  const [summary, setSummary] = useState<any>(null);
  const [dailyReport, setDailyReport] = useState<any[]>([]);
  const [categoryProf, setCategoryProf] = useState<any[]>([]);
  const [skuMargins, setSkuMargins] = useState<any[]>([]);
  const [ledgerEntries, setLedgerEntries] = useState<any[]>([]);
  const [settlements, setSettlements] = useState<any[]>([]);

  // SKU filters
  const [skuSearch, setSkuSearch] = useState('');
  const [filterLowMarginOnly, setFilterLowMarginOnly] = useState(false);

  // Spoilage modal state
  const [isWastageModalOpen, setIsWastageModalOpen] = useState(false);
  const [selectedProductForWastage, setSelectedProductForWastage] = useState('');
  const [wastageQuantity, setWastageQuantity] = useState(1);
  const [wastageReason, setWastageReason] = useState('Damaged packaging during dark store stocking');
  const [wastageSubmitting, setWastageSubmitting] = useState(false);
  const [wastageMessage, setWastageMessage] = useState<string | null>(null);

  const { activeLanguage } = useOps();
  const [isZReportModalOpen, setIsZReportModalOpen] = useState(false);
  const [zReportData, setZReportData] = useState<any>(null);
  const [zReportLoading, setZReportLoading] = useState(false);

  const handleOpenZReport = async () => {
    setIsZReportModalOpen(true);
    setZReportLoading(true);
    try {
      const res = await api.getDailyZReport(warehouseId);
      setZReportData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setZReportLoading(false);
    }
  };

  const fetchFinanceData = async () => {
    setLoading(true);
    try {
      const [sumRes, dailyRes, catRes, skuRes, ledgerRes, settleRes] = await Promise.all([
        fetch(`http://localhost:4001/api/v1/admin/finance/summary?warehouseId=${warehouseId}&period=${period}`).then((r) => r.json()),
        fetch(`http://localhost:4001/api/v1/admin/finance/daily-report?warehouseId=${warehouseId}&period=${period}`).then((r) => r.json()),
        fetch(`http://localhost:4001/api/v1/admin/finance/category-profitability?warehouseId=${warehouseId}`).then((r) => r.json()),
        fetch(`http://localhost:4001/api/v1/admin/finance/sku-margins?search=${encodeURIComponent(skuSearch)}&filterLowMargin=${filterLowMarginOnly}`).then((r) => r.json()),
        fetch(`http://localhost:4001/api/v1/admin/finance/ledger?warehouseId=${warehouseId}&limit=50`).then((r) => r.json()),
        fetch('http://localhost:4001/api/v1/admin/finance/supermarket-settlements').then((r) => r.json()).catch(() => ({ success: false, data: [] })),
      ]);

      if (sumRes.success) setSummary(sumRes.data);
      if (dailyRes.success) setDailyReport(dailyRes.data);
      if (catRes.success) setCategoryProf(catRes.data);
      if (skuRes.success) setSkuMargins(skuRes.data);
      if (ledgerRes.success) setLedgerEntries(ledgerRes.data);
      if (settleRes && settleRes.success) setSettlements(settleRes.data);
    } catch (err) {
      console.error('Failed to load financial data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinanceData();
  }, [warehouseId, period, filterLowMarginOnly]);

  const handleSkuSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetch(`http://localhost:4001/api/v1/admin/finance/sku-margins?search=${encodeURIComponent(skuSearch)}&filterLowMargin=${filterLowMarginOnly}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setSkuMargins(res.data);
      });
  };

  const handleRecordWastage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForWastage) return;
    setWastageSubmitting(true);
    setWastageMessage(null);

    try {
      const res = await fetch('http://localhost:4001/api/v1/admin/finance/wastage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProductForWastage,
          warehouseId: warehouseId === 'all' ? 'erbil-central-darkstore' : warehouseId,
          quantity: wastageQuantity,
          reason: wastageReason,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setWastageMessage(`Successfully logged write-off! Ledger Entry: ${data.data.ledgerEntryNumber} (Loss: ${formatIqd(data.data.totalLossAmountIqd)})`);
        fetchFinanceData();
        setTimeout(() => {
          setIsWastageModalOpen(false);
          setWastageMessage(null);
        }, 2000);
      } else {
        setWastageMessage(`Error: ${data.message || 'Failed to record write-off'}`);
      }
    } catch (err: any) {
      setWastageMessage(`Error: ${err.message}`);
    } finally {
      setWastageSubmitting(false);
    }
  };

  const exportDailyCsv = () => {
    if (!dailyReport.length) return;
    const headers = ['Date', 'Orders', 'GMV (IQD)', 'Net Revenue (IQD)', 'COGS (IQD)', 'Gross Profit (IQD)', 'Promo Burn (IQD)', 'Driver Cost (IQD)', 'Net Profit (IQD)', 'Margin %'];
    const rows = dailyReport.map((d) => [
      d.date,
      d.ordersCount,
      d.grossMerchandiseValueIqd,
      d.revenueIqd,
      d.cogsIqd,
      d.grossProfitIqd,
      d.promoBurnIqd,
      d.driverCostIqd,
      d.netProfitIqd,
      d.netMarginPercent + '%',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `BazMart_Daily_PL_Report_${period}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Facility:</span>
            <select
              value={warehouseId}
              onChange={(e) => setWarehouseId(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 font-medium focus:outline-none focus:border-[#FF5A00]"
            >
              <option value="all">All Dark Stores (Iraq & KRD)</option>
              <option value="erbil-central-darkstore">Erbil Central Dark Store</option>
              <option value="suly-main-darkstore">Sulaymaniyah Main Dark Store</option>
            </select>

            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-2">Period:</span>
            <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700 text-xs">
              <button
                onClick={() => setPeriod('today')}
                className={`px-3 py-1 rounded font-medium transition ${period === 'today' ? 'bg-[#FF5A00] text-white shadow' : 'text-slate-400 hover:text-white'}`}
              >
                Today
              </button>
              <button
                onClick={() => setPeriod('7days')}
                className={`px-3 py-1 rounded font-medium transition ${period === '7days' ? 'bg-[#FF5A00] text-white shadow' : 'text-slate-400 hover:text-white'}`}
              >
                7 Days
              </button>
              <button
                onClick={() => setPeriod('30days')}
                className={`px-3 py-1 rounded font-medium transition ${period === '30days' ? 'bg-[#FF5A00] text-white shadow' : 'text-slate-400 hover:text-white'}`}
              >
                30 Days
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsWastageModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg text-xs font-semibold transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Record Spoilage / Wastage
            </button>
            <button
              onClick={exportDailyCsv}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              Export CSV
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition"
            >
              <Printer className="w-3.5 h-3.5 text-slate-400" />
              Print P&L
            </button>
            <button
              onClick={handleOpenZReport}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#FF5A00] hover:bg-[#E04F00] text-white rounded-lg text-xs font-extrabold shadow-md shadow-orange-500/20 transition"
            >
              <Receipt className="w-3.5 h-3.5 text-white" />
              <span>{activeLanguage === 'ckb' ? 'چاپکردنی Z-Report' : 'Daily Cashier Z-Report'}</span>
            </button>
          </div>
        </div>

        {/* Executive P&L Waterfall KPI Cards */}
        {summary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* 1. Gross Revenue */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
                <span>Gross Merchandise Value (GMV)</span>
                <span className="p-1 rounded bg-blue-500/10 text-blue-400 text-[10px] font-bold">GMV</span>
              </div>
              <div className="text-xl font-extrabold text-white">
                {formatIqd(summary.netBasketRevenueIqd)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                <span>Item Promo: -{formatIqd(summary.itemPromoBurnIqd)}</span>
                <span className="text-slate-500">{summary.totalOrdersCount} orders</span>
              </div>
            </div>

            {/* 2. Total COGS */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
                <span>Total Cost of Goods (COGS)</span>
                <span className="p-1 rounded bg-rose-500/10 text-rose-400 text-[10px] font-bold">Landed Cost</span>
              </div>
              <div className="text-xl font-extrabold text-rose-400">
                - {formatIqd(summary.totalCogsIqd)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Wholesale landed cost across dark stores
              </div>
            </div>

            {/* 3. Gross Profit */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
                <span>Gross Profit (Pre-Coupon)</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[11px] font-bold">
                  {summary.grossMarginPercent}%
                </span>
              </div>
              <div className="text-xl font-extrabold text-emerald-400">
                {formatIqd(summary.grossProfitIqd)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Net Basket (Card 1) - COGS (Card 2)
              </div>
            </div>

            {/* 4. Promo & Voucher Burn */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
              <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
                <span>Coupon Burn & Net Fleet Cost</span>
                <span className="p-1 rounded bg-amber-500/10 text-amber-400 text-[10px] font-bold">Deductions</span>
              </div>
              <div className="text-xl font-extrabold text-amber-400">
                - {formatIqd(summary.totalDeductionsIqd ?? (summary.couponSubsidyBurnIqd + Math.max(0, (summary.driverPayoutCostIqd || 0) - (summary.deliveryFeeRevenueIqd || 0))))}
              </div>
              <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                <span>Coupons: -{formatIqd(summary.couponSubsidyBurnIqd)}</span>
                <span>Fleet: -{formatIqd(Math.max(0, (summary.driverPayoutCostIqd || 0) - (summary.deliveryFeeRevenueIqd || 0)))}</span>
              </div>
            </div>

            {/* 5. Net Operating Profit */}
            <div className="bg-gradient-to-br from-slate-900 to-emerald-950/40 border border-emerald-500/30 p-4 rounded-xl shadow-md">
              <div className="flex items-center justify-between text-emerald-400 text-xs font-medium mb-1">
                <span>Net Operating Profit</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 text-[11px] font-extrabold">
                  {summary.netMarginPercent}% Net
                </span>
              </div>
              <div className="text-2xl font-black text-emerald-300">
                {formatIqd(summary.netOperatingProfitIqd)}
              </div>
              <div className="text-[11px] text-emerald-400/70 mt-1 flex items-center justify-between">
                <span>Gross Profit (Card 3) - Deductions (Card 4)</span>
                <span className="font-semibold">{summary.completedOrdersCount} delivered</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 1: Daily Financial Statement */}
        {activeTab === 'daily' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Daily Multi-Store P&L Performance</h3>
                <p className="text-xs text-slate-400">Order-level aggregated net margins and accounting breakdown</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-800 text-slate-300">
                {dailyReport.length} Operating Days Reported
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/60 uppercase text-[10px] text-slate-400 font-bold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-center">Orders</th>
                    <th className="py-3 px-4 text-right">Gross GMV</th>
                    <th className="py-3 px-4 text-right">Net Revenue</th>
                    <th className="py-3 px-4 text-right text-rose-400">COGS</th>
                    <th className="py-3 px-4 text-right">Gross Profit</th>
                    <th className="py-3 px-4 text-right text-amber-400">Promo Burn</th>
                    <th className="py-3 px-4 text-right text-slate-400">Rider Cost</th>
                    <th className="py-3 px-4 text-right text-emerald-400 font-bold">Net Profit</th>
                    <th className="py-3 px-4 text-right font-bold">Margin %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {dailyReport.map((day, i) => (
                    <tr key={i} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4 font-semibold text-white">
                        <div>{day.date}</div>
                        <div className="text-[10px] text-slate-500 font-normal">{day.dayLabel}</div>
                      </td>
                      <td className="py-3 px-4 text-center font-bold">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200">
                          {day.ordersCount}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-400">{formatIqd(day.grossMerchandiseValueIqd)}</td>
                      <td className="py-3 px-4 text-right font-medium text-white">{formatIqd(day.revenueIqd)}</td>
                      <td className="py-3 px-4 text-right text-rose-400 font-medium">-{formatIqd(day.cogsIqd)}</td>
                      <td className="py-3 px-4 text-right text-emerald-400 font-medium">{formatIqd(day.grossProfitIqd)}</td>
                      <td className="py-3 px-4 text-right text-amber-400">-{formatIqd(day.promoBurnIqd)}</td>
                      <td className="py-3 px-4 text-right text-slate-400">-{formatIqd(day.driverCostIqd)}</td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-300">{formatIqd(day.netProfitIqd)}</td>
                      <td className="py-3 px-4 text-right">
                        <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                          day.netMarginPercent >= 20 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          day.netMarginPercent >= 12 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                          'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}>
                          {day.netMarginPercent}%
                        </span>
                      </td>
                    </tr>
                  ))}
                  {dailyReport.length === 0 && (
                    <tr>
                      <td colSpan={10} className="py-8 text-center text-slate-500">
                        No financial records found for the selected period and facility.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        

        {/* Tab 2: 20-Category Profitability Matrix */}
        {activeTab === 'categories' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">All 20 Grocery Departments Ranked by Profitability</h3>
                <p className="text-xs text-slate-400">Total units sold, cost attribution and margin contribution matrix</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded bg-[#FF5A00]/10 text-[#FF5A00] border border-[#FF5A00]/30">
                20 Core Categories
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/60 uppercase text-[10px] text-slate-400 font-bold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center">Rank</th>
                    <th className="py-3 px-4">Department / Category</th>
                    <th className="py-3 px-4 text-center">Units Sold</th>
                    <th className="py-3 px-4 text-right">Total Revenue</th>
                    <th className="py-3 px-4 text-right text-rose-400">Total COGS</th>
                    <th className="py-3 px-4 text-right text-emerald-400 font-bold">Gross Profit</th>
                    <th className="py-3 px-4 w-48 text-right font-bold">Profit Margin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {categoryProf.map((cat, i) => (
                    <tr key={cat.categoryId} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4 text-center font-bold text-slate-500">#{i + 1}</td>
                      <td className="py-3 px-4 font-semibold text-white">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#FF5A00]"></span>
                          {cat.categoryName}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center font-medium">{cat.unitsSold} pcs</td>
                      <td className="py-3 px-4 text-right font-medium text-white">{formatIqd(cat.revenueIqd)}</td>
                      <td className="py-3 px-4 text-right text-rose-400">-{formatIqd(cat.cogsIqd)}</td>
                      <td className="py-3 px-4 text-right text-emerald-300 font-bold">{formatIqd(cat.grossProfitIqd)}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-20 bg-slate-800 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-emerald-500 to-[#FF5A00] h-full rounded-full"
                              style={{ width: `${Math.min(100, Math.max(0, cat.marginPercent * 2.5))}%` }}
                            ></div>
                          </div>
                          <span className="font-bold text-xs text-emerald-400 w-12 text-right">
                            {cat.marginPercent}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        

        {/* Tab 3: SKU Margin & Loss-Leader Watchlist */}
        {activeTab === 'skus' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl space-y-4 p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-white">400 Master SKUs Margin Engine</h3>
                <p className="text-xs text-slate-400">Unit landed cost, live retail prices, supplier attribution and margin health</p>
              </div>

              <div className="flex items-center gap-3">
                <form onSubmit={handleSkuSearch} className="relative">
                  <input
                    type="text"
                    placeholder="Search SKU by name, ERP code, barcode..."
                    value={skuSearch}
                    onChange={(e) => setSkuSearch(e.target.value)}
                    className="bg-slate-800 border border-slate-700 text-white text-xs rounded-lg pl-8 pr-3 py-2 w-64 focus:outline-none focus:border-[#FF5A00]"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                </form>

                <button
                  type="button"
                  onClick={() => setFilterLowMarginOnly(!filterLowMarginOnly)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition ${
                    filterLowMarginOnly
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  {filterLowMarginOnly ? 'Showing Low Margin (< 12%) Only' : 'Filter Low Margin (< 12%)'}
                </button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-800">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/60 uppercase text-[10px] text-slate-400 font-bold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">SKU Code / Barcode</th>
                    <th className="py-3 px-4">Product Title</th>
                    <th className="py-3 px-4">Supplier</th>
                    <th className="py-3 px-4 text-right text-rose-400">Landed Cost</th>
                    <th className="py-3 px-4 text-right">Base Retail</th>
                    <th className="py-3 px-4 text-right text-blue-400">Active Price</th>
                    <th className="py-3 px-4 text-right text-emerald-400 font-bold">Unit Profit</th>
                    <th className="py-3 px-4 text-center font-bold">Margin Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {skuMargins.map((sku) => (
                    <tr key={sku.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4">
                        <div className="font-mono text-white font-semibold">{sku.externalErpId}</div>
                        <div className="font-mono text-[10px] text-slate-500">{sku.barcode}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{sku.titleEn}</div>
                        <div className="text-[10px] text-slate-500">{sku.categoryName}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-[11px]">{sku.supplierName || 'General Import'}</td>
                      <td className="py-3 px-4 text-right font-medium text-rose-400">{formatIqd(sku.costPriceIqd)}</td>
                      <td className="py-3 px-4 text-right text-slate-400">{formatIqd(sku.originalPriceIqd)}</td>
                      <td className="py-3 px-4 text-right font-semibold text-blue-300">
                        {formatIqd(sku.activePriceIqd)}
                        {sku.discountPercentage && (
                          <span className="ml-1 text-[10px] font-bold text-amber-400">(-{sku.discountPercentage}%)</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-300">
                        {formatIqd(sku.unitProfitIqd)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase tracking-wider inline-flex items-center gap-1 ${
                          sku.isLossLeader ? 'bg-rose-600 text-white animate-pulse' :
                          sku.isLowMargin ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                          sku.marginPercent >= 20 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          {sku.isLossLeader ? 'Loss Leader' : `${sku.marginPercent}%`}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        

        {/* Tab 4: Immutable General Financial Ledger */}
        {activeTab === 'ledger' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Double-Entry Financial Audit Trail</h3>
                <p className="text-xs text-slate-400">Immutable ledger tracking order revenue, COGS, subsidies and wastage debits</p>
              </div>
              <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded bg-slate-800 text-slate-300">
                {ledgerEntries.length} Recent Audit Entries
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/60 uppercase text-[10px] text-slate-400 font-bold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Entry Number</th>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Transaction Type</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4 text-center">Direction</th>
                    <th className="py-3 px-4 text-right font-bold">Amount (IQD)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {ledgerEntries.map((e) => (
                    <tr key={e.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4 font-bold text-[#FF5A00]">{e.entryNumber}</td>
                      <td className="py-3 px-4 text-slate-400 font-sans text-xs">
                        {formatDateSafe(e.recordedAt)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-sans text-[10px] font-bold">
                          {e.entryType}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-sans text-xs text-slate-300">{e.description}</td>
                      <td className="py-3 px-4 text-center font-sans">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          e.direction === 'CREDIT' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}>
                          {e.direction}
                        </span>
                      </td>
                      <td className={`py-3 px-4 text-right font-bold font-sans text-xs ${
                        e.direction === 'CREDIT' ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {e.direction === 'CREDIT' ? '+' : '-'} {formatIqd(e.amountIqd)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        

              

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 space-x-6 text-sm font-semibold">
          <button
            onClick={() => setActiveTab('daily')}
            className={`pb-3 flex items-center gap-2 border-b-2 transition ${
              activeTab === 'daily'
                ? 'border-[#FF5A00] text-[#FF5A00]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Daily Financial Statement
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`pb-3 flex items-center gap-2 border-b-2 transition ${
              activeTab === 'categories'
                ? 'border-[#FF5A00] text-[#FF5A00]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            20-Category Profitability Matrix
          </button>
          <button
            onClick={() => setActiveTab('skus')}
            className={`pb-3 flex items-center gap-2 border-b-2 transition ${
              activeTab === 'skus'
                ? 'border-[#FF5A00] text-[#FF5A00]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Percent className="w-4 h-4" />
            SKU Margin & Loss-Leader Watchlist
          </button>
          <button
            onClick={() => setActiveTab('ledger')}
            className={`pb-3 flex items-center gap-2 border-b-2 transition ${
              activeTab === 'ledger'
                ? 'border-[#FF5A00] text-[#FF5A00]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Receipt className="w-4 h-4" />
            General Financial Ledger (#FIN)
          </button>
          <button
            onClick={() => setActiveTab('settlements')}
            className={`pb-3 flex items-center gap-2 border-b-2 transition ${
              activeTab === 'settlements'
                ? 'border-[#FF5A00] text-[#FF5A00]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Percent className="w-4 h-4" />
            {activeLanguage === 'ckb' ? 'حیساباتی مارکێتە هاوبەشەکان (٣٪ کۆمیسیۆن)' : 'Supermarket Settlements (3% Commission)'}
          </button>
        </div>


      {/* Tab 5: Partner Supermarket Settlements (100% Shelf-Price & Fixed 3% Commission) */}
        {activeTab === 'settlements' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl space-y-4">
            <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">
                    {activeLanguage === 'ckb' ? 'حیساباتی مارکێتە هاوبەشەکان (مۆدێلی ٣٪ کۆمیسیۆن)' : 'Partner Supermarket POS Settlement Vouchers'}
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    100% Shelf-Price Parity
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {activeLanguage === 'ckb'
                    ? 'پشکنینی ژمێریاری: نرخی ڕەفەی مارکێت = ١٠٠٪، کۆمیسیۆنی بازماڕت = ٣٪، شایستەی پاکی مارکێت = ٩٧٪'
                    : 'Mathematical invariant: Shelf Gross (100%) = BazMart Commission (3%) + Partner Net Payable (97%)'}
                </p>
              </div>
              <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded bg-slate-800 text-slate-300">
                {settlements.length} Vouchers Generated
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/60 uppercase text-[10px] text-slate-400 font-bold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">{activeLanguage === 'ckb' ? 'ژمارەی پسوولە' : 'Voucher #'}</th>
                    <th className="py-3 px-4">{activeLanguage === 'ckb' ? 'کۆگا / لقی مارکێت' : 'Facility / Dark Store'}</th>
                    <th className="py-3 px-4">{activeLanguage === 'ckb' ? 'بەروار' : 'Period Date'}</th>
                    <th className="py-3 px-4 text-center">{activeLanguage === 'ckb' ? 'داواکاری' : 'Orders'}</th>
                    <th className="py-3 px-4 text-right font-bold text-white">{activeLanguage === 'ckb' ? 'کۆی فرۆشی ڕەفە (١٠٠٪)' : 'Gross Shelf Sales (100%)'}</th>
                    <th className="py-3 px-4 text-right font-bold text-[#FF5A00]">{activeLanguage === 'ckb' ? 'کۆمیسیۆنی بازماڕت (٣٪)' : 'BazMart 3% Commission'}</th>
                    <th className="py-3 px-4 text-right font-bold text-emerald-400">{activeLanguage === 'ckb' ? 'شایستەی مارکێت (٩٧٪)' : 'Partner Net Payable (97%)'}</th>
                    <th className="py-3 px-4 text-center">{activeLanguage === 'ckb' ? 'دۆخ' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {settlements.map((s: any) => (
                    <tr key={s.id || s.settlementNumber || s.settlement_number} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4 font-bold text-[#FF5A00]">
                        #{s.settlementNumber || s.settlement_number}
                      </td>
                      <td className="py-3 px-4 font-sans text-xs text-slate-300">
                        {(s.warehouseId || s.warehouse_id) === 'erbil-central-darkstore' ? 'Erbil Central Dark Store' : 'Sulaymaniyah Main Dark Store'}
                      </td>
                      <td className="py-3 px-4 font-sans text-xs text-slate-400">
                        {s.periodDate || s.period_date}
                      </td>
                      <td className="py-3 px-4 text-center font-bold">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200">
                          {s.ordersCount ?? s.orders_count}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-white font-sans text-xs">
                        {formatIqd(s.totalShelfSalesIqd ?? s.total_shelf_sales_iqd)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-[#FF5A00] font-sans text-xs">
                        {formatIqd(s.bazmartCommission3pctIqd ?? s.bazmart_commission_3pct_iqd)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-400 font-sans text-xs">
                        {formatIqd(s.supermarketNetPayable97pctIqd ?? s.supermarket_net_payable_97pct_iqd)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          s.status === 'SETTLED'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          {s.status === 'SETTLED' ? (activeLanguage === 'ckb' ? 'پارە دراوە' : 'SETTLED') : (activeLanguage === 'ckb' ? 'لە چاوەڕوانیدا' : 'PENDING')}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {settlements.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-500 font-sans">
                        No supermarket settlements recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Record Spoilage / Wastage Modal */}
      {isWastageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-rose-500" />
                Record Dark Store Spoilage Write-Off
              </h3>
              <button
                onClick={() => setIsWastageModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {wastageMessage && (
              <div className={`p-3 rounded-lg text-xs font-semibold ${
                wastageMessage.startsWith('Error') ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}>
                {wastageMessage}
              </div>
            )}

            <form onSubmit={handleRecordWastage} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Select Product to Write Off:</label>
                <select
                  value={selectedProductForWastage}
                  onChange={(e) => setSelectedProductForWastage(e.target.value)}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white font-medium focus:border-[#FF5A00]"
                >
                  <option value="">-- Choose Damaged / Expired SKU --</option>
                  {skuMargins.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.titleEn} (Landed Cost: IQD {p.costPriceIqd})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Quantity to Write Off (Units):</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={wastageQuantity}
                  onChange={(e) => setWastageQuantity(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white font-medium focus:border-[#FF5A00]"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Reason for Wastage:</label>
                <select
                  value={wastageReason}
                  onChange={(e) => setWastageReason(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white font-medium focus:border-[#FF5A00]"
                >
                  <option value="Damaged packaging during dark store stocking">Damaged packaging during stocking</option>
                  <option value="Perishable produce spoiled in transit">Perishable produce spoiled in transit</option>
                  <option value="Cold chain temperature break write-off">Cold chain temperature break write-off</option>
                  <option value="Manufacturer factory seal defect">Manufacturer factory seal defect</option>
                  <option value="Expired date threshold passed">Expired date threshold passed</option>
                </select>
              </div>

              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 space-y-1">
                <div className="font-semibold text-xs flex items-center justify-between">
                  <span>Inventory Impact:</span>
                  <span>- {wastageQuantity} units deducted from dark store</span>
                </div>
                <div className="text-[11px] text-rose-400/80">
                  This transaction will immediately post a COGS wastage debit entry to the general financial ledger.
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsWastageModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={wastageSubmitting}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg shadow-lg shadow-rose-600/30 transition disabled:opacity-50"
                >
                  {wastageSubmitting ? 'Posting...' : 'Confirm Spoilage Write-Off'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Daily Cashier Z-Report Modal */}
      {isZReportModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/50">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Receipt className="w-5 h-5 text-[#FF5A00]" />
                <div>
                  <h3 className="font-extrabold text-white text-sm">
                    {activeLanguage === 'ckb' ? 'ڕاپۆرتی کۆتایی ڕۆژانەی کاشێر (Z-Report)' : 'Daily Cashier Closing Z-Report'}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {zReportData?.reportNumber || 'Z-REPORT'} • Kurdistan Standard Time
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsZReportModalOpen(false)}
                className="w-7 h-7 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto space-y-4 font-mono text-xs">
              {zReportLoading ? (
                <div className="py-12 flex items-center justify-center space-x-2 text-slate-400">
                  <RefreshCw className="w-4 h-4 animate-spin text-[#FF5A00]" />
                  <span>Loading Z-Report audit data...</span>
                </div>
              ) : (
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-slate-300 font-mono text-[11px] whitespace-pre leading-relaxed shadow-inner overflow-x-auto">
                  {zReportData?.asciiZReport || 'Generating Z-Report...'}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-800/30 flex items-center justify-between">
              <span className="text-[11px] text-emerald-400 font-semibold flex items-center space-x-1 space-x-reverse">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{activeLanguage === 'ckb' ? 'تەئکیدکراو و هاوسەنگە' : 'Audit Balanced (Variance: IQD 0)'}</span>
              </span>
              <div className="flex items-center space-x-2 space-x-reverse">
                <button
                  type="button"
                  onClick={() => setIsZReportModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
                >
                  {activeLanguage === 'ckb' ? 'داخستن' : 'Close'}
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-[#FF5A00] hover:bg-[#E04F00] text-white rounded-lg text-xs font-extrabold shadow-md shadow-orange-500/20"
                >
                  {activeLanguage === 'ckb' ? 'چاپکردنی پسوولە' : 'Print Receipt'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FinancePage() {
  return (
    <DashboardLayout
      title="Cost Accounting & Financial P&L Engine"
      subtitle="Real-time COGS, Category Profitability & Dark Store Audit Ledger"
    >
      <FinanceContent />
    </DashboardLayout>
  );
}
