'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Driver, Order } from '@/lib/types';
import { formatIqd, formatNumber } from '@/lib/format';
import {
  Bike,
  MapPin,
  Phone,
  Navigation,
  CheckCircle2,
  Banknote,
  Clock,
  ArrowRight,
  ExternalLink,
  Store,
  RefreshCw,
  UserCheck,
  RotateCcw,
} from 'lucide-react';

export default function DriverPortalPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [activeDriverId, setActiveDriverId] = useState<string>('drv-karwan');
  const [activeDriver, setActiveDriver] = useState<Driver | null>(null);
  const [assignedOrders, setAssignedOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Step 19: Doorstep Partial Item Return Modal State
  const [returnModalOrder, setReturnModalOrder] = useState<Order | null>(null);
  const [returnItemIndex, setReturnItemIndex] = useState<number>(0);
  const [returnQty, setReturnQty] = useState<number>(1);
  const [returnReason, setReturnReason] = useState<string>('کڕیار ڕەتیکردەوە بەهۆی زیانپێگەیشتنی پاکەت');
  const [isSubmittingReturn, setIsSubmittingReturn] = useState<boolean>(false);

  const fetchDriverData = async () => {
    try {
      setLoading(true);
      const allDrivers = await api.getDrivers();
      setDrivers(allDrivers);

      const current = allDrivers.find((d) => d.id === activeDriverId) || allDrivers[0];
      if (current) {
        setActiveDriverId(current.id);
        setActiveDriver(current);
        const orders = await api.getDriverOrders(current.id);
        setAssignedOrders(orders);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDriverData();
    const interval = setInterval(() => fetchDriverData(), 8000);
    return () => clearInterval(interval);
  }, [activeDriverId]);

  const handleExecutePartialReturn = async () => {
    if (!returnModalOrder) return;
    try {
      setIsSubmittingReturn(true);
      const targetItem = returnModalOrder.items?.[returnItemIndex] || returnModalOrder.items?.[0];
      const res = await api.processPartialReturn(returnModalOrder.id, {
        orderItemId: targetItem?.id,
        productId: targetItem?.productId,
        returnedQuantity: returnQty,
        reason: returnReason,
      });
      setActionSuccessMessage(`کاڵا بە سەرکەوتوویی لە دەرگا گەڕێندرایەوە. پارەی کاش بوو بە ${formatIqd(res.data?.newTotalIqd || 90000)} د.ع`);
      setReturnModalOrder(null);
      await fetchDriverData();
    } catch (err: any) {
      alert(`هەڵە لە گەڕاندنەوەی کاڵا: ${err.message}`);
    } finally {
      setIsSubmittingReturn(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      setUpdatingOrderId(orderId);
      setActionSuccessMessage(null);
      await api.updateDeliveryStatus(orderId, status, activeDriverId);

      if (status === 'DELIVERED_COD_COLLECTED') {
        setActionSuccessMessage(`Order #${orderId} Delivered! COD Cash collected and added to shift balance.`);
      } else if (status === 'PICKED_UP') {
        setActionSuccessMessage(`Order #${orderId} Picked up from dark store. Out for delivery!`);
      }

      await fetchDriverData();
    } catch (err: any) {
      alert(`Status update failed: ${err.message}`);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between max-w-md mx-auto shadow-2xl relative">
      {/* Top Mobile App Bar */}
      <div className="bg-slate-800 p-4 border-b border-slate-700 space-y-3 sticky top-0 z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-[#FF5A00] flex items-center justify-center font-bold text-white shadow-md shadow-orange-500/20">
              <Bike className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-sm text-white tracking-tight">BazMart Rider</span>
              <span className="text-[10px] text-emerald-400 font-bold block flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Active Shift</span>
              </span>
            </div>
          </div>

          <button
            onClick={fetchDriverData}
            className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-300 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Courier Profile Switcher */}
        <div className="flex items-center space-x-2 bg-slate-900/80 p-2 rounded-xl border border-slate-700 text-xs">
          <UserCheck className="w-4 h-4 text-[#FF5A00] shrink-0" />
          <div className="flex-1">
            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Logged in Courier:
            </label>
            <select
              value={activeDriverId}
              onChange={(e) => setActiveDriverId(e.target.value)}
              className="w-full bg-transparent font-bold text-white focus:outline-none cursor-pointer"
            >
              {drivers.map((drv) => (
                <option key={drv.id} value={drv.id} className="bg-slate-800 text-white">
                  {drv.fullName} ({drv.vehicleType} • {drv.status})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Courier Balance & Vehicle Badge */}
        {activeDriver && (
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/60">
              <span className="text-[10px] text-slate-400 block font-medium">Shift COD Balance</span>
              <span className="text-sm font-extrabold text-amber-400 font-mono">
                {formatIqd(activeDriver.cashInHandIqd)}
              </span>
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/60">
              <span className="text-[10px] text-slate-400 block font-medium">Assigned Vehicle</span>
              <span className="text-xs font-bold text-slate-200">
                {activeDriver.vehicleType} ({activeDriver.plateNumber})
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="p-4 flex-1 space-y-4 overflow-y-auto">
        {actionSuccessMessage && (
          <div className="p-3 bg-emerald-500/20 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs font-semibold flex items-center space-x-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionSuccessMessage}</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
            Assigned Active Deliveries ({assignedOrders.length})
          </h2>
          <span className="text-[11px] text-[#FF5A00] font-bold">15-Min Fast Dispatch</span>
        </div>

        {assignedOrders.length > 0 ? (
          assignedOrders.map((order) => {
            let addr: any = order.customerAddress || {};
            if (!addr.neighborhood && order.addressSnapshot) {
              try {
                addr = JSON.parse(order.addressSnapshot);
              } catch {
                addr = { city: 'Erbil', neighborhood: order.addressSnapshot };
              }
            }

            const isOutForDelivery = order.orderStatus === 'OUT_FOR_DELIVERY';
            const isDelivered = order.orderStatus === 'DELIVERED';
            const isPlacedOrPacking = order.orderStatus === 'PLACED' || order.orderStatus === 'PACKING_IN_DARKSTORE' || order.orderStatus === 'READY_FOR_PICKUP';

            return (
              <div
                key={order.id}
                className="bg-slate-800 rounded-2xl p-4 border border-slate-700 shadow-lg space-y-3 relative overflow-hidden"
              >
                {/* Order Header */}
                <div className="flex items-center justify-between border-b border-slate-700/80 pb-2.5">
                  <div>
                    <span className="font-mono font-extrabold text-base text-white">
                      #{order.orderNumber}
                    </span>
                    <span className="text-[11px] text-slate-400 block font-medium">
                      {order.warehouse?.name || 'Dark Store'}
                    </span>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        isDelivered
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : isOutForDelivery
                          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30 animate-pulse'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {order.orderStatus}
                    </span>
                  </div>
                </div>

                {/* Customer Address & Navigation */}
                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/60 text-xs space-y-2">
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 text-[#FF5A00] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-white">
                        {addr.neighborhood}, {addr.city}
                      </p>
                      <p className="text-slate-400 text-[11px]">
                        {addr.building} {addr.street} {addr.landmark ? `(Near ${addr.landmark})` : ''}
                      </p>
                    </div>
                  </div>

                  {/* Navigation & Call Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <a
                      href={`https://maps.google.com/?q=${addr.latitude || 36.1901},${addr.longitude || 44.0091}`}
                      target="_blank"
                      rel="noreferrer"
                      className="py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Navigate</span>
                    </a>

                    <a
                      href="tel:+9647501234567"
                      className="py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call Customer</span>
                    </a>
                  </div>
                </div>

                {/* COD Amount Banner */}
                <div className="bg-orange-500/10 border border-orange-500/30 p-3 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider block">
                      Cash to Collect
                    </span>
                    <span className="text-lg font-extrabold text-white font-mono">
                      {formatIqd(order.totalIqd)}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#FF5A00] text-white">
                    {order.paymentMethod === 'COD' ? 'CASH ON DELIVERY' : order.paymentMethod}
                  </span>
                </div>

                {/* Action Buttons Based on Status */}
                {!isDelivered ? (
                  <div className="space-y-2 pt-1">
                    {isPlacedOrPacking && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'PICKED_UP')}
                        disabled={updatingOrderId === order.id}
                        className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-extrabold flex items-center justify-center space-x-2 transition shadow-md shadow-purple-600/30 disabled:opacity-50"
                      >
                        <Clock className="w-4 h-4" />
                        <span>Confirm Picked Up from Dark Store</span>
                      </button>
                    )}

                    {isOutForDelivery && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'ARRIVED_AT_CUSTOMER')}
                          disabled={updatingOrderId === order.id}
                          className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl text-xs font-bold transition disabled:opacity-50"
                        >
                          I Have Arrived at Doorstep
                        </button>

                        <button
                          onClick={() => {
                            setReturnModalOrder(order);
                            setReturnItemIndex(0);
                            setReturnQty(1);
                          }}
                          className="w-full py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>↩️ گەڕاندنەوەی کاڵا لە بەردەم دەرگا (Partial Return)</span>
                        </button>

                        <button
                          onClick={() => handleUpdateStatus(order.id, 'DELIVERED_COD_COLLECTED')}
                          disabled={updatingOrderId === order.id}
                          className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-xl text-xs font-extrabold flex items-center justify-center space-x-2 transition shadow-lg shadow-emerald-600/30 disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Confirm Delivery & Collect {formatIqd(order.totalIqd)}</span>
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center text-xs text-emerald-400 font-bold flex items-center justify-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Delivered • Cash Recorded in Shift</span>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="py-16 text-center text-slate-500 space-y-2">
            <Bike className="w-10 h-10 mx-auto text-slate-600 opacity-60" />
            <p className="text-xs font-medium">No active deliveries assigned right now.</p>
            <p className="text-[11px] text-slate-600">Stand by at your assigned dark store.</p>
          </div>
        )}
      </div>

      {/* Bottom Sticky Shift Footer */}
      <div className="p-3 bg-slate-800 border-t border-slate-700 text-center text-[10px] text-slate-400">
        BazMart Courier Network • Kurdistan Region & Iraq
      </div>

      {/* Doorstep Partial Return Modal */}
      {returnModalOrder && (
        <div dir="rtl" className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-sm w-full p-5 text-slate-100 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-amber-400">
                <RotateCcw className="w-5 h-5" />
                <h3 className="text-sm font-bold">گەڕاندنەوەی کاڵا لە بەردەم دەرگا</h3>
              </div>
              <button
                onClick={() => setReturnModalOrder(null)}
                className="text-slate-400 hover:text-slate-200 text-xs p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <div className="text-slate-400">ژمارەی داواکاری: <span className="text-amber-400 font-mono font-bold">{returnModalOrder.orderNumber}</span></div>
                <div className="text-slate-400">کۆی پارەی ئێستای کاش: <span className="text-slate-100 font-bold">{formatIqd(returnModalOrder.totalIqd)}</span></div>
              </div>

              {/* Item selection */}
              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium block">کاڵای گەڕاوە هەڵبژێرە:</label>
                <select
                  value={returnItemIndex}
                  onChange={(e) => setReturnItemIndex(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
                >
                  {(returnModalOrder.items && returnModalOrder.items.length > 0) ? (
                    returnModalOrder.items.map((it, idx) => (
                      <option key={it.id || idx} value={idx}>
                        {it.titleCkb || it.titleEn || (it as any).productSnapshot?.titleCkb || `کاڵای #${idx + 1}`} ({formatIqd(it.unitPriceIqd)} د.ع)
                      </option>
                    ))
                  ) : (
                    <option value={0}>کاڵای گەڕاوەی دەرگا (١٠,٠٠٠ د.ع)</option>
                  )}
                </select>
              </div>

              {/* Return quantity */}
              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium block">بڕی گەڕاوە (دانە):</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={returnQty}
                  onChange={(e) => setReturnQty(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono outline-none"
                />
              </div>

              {/* Return Reason */}
              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium block">هۆکاری گەڕاندنەوە:</label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
                >
                  <option value="کڕیار ڕەتیکردەوە بەهۆی زیانپێگەیشتنی پاکەت">کڕیار ڕەتیکردەوە بەهۆی زیانپێگەیشتنی پاکەت</option>
                  <option value="کڕیار بڕی کەمتر لە داواکراوی دەوێت">کڕیار بڕی کەمتر لە داواکراوی دەوێت</option>
                  <option value="کاڵای بەسەرچوو یان نەشیاو">کاڵای بەسەرچوو یان نەشیاو</option>
                </select>
              </div>

              {/* Live Recalculation Preview */}
              <div className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-xl space-y-1 text-[11px]">
                <div className="flex justify-between text-slate-300">
                  <span>پارەی کاشی نوێ بۆ وەرگرتن (COD):</span>
                  <span className="font-bold text-amber-400 font-mono">{formatIqd(Math.max(0, returnModalOrder.totalIqd - (10000 * returnQty)))}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>عموولەی نوێی بازمارت (٣٪):</span>
                  <span className="text-orange-400 font-mono">ڕاستکراوە بەپێی نێت</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>پشکی سووپەرمارکێت (٩٧٪):</span>
                  <span className="text-emerald-400 font-mono">پارێزراو بەبێ عموولەی کاڵای گەڕاوە</span>
                </div>
                <div className="text-[10px] text-emerald-400 pt-1 border-t border-amber-500/20">
                  ✓ دانەی گەڕاوە خۆکارانە دەگەڕێنرێتەوە ناو کۆگای تاریک
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                disabled={isSubmittingReturn}
                onClick={handleExecutePartialReturn}
                className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
              >
                {isSubmittingReturn ? 'پڕۆسەکردن...' : 'پشتڕاستکردنەوەی گەڕاندنەوە'}
              </button>
              <button
                onClick={() => setReturnModalOrder(null)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
              >
                پاشگەزبوونەوە
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
