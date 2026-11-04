'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useOps } from '@/components/layout/OpsContext';
import { api } from '@/lib/api';
import {
  SupplierItem,
  PurchaseOrderRow,
  InventoryBatchItem,
  SupplyChainOverview,
} from '@/lib/types';
import { formatIqd, formatNumber, formatDateSafe } from '@/lib/format';
import {
  Boxes,
  Truck,
  AlertTriangle,
  Clock,
  ShieldAlert,
  CheckCircle2,
  Calendar,
  DollarSign,
  PackageCheck,
  Search,
  Filter,
  RefreshCw,
  Plus,
  Zap,
  Trash2,
  Check,
} from 'lucide-react';

export default function SupplyChainPage() {
  const { selectedWarehouse } = useOps();

  // State
  const [overview, setOverview] = useState<SupplyChainOverview | null>(null);
  const [batches, setBatches] = useState<InventoryBatchItem[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderRow[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Tabs & Filters
  const [activeTab, setActiveTab] = useState<'batches' | 'pos' | 'suppliers'>('batches');
  const [batchUrgency, setBatchUrgency] = useState<'all' | 'near_expiry' | 'expired' | 'healthy'>('all');
  const [batchSearch, setBatchSearch] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Create PO Modal
  const [isPoModalOpen, setIsPoModalOpen] = useState(false);
  const [newPoSupplierId, setNewPoSupplierId] = useState('sup-henkel-levant');
  const [newPoProductId, setNewPoProductId] = useState('p-schauma');
  const [newPoQuantity, setNewPoQuantity] = useState(20);
  const [newPoSubmitting, setNewPoSubmitting] = useState(false);

  // Data Loading
  const loadData = async () => {
    try {
      setLoading(true);
      const [ov, bList, poList, supList] = await Promise.all([
        api.getSupplyChainOverview(selectedWarehouse),
        api.getBatches({ warehouseId: selectedWarehouse, urgency: batchUrgency, search: batchSearch }),
        api.getPurchaseOrders(selectedWarehouse),
        api.getSuppliers(),
      ]);
      setOverview(ov);
      setBatches(bList);
      setPurchaseOrders(poList);
      setSuppliers(supList);
    } catch (err: any) {
      console.error('Failed to load supply chain data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedWarehouse, batchUrgency]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    api.getBatches({ warehouseId: selectedWarehouse, urgency: batchUrgency, search: batchSearch })
      .then(setBatches);
  };

  // Actions
  const handleReceivePo = async (poId: string) => {
    try {
      const res = await api.receivePurchaseOrder(poId);
      setActionNotice(`✓ Received Purchase Order ${res.poNumber} into stock! Created new batches & updated warehouse inventory.`);
      loadData();
      setTimeout(() => setActionNotice(null), 6000);
    } catch (err: any) {
      alert(err.message || 'Failed to receive purchase order');
    }
  };

  const handleApplyClearance = async (batchId: number) => {
    try {
      const res = await api.applyClearanceDiscount(batchId);
      setActionNotice(`⚡ Applied 25% Flash Clearance Sale to ${res.productTitle}! New Price: ${formatIqd(res.newDiscountedPriceIqd)} (was ${formatIqd(res.originalPriceIqd)}).`);
      loadData();
      setTimeout(() => setActionNotice(null), 6000);
    } catch (err: any) {
      alert(err.message || 'Failed to apply clearance discount');
    }
  };

  const handleQuarantine = async (batchId: number) => {
    try {
      const res = await api.quarantineBatch(batchId, 'FEFO expired stock spoilage write-off');
      setActionNotice(`🗑️ Quarantined & wrote off ${res.quarantinedQuantity} units for Batch ${res.batchNumber}! Financial ledger wastage debit logged.`);
      loadData();
      setTimeout(() => setActionNotice(null), 6000);
    } catch (err: any) {
      alert(err.message || 'Failed to quarantine batch');
    }
  };

  const handleCreatePoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setNewPoSubmitting(true);
      await api.createPurchaseOrder({
        supplierId: newPoSupplierId,
        warehouseId: selectedWarehouse === 'all' ? 'erbil-central-darkstore' : selectedWarehouse,
        items: [
          {
            productId: newPoProductId,
            orderedQuantity: Number(newPoQuantity),
          },
        ],
      });
      setIsPoModalOpen(false);
      setActionNotice('✓ Successfully drafted & sent new Purchase Order to supplier!');
      loadData();
      setTimeout(() => setActionNotice(null), 6000);
    } catch (err: any) {
      alert(err.message || 'Failed to create purchase order');
    } finally {
      setNewPoSubmitting(false);
    }
  };

  return (
    <DashboardLayout
      title="Supply Chain & FEFO Expiry Radar"
      subtitle="Inbound procurement, supplier logistics, and First-Expired First-Out shelf life management"
    >
      <div className="space-y-6">
        {/* Action Banner */}
        {actionNotice && (
          <div className="bg-emerald-900/60 border border-emerald-500/40 text-emerald-200 px-4 py-3 rounded-xl text-xs font-semibold flex items-center justify-between shadow-lg animate-fadeIn">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{actionNotice}</span>
            </div>
            <button onClick={() => setActionNotice(null)} className="text-emerald-400 hover:text-white font-bold ml-4">
              &times;
            </button>
          </div>
        )}

        {/* 5 Top KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {/* 1. Active Suppliers */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
              <span>Active Suppliers</span>
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <Truck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-white">
              {overview?.activeSuppliersCount ?? 8}
            </div>
            <div className="text-[11px] text-blue-400 font-semibold mt-1">
              Regional & International Hubs
            </div>
          </div>

          {/* 2. Open Purchase Orders */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
              <span>Open Purchase Orders</span>
              <div className="w-7 h-7 rounded-lg bg-orange-500/10 text-[#FF5A00] flex items-center justify-center">
                <PackageCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-white">
              {overview?.openPurchaseOrdersCount ?? 2} Open POs
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Inbound Dark Store Deliveries
            </div>
          </div>

          {/* 3. Total Batch Inventory Value */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-md">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
              <span>Batch Stock Value (Cost)</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-extrabold text-emerald-400">
              {formatIqd(overview?.totalInventoryValueCostIqd ?? 0)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Tracked FEFO inventory landed cost
            </div>
          </div>

          {/* 4. Near-Expiry Batches Warning */}
          <div className="bg-slate-900 border border-amber-500/30 p-4 rounded-xl shadow-md relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
              <span>Near Expiry (&le; 7 Days)</span>
              <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-amber-400 flex items-center gap-2">
              <span>{overview?.nearExpiryBatchesCount ?? 0}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full">
                Amber Alert
              </span>
            </div>
            <div className="text-[11px] text-amber-300/80 font-medium mt-1">
              Target for 25% flash clearance
            </div>
          </div>

          {/* 5. Quarantined & Spoilage */}
          <div className="bg-slate-900 border border-rose-500/30 p-4 rounded-xl shadow-md">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
              <span>Quarantined / Expired</span>
              <div className="w-7 h-7 rounded-lg bg-rose-500/15 text-rose-400 flex items-center justify-center">
                <ShieldAlert className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-extrabold text-rose-400">
              {formatIqd(overview?.quarantinedValueIqd ?? 0)}
            </div>
            <div className="text-[11px] text-rose-400/80 font-medium mt-1">
              Isolated from customer picking
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 space-x-6 text-sm font-semibold">
          <button
            onClick={() => setActiveTab('batches')}
            className={`pb-3 flex items-center gap-2 border-b-2 transition ${
              activeTab === 'batches'
                ? 'border-[#FF5A00] text-[#FF5A00]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>FEFO Batch & Expiry Radar</span>
            {overview && overview.nearExpiryBatchesCount > 0 && (
              <span className="bg-amber-500 text-slate-950 font-bold px-1.5 py-0.2 rounded-full text-[10px]">
                {overview.nearExpiryBatchesCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('pos')}
            className={`pb-3 flex items-center gap-2 border-b-2 transition ${
              activeTab === 'pos'
                ? 'border-[#FF5A00] text-[#FF5A00]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <PackageCheck className="w-4 h-4" />
            <span>Purchase Orders & Inbound Receiving</span>
            {overview && overview.openPurchaseOrdersCount > 0 && (
              <span className="bg-blue-500 text-white font-bold px-1.5 py-0.2 rounded-full text-[10px]">
                {overview.openPurchaseOrdersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('suppliers')}
            className={`pb-3 flex items-center gap-2 border-b-2 transition ${
              activeTab === 'suppliers'
                ? 'border-[#FF5A00] text-[#FF5A00]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Suppliers Directory ({suppliers.length || 8})</span>
          </button>
        </div>

        {/* ============================================================== */}
        {/* TAB 1: FEFO BATCH & EXPIRY RADAR */}
        {/* ============================================================== */}
        {activeTab === 'batches' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl space-y-4 p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>First-Expired First-Out (FEFO) Lot Monitor</span>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
                    {batches.length} Batches Tracked
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Batches automatically prioritized for picking by earliest expiration date
                </p>
              </div>

              {/* Urgency Filter Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setBatchUrgency('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    batchUrgency === 'all'
                      ? 'bg-slate-800 text-white border border-slate-700'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All Batches
                </button>
                <button
                  onClick={() => setBatchUrgency('near_expiry')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    batchUrgency === 'near_expiry'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'text-amber-400/70 hover:text-amber-300'
                  }`}
                >
                  <AlertTriangle className="w-3 h-3" />
                  <span>Expiring Soon (&le; 7d)</span>
                </button>
                <button
                  onClick={() => setBatchUrgency('expired')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    batchUrgency === 'expired'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'text-rose-400/70 hover:text-rose-300'
                  }`}
                >
                  <ShieldAlert className="w-3 h-3" />
                  <span>Expired / Quarantine</span>
                </button>
                <button
                  onClick={() => setBatchUrgency('healthy')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    batchUrgency === 'healthy'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'text-emerald-400/70 hover:text-emerald-300'
                  }`}
                >
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Healthy Stock</span>
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="relative max-w-sm">
              <input
                type="text"
                placeholder="Search batch #, product SKU or title..."
                value={batchSearch}
                onChange={(e) => setBatchSearch(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:border-[#FF5A00]"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </form>

            {/* Batches Table */}
            <div className="overflow-x-auto rounded-lg border border-slate-800">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/60 uppercase text-[10px] text-slate-400 font-bold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Batch / Lot #</th>
                    <th className="py-3 px-4">Product Details</th>
                    <th className="py-3 px-4">Dark Store</th>
                    <th className="py-3 px-4 text-center">Remaining Stock</th>
                    <th className="py-3 px-4 text-right">Landed Cost</th>
                    <th className="py-3 px-4 text-center">Expiry & Status</th>
                    <th className="py-3 px-4 text-right">Action Protocol</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {batches.map((batch) => {
                    const isNearExpiry = batch.urgency === 'NEAR_EXPIRY';
                    const isExpired = batch.urgency === 'EXPIRED';

                    return (
                      <tr
                        key={batch.id}
                        className={`hover:bg-slate-800/30 transition ${
                          isExpired
                            ? 'bg-rose-950/20'
                            : isNearExpiry
                            ? 'bg-amber-950/20'
                            : ''
                        }`}
                      >
                        <td className="py-3 px-4 font-mono">
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span>{batch.batchNumber}</span>
                            {batch.status === 'NEAR_EXPIRY_PROMO' && (
                              <span className="text-[9px] bg-purple-500/20 text-purple-300 px-1 py-0.5 rounded font-sans font-bold">
                                Flash Promo
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            Prod: {batch.productionDate || 'N/A'}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-semibold text-white">{batch.productTitle}</div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {batch.productSku} &bull; {batch.categoryName}
                          </div>
                        </td>

                        <td className="py-3 px-4 text-slate-300 text-[11px]">
                          {batch.warehouseName}
                        </td>

                        <td className="py-3 px-4 text-center">
                          <span className="font-extrabold text-white text-sm">
                            {batch.remainingQuantity}
                          </span>
                          <span className="text-[10px] text-slate-500 block">
                            / {batch.initialQuantity} units
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="font-bold text-slate-200">
                            {formatIqd(batch.unitCostIqd)}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            Lot: {formatIqd(batch.totalBatchCostIqd)}
                          </div>
                        </td>

                        <td className="py-3 px-4 text-center">
                          <div className="font-semibold text-slate-200">{batch.expiryDate}</div>
                          {isExpired ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 rounded-full mt-0.5">
                              <ShieldAlert className="w-3 h-3" />
                              <span>Expired ({Math.abs(batch.daysRemaining)}d ago)</span>
                            </span>
                          ) : isNearExpiry ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full mt-0.5 animate-pulse">
                              <AlertTriangle className="w-3 h-3" />
                              <span>{batch.daysRemaining} days left</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full mt-0.5">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Healthy ({batch.daysRemaining}d)</span>
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right">
                          {isExpired && batch.status !== 'EXPIRED_QUARANTINED' ? (
                            <button
                              onClick={() => handleQuarantine(batch.id)}
                              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 ml-auto shadow-md shadow-rose-600/30"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Quarantine & Write-Off</span>
                            </button>
                          ) : isNearExpiry && batch.status !== 'NEAR_EXPIRY_PROMO' ? (
                            <button
                              onClick={() => handleApplyClearance(batch.id)}
                              className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold rounded-lg text-xs transition flex items-center gap-1.5 ml-auto shadow-md"
                            >
                              <Zap className="w-3.5 h-3.5" />
                              <span>Apply Clearance Sale (25%)</span>
                            </button>
                          ) : batch.status === 'EXPIRED_QUARANTINED' ? (
                            <span className="text-[11px] font-semibold text-rose-400 bg-rose-950/40 border border-rose-800/40 px-2 py-1 rounded inline-block">
                              Quarantined
                            </span>
                          ) : (
                            <span className="text-[11px] font-medium text-slate-500">
                              Active in FEFO Queue
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: PURCHASE ORDERS & INBOUND RECEIVING */}
        {/* ============================================================== */}
        {activeTab === 'pos' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl space-y-4 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Dark Store Purchase Orders (PO)</h3>
                <p className="text-xs text-slate-400">Manage supplier procurement contracts, stock dock intake and landed costs</p>
              </div>

              <button
                onClick={() => setIsPoModalOpen(true)}
                className="px-3.5 py-2 bg-[#FF5A00] hover:bg-[#E04F00] text-white rounded-lg text-xs font-bold transition flex items-center gap-2 shadow-md shadow-orange-500/20"
              >
                <Plus className="w-4 h-4" />
                <span>Create Purchase Order</span>
              </button>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-800">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/60 uppercase text-[10px] text-slate-400 font-bold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">PO Number</th>
                    <th className="py-3 px-4">Supplier & City</th>
                    <th className="py-3 px-4">Target Dark Store</th>
                    <th className="py-3 px-4">Delivery Due</th>
                    <th className="py-3 px-4 text-right">Total Order Value</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Inbound Receiving</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {purchaseOrders.map((po) => {
                    const isReceived = po.status === 'RECEIVED_INTO_STOCK';

                    return (
                      <tr key={po.id} className="hover:bg-slate-800/30 transition">
                        <td className="py-3.5 px-4 font-mono">
                          <div className="font-extrabold text-white">{po.poNumber}</div>
                          <div className="text-[10px] text-slate-500">{po.itemsCount} SKUs Included</div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-white">{po.supplierName}</div>
                          <div className="text-[10px] text-slate-400">{po.supplierCity}</div>
                        </td>

                        <td className="py-3.5 px-4 text-slate-300 font-medium">
                          {po.warehouseName}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-200">{po.expectedDeliveryDate}</div>
                          {po.receivedAt && (
                            <span className="text-[10px] text-emerald-400 block">
                              Recv: {formatDateSafe(po.receivedAt)}
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right font-bold text-white">
                          {formatIqd(po.totalCostIqd)}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          {isReceived ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Received into Stock</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 inline-flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>Sent to Supplier</span>
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          {!isReceived ? (
                            <button
                              onClick={() => handleReceivePo(po.id)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 ml-auto shadow-md shadow-emerald-600/20"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Receive Stock &amp; Log Batches</span>
                            </button>
                          ) : (
                            <span className="text-[11px] font-semibold text-slate-500">
                              ✓ Stock Logged in FEFO
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: SUPPLIERS DIRECTORY */}
        {/* ============================================================== */}
        {activeTab === 'suppliers' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl space-y-4 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Regional &amp; International Distributors</h3>
                <p className="text-xs text-slate-400">8 contracted suppliers powering 400 dark store SKUs</p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-800">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/60 uppercase text-[10px] text-slate-400 font-bold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Supplier Name</th>
                    <th className="py-3 px-4">Contact Person</th>
                    <th className="py-3 px-4">City / Region</th>
                    <th className="py-3 px-4 text-center">Lead Time</th>
                    <th className="py-3 px-4">Payment Terms</th>
                    <th className="py-3 px-4 text-right">Total Purchased (Cost)</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {suppliers.map((sup) => (
                    <tr key={sup.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white">{sup.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{sup.id}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-200">{sup.contactPerson}</div>
                        <div className="text-[10px] text-slate-400">{sup.phone}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-300">{sup.city}</div>
                        <span className="text-[9px] font-bold bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                          {sup.countryCode}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="font-extrabold text-white">{sup.leadTimeDays}</span>
                        <span className="text-[10px] text-slate-400 ml-1">Days</span>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-300">
                        {sup.paymentTerms}
                      </td>

                      <td className="py-3.5 px-4 text-right font-bold text-emerald-400">
                        {formatIqd(sup.totalPurchasedIqd)}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          Active Partner
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Create PO Modal */}
        {isPoModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-scaleUp">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <PackageCheck className="w-5 h-5 text-[#FF5A00]" />
                  <span>Draft New Purchase Order</span>
                </h3>
                <button
                  onClick={() => setIsPoModalOpen(false)}
                  className="text-slate-400 hover:text-white text-lg font-bold"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleCreatePoSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Select Supplier</label>
                  <select
                    value={newPoSupplierId}
                    onChange={(e) => setNewPoSupplierId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-[#FF5A00]"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.city}) &bull; {s.paymentTerms}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Target Product SKU</label>
                  <select
                    value={newPoProductId}
                    onChange={(e) => setNewPoProductId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-[#FF5A00]"
                  >
                    <option value="p-schauma">Schauma Shampoo 400ml (Henkel) &bull; Cost: 5,400 IQD</option>
                    <option value="p-cucumber">Cucumber Crisp 1kg (Anadol) &bull; Cost: 1,050 IQD</option>
                    <option value="p-eggs">Kurdistan Eggs Tray (Poultry) &bull; Cost: 2,950 IQD</option>
                    <option value="p-tabasco-chicken">Tabasco Ramen Chicken (Asian Hub) &bull; Cost: 900 IQD</option>
                    <option value="p-nescafe-latte">Nescafe Latte Iced (Nestlé) &bull; Cost: 750 IQD</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Ordered Quantity (Units)</label>
                  <input
                    type="number"
                    min="5"
                    max="500"
                    value={newPoQuantity}
                    onChange={(e) => setNewPoQuantity(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-[#FF5A00]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsPoModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={newPoSubmitting}
                    className="px-4 py-2 bg-[#FF5A00] hover:bg-[#E04F00] text-white font-bold rounded-lg transition flex items-center gap-1.5"
                  >
                    {newPoSubmitting ? 'Submitting...' : 'Issue Purchase Order'}
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

