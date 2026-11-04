'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useOps } from '@/components/layout/OpsContext';
import { getTranslations } from '@/lib/i18n';
import { formatIqd, formatDateSafe } from '@/lib/format';
import {
  ShieldCheck,
  UserCheck,
  History,
  Search,
  Filter,
  CheckCircle2,
  Lock,
  Eye,
  RefreshCw,
} from 'lucide-react';

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ACCOUNTANT' | 'PICKER' | 'DISPATCHER';
  roleCkb: string;
  warehouse: string;
  status: 'ACTIVE' | 'ON_DUTY' | 'OFFLINE';
  lastActive: string;
}

interface AuditLog {
  id: string;
  actorName: string;
  actorRole: string;
  actionType: string;
  targetReference: string;
  details: string;
  createdAt: string;
}

const INITIAL_STAFF: StaffMember[] = [
  {
    id: 'STF-001',
    name: 'Zanyar Soran',
    email: 'zanyar@bazmart.iq',
    role: 'SUPER_ADMIN',
    roleCkb: 'سەرپەرشتیاری گشتی',
    warehouse: 'Erbil Central Dark Store',
    status: 'ON_DUTY',
    lastActive: 'Just now',
  },
  {
    id: 'STF-002',
    name: 'Shkar Hama',
    email: 'shkar.finance@bazmart.iq',
    role: 'ACCOUNTANT',
    roleCkb: 'ژمێریاری دارایی',
    warehouse: 'All Dark Stores',
    status: 'ACTIVE',
    lastActive: '5 mins ago',
  },
  {
    id: 'STF-003',
    name: 'Rawa Slemani',
    email: 'rawa.picker@bazmart.iq',
    role: 'PICKER',
    roleCkb: 'پێکەری دارکستۆر',
    warehouse: 'Sulaymaniyah Main Dark Store',
    status: 'ON_DUTY',
    lastActive: 'Active in Aisle 4',
  },
  {
    id: 'STF-004',
    name: 'Diyar Hawleri',
    email: 'diyar.dispatch@bazmart.iq',
    role: 'DISPATCHER',
    roleCkb: 'بەڕێوەبەری تیمی گەیاندن',
    warehouse: 'Erbil Central Dark Store',
    status: 'ON_DUTY',
    lastActive: 'Dispatching Rider #03',
  },
];

const INITIAL_LOGS: AuditLog[] = [
  {
    id: 'LOG-8801',
    actorName: 'Zanyar Soran',
    actorRole: 'SUPER_ADMIN',
    actionType: 'ITEM_SUBSTITUTION',
    targetReference: 'ORD-10001 / SKU-1005',
    details: 'Substituted Cucumber 1kg with Organic Cucumber due to dark store stock-out. No customer price delta.',
    createdAt: '2026-11-03T01:30:00.000Z',
  },
  {
    id: 'LOG-8802',
    actorName: 'Shkar Hama',
    actorRole: 'ACCOUNTANT',
    actionType: 'Z_REPORT_SETTLEMENT',
    targetReference: 'Z-20261102-SULY',
    details: 'Verified cashier shift total IQD 89,500. Balanced physical cash with POS ledger.',
    createdAt: '2026-11-03T01:15:00.000Z',
  },
  {
    id: 'LOG-8803',
    actorName: 'Diyar Hawleri',
    actorRole: 'DISPATCHER',
    actionType: 'DRIVER_FORCE_REASSIGN',
    targetReference: 'ORD-10003',
    details: 'Reassigned delivery to Karwan Ahmad (Erbil Central Dark Store) due to tire puncture on Bike 02.',
    createdAt: '2026-11-03T00:45:00.000Z',
  },
  {
    id: 'LOG-8804',
    actorName: 'Zanyar Soran',
    actorRole: 'SUPER_ADMIN',
    actionType: 'FEFO_CLEARANCE_DISCOUNT',
    targetReference: 'BATCH-LOT-4402',
    details: 'Triggered 25% Flash Clearance Sale on Near-Expiry Almarai Milk 1L. Expiry date within 4 days.',
    createdAt: '2026-11-03T00:15:00.000Z',
  },
];

