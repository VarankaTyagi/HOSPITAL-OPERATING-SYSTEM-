'use client';

import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Cpu,
  BedDouble,
  Receipt,
  BarChart3,
  ShieldCheck,
  RefreshCw,
  Users,
  AlertTriangle,
  Building,
  CheckCircle2,
  Clock,
  Radio,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { DigitalTwinView } from '../../../components/DigitalTwinView';
import { digitalTwinService } from '../../../services/digital-twin.service';
import { analyticsService } from '../../../services/analytics.service';
import { bedService } from '../../../services/bed.service';
import { billingService } from '../../../services/billing.service';
import { api } from '../../../services/api';
import { DigitalTwinState, Bed, Bill } from '../../../types';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'twin' | 'beds' | 'billing' | 'analytics' | 'audit'>('overview');
  const [twinState, setTwinState] = useState<DigitalTwinState | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [twinData, analyticsData, bedsData, billsData, auditData] = await Promise.all([
        digitalTwinService.getState(),
        analyticsService.getOperationalMetrics().catch(() => null),
        bedService.getAll(),
        billingService.getAll(),
        api.get('/audit').then((r) => r.data.logs).catch(() => []),
      ]);

      setTwinState(twinData);
      setAnalytics(analyticsData);
      setBeds(bedsData);
      setBills(billsData);
      setAuditLogs(auditData);
    } catch (err) {
      console.error('Error loading admin operations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateBed = async (bedId: string, newStatus: any) => {
    try {
      await bedService.updateStatus(bedId, newStatus);
      loadData();
    } catch (err) {
      console.error('Failed to update bed:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <RefreshCw className="w-8 h-8 text-sky-600 animate-spin" />
        <p className="text-sm font-medium text-slate-600">Connecting to Hospital Operations Command Center...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Command Center Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Hospital Command Center</h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">
              OPERATIONAL
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Centralized supervisory dashboard tracking beds, clinical workloads, queues, and financial metrics in real time.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center space-x-1 bg-slate-200/80 p-1 rounded-xl text-xs font-semibold">
          {[
            { id: 'overview', label: 'Command Overview' },
            { id: 'twin', label: 'Digital Twin' },
            { id: 'beds', label: 'Bed Capacity' },
            { id: 'billing', label: 'Revenue & Bills' },
            { id: 'analytics', label: 'Analytics' },
            { id: 'audit', label: 'Audit Trail' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === t.id
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <DigitalTwinView />
        </div>
      )}

      {/* Tab: DIGITAL TWIN */}
      {activeTab === 'twin' && <DigitalTwinView />}

      {/* Tab: BED CAPACITY & ALLOCATIONS */}
      {activeTab === 'beds' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Hospital Bed Capacity Management</h3>
              <p className="text-xs text-slate-500">Live bed allocation status across ICUs, Emergency, and Wards.</p>
            </div>
            <span className="text-xs font-medium text-slate-600">{beds.length} Total Registered Beds</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {beds.map((bed) => (
              <div
                key={bed.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900">{bed.bedNumber}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 uppercase">
                    {bed.type}
                  </span>
                </div>

                <div className="text-xs text-slate-600 space-y-1">
                  <div>Department: <span className="font-semibold">{bed.department?.name}</span></div>
                  <div>Room: <span className="font-semibold">{bed.room?.roomNumber}</span></div>
                  <div>Daily Rate: <span className="font-semibold">${bed.dailyRate}</span></div>
                  {bed.notes && <div className="text-[11px] text-slate-500 italic">{bed.notes}</div>}
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      bed.status === 'AVAILABLE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : bed.status === 'OCCUPIED'
                          ? 'bg-sky-100 text-sky-800'
                          : bed.status === 'CLEANING'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {bed.status}
                  </span>

                  {/* Operational Status Action */}
                  <select
                    value={bed.status}
                    onChange={(e) => handleUpdateBed(bed.id, e.target.value)}
                    className="text-xs border border-slate-300 rounded px-1.5 py-0.5 bg-white"
                  >
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="OCCUPIED">OCCUPIED</option>
                    <option value="CLEANING">CLEANING</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: REVENUE & BILLS */}
      {activeTab === 'billing' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Patient Billing & Accounts Receivable</h3>
              <p className="text-xs text-slate-500">Invoices, fee breakdowns, and payment collection status.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b">
                <tr>
                  <th className="p-3">Invoice #</th>
                  <th className="p-3">Patient</th>
                  <th className="p-3">Total Amount</th>
                  <th className="p-3">Paid Amount</th>
                  <th className="p-3">Balance</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-slate-50/80">
                    <td className="p-3 font-mono font-semibold text-sky-700">{bill.invoiceNumber}</td>
                    <td className="p-3 font-medium text-slate-900">
                      {bill.patient?.firstName} {bill.patient?.lastName} ({bill.patient?.mrn})
                    </td>
                    <td className="p-3 font-semibold text-slate-900">${bill.netAmount}</td>
                    <td className="p-3 text-emerald-600 font-semibold">${bill.paidAmount}</td>
                    <td className="p-3 text-rose-600 font-semibold">${bill.balanceAmount}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          bill.status === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {bill.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500">{new Date(bill.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: OPERATIONAL ANALYTICS */}
      {activeTab === 'analytics' && analytics && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Department Workload Bar Chart */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Department Clinical Workload</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.departmentWorkload}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" fontSize={11} />
                    <YAxis fontSize={11} />
                    <Tooltip />
                    <Bar dataKey="appointments" fill="#0284c7" name="Appointments" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="admissions" fill="#0f766e" name="Admissions" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Weekly Volume Trend */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Weekly Patient Inflow Pattern</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.weeklyPatientVolume}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="day" fontSize={11} />
                    <YAxis fontSize={11} />
                    <Tooltip />
                    <Line type="monotone" dataKey="opd" stroke="#0284c7" strokeWidth={2} name="OPD Visits" />
                    <Line type="monotone" dataKey="emergency" stroke="#ef4444" strokeWidth={2} name="Emergency" />
                    <Line type="monotone" dataKey="ipd" stroke="#10b981" strokeWidth={2} name="Inpatient" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>Regulatory Audit Trail</span>
              </h3>
              <p className="text-xs text-slate-500">Immutable chronological log of all hospital transactions and access events.</p>
            </div>
            <span className="text-xs text-slate-400">{auditLogs.length} events logged</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">User</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Entity</th>
                  <th className="p-3">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {auditLogs.map((log, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-3 text-slate-500">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="p-3 font-semibold text-slate-900">
                      {log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System'}
                    </td>
                    <td className="p-3">{log.userRole || 'SYSTEM'}</td>
                    <td className="p-3 font-bold text-sky-700">{log.action}</td>
                    <td className="p-3 text-slate-700">{log.entity}</td>
                    <td className="p-3 text-slate-400">{log.ipAddress || '127.0.0.1'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
