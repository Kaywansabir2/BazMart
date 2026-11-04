'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { api } from '@/lib/api';
import { CustomerItem } from '@/lib/types';
import { formatIqd, formatNumber, formatDateSafe } from '@/lib/format';
import {
  Users,
  Search,
  Phone,
  ShoppingBag,
  MapPin,
  Calendar,
  RefreshCw,
  CheckCircle,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerItem | null>(null);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await api.getCustomers();
      setCustomers(data);
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      c.phone.replace(/[\s\+]/g, '').includes(q.replace(/[\s\+]/g, '')) ||
      (c.lastOrderNumber && c.lastOrderNumber.toLowerCase().includes(q))
    );
  });

  const totalOrdersSum = customers.reduce((acc, c) => acc + c.totalOrders, 0);
  const totalLifetimeSpend = customers.reduce((acc, c) => acc + c.lifetimeSpendIqd, 0);
  const avgSpendPerUser = customers.length > 0 ? Math.round(totalLifetimeSpend / customers.length) : 0;

  return (
    <DashboardLayout
      title="Customers & CRM"
      subtitle="Registered customers, normalized Iraqi phone numbers, lifetime spend & saved addresses"
    >
      <div className="space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-4 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-[#FF5A00]">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">Total Customers</p>
              <h3 className="text-xl font-bold text-white tracking-tight">{customers.length}</h3>
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-4 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">Total Orders Placed</p>
              <h3 className="text-xl font-bold text-white tracking-tight">{totalOrdersSum}</h3>
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-4 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <span className="font-bold text-xs">IQD</span>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">Lifetime GMV Spend</p>
              <h3 className="text-xl font-bold text-white tracking-tight">
                {formatIqd(totalLifetimeSpend)}
              </h3>
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-4 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">Avg Spend / User</p>
              <h3 className="text-xl font-bold text-white tracking-tight">
                {formatIqd(avgSpendPerUser)}
              </h3>
            </div>
          </div>
        </div>

        {/* Action Header & Search */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, phone (+964), order..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#FF5A00] transition"
            />
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <button
              onClick={fetchCustomers}
              className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-700/60">
                <tr>
                  <th className="px-4 py-3.5">Customer</th>
                  <th className="px-4 py-3.5">Phone Number</th>
                  <th className="px-4 py-3.5">Lang</th>
                  <th className="px-4 py-3.5 text-center">Orders</th>
                  <th className="px-4 py-3.5 text-right">Lifetime Spend</th>
                  <th className="px-4 py-3.5">Saved Addresses</th>
                  <th className="px-4 py-3.5">Last Order</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/40">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#FF5A00]" />
                      Loading customer CRM records...
                    </td>
                  </tr>
                ) : filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      No customers match your search query.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((c) => (
                    <tr
                      key={c.id}
                      className="hover:bg-slate-750/50 transition duration-150"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-8 h-8 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center font-bold text-[#FF5A00] text-xs">
                            {c.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-white">{c.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{c.id.slice(0, 10)}...</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-200">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[10px] px-1 bg-slate-700 rounded text-slate-300">🇮🇶</span>
                          <span className="font-semibold text-emerald-400">{c.phone}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-slate-700 text-slate-300">
                          {c.preferredLanguage}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            c.totalOrders > 0
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              : 'bg-slate-700 text-slate-400'
                          }`}
                        >
                          {c.totalOrders} {c.totalOrders === 1 ? 'order' : 'orders'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-white">
                        {formatIqd(c.lifetimeSpendIqd)}
                      </td>
                      <td className="px-4 py-3">
                        {c.addresses && c.addresses.length > 0 ? (
                          <div className="space-y-0.5">
                            {c.addresses.map((a, idx) => (
                              <div key={idx} className="flex items-center space-x-1 text-[11px] text-slate-300">
                                <MapPin className="w-3 h-3 text-[#FF5A00] shrink-0" />
                                <span className="font-medium text-white">{a.title}:</span>
                                <span className="text-slate-400 truncate max-w-[150px]">
                                  {a.city} - {a.neighborhood}
                                </span>
                                {a.isDefault && (
                                  <span className="text-[9px] px-1 bg-emerald-500/20 text-emerald-400 rounded">
                                    Default
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-500 italic text-[11px]">No saved address</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-300">
                        {c.lastOrderNumber ? (
                          <div className="text-[11px]">
                            <span className="font-bold text-[#FF5A00]">#{c.lastOrderNumber}</span>
                            {c.lastOrderAt && (
                              <p className="text-[10px] text-slate-500">
                                {formatDateSafe(c.lastOrderAt)}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-500 text-[11px]">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setSelectedCustomer(c)}
                          className="px-2.5 py-1 bg-slate-700 hover:bg-[#FF5A00] hover:text-white text-slate-200 rounded text-[11px] font-medium transition"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Customer Details Modal */}
        {selectedCustomer && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center font-bold text-[#FF5A00] text-sm">
                    {selectedCustomer.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">{selectedCustomer.name}</h3>
                    <p className="text-xs text-emerald-400 font-mono">{selectedCustomer.phone}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-700/50">
                  <span className="text-slate-400 block mb-1">Total Orders</span>
                  <span className="text-base font-bold text-white">{selectedCustomer.totalOrders}</span>
                </div>
                <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-700/50">
                  <span className="text-slate-400 block mb-1">Lifetime Spend</span>
                  <span className="text-base font-bold text-[#FF5A00]">
                    {formatIqd(selectedCustomer.lifetimeSpendIqd)}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Saved Delivery Addresses ({selectedCustomer.addresses?.length || 0})
                </h4>
                <div className="space-y-2">
                  {selectedCustomer.addresses && selectedCustomer.addresses.length > 0 ? (
                    selectedCustomer.addresses.map((a, i) => (
                      <div
                        key={i}
                        className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/50 text-xs flex items-start justify-between"
                      >
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-white">{a.title}</span>
                            {a.isDefault && (
                              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded font-semibold">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-slate-300 text-[11px] mt-0.5">
                            {a.city}, {a.neighborhood}, {a.street} {a.building ? `, ${a.building}` : ''}
                          </p>
                          {a.landmark && (
                            <p className="text-slate-400 text-[10px]">Landmark: {a.landmark}</p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 italic">No saved addresses on file.</p>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-700 flex justify-end">
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

