'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useOps } from '@/components/layout/OpsContext';
import { api } from '@/lib/api';
import { Order, Driver } from '@/lib/types';
import { formatIqd, formatNumber, formatDateSafe } from '@/lib/format';
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Bike,
  Printer,
  MapPin,
  Phone,
  User,
  X,
  RefreshCw,
  Barcode,
  Thermometer,
  Banknote,
  ExternalLink,
  Star,
} from 'lucide-react';

function parseAddress(o?: Order | null): { neighborhood: string; city: string; street?: string; building?: string; landmark?: string; latitude?: number; longitude?: number } {
  if (!o) return { neighborhood: 'Gulan', city: 'Erbil', street: '', building: '', landmark: '', latitude: 36.1911, longitude: 44.0092 };
  if (o.customerAddress && typeof o.customerAddress === 'object') return o.customerAddress;
  if (typeof o.addressSnapshot === 'string') {
    try {
      const parsed = JSON.parse(o.addressSnapshot);
      if (parsed && typeof parsed === 'object') return parsed;
    } catch {}
  }
  if (o.addressSnapshot && typeof o.addressSnapshot === 'object') return o.addressSnapshot as any;
  return { neighborhood: 'Gulan', city: 'Erbil', street: '', building: '', landmark: '', latitude: 36.1911, longitude: 44.0092 };
}