function StaffContent() {
  const { activeLanguage } = useOps();
  const t = getTranslations(activeLanguage);
  const isRtl = activeLanguage === 'ckb' || activeLanguage === 'ar';

  const [staff] = useState<StaffMember[]>(INITIAL_STAFF);
  const [logs] = useState<AuditLog[]>(INITIAL_LOGS);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.actorName.toLowerCase().includes(search.toLowerCase()) ||
      log.targetReference.toLowerCase().includes(search.toLowerCase()) ||
      log.actionType.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || log.actorRole === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Staff Directory Cards */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 space-x-reverse">
            <UserCheck className="w-5 h-5 text-[#FF5A00]" />
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              {t.staff.activeStaff}
            </h3>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
            4 / 4 {activeLanguage === 'ckb' ? 'ئەندامی تیم چالاکن' : 'Team Members Active'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {staff.map((m) => (
            <div
              key={m.id}
              className="p-4 rounded-xl border border-slate-200 hover:border-orange-300 hover:shadow-md transition bg-gradient-to-b from-slate-50/50 to-white space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm leading-tight">{m.name}</h4>
                  <p className="text-[11px] text-slate-400 font-mono">{m.email}</p>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-100"></span>
              </div>

              <div className="space-y-1">
                <span className="inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-orange-100 text-[#FF5A00] tracking-wide">
                  {activeLanguage === 'ckb' ? m.roleCkb : m.role}
                </span>
                <p className="text-[11px] text-slate-600 font-medium">{m.warehouse}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                <span>{m.id}</span>
                <span className="text-emerald-600 font-semibold">{m.lastActive}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Immutable Audit Log Stream */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center space-x-2 space-x-reverse">
            <History className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                {t.staff.auditTrail}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {activeLanguage === 'ckb'
                  ? 'تۆماری نەگۆڕی دارکستۆر بەپێی کات بە شێوازی پارێزراو'
                  : 'Append-only ledger of sensitive inventory, financial, and picker decisions'}
              </p>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="flex items-center space-x-2 space-x-reverse">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute top-2.5 left-2.5 text-slate-400" />
              <input
                type="text"
                placeholder={activeLanguage === 'ckb' ? 'گەڕان لە تۆمارەکان...' : 'Search audit trail...'}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-100 border border-slate-200 rounded-lg focus:outline-none focus:border-[#FF5A00] text-slate-700 w-48"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="py-1.5 px-2.5 text-xs bg-slate-100 border border-slate-200 rounded-lg focus:outline-none focus:border-[#FF5A00] text-slate-700 font-medium"
            >
              <option value="ALL">{activeLanguage === 'ckb' ? 'هەموو پلەکان' : 'All Roles'}</option>
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="ACCOUNTANT">Accountant</option>
              <option value="PICKER">Picker</option>
              <option value="DISPATCHER">Dispatcher</option>
            </select>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-y border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">{t.staff.timestamp}</th>
                <th className="py-2.5 px-3">{t.staff.actor}</th>
                <th className="py-2.5 px-3">{t.staff.role}</th>
                <th className="py-2.5 px-3">{t.staff.action}</th>
                <th className="py-2.5 px-3">{t.staff.reference}</th>
                <th className="py-2.5 px-3">
                  {activeLanguage === 'ckb' ? 'وردەکارییەکان' : 'Details'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {formatDateSafe(log.createdAt)}
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-800 whitespace-nowrap">
                    {log.actorName}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-slate-100 text-slate-700 border border-slate-200">
                      {log.actorRole}
                    </span>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="font-mono font-bold text-[#FF5A00] text-[11px]">
                      {log.actionType}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                    {log.targetReference}
                  </td>
                  <td className="py-3 px-3 text-slate-600 max-w-md leading-relaxed">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function StaffPage() {
  const { activeLanguage } = useOps();
  const t = getTranslations(activeLanguage);

  return (
    <DashboardLayout
      title={t.staff.title}
      subtitle={t.staff.subtitle}
    >
      <StaffContent />
    </DashboardLayout>
  );
}
