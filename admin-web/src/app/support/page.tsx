'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { formatIqd, formatNumber } from '@/lib/format';
import {
  LifeBuoy,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Wallet,
  ArrowRight,
  RefreshCw,
  Search,
  Filter,
  DollarSign,
  User,
  ShoppingBag,
} from 'lucide-react';

interface SupportTicket {
  id: number;
  ticketNumber: string;
  orderId: string;
  customerId: string;
  issueCategory: string;
  affectedOrderItemIds: string[];
  customerNote: string;
  requestedRefundIqd: number;
  status: 'OPEN' | 'APPROVED_REFUNDED_TO_WALLET' | 'REJECTED';
  adminResolutionNote?: string;
  resolvedAt?: string;
  createdAt: string;
  customer?: {
    id: string;
    name: string;
    phone: string;
    walletBalanceIqd: number;
  };
  order?: {
    id: string;
    orderNumber: string;
    totalIqd: number;
    paymentMethod: string;
  };
}

export default function SupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'OPEN' | 'APPROVED_REFUNDED_TO_WALLET' | 'REJECTED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://127.0.0.1:4001/api/v1/admin/support-tickets');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setTickets(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch support tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleResolveTicket = async (ticketId: number, action: 'approve' | 'reject') => {
    try {
      setProcessingId(ticketId);
      const res = await fetch(`http://127.0.0.1:4001/api/v1/admin/support-tickets/${ticketId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          adminResolutionNote: action === 'approve'
            ? 'Approved by Dark Store Operations and credited directly to customer BazMart Wallet.'
            : 'Rejected after dark store order verification.',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionSuccessMessage(
          action === 'approve'
            ? `✓ Ticket #${data.ticket.ticketNumber} Approved: ${formatIqd(data.ticket.requestedRefundIqd || 2250)} successfully credited to ${data.ticket.customer?.name || 'Customer'}'s Wallet!`
            : `Ticket #${data.ticket.ticketNumber} marked as Rejected.`
        );
        fetchTickets();
        setTimeout(() => setActionSuccessMessage(null), 5000);
      }
    } catch (err) {
      console.error('Error resolving ticket:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    if (filterStatus !== 'ALL' && t.status !== filterStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const numMatch = t.ticketNumber?.toLowerCase().includes(q);
      const custMatch = t.customer?.name?.toLowerCase().includes(q) || t.customer?.phone?.includes(q);
      const orderMatch = t.order?.orderNumber?.toLowerCase().includes(q);
      if (!numMatch && !custMatch && !orderMatch) return false;
    }
    return true;
  });

  const openCount = tickets.filter((t) => t.status === 'OPEN').length;
  const approvedCount = tickets.filter((t) => t.status === 'APPROVED_REFUNDED_TO_WALLET').length;
  const totalRefundedIqd = tickets
    .filter((t) => t.status === 'APPROVED_REFUNDED_TO_WALLET')
    .reduce((sum, t) => sum + (t.requestedRefundIqd || 0), 0);

  return (
    <DashboardLayout
      title="Customer Support & Wallet Refunds"
      subtitle="Order discrepancy resolution, damaged/missing item investigations, and 1-click automated wallet credits"
    >
      <div className="space-y-6">
        {/* Banner Toast Success */}
        {actionSuccessMessage && (
          <div className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 px-4 py-3 rounded-xl text-xs font-medium flex items-center justify-between animate-fadeIn shadow-lg">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{actionSuccessMessage}</span>
            </div>
            <button onClick={() => setActionSuccessMessage(null)} className="text-emerald-400 hover:text-white font-bold ml-4">
              &times;
            </button>
          </div>
        )}

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-md">
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Open Tickets</p>
              <h3 className="text-2xl font-black text-amber-400 mt-1">{openCount}</h3>
              <span className="text-[11px] text-amber-500/80 font-medium mt-1 inline-block">Requires Operations Review</span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-md">
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Approved & Refunded</p>
              <h3 className="text-2xl font-black text-emerald-400 mt-1">{approvedCount}</h3>
              <span className="text-[11px] text-emerald-500/80 font-medium mt-1 inline-block">Credited to Customer Wallets</span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-md">
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Refund Volume</p>
              <h3 className="text-2xl font-black text-white mt-1">{formatIqd(totalRefundedIqd)}</h3>
              <span className="text-[11px] text-slate-400 font-medium mt-1 inline-block">Automated Ledger Debit</span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Wallet className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-md">
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Avg Resolution Time</p>
              <h3 className="text-2xl font-black text-[#FF5A00] mt-1">&lt; 15 Mins</h3>
              <span className="text-[11px] text-slate-400 font-medium mt-1 inline-block">Talabat Mart Rapid Benchmark</span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-[#FF5A00]">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Filter Bar & Search */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
          <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto">
            {(['ALL', 'OPEN', 'APPROVED_REFUNDED_TO_WALLET', 'REJECTED'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  filterStatus === status
                    ? 'bg-[#FF5A00] text-white shadow-md shadow-orange-500/20'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {status === 'ALL' && 'All Tickets'}
                {status === 'OPEN' && 'Open (Action Required)'}
                {status === 'APPROVED_REFUNDED_TO_WALLET' && 'Approved & Refunded'}
                {status === 'REJECTED' && 'Rejected'}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search ticket #, customer, order..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#FF5A00]"
            />
          </div>
        </div>

        {/* Tickets Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/60 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Ticket Number</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Order Ref</th>
                  <th className="py-3 px-4">Issue Category</th>
                  <th className="py-3 px-4">Customer Note</th>
                  <th className="py-3 px-4">Requested Refund</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action Protocol</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-500">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#FF5A00]" />
                      Loading support tickets...
                    </td>
                  </tr>
                ) : filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-500">
                      No support tickets found matching the criteria.
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((ticket) => {
                    const isProcessing = processingId === ticket.id;
                    return (
                      <tr key={ticket.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3.5 px-4 font-mono font-bold text-white">
                          {ticket.ticketNumber}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-white">{ticket.customer?.name || 'Customer'}</div>
                          <div className="text-[11px] text-slate-400">{ticket.customer?.phone}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-mono font-bold text-[#FF5A00]">
                            {ticket.order?.orderNumber || ticket.orderId}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Total: {ticket.order?.totalIqd ? formatIqd(ticket.order.totalIqd) : 'N/A'}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              ticket.issueCategory === 'DAMAGED_OR_SPOILED_ITEM'
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                : ticket.issueCategory === 'MISSING_ITEM'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            }`}
                          >
                            {ticket.issueCategory.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 max-w-xs">
                          <p className="text-slate-300 text-[11px] truncate" title={ticket.customerNote}>
                            {ticket.customerNote || 'No specific note provided.'}
                          </p>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-white">
                          {formatIqd(ticket.requestedRefundIqd || 2250)}
                        </td>
                        <td className="py-3.5 px-4">
                          {ticket.status === 'OPEN' && (
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                              <span>OPEN</span>
                            </span>
                          )}
                          {ticket.status === 'APPROVED_REFUNDED_TO_WALLET' && (
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>REFUNDED TO WALLET</span>
                            </span>
                          )}
                          {ticket.status === 'REJECTED' && (
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                              REJECTED
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {ticket.status === 'OPEN' ? (
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => handleResolveTicket(ticket.id, 'approve')}
                                disabled={isProcessing}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] rounded-lg shadow-sm shadow-emerald-500/20 transition flex items-center space-x-1.5 disabled:opacity-50"
                              >
                                {isProcessing ? (
                                  <RefreshCw className="w-3 h-3 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                )}
                                <span>Approve & Refund {formatIqd(ticket.requestedRefundIqd || 2250)}</span>
                              </button>
                              <button
                                onClick={() => handleResolveTicket(ticket.id, 'reject')}
                                disabled={isProcessing}
                                className="px-2.5 py-1.5 bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 font-semibold text-[11px] rounded-lg border border-slate-700 transition disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <div className="text-[11px] text-slate-500 italic">
                              {ticket.adminResolutionNote || 'Resolved'}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
