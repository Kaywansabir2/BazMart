'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { api } from '@/lib/api';
import { Coupon } from '@/lib/types';
import { formatIqd, formatNumber, formatDateSafe } from '@/lib/format';
import {
  Ticket,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Percent,
  Banknote,
  Truck,
  X,
  AlertCircle,
} from 'lucide-react';

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // New coupon form state
  const [formData, setFormData] = useState({
    code: '',
    titleEn: '',
    titleCkb: '',
    titleAr: '',
    discountType: 'FIXED_IQD',
    discountValue: 1000,
    maxDiscountIqd: '',
    minOrderSubtotalIqd: 7000,
    firstOrderOnly: false,
    applicableCategoryIds: '',
    excludeDiscountedItems: false,
    usageLimitGlobal: 500,
    usageLimitPerCustomer: 1,
    expiresAt: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
  });

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const data = await api.getCoupons();
      setCoupons(data);
    } catch (err) {
      console.error('Failed to load coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleToggle = async (id: string) => {
    try {
      await api.toggleCoupon(id);
      fetchCoupons();
    } catch (err) {
      console.error('Failed to toggle coupon:', err);
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await api.createCoupon({
        ...formData,
        code: formData.code.trim().toUpperCase(),
        discountValue: Number(formData.discountValue),
        maxDiscountIqd: formData.maxDiscountIqd ? Number(formData.maxDiscountIqd) : null,
        minOrderSubtotalIqd: Number(formData.minOrderSubtotalIqd),
        applicableCategoryIds: formData.applicableCategoryIds.trim() || undefined,
        excludeDiscountedItems: formData.excludeDiscountedItems,
        usageLimitGlobal: formData.usageLimitGlobal ? Number(formData.usageLimitGlobal) : null,
        usageLimitPerCustomer: Number(formData.usageLimitPerCustomer),
        expiresAt: new Date(formData.expiresAt).toISOString(),
      });

      setSuccessMessage(`Coupon "${formData.code.toUpperCase()}" created successfully!`);
      setTimeout(() => setSuccessMessage(null), 4000);
      setIsModalOpen(false);
      setFormData({
        code: '',
        titleEn: '',
        titleCkb: '',
        titleAr: '',
        discountType: 'FIXED_IQD',
        discountValue: 1000,
        maxDiscountIqd: '',
        minOrderSubtotalIqd: 7000,
        firstOrderOnly: false,
        applicableCategoryIds: '',
        excludeDiscountedItems: false,
        usageLimitGlobal: 500,
        usageLimitPerCustomer: 1,
        expiresAt: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
      });
      fetchCoupons();
    } catch (err: any) {
      alert(`Error creating coupon: ${err.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCoupons = coupons.filter(
    (c) =>
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.titleEn.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <DashboardLayout
      title="Coupons & Vouchers"
      subtitle="Configure and audit promotional discount vouchers for Kurdistan Region & Iraq"
    >
      <div className="p-8 space-y-6">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-2 bg-orange-100 text-[#FF5A00] rounded-xl">
                <Ticket className="w-5 h-5" />
              </span>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Discount Coupons & Promo Vouchers
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Configure and audit promotional discount vouchers for Kurdistan Region & Iraq delivery
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={fetchCoupons}
              className="p-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2.5 bg-[#FF5A00] hover:bg-[#E04F00] text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-lg shadow-orange-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Create Promo Code</span>
            </button>
          </div>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center space-x-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Filter and Search Bar */}
        <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="relative w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search code or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-medium focus:outline-none focus:border-[#FF5A00]"
            />
          </div>
          <div className="text-xs font-bold text-slate-500">
            Total Coupons: <span className="text-slate-900 font-extrabold">{coupons.length}</span>
          </div>
        </div>

        {/* Coupons Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-extrabold uppercase text-slate-500 tracking-wider">
                  <th className="py-3.5 px-5">Promo Code</th>
                  <th className="py-3.5 px-5">Discount Type & Value</th>
                  <th className="py-3.5 px-5">Min Basket (IQD)</th>
                  <th className="py-3.5 px-5">Redemptions / Limit</th>
                  <th className="py-3.5 px-5">Expiration Window</th>
                  <th className="py-3.5 px-5 text-right">Status / Toggle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredCoupons.map((coupon) => {
                  const isExpired = new Date(coupon.expiresAt) <= new Date();
                  const usagePercent = coupon.usageLimitGlobal
                    ? Math.min(100, Math.round((coupon.currentUsageCount / coupon.usageLimitGlobal) * 100))
                    : 0;

                  return (
                    <tr key={coupon.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-4 px-5">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-black text-sm bg-orange-100 text-[#FF5A00] px-2.5 py-1 rounded-lg border border-orange-200 tracking-wide">
                            {coupon.code}
                          </span>
                          {coupon.firstOrderOnly && (
                            <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                              New Users
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] font-medium text-slate-600 mt-1">
                          {coupon.titleEn}
                        </div>
                      </td>

                      <td className="py-4 px-5">
                        <div className="flex items-center space-x-1.5">
                          {coupon.discountType === 'PERCENTAGE' && (
                            <span className="inline-flex items-center space-x-1 font-extrabold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg border border-blue-200 text-xs">
                              <Percent className="w-3.5 h-3.5" />
                              <span>{coupon.discountValue}% OFF</span>
                            </span>
                          )}
                          {coupon.discountType === 'FIXED_IQD' && (
                            <span className="inline-flex items-center space-x-1 font-extrabold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg border border-emerald-200 text-xs">
                              <Banknote className="w-3.5 h-3.5" />
                              <span>{formatIqd(coupon.discountValue)} OFF</span>
                            </span>
                          )}
                          {coupon.discountType === 'FREE_DELIVERY' && (
                            <span className="inline-flex items-center space-x-1 font-extrabold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg border border-indigo-200 text-xs">
                              <Truck className="w-3.5 h-3.5" />
                              <span>FREE DELIVERY</span>
                            </span>
                          )}
                        </div>
                        {coupon.maxDiscountIqd && (
                          <span className="text-[10px] text-slate-500 font-medium block mt-1">
                            Cap: {formatIqd(coupon.maxDiscountIqd)}
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-5">
                        <span className="font-bold text-slate-800">
                          {formatIqd(coupon.minOrderSubtotalIqd)}
                        </span>
                      </td>

                      <td className="py-4 px-5">
                        <div className="w-36 space-y-1">
                          <div className="flex items-center justify-between text-[11px] font-bold">
                            <span className="text-slate-800">{coupon.currentUsageCount} used</span>
                            <span className="text-slate-400">
                              {coupon.usageLimitGlobal ? `/ ${coupon.usageLimitGlobal}` : 'Unlimited'}
                            </span>
                          </div>
                          {coupon.usageLimitGlobal && (
                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-[#FF5A00] h-full rounded-full transition-all"
                                style={{ width: `${usagePercent}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-5">
                        <div className="flex items-center space-x-1.5 text-xs font-semibold">
                          <Clock className={`w-3.5 h-3.5 ${isExpired ? 'text-red-500' : 'text-slate-400'}`} />
                          <span className={isExpired ? 'text-red-600 font-bold' : 'text-slate-700'}>
                            {formatDateSafe(coupon.expiresAt)}
                          </span>
                        </div>
                        {isExpired && (
                          <span className="text-[10px] font-bold text-red-500 block mt-0.5">
                            Expired
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-5 text-right">
                        <button
                          onClick={() => handleToggle(coupon.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ml-auto border ${
                            coupon.isActive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          {coupon.isActive ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Active</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5 text-slate-400" />
                              <span>Inactive</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* CREATE COUPON MODAL */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-scaleUp">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center space-x-2">
                  <span className="p-2 bg-orange-100 text-[#FF5A00] rounded-xl">
                    <Sparkles className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">Create Promotional Coupon</h3>
                    <p className="text-[11px] text-slate-500">Configure voucher rules & instant discounts</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateCoupon} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Promo Code</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ERBIL1000"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono font-bold uppercase focus:outline-none focus:border-[#FF5A00]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Discount Type</label>
                    <select
                      value={formData.discountType}
                      onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-[#FF5A00]"
                    >
                      <option value="FIXED_IQD">Fixed IQD Off</option>
                      <option value="PERCENTAGE">Percentage (%) Off</option>
                      <option value="FREE_DELIVERY">Free Delivery</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      {formData.discountType === 'PERCENTAGE' ? 'Discount Percentage (%)' : 'Discount Value (IQD)'}
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.discountValue}
                      onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold focus:outline-none focus:border-[#FF5A00]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Max Cap (IQD, Optional)</label>
                    <input
                      type="number"
                      placeholder="e.g. 5000"
                      value={formData.maxDiscountIqd}
                      onChange={(e) => setFormData({ ...formData, maxDiscountIqd: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold focus:outline-none focus:border-[#FF5A00]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">English Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. IQD 1,000 instant discount on Erbil orders"
                    value={formData.titleEn}
                    onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium focus:outline-none focus:border-[#FF5A00]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Kurdish Sorani (کوردی)</label>
                    <input
                      type="text"
                      dir="rtl"
                      placeholder="١،٠٠٠ د.ع داشکاندنی دەستبەجێ"
                      value={formData.titleCkb}
                      onChange={(e) => setFormData({ ...formData, titleCkb: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium focus:outline-none focus:border-[#FF5A00]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Arabic (عربي)</label>
                    <input
                      type="text"
                      dir="rtl"
                      placeholder="خصم فوري 1,000 د.ع"
                      value={formData.titleAr}
                      onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium focus:outline-none focus:border-[#FF5A00]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Min Order Basket (IQD)</label>
                    <input
                      type="number"
                      required
                      value={formData.minOrderSubtotalIqd}
                      onChange={(e) => setFormData({ ...formData, minOrderSubtotalIqd: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold focus:outline-none focus:border-[#FF5A00]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Expiration Date</label>
                    <input
                      type="date"
                      required
                      value={formData.expiresAt}
                      onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-bold focus:outline-none focus:border-[#FF5A00]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Applicable Categories (Optional)</label>
                  <input
                    type="text"
                    id="applicableCategoryIds"
                    placeholder="e.g. fruit-veg, dairy-eggs (leave empty for all)"
                    value={formData.applicableCategoryIds}
                    onChange={(e) => setFormData({ ...formData, applicableCategoryIds: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium focus:outline-none focus:border-[#FF5A00]"
                  />
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="excludeDiscountedItems"
                      checked={formData.excludeDiscountedItems}
                      onChange={(e) => setFormData({ ...formData, excludeDiscountedItems: e.target.checked })}
                      className="w-4 h-4 text-[#FF5A00] rounded focus:ring-0 cursor-pointer"
                    />
                    <label htmlFor="excludeDiscountedItems" className="text-xs font-bold text-slate-700 cursor-pointer">
                      Exclude Already-Discounted Items (Prevent Double Discounts)
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="firstOrderOnly"
                      checked={formData.firstOrderOnly}
                      onChange={(e) => setFormData({ ...formData, firstOrderOnly: e.target.checked })}
                      className="w-4 h-4 text-[#FF5A00] rounded focus:ring-0 cursor-pointer"
                    />
                    <label htmlFor="firstOrderOnly" className="text-xs font-bold text-slate-700 cursor-pointer">
                      New Customers Only (1st Order)
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-[#FF5A00] hover:bg-[#E04F00] text-white rounded-xl text-xs font-bold transition shadow-lg shadow-orange-500/20 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving...' : 'Publish Coupon'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
