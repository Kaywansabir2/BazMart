'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { api } from '@/lib/api';
import { CampaignBanner } from '@/lib/types';
import {
  Megaphone,
  Plus,
  Layers,
  Sparkles,
  ShoppingBag,
  Trash2,
  Edit,
  Save,
  Check,
  Flame,
  Globe,
  Sliders,
} from 'lucide-react';

export default function CampaignStudioPage() {
  const [campaigns, setCampaigns] = useState<CampaignBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [minOrderThreshold, setMinOrderThreshold] = useState(7000);
  const [isSaved, setIsSaved] = useState(false);

  // New Banner Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitleEn, setNewTitleEn] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newBadgeText, setNewBadgeText] = useState('Hot Deals');
  const [newBgColor, setNewBgColor] = useState('#FF5A00');
  const [newType, setNewType] = useState<'VERTICAL_PROMO_CARD' | 'FULL_WIDTH_BANNER'>('VERTICAL_PROMO_CARD');

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const res = await api.getCampaigns();
      setCampaigns(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleCreateCampaign = async () => {
    if (!newTitleEn) return;
    try {
      const created = await api.createCampaign({
        type: newType,
        titleEn: newTitleEn,
        titleCkb: newTitleEn,
        titleAr: newTitleEn,
        subtitle: newSubtitle,
        badgeText: newBadgeText,
        bgColorHex: newBgColor,
        sortOrder: campaigns.length + 1,
      });
      setCampaigns([...campaigns, created]);
      setIsModalOpen(false);
      setNewTitleEn('');
      setNewSubtitle('');
    } catch (err: any) {
      alert(`Failed to create banner: ${err.message}`);
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    if (!confirm('Are you sure you want to delete this promotional banner?')) return;
    try {
      await api.deleteCampaign(id);
      setCampaigns(campaigns.filter((c) => c.id !== id));
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const handleSaveThreshold = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const promoCards = campaigns.filter((c) => c.type === 'VERTICAL_PROMO_CARD');
  const fullWidthBanners = campaigns.filter((c) => c.type === 'FULL_WIDTH_BANNER' || c.type === 'SPLIT_FRESH_BANNER');

  return (
    <DashboardLayout
      title="Home Screen Campaign & Banner Studio"
      subtitle="Visual layout manager for top vertical promo cards, campaign banners & upsell rules"
    >
      <div className="space-y-6">
        {/* Global Threshold & Upsell Config */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center space-x-2">
              <Sliders className="w-5 h-5 text-[#FF5A00]" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Customer App Checkout Thresholds & Upsell Engine
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Controls minimum order amount and cart upsell suggestions
                </p>
              </div>
            </div>
            <button
              onClick={handleSaveThreshold}
              className="px-4 py-1.5 bg-[#FF5A00] text-white rounded-lg text-xs font-bold hover:bg-[#E04F00] transition flex items-center space-x-1 shadow-sm"
            >
              {isSaved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
              <span>{isSaved ? 'Threshold Active' : 'Save Rules'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Minimum Order Value (IQD)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={minOrderThreshold}
                  onChange={(e) => setMinOrderThreshold(parseInt(e.target.value || '0', 10))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-14 pr-3 py-2 font-bold text-slate-900 focus:outline-none focus:border-[#FF5A00]"
                />
                <span className="absolute left-3 top-2.5 font-bold text-slate-400 text-[10px]">
                  IQD
                </span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Default: IQD 7000 (Prevents low-basket checkout in customer app)
              </span>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                "Frequently Bought Together" Rule
              </label>
              <select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-semibold text-slate-700 focus:outline-none focus:border-[#FF5A00]">
                <option>Smart Co-Occurrence Algorithm (Milk + Cereal + Tea)</option>
                <option>Category Cross-Sell (Fresh Bakery with Dairy)</option>
                <option>Top Savers Bundle</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                "Grab Your Usuals" Cart Upsell
              </label>
              <select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-semibold text-slate-700 focus:outline-none focus:border-[#FF5A00]">
                <option>Previous Order History Re-Order</option>
                <option>Top Essentials (Cucumber, Eggs, Mountain Dew)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 1: Vertical Promo Cards */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center space-x-2">
              <Flame className="w-5 h-5 text-[#FF5A00]" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Top Vertical Promo Cards (Talabat Mart Style)
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Warm cream surface cards with curved orange wave graphic & 4-point sparkle stars
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setNewType('VERTICAL_PROMO_CARD');
                setIsModalOpen(true);
              }}
              className="px-3 py-1.5 bg-slate-100 hover:bg-[#FF5A00] hover:text-white rounded-lg text-xs font-bold transition flex items-center space-x-1 text-slate-700"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Promo Card</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {promoCards.map((card) => (
              <div
                key={card.id}
                className="bg-[#F6F1EB] rounded-2xl p-3 border border-orange-100 relative overflow-hidden flex flex-col justify-between shadow-sm min-h-[140px]"
              >
                <div>
                  <span className="text-[9px] font-extrabold uppercase tracking-wider bg-white/80 text-[#FF5A00] px-1.5 py-0.5 rounded shadow-xs inline-block mb-1">
                    {card.badgeText || 'Hot Deals'}
                  </span>
                  <div className="text-xs font-extrabold text-slate-900 leading-tight">
                    {card.titleEn}
                  </div>
                  {card.subtitle && (
                    <p className="text-[10px] text-slate-500 font-medium mt-0.5">{card.subtitle}</p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 z-10">
                  <span className="text-[9px] font-bold text-slate-400">Order: #{card.sortOrder}</span>
                  <button
                    onClick={() => handleDeleteCampaign(card.id)}
                    className="p-1 text-slate-400 hover:text-red-600 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Orange Wave Graphic Accent */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-6 opacity-80"
                  style={{ backgroundColor: card.bgColorHex || '#FF5A00' }}
                ></div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Full-Width Campaign Banners */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center space-x-2">
              <Megaphone className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Full-Width Mid-Feed Campaign Banners
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Rich hero banners (Pepsi, Nescafe Iced Coffee, Fresh Picks)
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setNewType('FULL_WIDTH_BANNER');
                setIsModalOpen(true);
              }}
              className="px-3 py-1.5 bg-slate-100 hover:bg-[#FF5A00] hover:text-white rounded-lg text-xs font-bold transition flex items-center space-x-1 text-slate-700"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Full-Width Banner</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fullWidthBanners.map((banner) => (
              <div
                key={banner.id}
                className="rounded-xl p-5 text-white flex items-center justify-between relative overflow-hidden shadow-md"
                style={{ backgroundColor: banner.bgColorHex || '#0D47A1' }}
              >
                <div className="space-y-1 z-10">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full inline-block">
                    {banner.badgeText || 'Promo'}
                  </span>
                  <h4 className="text-base font-extrabold tracking-tight">{banner.titleEn}</h4>
                  <p className="text-xs text-white/80">{banner.subtitle}</p>
                </div>

                <button
                  onClick={() => handleDeleteCampaign(banner.id)}
                  className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition z-10"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* MODAL: ADD NEW PROMO CARD / BANNER */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">Create New Campaign Banner</h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Banner Type</label>
                  <select
                    value={newType}
                    onChange={(e: any) => setNewType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-semibold text-slate-700"
                  >
                    <option value="VERTICAL_PROMO_CARD">Vertical Promo Card (Warm Cream)</option>
                    <option value="FULL_WIDTH_BANNER">Full-Width Campaign Banner</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Campaign Headline (EN)</label>
                  <input
                    type="text"
                    placeholder="e.g. Up to 40% off Hot Deals"
                    value={newTitleEn}
                    onChange={(e) => setNewTitleEn(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-bold text-slate-900 focus:outline-none focus:border-[#FF5A00]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Subtitle / Call to Action</label>
                  <input
                    type="text"
                    placeholder="e.g. Shop fresh cuts & save"
                    value={newSubtitle}
                    onChange={(e) => setNewSubtitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:border-[#FF5A00]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Badge Text</label>
                    <input
                      type="text"
                      placeholder="e.g. Hot Deals, Fresh"
                      value={newBadgeText}
                      onChange={(e) => setNewBadgeText(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-bold text-slate-900 focus:outline-none focus:border-[#FF5A00]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Accent Hex Color</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={newBgColor}
                        onChange={(e) => setNewBgColor(e.target.value)}
                        className="w-8 h-8 rounded border-0 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={newBgColor}
                        onChange={(e) => setNewBgColor(e.target.value)}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 font-mono text-[11px]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateCampaign}
                  className="px-5 py-2 bg-[#FF5A00] hover:bg-[#E04F00] text-white rounded-lg text-xs font-bold transition shadow-md shadow-orange-500/20"
                >
                  Publish to App
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

