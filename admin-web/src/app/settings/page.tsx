'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { api } from '@/lib/api';
import { PaymentConfig, Warehouse } from '@/lib/types';
import { formatIqd, formatNumber } from '@/lib/format';
import {
  Settings,
  CreditCard,
  Banknote,
  Store,
  CheckCircle2,
  Lock,
  Save,
  ShieldCheck,
  Check,
  RefreshCw,
  Globe,
  MapPin,
} from 'lucide-react';

export default function SettingsPage() {
  const [payments, setPayments] = useState<PaymentConfig[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [paymentsRes, warehousesRes] = await Promise.all([
        api.getPaymentSettings(),
        api.getWarehouses(),
      ]);
      setPayments(paymentsRes);
      setWarehouses(warehousesRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTogglePayment = async (id: string, currentEnabled: boolean) => {
    try {
      setSavingId(id);
      const newEnabled = !currentEnabled;
      await api.updatePaymentSetting(id, newEnabled);

      setPayments((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isEnabled: newEnabled } : p))
      );

      setSuccessBanner(
        `Payment gateway "${id}" is now ${newEnabled ? 'ENABLED' : 'DISABLED'}. Updated live in customer checkout API!`
      );
      setTimeout(() => setSuccessBanner(null), 4000);
    } catch (err: any) {
      alert(`Toggle failed: ${err.message}`);
    } finally {
      setSavingId(null);
    }
  };

  const handleUpdateWarehouse = async (warehouse: Warehouse, updates: Partial<Warehouse>) => {
    try {
      const updated = await api.updateWarehouse(warehouse.id, updates);
      setWarehouses((prev) =>
        prev.map((w) => (w.id === warehouse.id ? { ...w, ...updated } : w))
      );
      setSuccessBanner(`Warehouse "${warehouse.name}" settings updated.`);
      setTimeout(() => setSuccessBanner(null), 3000);
    } catch (err: any) {
      alert(`Update failed: ${err.message}`);
    }
  };

  return (
    <DashboardLayout
      title="Payment Gateways & Dark Store Branch Settings"
      subtitle="Manage live payment methods, local Iraqi fintech integrations & warehouse geofences"
    >
      <div className="space-y-6">
        {successBanner && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center space-x-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successBanner}</span>
          </div>
        )}

        {/* Section 1: Payment Gateways */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center space-x-2">
              <CreditCard className="w-5 h-5 text-[#FF5A00]" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Payment Gateway Strategy Control
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Toggling any gateway here dynamically updates the Flutter customer checkout screen
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-slate-400">
              Active Strategy: COD Enabled by Default
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 1. Cash on Delivery (COD) */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                    Offline Settlement
                  </span>
                  <h4 className="text-sm font-extrabold text-slate-900 mt-0.5">
                    Cash on Delivery (COD)
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Customer pays cash to the courier upon doorstep receipt.
                  </p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#FF5A00] flex items-center justify-center">
                  <Banknote className="w-4 h-4" />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-600 flex items-center space-x-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>Always Active (Core)</span>
                </span>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-200/80 px-2 py-0.5 rounded">
                  Min IQD 7,000
                </span>
              </div>
            </div>

            {/* 2. FastPay Iraq */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col justify-between space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-600">
                    Kurdistan Mobile Wallet
                  </span>
                  <h4 className="text-sm font-extrabold text-slate-900 mt-0.5">FastPay Iraq</h4>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Direct in-app mobile wallet QR / OTP payment in IQD.
                  </p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xs">
                  FP
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                {payments.find((p) => p.id === 'FASTPAY')?.isEnabled ? (
                  <span className="text-xs font-bold text-emerald-600">Enabled</span>
                ) : (
                  <span className="text-xs font-bold text-slate-400">Disabled</span>
                )}

                <button
                  onClick={() =>
                    handleTogglePayment(
                      'FASTPAY',
                      payments.find((p) => p.id === 'FASTPAY')?.isEnabled || false
                    )
                  }
                  disabled={savingId === 'FASTPAY'}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    payments.find((p) => p.id === 'FASTPAY')?.isEnabled
                      ? 'bg-red-50 text-red-600 hover:bg-red-100'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  {payments.find((p) => p.id === 'FASTPAY')?.isEnabled ? 'Disable' : 'Enable'}
                </button>
              </div>
            </div>

            {/* 3. ZainCash Iraq */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col justify-between space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600">
                    Federal Iraq Wallet
                  </span>
                  <h4 className="text-sm font-extrabold text-slate-900 mt-0.5">ZainCash Iraq</h4>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Iraq's largest mobile money gateway for Baghdad and beyond.
                  </p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                  ZC
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                {payments.find((p) => p.id === 'ZAINCASH')?.isEnabled ? (
                  <span className="text-xs font-bold text-emerald-600">Enabled</span>
                ) : (
                  <span className="text-xs font-bold text-slate-400">Disabled</span>
                )}

                <button
                  onClick={() =>
                    handleTogglePayment(
                      'ZAINCASH',
                      payments.find((p) => p.id === 'ZAINCASH')?.isEnabled || false
                    )
                  }
                  disabled={savingId === 'ZAINCASH'}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    payments.find((p) => p.id === 'ZAINCASH')?.isEnabled
                      ? 'bg-red-50 text-red-600 hover:bg-red-100'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  {payments.find((p) => p.id === 'ZAINCASH')?.isEnabled ? 'Disable' : 'Enable'}
                </button>
              </div>
            </div>

            {/* 4. First Iraqi Bank (FIB) */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col justify-between space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600">
                    Digital Banking
                  </span>
                  <h4 className="text-sm font-extrabold text-slate-900 mt-0.5">
                    First Iraqi Bank (FIB)
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Direct account-to-account zero fee payment gateway.
                  </p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                  FIB
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                {payments.find((p) => p.id === 'FIB')?.isEnabled ? (
                  <span className="text-xs font-bold text-emerald-600">Enabled</span>
                ) : (
                  <span className="text-xs font-bold text-slate-400">Disabled</span>
                )}

                <button
                  onClick={() =>
                    handleTogglePayment(
                      'FIB',
                      payments.find((p) => p.id === 'FIB')?.isEnabled || false
                    )
                  }
                  disabled={savingId === 'FIB'}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    payments.find((p) => p.id === 'FIB')?.isEnabled
                      ? 'bg-red-50 text-red-600 hover:bg-red-100'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  {payments.find((p) => p.id === 'FIB')?.isEnabled ? 'Disable' : 'Enable'}
                </button>
              </div>
            </div>

            {/* 5. Visa / MasterCard / Switch QiCard */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col justify-between space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600">
                    National & Global Cards
                  </span>
                  <h4 className="text-sm font-extrabold text-slate-900 mt-0.5">
                    Cards & QiCard Switch
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Visa, MasterCard, and Iraqi National Switch QiCard.
                  </p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                  CARD
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                {payments.find((p) => p.id === 'CARD')?.isEnabled ? (
                  <span className="text-xs font-bold text-emerald-600">Enabled</span>
                ) : (
                  <span className="text-xs font-bold text-slate-400">Disabled</span>
                )}

                <button
                  onClick={() =>
                    handleTogglePayment(
                      'CARD',
                      payments.find((p) => p.id === 'CARD')?.isEnabled || false
                    )
                  }
                  disabled={savingId === 'CARD'}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    payments.find((p) => p.id === 'CARD')?.isEnabled
                      ? 'bg-red-50 text-red-600 hover:bg-red-100'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  {payments.find((p) => p.id === 'CARD')?.isEnabled ? 'Disable' : 'Enable'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Dark Store Branches */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center space-x-2">
              <Store className="w-5 h-5 text-[#FF5A00]" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Dark Store Branches & Geofence Polygons
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Configure delivery radius, minimum order values, and branch operations
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {warehouses.map((wh) => (
              <div
                key={wh.id}
                className="p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">{wh.name}</h4>
                    <span className="text-xs text-slate-500 font-medium">City: {wh.city}</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      wh.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {wh.isActive ? 'OPERATIONAL' : 'OFFLINE'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-medium">Min Order</span>
                    <span className="font-extrabold text-slate-900 font-mono">
                      {formatIqd(wh.minOrderIqd)}
                    </span>
                  </div>

                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-medium">Delivery Fee</span>
                    <span className="font-extrabold text-slate-900 font-mono">
                      {wh.deliveryFeeIqd === 0 ? 'FREE' : `IQD ${wh.deliveryFeeIqd}`}
                    </span>
                  </div>

                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 block font-medium">Radius</span>
                    <span className="font-extrabold text-slate-900">
                      {wh.deliveryRadiusKm} km
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                  <span className="text-slate-500 text-[11px]">
                    GPS: {wh.latitude}, {wh.longitude}
                  </span>
                  <button
                    onClick={() =>
                      handleUpdateWarehouse(wh, {
                        deliveryFeeIqd: wh.deliveryFeeIqd === 0 ? 1000 : 0,
                      })
                    }
                    className="text-[#FF5A00] font-bold hover:underline text-[11px]"
                  >
                    Toggle Free Delivery Promo
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

