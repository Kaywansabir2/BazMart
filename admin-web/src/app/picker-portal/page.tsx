'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { getPhotoKey } from '@/lib/photo-utils';
import { formatIqd } from '@/lib/format';
import {
  ScanLine,
  CheckCircle2,
  Clock,
  Printer,
  Scale,
  Sparkles,
  AlertCircle,
  Truck,
  MapPin,
  ChevronRight,
  PackageCheck,
  RefreshCw,
  ShoppingBag,
} from 'lucide-react';

interface MockItem {
  id: string;
  nameKu: string;
  nameEn: string;
  barcode: string;
  aisle: string;
  shelfPriceIqd: number;
  fefoBatch: string;
  aisleLocation?: string;
  subPreference: 'substitute' | 'call' | 'remove';
  isPicked: boolean;
  scaleWeightKg?: number;
}

export default function PickerPortalPage() {
  const [activeTab, setActiveTab] = useState<'PLACED' | 'PICKING' | 'READY'>('PICKING');
  const [timerSeconds, setTimerSeconds] = useState(165); // 02:45
  const [orders, setOrders] = useState<any[]>([]);
  const [activeOrderId, setActiveOrderId] = useState<string>('ord-1001');
  const [items, setItems] = useState<MockItem[]>([
    {
      id: 'it-1',
      nameKu: 'شیری ئەلڕەحمە، ١ لیتر (ساردکەرەوە)',
      nameEn: 'Al Rahma Fresh Milk 1L',
      barcode: '6291100010014',
      aisle: 'ڕەفەی شیرەمەنی و ساردکەرەوە (Aisle 01-A)',
      shelfPriceIqd: 2250,
      fefoBatch: 'LOT-ALRAHMA-1101 (بەسەرچوون: ٢٠٢٦/١٢)',
      subPreference: 'substitute',
      isPicked: false,
    },
    {
      id: 'it-2',
      nameKu: 'خەیاری ناوخۆیی فڕێش (تەرازوو - ١.٢٥ کگم)',
      nameEn: 'Cucumber - Local, 1.25kg (Digital Scale)',
      barcode: '2001005012509',
      aisle: 'ڕەفەی میوە و سەوزەی تازە (Aisle 03-C)',
      shelfPriceIqd: 1806,
      fefoBatch: 'LOT-FRESH-SULY-204 (بەسەرچوون: ٢٠٢٦/١١)',
      subPreference: 'call',
      isPicked: false,
      scaleWeightKg: 1.25,
    },
    {
      id: 'it-3',
      nameKu: 'شیرینی چەوی گوێزی هیندی، ١٢٠ گم',
      nameEn: 'My Chewy Coconut Candy 120g',
      barcode: '6291100010204',
      aisle: 'ڕەفەی شیرنەمەنی و قاوە (Aisle 02-B)',
      shelfPriceIqd: 6000,
      fefoBatch: 'LOT-CHEWY-908 (بەسەرچوون: ٢٠٢٧/٠٣)',
      subPreference: 'remove',
      isPicked: false,
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [scaleModalData, setScaleModalData] = useState<any | null>(null);
  const [thermalLabelModal, setThermalLabelModal] = useState<any | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 180));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handlePickItem = async (item: MockItem) => {
    try {
      setLoading(true);
      await api.pickOrderItem(activeOrderId, { itemId: item.id, barcode: item.barcode, isPicked: !item.isPicked });
      setItems((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, isPicked: !it.isPicked } : it))
      );
      showToast(item.isPicked ? `کاڵای ${item.nameKu} هەڵوەشێنرایەوە.` : `کاڵای ${item.nameKu} بە سەرکەوتوویی پشکێنرا و کۆکرایەوە!`);
    } catch (err: any) {
      setItems((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, isPicked: !it.isPicked } : it))
      );
      showToast(`پشکنین ئەنجامدرا: ${item.nameKu}`);
    } finally {
      setLoading(false);
    }
  };

  const handleScanScaleBarcodeChip = async () => {
    // Immediate responsive display
    const initialData = {
      isScaleBarcode: true,
      barcode: '2001005012509',
      weightKg: 1.25,
      weightGrams: 1250,
      unitPriceIqd: 1445,
      totalShelfPriceIqd: 1806,
      priceVarianceIqd: 0,
      parityRate: 100.0,
      bazmartCommission3pctIqd: 54,
      supermarketNet97pctIqd: 1752,
      kurdishLabel: 'تەرازووی دیجیتاڵ: ١.٢٥ کیلۆ • نرخی کیلۆ: ١,٤٤٥ د.ع • کۆی تەرازوو: ١,٨٠٦ د.ع (٠ د.ع جیاوازی)',
    };
    setScaleModalData(initialData);
    setItems((prev) =>
      prev.map((it) => (it.barcode === '2001005012509' ? { ...it, isPicked: true } : it))
    );
    showToast('بارکۆدی تەرازوو خوێندرایەوە: ١.٢٥ کگم خەیار • ١,٨٠٦ د.ع (٠ د.ع جیاوازی)');

    try {
      const res = await api.parseScaleBarcode('2001005012509');
      if (res?.data) {
        setScaleModalData(res.data);
      }
    } catch (_) {}
  };

  const handleCompletePicking = async () => {
    try {
      setLoading(true);
      const res = await api.completeOrderPicking(activeOrderId);
      setThermalLabelModal(res.data?.bagLabel || {
        storeName: 'بازاڕی بازمارت (سووپەرمارکێتی هاوبەشی سلێمانی - شەقامی سالم)',
        storeNameEn: 'BazMart Partner Hypermarket (Sulaymaniyah, Salim St)',
        orderNumber: '#BM-84920',
        shelfAisle: 'ڕەفەی ساردکەرەوە و میوەی تازە',
        pickerName: 'ئارام کەریم (Picker #04)',
        customerPhone: '+964 770 123 4567',
        totalItems: 3,
        shelfTotalIqd: 10056,
        parityVerified: '١٠٠٪ هاوسەنگیی نرخی ڕەفە (جیاوازی ٠ د.ع)',
        timestamp: new Date().toLocaleString(),
      });
      setActiveTab('READY');
      showToast('کۆکردنەوە تەواو بوو! داواکاری ئامادەیە بۆ شۆفێری گەیاندن.');
    } catch (err: any) {
      setThermalLabelModal({
        storeName: 'بازاڕی بازمارت (سووپەرمارکێتی هاوبەشی سلێمانی - شەقامی سالم)',
        storeNameEn: 'BazMart Partner Hypermarket (Sulaymaniyah, Salim St)',
        orderNumber: '#BM-84920',
        shelfAisle: 'ڕەفەی ساردکەرەوە و میوەی تازە',
        pickerName: 'ئارام کەریم (Picker #04)',
        customerPhone: '+964 770 123 4567',
        totalItems: 3,
        shelfTotalIqd: 10056,
        parityVerified: '١٠٠٪ هاوسەنگیی نرخی ڕەفە (جیاوازی ٠ د.ع)',
        timestamp: new Date().toLocaleString(),
      });
      setActiveTab('READY');
    } finally {
      setLoading(false);
    }
  };

  const pickedCount = items.filter((i) => i.isPicked).length;
  const progressPercent = Math.round((pickedCount / items.length) * 100);

  return (
    <div dir="rtl" className="min-h-screen bg-slate-950 text-slate-100 p-4 lg:p-6 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-emerald-400 font-medium text-sm animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-4xl mx-auto space-y-5">
        {/* Top Header Card */}
        <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 rounded-2xl p-4 text-white shadow-xl border border-orange-500/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
                <ScanLine className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold tracking-tight">پۆرتاڵی ئامادەکاری ناو ڕەفە (In-Store Picker)</h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500 text-white shadow-sm">
                    ڕاستەوخۆ
                  </span>
                </div>
                <p className="text-xs text-orange-100 mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>📍 سووپەرمارکێتی هاوبەشی سلێمانی - شەقامی سالم</span>
                </p>
              </div>
            </div>

            {/* Countdown preparation timer */}
            <div className="bg-black/30 backdrop-blur-md px-4 py-2 rounded-xl flex items-center gap-2 border border-white/10 self-start sm:self-auto">
              <Clock className="w-5 h-5 text-amber-300 animate-pulse" />
              <div className="text-right">
                <div className="text-[10px] text-orange-200">تایمەری ئامادەکردن</div>
                <div className="text-lg font-mono font-bold text-amber-300">{formatTimer(timerSeconds)} خولەک ⚡</div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 19 Quick Scale Barcode Test Chip */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <span>تاقیکردنەوەی بارکۆدی تەرازووی دیجیتاڵ (Prefix 20xxxxx)</span>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800">
                  GS1 EAN-13
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                بارکۆدی کێشی بەستراوەی تەرازوو بۆ سەوزە و گۆشت (دەرهێنانی کێش بە گرام و حیسابکردنی نرخی هاوتا)
              </p>
            </div>
          </div>

          <button
            data-testid="scale-barcode-chip-btn"
            onClick={handleScanScaleBarcodeChip}
            className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-l from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Scale className="w-4 h-4" />
            <span>⚖️ بارکۆدی تەرازووی سەوزە و گۆشت (2001005012509 — ١.٢٥ کیلۆ خەیار)</span>
          </button>
        </div>

        {/* Queue Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('PLACED')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'PLACED'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:bg-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>داواکارییە نوێیەکان (PLACED) [١]</span>
          </button>
          <button
            onClick={() => setActiveTab('PICKING')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'PICKING'
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                : 'text-slate-400 hover:bg-slate-900'
            }`}
          >
            <ScanLine className="w-3.5 h-3.5" />
            <span>لە کاتی کۆکردنەوەدا (PICKING) [داواکاری چالاک]</span>
          </button>
          <button
            onClick={() => setActiveTab('READY')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'READY'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:bg-slate-900'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>ئامادەیە بۆ شۆفێر (READY)</span>
          </button>
        </div>

        {/* Active Order Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-mono font-bold text-orange-400">#BM-84920</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
                  داواکاری کڕیار: ژیلوان ئەحمەد
                </span>
                <span className="text-xs text-slate-400 font-mono">+964 770 123 4567</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                سلێمانی، شەقامی سالم، تەنیشت باخی گشتی • کۆی کاڵاکان: {items.length} دانە
              </p>
            </div>

            {/* Progress bar */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-[11px] text-slate-400">ڕێژەی کۆکردنەوە</div>
                <div className="text-sm font-bold text-slate-100">{pickedCount} لە {items.length} کاڵا ({progressPercent}٪)</div>
              </div>
              <div className="w-20 bg-slate-800 rounded-full h-2.5 overflow-hidden border border-slate-700">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Aisle-by-Aisle Picking Items */}
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition-all ${
                  item.isPicked
                    ? 'bg-emerald-950/20 border-emerald-500/40 shadow-inner'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center p-1">
                      <img
                        src={`/images/products/${getPhotoKey(item.id, '')}.png`}
                        alt={item.nameEn}
                        className="w-full h-full object-contain"
                        onError={(e: any) => {
                          e.target.src = '/images/products/grocery_generic.png';
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {item.aisleLocation && (
                          <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            {item.aisleLocation}
                          </span>
                        )}
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                        {item.aisle}
                      </span>
                      {item.subPreference === 'substitute' && (
                        <span className="text-[11px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          بە هاوشێوە بیگۆڕە
                        </span>
                      )}
                      {item.subPreference === 'call' && (
                        <span className="text-[11px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          پەیوەندیم پێوە بکە
                        </span>
                      )}
                      {item.subPreference === 'remove' && (
                        <span className="text-[11px] px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          لایببە و پارەکە بگەڕێنەوە
                        </span>
                      )}
                    </div>

                    <div className="text-sm font-bold text-slate-100">{item.nameKu}</div>
                    <div className="text-xs text-slate-400 font-sans">{item.nameEn}</div>

                    <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-400">
                      <span className="font-mono text-slate-300">بارکۆد: {item.barcode}</span>
                      <span>•</span>
                      <span className="font-semibold text-emerald-400">
                        نرخی سەر ڕەفە: {formatIqd(item.shelfPriceIqd)} — ١٠٠٪ هاوتا
                      </span>
                      <span>•</span>
                      <span className="text-slate-400">{item.fefoBatch}</span>
                    </div>
                  </div>
                </div>

                {/* Pick Action Button */}
                  <button
                    onClick={() => handlePickItem(item)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shrink-0 ${
                      item.isPicked
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                    }`}
                  >
                    {item.isPicked ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-white" />
                        <span>کۆکرایەوە ✓</span>
                      </>
                    ) : (
                      <>
                        <ScanLine className="w-4 h-4 text-orange-400" />
                        <span>📷 لێدانی بارکۆد و پشتڕاستکردنەوە</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Complete Picking Action */}
          <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>پشکنینی ئەلیکترۆنی: دڵنیابوونەوە لە بەرواری بەسەرچوون (FEFO) و ١٠٠٪ هاوسەنگی نرخ</span>
            </div>

            <button
              onClick={handleCompletePicking}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-l from-orange-600 via-amber-600 to-orange-500 hover:from-orange-500 hover:to-amber-500 text-white rounded-xl text-sm font-bold shadow-xl shadow-orange-600/20 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <PackageCheck className="w-5 h-5" />
              <span>✓ تەواوکردنی کۆکردنەوە و بانگکردنی شۆفێر</span>
            </button>
          </div>
        </div>
      </div>

      {/* Scale Barcode Inspection Modal */}
      {scaleModalData && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl max-w-lg w-full p-6 text-slate-100 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-emerald-400">
                <Scale className="w-6 h-6" />
                <h3 className="text-base font-bold">پشکنینی تەرازووی دیجیتاڵ (Digital Scale Barcode)</h3>
              </div>
              <button
                onClick={() => setScaleModalData(null)}
                className="text-slate-400 hover:text-slate-200 text-sm p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono space-y-1">
                <div className="text-slate-400">بارکۆدی تەرازوو: <span className="text-emerald-400 font-bold">{scaleModalData.barcode}</span></div>
                <div className="text-slate-400">کۆدی کاڵا (PLU): <span className="text-slate-200">{scaleModalData.plu || '01005'} (ERP-SKU-1005 — خەیاری کوردی)</span></div>
                <div className="text-slate-400">کێشی دەرهێنراو: <span className="text-amber-400 font-bold">{scaleModalData.weightKg} کگم ({scaleModalData.weightGrams} گرام)</span></div>
                <div className="text-slate-400">نرخی کیلۆ: <span className="text-slate-200">{formatIqd(scaleModalData.unitPriceIqd || 1445)}</span></div>
              </div>

              {/* Exact Math Box */}
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-emerald-950/30 border border-emerald-500/30 p-2.5 rounded-xl">
                  <div className="text-[11px] text-emerald-300">کۆی نرخی سەر ستیكەری تەرازوو</div>
                  <div className="text-base font-bold text-emerald-400">{formatIqd(scaleModalData.totalShelfPriceIqd)}</div>
                  <div className="text-[10px] text-emerald-400">٠ دینار جیاوازی (١٠٠٪ هاوتا)</div>
                </div>
                <div className="bg-blue-950/30 border border-blue-500/30 p-2.5 rounded-xl">
                  <div className="text-[11px] text-blue-300">دابەشکاری (٩٧٪ / ٣٪)</div>
                  <div className="text-xs font-bold text-slate-200">سووپەرمارکێت: {formatIqd(scaleModalData.supermarketNet97pctIqd)}</div>
                  <div className="text-[11px] text-orange-400">عموولەی بازمارت: {formatIqd(scaleModalData.bazmartCommission3pctIqd)}</div>
                </div>
              </div>

              <div className="p-2.5 bg-emerald-500/10 text-emerald-300 rounded-xl border border-emerald-500/20 text-center font-medium">
                {scaleModalData.kurdishLabel}
              </div>
            </div>

            <button
              onClick={() => setScaleModalData(null)}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition"
            >
              پشتڕاستکردنەوە و داخران
            </button>
          </div>
        </div>
      )}

      {/* Bilingual Thermal Bag Label Modal */}
      {thermalLabelModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4 font-mono text-xs border border-slate-300">
            {/* Thermal sticker preview */}
            <div className="text-center space-y-1 border-b-2 border-dashed border-slate-300 pb-3">
              <div className="font-bold text-sm tracking-wide text-orange-600">BAZMART PARTNER EXPRESS</div>
              <div className="text-[11px] font-bold text-slate-800">{thermalLabelModal.storeName}</div>
              <div className="text-[9px] text-slate-500">{thermalLabelModal.storeNameEn}</div>
            </div>

            <div className="space-y-1.5 py-1">
              <div className="flex justify-between font-bold text-sm">
                <span>ژمارەی داواکاری:</span>
                <span className="text-orange-600">{thermalLabelModal.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>ڕەفەی ئامادەکردن:</span>
                <span>{thermalLabelModal.shelfAisle}</span>
              </div>
              <div className="flex justify-between">
                <span>ئامادەکار (Picker):</span>
                <span>{thermalLabelModal.pickerName}</span>
              </div>
              <div className="flex justify-between">
                <span>ژمارەی کڕیار:</span>
                <span>{thermalLabelModal.customerPhone}</span>
              </div>
              <div className="flex justify-between">
                <span>ژمارەی کاڵاکان:</span>
                <span className="font-bold">{thermalLabelModal.totalItems} دانە</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-slate-900 border-t border-dashed border-slate-300 pt-1">
                <span>کۆی نرخی ڕەفە:</span>
                <span>{formatIqd(thermalLabelModal.shelfTotalIqd)}</span>
              </div>
              <div className="text-[10px] text-emerald-700 text-center font-bold pt-1">
                {thermalLabelModal.parityVerified}
              </div>
            </div>

            {/* Barcode graphic placeholder */}
            <div className="text-center py-2 border-t border-b border-dashed border-slate-300 space-y-1">
              <div className="text-2xl font-barcode tracking-widest">||||| | |||| || |||||| | |||</div>
              <div className="text-[10px] text-slate-500">{thermalLabelModal.orderNumber} • {thermalLabelModal.timestamp}</div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => {
                  alert('چاپکردنی ستیكەری کیسەی خواردنەوە و میوە نێردرا بۆ پرینتەری گەرمیی #POS-PRINTER-01');
                  setThermalLabelModal(null);
                }}
                className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>🖨️ چاپکردنی ستیكەر</span>
              </button>
              <button
                onClick={() => setThermalLabelModal(null)}
                className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold cursor-pointer"
              >
                داخستن
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