function OrdersContent() {
  const { selectedWarehouse, activeLanguage } = useOps();
  const [orders, setOrders] = useState<Order[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Drawer & Modal state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [packedItemIds, setPackedItemIds] = useState<string[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [thermalReceipt, setThermalReceipt] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Step 15 Dark Store Picker Item Substitution
  const [substituteItem, setSubstituteItem] = useState<any>(null);
  const [substitutionAction, setSubstitutionAction] = useState<'REMOVE_AND_REFUND' | 'REPLACE_BEST_MATCH'>('REMOVE_AND_REFUND');
  const [substitutionReason, setSubstitutionReason] = useState('Damaged packaging / stock-out during picking');
  const [substitutionNotice, setSubstitutionNotice] = useState<string | null>(null);
  const [isSubmittingSubstitution, setIsSubmittingSubstitution] = useState(false);

  const handleExecuteSubstitution = async () => {
    if (!selectedOrder || !substituteItem) return;
    setIsSubmittingSubstitution(true);
    try {
      await api.substituteOrRemoveOrderItem(selectedOrder.id, substituteItem.id, {
        action: substitutionAction,
        replacementProductId: 'ERP-SKU-1005',
        reason: substitutionReason,
      });
      setSubstitutionNotice(`✓ Action logged in immutable audit trail for #${selectedOrder.orderNumber}`);
      await fetchOrders(selectedWarehouse);
      setSubstituteItem(null);
    } catch (e: any) {
      alert('Error updating order item: ' + e.message);
    } finally {
      setIsSubmittingSubstitution(false);
    }
  };

  const fetchOrders = async (warehouseId?: string) => {
    try {
      setLoading(true);
      const [ordersRes, driversRes] = await Promise.all([
        api.getOrders({
          status: statusFilter,
          warehouseId: warehouseId === 'all' ? undefined : warehouseId,
          paymentMethod: paymentFilter,
          search: searchQuery,
        }),
        api.getDrivers(warehouseId === 'all' ? undefined : warehouseId),
      ]);
      setOrders(ordersRes);
      setDrivers(driversRes);

      // Refresh selected order if open
      if (selectedOrder) {
        const refreshed = ordersRes.find((o) => o.id === selectedOrder.id);
        if (refreshed) {
          setSelectedOrder(refreshed);
          setPackedItemIds(refreshed.packedItemIds || []);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(selectedWarehouse);
    const timer = setInterval(() => fetchOrders(selectedWarehouse), 8000);
    return () => clearInterval(timer);
  }, [statusFilter, paymentFilter, searchQuery, selectedWarehouse]);

  const openDrawer = (order: Order) => {
    setSelectedOrder(order);
    setPackedItemIds(order.packedItemIds || []);
    setSelectedDriverId(order.driverId || '');
  };

  const closeDrawer = () => {
    setSelectedOrder(null);
    setPackedItemIds([]);
    setThermalReceipt(null);
  };

  const toggleItemPacked = async (productId: string) => {
    if (!selectedOrder) return;
    const isPacked = packedItemIds.includes(productId);
    const updatedPacked = isPacked
      ? packedItemIds.filter((id) => id !== productId)
      : [...packedItemIds, productId];

    setPackedItemIds(updatedPacked);

    const isAllPacked = selectedOrder.items.every((item) =>
      updatedPacked.includes(item.productId)
    );

    try {
      setIsUpdating(true);
      const updated = await api.markOrderPacking(selectedOrder.id, updatedPacked, isAllPacked);
      setSelectedOrder(updated);
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAssignDriver = async () => {
    if (!selectedOrder || !selectedDriverId) return;
    try {
      setIsUpdating(true);
      const updated = await api.assignOrderToDriver(selectedOrder.id, selectedDriverId);
      setSelectedOrder(updated);
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      alert(`Order #${updated.orderNumber} assigned to driver successfully!`);
    } catch (err: any) {
      alert(`Assignment failed: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePrintReceipt = async () => {
    if (!selectedOrder) return;
    try {
      const res = await api.getThermalReceipt(selectedOrder.id);
      setThermalReceipt(res.asciiReceipt);
    } catch (err: any) {
      alert(`Failed to generate receipt: ${err.message}`);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PLACED':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
            PLACED
          </span>
        );
      case 'PACKING_IN_DARKSTORE':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800 border border-blue-300 animate-pulse">
            PACKING
          </span>
        );
      case 'READY_FOR_PICKUP':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 text-indigo-800 border border-indigo-300">
            READY FOR PICKUP
          </span>
        );
      case 'OUT_FOR_DELIVERY':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-800 border border-purple-300">
            OUT FOR DELIVERY
          </span>
        );
      case 'DELIVERED':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
            DELIVERED
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-800">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search order #, address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#FF5A00]"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg text-xs font-bold text-slate-600">
            {['ALL', 'PLACED', 'PACKING_IN_DARKSTORE', 'OUT_FOR_DELIVERY', 'DELIVERED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded transition ${
                  statusFilter === st
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'hover:text-slate-900'
                }`}
              >
                {st === 'ALL'
                  ? 'All'
                  : st === 'PACKING_IN_DARKSTORE'
                  ? 'Packing'
                  : st === 'OUT_FOR_DELIVERY'
                  ? 'Delivering'
                  : st}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => fetchOrders(selectedWarehouse)}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-700 flex items-center space-x-1.5 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Queue</span>
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Dark Store</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Items / Scan</th>
                <th className="py-3 px-4">Delivery Address</th>
                <th className="py-3 px-4">Total (IQD)</th>
                <th className="py-3 px-4">Assigned Driver</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.length > 0 ? (
                orders.map((o) => (
                  <tr
                    key={o.id}
                    onClick={() => openDrawer(o)}
                    className="hover:bg-orange-50/40 cursor-pointer transition"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      #{o.orderNumber}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-600">
                      {o.warehouseName || 'Erbil Central'}
                    </td>
                    <td className="py-3.5 px-4">{getStatusBadge(o.orderStatus)}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900">
                        {o.items.length} items
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {o.isPacked ? (
                          <span className="text-emerald-600 font-semibold flex items-center space-x-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>100% Packed</span>
                          </span>
                        ) : (
                          `${o.packedItemIds?.length || 0}/${o.items.length} packed`
                        )}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-600 truncate max-w-xs">
                      {parseAddress(o).neighborhood || 'N/A'}, {parseAddress(o).city || ''}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {formatIqd(o.totalIqd)}
                      <span className="text-[10px] font-normal text-slate-500 block">
                        {o.paymentMethod} ({o.paymentStatus})
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {o.assignedDriverName ? (
                        <div className="flex items-center space-x-1 text-slate-800">
                          <Bike className="w-3.5 h-3.5 text-[#FF5A00]" />
                          <span className="font-semibold">{o.assignedDriverName}</span>
                        </div>
                      ) : (
                        <span className="text-amber-600 font-bold text-[11px]">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openDrawer(o);
                        }}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-[#FF5A00] hover:text-white rounded text-xs font-bold transition text-slate-700"
                      >
                        Dispatch &rarr;
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No orders matching current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FULFILLMENT DRAWER MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 overflow-hidden">
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-extrabold text-lg text-slate-900">
                    #{selectedOrder.orderNumber}
                  </span>
                  {getStatusBadge(selectedOrder.orderStatus)}
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Dark Store Fulfillment & Picker Checklist
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePrintReceipt}
                  className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition"
                  title="Print Thermal Invoice"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={closeDrawer}
                  className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Customer & Address Card */}
              {(() => {
                const addr = parseAddress(selectedOrder);
                return (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                      <span className="flex items-center space-x-1.5">
                        <User className="w-3.5 h-3.5 text-[#FF5A00]" />
                        <span>Customer Delivery Address</span>
                      </span>
                      <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                        {selectedOrder.estimatedDeliveryMinutes}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 space-y-1">
                      <div className="flex items-center space-x-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>
                          {addr.neighborhood || 'Central'}, {addr.city || 'Erbil'}
                          {addr.building ? ` • ${addr.building}` : ''}
                          {addr.street ? ` ${addr.street}` : ''}
                        </span>
                      </div>
                      {addr.landmark && (
                        <p className="text-[11px] text-slate-500 pl-5">
                          Landmark: {addr.landmark}
                        </p>
                      )}
                      {addr.latitude && (
                        <a
                          href={`https://maps.google.com/?q=${addr.latitude},${addr.longitude}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1 text-[11px] text-[#FF5A00] font-bold hover:underline pl-5 pt-0.5"
                        >
                          <span>Open GPS Coordinates</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Financial Summary Banner */}
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-orange-900 uppercase tracking-wider block">
                      Payment Due on Delivery
                    </span>
                    <div className="text-xl font-extrabold text-slate-900">
                      {formatIqd(selectedOrder.totalIqd)}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-extrabold px-2.5 py-1 bg-white border border-orange-200 text-[#FF5A00] rounded-lg shadow-sm">
                      {selectedOrder.paymentMethod}
                    </span>
                    <span className="text-[10px] text-orange-700 font-medium block mt-1">
                      {selectedOrder.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Applied Coupon Line */}
                {selectedOrder.couponCode && (
                  <div className="pt-2 border-t border-orange-200/70 flex items-center justify-between text-xs">
                    <span className="text-emerald-700 font-bold flex items-center space-x-1">
                      <span>🎟️ Coupon Applied:</span>
                      <span className="font-mono bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded uppercase">
                        {selectedOrder.couponCode}
                      </span>
                    </span>
                    <span className="font-extrabold text-emerald-700">
                      - {formatIqd(selectedOrder.couponDiscountIqd || 0)}
                    </span>
                  </div>
                )}
              </div>

              {/* Talabat Mart Customer Preferences & Breakdown Card */}
              <div className="p-3.5 bg-slate-800/80 border border-slate-700/80 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-300 font-bold border-b border-slate-700 pb-2">
                  <span className="flex items-center space-x-1.5">
                    <span>⚡</span>
                    <span>Talabat Mart Delivery & Item Rules</span>
                  </span>
                  <span className="text-[10px] bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded font-mono">
                    {selectedOrder.unavailableItemPreference === 'CALL_ME'
                      ? '📞 Call Customer'
                      : selectedOrder.unavailableItemPreference === 'REMOVE_AND_REFUND_ITEM'
                      ? '❌ Remove & Refund'
                      : '🔄 Replace with Best Match'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  <div>
                    <span className="text-slate-400 block">Rider Tip:</span>
                    <span className="font-bold text-amber-400">
                      + {formatIqd(selectedOrder.riderTipIqd || 0)} (100% to Driver)
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Drop-off Rule:</span>
                    <span className="font-medium text-slate-200">
                      {typeof selectedOrder.deliveryDropoffOptions === 'object' && (selectedOrder.deliveryDropoffOptions as any)?.leaveAtDoor
                        ? '🚪 Leave at door (Do not ring)'
                        : '🤝 Hand to customer'}
                    </span>
                  </div>
                </div>

                {selectedOrder.walletAmountUsedIqd && selectedOrder.walletAmountUsedIqd > 0 ? (
                  <div className="mt-2 pt-2 border-t border-slate-700/60 flex items-center justify-between font-mono text-[11px]">
                    <span className="text-emerald-400">💳 BazMart Wallet Paid:</span>
                    <span className="font-bold text-emerald-400">
                      - {formatIqd(selectedOrder.walletAmountUsedIqd)}
                    </span>
                  </div>
                ) : null}

                <div className="flex items-center justify-between font-mono text-[11px]">
                  <span className="text-slate-300 font-semibold">Net COD Cash To Collect:</span>
                  <span className="font-black text-amber-400 text-xs">
                    {formatIqd(selectedOrder.netCodPayableIqd ?? (selectedOrder.totalIqd - (selectedOrder.walletAmountUsedIqd || 0)))}
                  </span>
                </div>
              </div>

              {/* Order Profitability Card (Admin Confidential) */}
              <div className="p-4 bg-slate-900 text-white rounded-xl space-y-3 shadow-lg border border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs">💼</span>
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-200">
                      Order Profitability (Admin Only)
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-extrabold font-mono px-2 py-0.5 rounded ${
                      (selectedOrder.netProfitIqd || 0) >= 0
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-red-500/20 text-red-300 border border-red-500/30'
                    }`}
                  >
                    {selectedOrder.profitMarginPercentage !== undefined
                      ? `${selectedOrder.profitMarginPercentage}% Margin`
                      : selectedOrder.totalIqd > 0
                      ? `${Math.round(((selectedOrder.netProfitIqd || 0) / selectedOrder.totalIqd) * 1000) / 10}% Margin`
                      : '0%'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-slate-800/80 rounded-lg">
                    <span className="text-[10px] text-slate-400 block uppercase">Wholesale COGS</span>
                    <span className="font-mono font-bold text-slate-200">
                      {formatIqd(selectedOrder.totalCogsIqd || 0)}
                    </span>
                  </div>
                  <div className="p-2 bg-slate-800/80 rounded-lg">
                    <span className="text-[10px] text-slate-400 block uppercase">Gross Profit</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {formatIqd((selectedOrder.subtotalIqd || 0) - (selectedOrder.totalCogsIqd || 0))}
                    </span>
                  </div>
                  <div className="p-2 bg-slate-800/80 rounded-lg">
                    <span className="text-[10px] text-slate-400 block uppercase">Driver Payout</span>
                    <span className="font-mono font-bold text-amber-400">
                      - {formatIqd(((selectedOrder as any).driverDeliveryPayoutIqd || selectedOrder.driverPayoutIqd || 1500))}
                    </span>
                  </div>
                  <div className="p-2 bg-slate-800/80 rounded-lg">
                    <span className="text-[10px] text-slate-400 block uppercase">Net Operating Profit</span>
                    <span
                      className={`font-mono font-extrabold ${
                        (selectedOrder.netProfitIqd || 0) >= 0 ? 'text-emerald-300' : 'text-red-400'
                      }`}
                    >
                      {(selectedOrder.netProfitIqd || 0) >= 0 ? '+' : ''}
                      {formatIqd(selectedOrder.netProfitIqd || 0)}
                    </span>
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 flex items-center justify-between border-t border-slate-800 pt-2 font-mono">
                  <span>Customer Paid: {formatIqd(selectedOrder.totalIqd)}</span>
                  <span>Ledger #FIN-{selectedOrder.orderNumber.replace('ORD-', '')}</span>
                </div>
              </div>

              {/* Picker Checklist */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                    <Barcode className="w-4 h-4 text-[#FF5A00]" />
                    <span>Dark Store Picker Checklist ({selectedOrder.items.length})</span>
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    {packedItemIds.length} / {selectedOrder.items.length} Packed
                  </span>
                </div>

                <div className="space-y-2">
                  {selectedOrder.items.map((item) => {
                    const isPacked = packedItemIds.includes(item.productId);
                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleItemPacked(item.productId)}
                        className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                          isPacked
                            ? 'bg-emerald-50/60 border-emerald-300'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={isPacked}
                            onChange={() => {}}
                            className="w-4 h-4 text-[#FF5A00] rounded focus:ring-0 cursor-pointer"
                          />
                          <div>
                            <div className={`text-xs font-bold ${isPacked ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                              {activeLanguage === 'ckb'
                                ? item.titleCkb || item.titleEn
                                : activeLanguage === 'ar'
                                ? item.titleAr || item.titleEn
                                : item.titleEn}
                            </div>
                            <div className="flex items-center space-x-2 text-[10px] text-slate-500 mt-0.5">
                              <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">
                                {item.barcode || 'NO-BARCODE'}
                              </span>
                              <span className="flex items-center space-x-0.5 text-blue-600 font-medium">
                                <Thermometer className="w-3 h-3" />
                                <span>{item.storageTemp || 'Ambient'}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-extrabold text-slate-900 block">
                            {item.quantity}x
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">
                            {formatIqd(item.totalIqd)}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSubstituteItem(item);
                            }}
                            className="mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition"
                          >
                            {activeLanguage === 'ckb' ? '⚠ جێگرتنەوە' : '⚠ Substitute'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Post-Delivery Customer Rating & Feedback Card */}
              {(selectedOrder as any).rating && (
                <div className="p-4 bg-amber-50/80 rounded-xl border border-amber-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-amber-900 flex items-center space-x-1.5">
                      <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                      <span>Customer Evaluation</span>
                    </span>
                    <span className="text-xs font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-full">
                      Verified Review
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 bg-white rounded-lg border border-amber-100">
                      <div className="text-[10px] text-slate-500 font-bold uppercase">Store & Items</div>
                      <div className="text-amber-500 font-black text-sm mt-0.5">
                        {(selectedOrder as any).rating.overallStoreStars}.0 ★
                      </div>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-amber-100">
                      <div className="text-[10px] text-slate-500 font-bold uppercase">Courier Delivery</div>
                      <div className="text-amber-500 font-black text-sm mt-0.5">
                        {(selectedOrder as any).rating.driverStars}.0 ★
                      </div>
                    </div>
                  </div>

                  {(selectedOrder as any).rating.feedbackTags && (selectedOrder as any).rating.feedbackTags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {(selectedOrder as any).rating.feedbackTags.map((tag: string, idx: number) => (
                        <span key={idx} className="bg-white border border-amber-200 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {(selectedOrder as any).rating.comment && (
                    <div className="p-2.5 bg-white border border-amber-200 rounded-lg text-slate-800 text-xs italic">
                      &ldquo;{(selectedOrder as any).rating.comment}&rdquo;
                    </div>
                  )}
                </div>
              )}

              {/* Driver Assignment Section */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                    <Bike className="w-4 h-4 text-[#FF5A00]" />
                    <span>Assign In-House Driver</span>
                  </span>
                  {selectedOrder.assignedDriverName && (
                    <span className="text-xs font-bold text-emerald-600">
                      Active: {selectedOrder.assignedDriverName}
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <select
                    value={selectedDriverId}
                    onChange={(e) => setSelectedDriverId(e.target.value)}
                    className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#FF5A00]"
                  >
                    <option value="">-- Select In-House Rider --</option>
                    {drivers.map((drv) => (
                      <option key={drv.id} value={drv.id}>
                        {drv.fullName} ({drv.vehicleType} • {drv.status} • Cash: {formatIqd(drv.cashInHandIqd)})
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleAssignDriver}
                    disabled={!selectedDriverId || isUpdating}
                    className="px-4 py-2 bg-[#FF5A00] hover:bg-[#E04F00] text-white rounded-lg text-xs font-bold transition disabled:opacity-50"
                  >
                    Assign Rider
                  </button>
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                onClick={handlePrintReceipt}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition"
              >
                <Printer className="w-4 h-4" />
                <span>Print Thermal Invoice</span>
              </button>
              <button
                onClick={closeDrawer}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition"
              >
                Done / Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* THERMAL INVOICE MODAL */}
      {thermalReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-5 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center space-x-2">
                <Printer className="w-5 h-5 text-[#FF5A00]" />
                <h3 className="font-bold text-slate-900 text-sm">Thermal Invoice Preview (IQD)</h3>
              </div>
              <button
                onClick={() => setThermalReceipt(null)}
                className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <pre className="bg-slate-900 text-emerald-400 p-4 rounded-lg font-mono text-[11px] overflow-x-auto leading-relaxed max-h-96">
              {thermalReceipt}
            </pre>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-[#FF5A00] text-white rounded-lg text-xs font-bold hover:bg-[#E04F00] transition"
              >
                Print Invoice
              </button>
              <button
                onClick={() => setThermalReceipt(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 15 ITEM SUBSTITUTION & OUT-OF-STOCK MODAL */}
      {substituteItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-5 border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Barcode className="w-5 h-5 text-[#FF5A00]" />
                <h3 className="font-extrabold text-slate-900 text-sm">
                  {activeLanguage === 'ckb' ? 'جێگرتنەوەی کاڵای نەماو لە دارکستۆر' : 'Item Substitution & Out-of-Stock Resolution'}
                </h3>
              </div>
              <button
                onClick={() => setSubstituteItem(null)}
                className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Item Card */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {activeLanguage === 'ckb' ? 'کاڵای دیاریکراو' : 'Target Item'}
              </span>
              <div className="font-bold text-slate-900 text-sm">
                {substituteItem.titleEn || substituteItem.titleCkb || 'Selected Item'}
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                <span>{substituteItem.barcode || 'SKU'}</span>
                <span className="font-bold text-[#FF5A00]">
                  {formatIqd(substituteItem.totalIqd)}
                </span>
              </div>
            </div>

            {/* Substitution Action Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                {activeLanguage === 'ckb' ? 'هەڵبژاردنی چارەسەر:' : 'Resolution Action:'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSubstitutionAction('REMOVE_AND_REFUND')}
                  className={`p-3 rounded-xl border text-xs font-bold text-center transition ${
                    substitutionAction === 'REMOVE_AND_REFUND'
                      ? 'bg-rose-50 border-rose-300 text-rose-700 ring-2 ring-rose-200'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {activeLanguage === 'ckb' ? 'سڕینەوە و گەڕاندنەوەی پارە' : 'Remove & Refund'}
                </button>
                <button
                  type="button"
                  onClick={() => setSubstitutionAction('REPLACE_BEST_MATCH')}
                  className={`p-3 rounded-xl border text-xs font-bold text-center transition ${
                    substitutionAction === 'REPLACE_BEST_MATCH'
                      ? 'bg-orange-50 border-orange-300 text-[#FF5A00] ring-2 ring-orange-200'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {activeLanguage === 'ckb' ? 'جێگرتنەوە بە هاوشێوە' : 'Replace Best Match'}
                </button>
              </div>
            </div>

            {/* Reason Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                {activeLanguage === 'ckb' ? 'هۆکاری جێگرتنەوە:' : 'Picker Reason:'}
              </label>
              <select
                value={substitutionReason}
                onChange={(e) => setSubstitutionReason(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-[#FF5A00]"
              >
                <option value="Shelf empty / inventory discrepancy in dark store">Shelf empty / stock-out in dark store</option>
                <option value="Damaged packaging during dark store picking">Damaged packaging / bottle leak</option>
                <option value="Near expiry date below 3-day quality standard">Near expiry date below 3-day quality standard</option>
                <option value="Cold chain temperature breach">Cold chain temperature breach</option>
              </select>
            </div>

            {/* Impact Notice */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 space-y-1">
              <span className="font-bold block">
                {activeLanguage === 'ckb' ? 'تێبینی ژمێریاری و دارایی:' : 'Audit Trail & Financial Impact:'}
              </span>
              <p>
                {substitutionAction === 'REMOVE_AND_REFUND'
                  ? (activeLanguage === 'ckb'
                      ? 'نرخی کاڵاکە لە کۆی گشتی و کاشی لای شۆفێر کەمدەکرێتەوە و لە تۆماری دارایی تۆمار دەکرێت.'
                      : 'Item value will be deducted from order total/COD cash and logged in the immutable audit trail.')
                  : (activeLanguage === 'ckb'
                      ? 'کاڵای هاوشێوە دەخرێتە شوێنی و بارکۆدەکەی بۆ شۆفێر نوێ دەکرێتەوە.'
                      : 'The matching SKU barcode will replace this item and be logged in the immutable audit trail.')}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-2 space-x-reverse pt-2">
              <button
                type="button"
                onClick={() => setSubstituteItem(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition"
              >
                {activeLanguage === 'ckb' ? 'پاشگەزبوونەوە' : 'Cancel'}
              </button>
              <button
                type="button"
                disabled={isSubmittingSubstitution}
                onClick={handleExecuteSubstitution}
                className="px-5 py-2 bg-[#FF5A00] hover:bg-[#E04F00] text-white rounded-lg text-xs font-extrabold shadow-md shadow-orange-500/20 transition disabled:opacity-50"
              >
                {isSubmittingSubstitution
                  ? 'Processing...'
                  : (activeLanguage === 'ckb' ? 'تەئکیدکردنەوەی چارەسەر' : 'Confirm Resolution')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrdersDispatchPage() {
  return (
    <DashboardLayout
      title="Live Dark Store Dispatch & Picker Board"
      subtitle="Fulfill 15-minute grocery orders, scan barcodes & assign in-house fleet"
    >
      <OrdersContent />
    </DashboardLayout>
  );
}
