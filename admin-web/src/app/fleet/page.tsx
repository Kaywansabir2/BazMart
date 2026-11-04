'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useOps } from '@/components/layout/OpsContext';
import { api } from '@/lib/api';
import { Driver } from '@/lib/types';
import { formatIqd, formatNumber } from '@/lib/format';
import {
  Bike,
  Truck,
  Banknote,
  CheckCircle2,
  Phone,
  Plus,
  RefreshCw,
  Search,
  ExternalLink,
  Receipt,
  X,
} from 'lucide-react';

function FleetContent() {
  const { selectedWarehouse } = useOps();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [settlingDriverId, setSettlingDriverId] = useState<string | null>(null);
  const [settlementReceipt, setSettlementReceipt] = useState<any | null>(null);

  // New Driver Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newPhone, setNewPhone] = useState('+964 750 ');
  const [newVehicle, setNewVehicle] = useState('Motorcycle');
  const [newPlate, setNewPlate] = useState('KR-ERB-');
  const [newWarehouseId, setNewWarehouseId] = useState('erbil-central-darkstore');

  const fetchDrivers = async (warehouseId?: string) => {
    try {
      setLoading(true);
      const res = await api.getDrivers(warehouseId === 'all' ? undefined : warehouseId);
      setDrivers(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers(selectedWarehouse);
  }, [selectedWarehouse]);

  const handleSettleCash = async (driver: Driver) => {
    if (driver.cashInHandIqd === 0) {
      alert(`${driver.fullName} currently has IQD 0 cash in hand.`);
      return;
    }
    if (
      !confirm(
        `Are you sure you want to reconcile and settle ${formatIqd(driver.cashInHandIqd)} collected by ${driver.fullName}?`
      )
    )
      return;

    try {
      setSettlingDriverId(driver.id);
      const receipt = await api.settleDriverCash(driver.id);
      setSettlementReceipt(receipt);
      setDrivers((prev) =>
        prev.map((d) => (d.id === driver.id ? { ...d, cashInHandIqd: 0 } : d))
      );
    } catch (err: any) {
      alert(`Settlement failed: ${err.message}`);
    } finally {
      setSettlingDriverId(null);
    }
  };

  const handleCreateDriver = async () => {
    if (!newFullName || !newPlate) return;
    try {
      const created = await api.createDriver({
        fullName: newFullName,
        phone: newPhone,
        vehicleType: newVehicle,
        plateNumber: newPlate,
        warehouseId: newWarehouseId,
      });
      setDrivers([...drivers, created]);
      setIsModalOpen(false);
      setNewFullName('');
    } catch (err: any) {
      alert(`Failed to add rider: ${err.message}`);
    }
  };

  const totalCashInField = drivers.reduce((acc, d) => acc + d.cashInHandIqd, 0);

  return (
    <div className="space-y-6">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Total Active Couriers
            </span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">
              {drivers.length} Riders
            </div>
            <span className="text-xs text-emerald-600 font-semibold mt-0.5 block">
              100% Dedicated BazMart Fleet
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF5A00] flex items-center justify-center">
            <Bike className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Total COD Cash in Field
            </span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">
              {formatIqd(totalCashInField)}
            </div>
            <span className="text-xs text-amber-600 font-semibold mt-0.5 block">
              Awaiting shift handover to cashier
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Banknote className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Driver Companion Portal
            </span>
            <Link
              href="/driver-portal"
              target="_blank"
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#FF5A00] hover:underline mt-2"
            >
              <span>Launch Mobile Rider View</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <span className="text-[10px] text-slate-400 block mt-1">
              Used on couriers' smartphones
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Truck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Drivers & Cash Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Dedicated Dark Store Courier Roster
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Shift status, active delivery, and physical cash ledger
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => fetchDrivers(selectedWarehouse)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-700 flex items-center space-x-1.5 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-3 py-1.5 bg-[#FF5A00] hover:bg-[#E04F00] text-white rounded-lg text-xs font-bold transition flex items-center space-x-1 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register New Rider</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Courier Name</th>
                <th className="py-3 px-4">Phone / Contact</th>
                <th className="py-3 px-4">Vehicle & Plate</th>
                <th className="py-3 px-4">Dark Store</th>
                <th className="py-3 px-4">Fleet Status</th>
                <th className="py-3 px-4">Current Order</th>
                <th className="py-3 px-4">COD Cash in Hand</th>
                <th className="py-3 px-4 text-right">Cashier Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {drivers.map((drv) => (
                <tr key={drv.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    <div>{drv.fullName}</div>
                    <div className="flex items-center space-x-1 mt-0.5">
                      <span className="text-amber-500 font-extrabold text-[11px]">
                        ★ {drv.averageRating ? drv.averageRating.toFixed(1) : '4.9'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        ({drv.totalRatingsCount ?? 14} reviews)
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-600 font-mono">
                    {drv.phone}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-800 block">
                      {drv.vehicleType}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {drv.plateNumber}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-600">
                    {drv.warehouseName || 'Erbil Central'}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        drv.status === 'AVAILABLE'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : drv.status === 'BUSY_DELIVERING'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {drv.status === 'BUSY_DELIVERING' ? 'Delivering' : drv.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    {drv.activeOrder ? (
                      <Link
                        href="/orders"
                        className="font-mono font-bold text-[#FF5A00] hover:underline"
                      >
                        #{drv.activeOrder.orderNumber} ({formatIqd(drv.activeOrder.totalIqd)})
                      </Link>
                    ) : (
                      <span className="text-slate-400 text-[11px]">Idle / Standby</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">
                    <span
                      className={`px-2 py-1 rounded-lg ${
                        drv.cashInHandIqd > 0
                          ? 'bg-amber-100 text-amber-900 font-extrabold'
                          : 'text-slate-400'
                      }`}
                    >
                      {formatIqd(drv.cashInHandIqd)}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleSettleCash(drv)}
                      disabled={drv.cashInHandIqd === 0 || settlingDriverId === drv.id}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition disabled:opacity-40 disabled:hover:bg-emerald-600"
                    >
                      {settlingDriverId === drv.id ? 'Settling...' : 'Settle Cash'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SETTLEMENT RECEIPT MODAL */}
      {settlementReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4 border border-slate-200 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Cash Handover Reconciled
              </h3>
              <p className="text-xs text-slate-500 font-medium font-mono mt-0.5">
                Receipt: {settlementReceipt.receiptNumber}
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Rider Name:</span>
                <span className="font-bold text-slate-900">{settlementReceipt.driverName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount Settled:</span>
                <span className="font-extrabold text-emerald-700">
                  {formatIqd(settlementReceipt.settledAmountIqd)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Remaining Balance:</span>
                <span className="font-mono text-slate-900">IQD 0</span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 pt-1 border-t">
                <span>Timestamp:</span>
                <span>{new Date(settlementReceipt.settledAt).toLocaleTimeString()}</span>
              </div>
            </div>

            <button
              onClick={() => setSettlementReceipt(null)}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition"
            >
              Close & Print Voucher
            </button>
          </div>
        </div>
      )}

      {/* REGISTER NEW DRIVER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-bold text-slate-900">Register New Fleet Courier</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Heja Kamaran"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-bold text-slate-900 focus:outline-none focus:border-[#FF5A00]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Phone Number (+964)</label>
                <input
                  type="text"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-mono text-slate-900 focus:outline-none focus:border-[#FF5A00]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Vehicle Type</label>
                  <select
                    value={newVehicle}
                    onChange={(e) => setNewVehicle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-semibold text-slate-700"
                  >
                    <option value="Motorcycle">Motorcycle</option>
                    <option value="Refrigerated Van">Refrigerated Van</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Plate Number</label>
                  <input
                    type="text"
                    value={newPlate}
                    onChange={(e) => setNewPlate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-mono text-slate-900 focus:outline-none focus:border-[#FF5A00]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Assigned Dark Store</label>
                <select
                  value={newWarehouseId}
                  onChange={(e) => setNewWarehouseId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-semibold text-slate-700"
                >
                  <option value="erbil-central-darkstore">Erbil Central Dark Store</option>
                  <option value="suly-main-darkstore">Sulaymaniyah Main Dark Store</option>
                </select>
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
                onClick={handleCreateDriver}
                className="px-5 py-2 bg-[#FF5A00] hover:bg-[#E04F00] text-white rounded-lg text-xs font-bold transition shadow-md shadow-orange-500/20"
              >
                Register Courier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FleetManagementPage() {
  return (
    <DashboardLayout
      title="In-House Delivery Fleet & COD Cash Reconciliation"
      subtitle="Monitor dedicated dark store couriers, track live orders & balance shift cash in IQD"
    >
      <FleetContent />
    </DashboardLayout>
  );
}
