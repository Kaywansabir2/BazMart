'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useOps } from '@/components/layout/OpsContext';
import { api } from '@/lib/api';
import { Product } from '@/lib/types';
import { formatIqd, formatNumber } from '@/lib/format';
import { getPhotoKey } from '@/lib/photo-utils';
import {
  Search,
  Filter,
  Tag,
  Percent,
  CheckCircle2,
  RefreshCw,
  Edit,
  X,
  Sparkles,
  Thermometer,
  Layers,
  Package,
} from 'lucide-react';

function CatalogContent() {
  const { activeLanguage } = useOps();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  
  // Quick Promo Editor Modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [promoPercentage, setPromoPercentage] = useState<number>(0);
  const [promoPriceIqd, setPromoPriceIqd] = useState<number>(0);
  const [editTitleEn, setEditTitleEn] = useState('');
  const [editTitleCkb, setEditTitleCkb] = useState('');
  const [editTitleAr, setEditTitleAr] = useState('');
  const [editStorageTemp, setEditStorageTemp] = useState('');
  const [editCostPriceIqd, setEditCostPriceIqd] = useState<number>(0);
  const [editSupplierName, setEditSupplierName] = useState<string>('');
  const [saving, setSaving] = useState(false);

  const fetchCatalog = async () => {
    try {
      setLoading(true);
      const res = await api.getCatalog({
        search: searchQuery,
        categoryId: categoryFilter,
      });
      setProducts(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, [searchQuery, categoryFilter]);

  const openPromoEditor = (product: Product) => {
    setSelectedProduct(product);
    setPromoPercentage(product.discountPercentage || 0);
    setPromoPriceIqd(product.discountedPriceIqd || product.originalPriceIqd);
    setEditTitleEn(product.titleEn);
    setEditTitleCkb(product.titleCkb || '');
    setEditTitleAr(product.titleAr || '');
    setEditStorageTemp(product.storageTemp || 'Ambient');
    setEditCostPriceIqd(product.costPriceIqd || 0);
    setEditSupplierName(product.supplierName || '');
  };

  const handlePercentageChange = (pct: number) => {
    setPromoPercentage(pct);
    if (!selectedProduct) return;
    if (pct > 0) {
      const calculated = Math.round(selectedProduct.originalPriceIqd * (1 - pct / 100));
      setPromoPriceIqd(calculated);
    } else {
      setPromoPriceIqd(selectedProduct.originalPriceIqd);
    }
  };

  const handlePriceChange = (price: number) => {
    setPromoPriceIqd(price);
    if (!selectedProduct) return;
    if (price < selectedProduct.originalPriceIqd && price > 0) {
      const pct = Math.round(
        ((selectedProduct.originalPriceIqd - price) / selectedProduct.originalPriceIqd) * 100
      );
      setPromoPercentage(pct);
    } else {
      setPromoPercentage(0);
    }
  };

  const saveProductChanges = async () => {
    if (!selectedProduct) return;
    try {
      setSaving(true);
      const updated = await api.updateProduct(selectedProduct.id, {
        titleEn: editTitleEn,
        titleCkb: editTitleCkb,
        titleAr: editTitleAr,
        storageTemp: editStorageTemp,
        costPriceIqd: editCostPriceIqd,
        supplierName: editSupplierName,
        discountPercentage: promoPercentage > 0 ? promoPercentage : null,
        discountedPriceIqd: promoPercentage > 0 ? promoPriceIqd : null,
      });

      setProducts((prev) => prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)));
      setSelectedProduct(null);
      alert('Product pricing, cost & metadata updated successfully! Live in mobile app.');
    } catch (err: any) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search SKU, barcode, product name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#FF5A00]"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#FF5A00]"
          >
            <option value="">All Categories</option>
            <option value="cat-milk">Milk & Dairy</option>
            <option value="cat-fruit-veg">Fruit & Veg</option>
            <option value="cat-beverages">Beverages</option>
            <option value="cat-snacks">Snacks & Chocolate</option>
            <option value="cat-stationery">Stationery</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-500">
            Total Synced: {products.length} SKUs
          </span>
          <button
            onClick={fetchCatalog}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-700 flex items-center space-x-1.5 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Catalog Master Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Product / SKU</th>
                <th className="py-3 px-4">Category & Brand</th>
                <th className="py-3 px-4">Origin</th>
                <th className="py-3 px-4">Storage</th>
                <th className="py-3 px-4">Dark Store Stock</th>
                <th className="py-3 px-4">Base Price</th>
                <th className="py-3 px-4">Discount Badge</th>
                <th className="py-3 px-4">Customer Price</th>
                <th className="py-3 px-4">Wholesale Cost</th>
                <th className="py-3 px-4">Unit Profit</th>
                <th className="py-3 px-4">Margin %</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.length > 0 ? (
                products.map((p) => {
                  const totalStock = p.stocks?.reduce((acc, s) => acc + s.stockQuantity, 0) || 0;
                  const hasDiscount = p.discountPercentage && p.discountPercentage > 0;
                  const activePrice = p.discountedPriceIqd || p.originalPriceIqd;
                  const cost = p.costPriceIqd || 0;
                  const unitProfit = activePrice - cost;
                  const marginPct = activePrice > 0 ? Math.round((unitProfit / activePrice) * 1000) / 10 : 0;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center p-0.5">
                            <img
                              src={`/images/products/${getPhotoKey(p.id, p.category?.nameEn)}.png`}
                              alt={p.titleEn}
                              className="w-full h-full object-contain"
                              onError={(e: any) => {
                                e.target.src = '/images/products/grocery_generic.png';
                              }}
                            />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">
                          {activeLanguage === 'ckb'
                            ? p.titleCkb || p.titleEn
                            : activeLanguage === 'ar'
                            ? p.titleAr || p.titleEn
                            : p.titleEn}
                        </div>
                        <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-mono mt-0.5">
                          <span>{p.externalErpId}</span>
                          {p.barcode && <span>• {p.barcode}</span>}
                          <span>• {p.unitText}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800 block">
                          {p.category?.nameEn || 'General'}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {p.brand?.name || 'Unbranded'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                          {p.countryOrigin?.code === 'KRD' ? '☀️ Kurdistan' : p.countryOrigin?.code || 'Local'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[11px] font-medium text-slate-600 flex items-center space-x-1">
                          <Thermometer className="w-3.5 h-3.5 text-blue-500" />
                          <span>{p.storageTemp || 'Ambient'}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                            totalStock < 15
                              ? 'bg-red-100 text-red-700'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {totalStock} units
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-600">
                        {formatIqd(p.originalPriceIqd)}
                      </td>
                      <td className="py-3 px-4">
                        {hasDiscount ? (
                          <span className="bg-[#A4FF00] text-black font-extrabold text-[10px] px-2 py-0.5 rounded shadow-sm">
                            Save {p.discountPercentage}%
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px] font-medium">None</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {hasDiscount ? (
                          <div>
                            <span className="font-extrabold text-slate-900 bg-[#FFF176] px-1 py-0.5 rounded font-mono">
                              {formatIqd(p.discountedPriceIqd)}
                            </span>
                            <span className="block text-[10px] text-slate-400 line-through">
                              {formatIqd(p.originalPriceIqd)}
                            </span>
                          </div>
                        ) : (
                          <span className="font-bold text-slate-900 font-mono">
                            {formatIqd(p.originalPriceIqd)}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-600">
                        {cost > 0 ? formatIqd(cost) : <span className="text-slate-400">—</span>}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold">
                        <span className={unitProfit >= 0 ? 'text-emerald-700' : 'text-red-600'}>
                          {unitProfit >= 0 ? `+${formatIqd(unitProfit)}` : `-${formatIqd(Math.abs(unitProfit))}`}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`font-mono font-extrabold px-2 py-0.5 rounded text-[10px] ${
                            marginPct >= 20
                              ? 'bg-emerald-100 text-emerald-800'
                              : marginPct >= 10
                              ? 'bg-blue-100 text-blue-800'
                              : marginPct >= 0
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {marginPct}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => openPromoEditor(p)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-[#FF5A00] hover:text-white rounded text-xs font-bold transition flex items-center space-x-1 ml-auto text-slate-700"
                        >
                          <Edit className="w-3 h-3" />
                          <span>Promo & Edit</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* QUICK PROMO & PRICE EDITOR MODAL WITH TALABAT MART PREVIEW */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-6 border border-slate-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center space-x-2">
                <Tag className="w-5 h-5 text-[#FF5A00]" />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Promotional Pricing & Metadata Editor
                  </h3>
                  <p className="text-xs text-slate-500 font-medium font-mono">
                    SKU: {selectedProduct.externalErpId}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left: Input Controls */}
              <div className="space-y-4">
                {/* Trilingual Title Editor */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Product Title (English)
                  </label>
                  <input
                    type="text"
                    value={editTitleEn}
                    onChange={(e) => setEditTitleEn(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-[#FF5A00]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1 font-arabic">
                      کوردی (Sorani)
                    </label>
                    <input
                      type="text"
                      value={editTitleCkb}
                      onChange={(e) => setEditTitleCkb(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-medium font-arabic focus:outline-none focus:border-[#FF5A00]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1 font-arabic">
                      عربي (Arabic)
                    </label>
                    <input
                      type="text"
                      value={editTitleAr}
                      onChange={(e) => setEditTitleAr(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-medium font-arabic focus:outline-none focus:border-[#FF5A00]"
                    />
                  </div>
                </div>

                {/* Storage Temp */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Storage Zone / Temperature
                  </label>
                  <select
                    value={editStorageTemp}
                    onChange={(e) => setEditStorageTemp(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#FF5A00]"
                  >
                    <option value="Ambient">Ambient (Room Temp)</option>
                    <option value="Stored at 5°">Chilled (Stored at 5°)</option>
                    <option value="Stored at -18°">Frozen (Stored at -18°)</option>
                  </select>
                </div>

                {/* Discount Percentage Slider */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>Discount Percentage</span>
                    <span className="text-[#FF5A00] font-extrabold">{promoPercentage}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="70"
                    step="5"
                    value={promoPercentage}
                    onChange={(e) => handlePercentageChange(parseInt(e.target.value, 10))}
                    className="w-full accent-[#FF5A00] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-semibold mt-1">
                    <button onClick={() => handlePercentageChange(0)} className="hover:text-slate-800">0%</button>
                    <button onClick={() => handlePercentageChange(10)} className="hover:text-slate-800">10%</button>
                    <button onClick={() => handlePercentageChange(15)} className="hover:text-slate-800">15%</button>
                    <button onClick={() => handlePercentageChange(20)} className="hover:text-slate-800">20%</button>
                    <button onClick={() => handlePercentageChange(30)} className="hover:text-slate-800">30%</button>
                    <button onClick={() => handlePercentageChange(50)} className="hover:text-slate-800">50%</button>
                  </div>
                </div>

                {/* Explicit Price Input */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Final Customer Price (IQD)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={promoPriceIqd}
                      onChange={(e) => handlePriceChange(parseInt(e.target.value || '0', 10))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-14 pr-3 py-1.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-[#FF5A00]"
                    />
                    <span className="absolute left-3 top-2 text-[10px] font-bold text-slate-400">
                      IQD
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Base ERP Price: {formatIqd(selectedProduct.originalPriceIqd)}
                  </span>
                </div>

                {/* Wholesale Landed Cost & Supplier Fields */}
                <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Wholesale Cost (IQD)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={editCostPriceIqd}
                        onChange={(e) => setEditCostPriceIqd(parseInt(e.target.value || '0', 10))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-14 pr-3 py-1.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-[#FF5A00]"
                      />
                      <span className="absolute left-3 top-2 text-[10px] font-bold text-slate-400">
                        IQD
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Supplier / Importer
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Al Rahma Dairy Co."
                      value={editSupplierName}
                      onChange={(e) => setEditSupplierName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-[#FF5A00]"
                    />
                  </div>
                </div>

                {/* Live Profit Margin Calculator */}
                {(() => {
                  const activePrice = promoPriceIqd > 0 ? promoPriceIqd : (selectedProduct.discountedPriceIqd || selectedProduct.originalPriceIqd);
                  const unitProfit = activePrice - editCostPriceIqd;
                  const marginPct = activePrice > 0 ? Math.round((unitProfit / activePrice) * 1000) / 10 : 0;
                  const isBelowCost = editCostPriceIqd > 0 && activePrice < editCostPriceIqd;

                  return (
                    <div className="space-y-2">
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                          <span>Live Unit Margin Calculation</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-extrabold font-mono ${
                              marginPct >= 20
                                ? 'bg-emerald-100 text-emerald-800'
                                : marginPct >= 10
                                ? 'bg-blue-100 text-blue-800'
                                : marginPct >= 0
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {marginPct}% Margin
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                          <div>
                            <span className="text-slate-400 block text-[9px]">SELLING PRICE</span>
                            <span className="font-bold text-slate-900">{formatIqd(activePrice)}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[9px]">UNIT GROSS PROFIT</span>
                            <span className={`font-bold ${unitProfit >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                              {unitProfit >= 0 ? `+${formatIqd(unitProfit)}` : `-${formatIqd(Math.abs(unitProfit))}`}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Loss-Leader / Below-Cost Warning Banner */}
                      {isBelowCost && (
                        <div className="p-2.5 bg-red-50 border border-red-300 rounded-lg text-red-800 text-[11px] font-bold flex items-start space-x-1.5">
                          <span className="text-sm">⚠️</span>
                          <div>
                            <div>BELOW COST LOSS-LEADER WARNING</div>
                            <div className="font-normal text-[10px] text-red-700 mt-0.5">
                              Selling price ({formatIqd(activePrice)}) is less than wholesale cost ({formatIqd(editCostPriceIqd)}). Each unit sold incurs a loss of {formatIqd(Math.abs(unitProfit))}.
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Right: Real-time Talabat Mart Product Card Preview */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col items-center justify-center space-y-3">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-600">
                  <Sparkles className="w-3.5 h-3.5 text-[#FF5A00]" />
                  <span>Talabat Mart Mobile Card Preview</span>
                </div>

                {/* Mock Mobile Product Card */}
                <div className="w-48 bg-white rounded-xl p-3 shadow-md border border-slate-100 relative">
                  {/* Neon Green Discount Badge */}
                  {promoPercentage > 0 && (
                    <div className="absolute top-2 left-2 bg-[#A4FF00] text-black font-extrabold text-[9px] px-1.5 py-0.5 rounded shadow-sm">
                      Save {promoPercentage}%
                    </div>
                  )}

                  {/* Image Surface */}
                  <div className="w-full h-28 bg-[#F8FAFC] rounded-lg border border-slate-200 flex items-center justify-center p-2 mb-2">
                    <img
                      src={`/images/products/${getPhotoKey(selectedProduct.id, selectedProduct.category?.nameEn)}.png`}
                      alt={selectedProduct.titleEn}
                      className="max-h-full max-w-full object-contain"
                      onError={(e: any) => {
                        e.target.src = '/images/products/grocery_generic.png';
                      }}
                    />
                  </div>

                  {/* Price Row */}
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-1.5">
                      <span
                        className={`text-xs font-extrabold text-slate-900 ${
                          promoPercentage > 0 ? 'bg-[#FFF176] px-1 rounded' : ''
                        }`}
                      >
                        {formatIqd(promoPriceIqd)}
                      </span>
                      {promoPercentage > 0 && (
                        <span className="text-[9px] text-slate-400 line-through">
                          {formatIqd(selectedProduct.originalPriceIqd)}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] font-bold text-slate-800 line-clamp-1">
                      {editTitleEn}
                    </p>
                    <p className="text-[9px] text-slate-400">
                      {selectedProduct.unitText} • {editStorageTemp}
                    </p>
                  </div>

                  {/* Mock Add Button */}
                  <div className="mt-2.5 flex justify-end">
                    <div className="w-6 h-6 rounded-lg bg-[#FF5A00] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                      +
                    </div>
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 text-center">
                  Neon Lime (#A4FF00) and Yellow Highlighter (#FFF176) render live in customer app
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end space-x-2 border-t pt-4">
              <button
                onClick={() => setSelectedProduct(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                onClick={saveProductChanges}
                disabled={saving}
                className="px-5 py-2 bg-[#FF5A00] hover:bg-[#E04F00] text-white rounded-lg text-xs font-bold transition shadow-md shadow-orange-500/20 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Apply Live to Mobile App'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CatalogManagerPage() {
  return (
    <DashboardLayout
      title="ERP Catalog, Stock & Promotional Discount Manager"
      subtitle="Manage external ERP synced products, override discount badges & edit trilingual names"
    >
      <CatalogContent />
    </DashboardLayout>
  );
}
