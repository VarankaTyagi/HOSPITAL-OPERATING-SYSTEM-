'use client';

import React, { useState, useEffect } from 'react';
import {
  FlaskConical,
  CheckCircle2,
  Clock,
  FileCheck,
  AlertCircle,
  Search,
  RefreshCw,
  PlusCircle,
  FileText,
} from 'lucide-react';
import { laboratoryService } from '../../../services/laboratory.service';
import { LabOrder, LabOrderStatus } from '../../../types';

export default function LaboratoryDashboard() {
  const [orders, setOrders] = useState<LabOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Report Modal
  const [selectedOrder, setSelectedOrder] = useState<LabOrder | null>(null);
  const [findings, setFindings] = useState('');
  const [impression, setImpression] = useState('');
  const [comments, setComments] = useState('');
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    loadLabData();
  }, []);

  const loadLabData = async () => {
    try {
      setLoading(true);
      const data = await laboratoryService.getOrders();
      setOrders(data || []);
    } catch (err) {
      console.error('Failed to load lab orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCollectSample = async (sampleId: string) => {
    try {
      await laboratoryService.collectSample(sampleId, 'Lab Technician');
      alert('Sample collected and barcode accessioned!');
      loadLabData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to collect sample');
    }
  };

  const handleProcessSample = async (sampleId: string) => {
    try {
      await laboratoryService.processSample(sampleId, 'Lab Technician');
      alert('Sample analyzer run initiated!');
      loadLabData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to start processing');
    }
  };

  const handlePublishReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    try {
      setPublishing(true);
      await laboratoryService.publishReport(selectedOrder.id, {
        reportNumber: `REP-${Date.now().toString().slice(-6)}`,
        findings,
        impression,
        comments,
        status: 'FINAL',
      });
      alert('Diagnostic lab report verified & published to Patient EHR!');
      setSelectedOrder(null);
      setFindings('');
      setImpression('');
      setComments('');
      loadLabData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to publish report');
    } finally {
      setPublishing(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = filterStatus === 'ALL' || o.status === filterStatus;
    const matchesSearch =
      (o.testName || o.samples?.[0]?.testName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.orderNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.patient?.user?.firstName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.patient?.user?.lastName || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-violet-700 via-purple-700 to-indigo-900 p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <FlaskConical className="h-7 w-7 text-purple-300" />
              <h1 className="text-2xl font-bold">Diagnostic Pathology & Lab Workstation</h1>
            </div>
            <p className="text-xs text-purple-200 mt-1">
              Specimen Accessioning, High-Throughput Analyzers, Results Verification & Digital Reports
            </p>
          </div>
          <button
            onClick={loadLabData}
            className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3.5 py-2 text-xs font-semibold backdrop-blur hover:bg-white/20 transition"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Sync Orders
          </button>
        </div>

        {/* Counter cards */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-xl bg-white/10 p-3 backdrop-blur border border-white/20">
            <p className="text-xs text-purple-200">Total Workload</p>
            <p className="text-xl font-bold">{orders.length}</p>
          </div>
          <div className="rounded-xl bg-white/10 p-3 backdrop-blur border border-white/20">
            <p className="text-xs text-purple-200">Pending Collection</p>
            <p className="text-xl font-bold">{orders.filter((o) => o.status === 'ORDERED').length}</p>
          </div>
          <div className="rounded-xl bg-white/10 p-3 backdrop-blur border border-white/20">
            <p className="text-xs text-purple-200">In Analyzer</p>
            <p className="text-xl font-bold text-amber-200">
              {orders.filter((o) => o.status === 'PROCESSING' || o.status === 'SAMPLE_COLLECTED').length}
            </p>
          </div>
          <div className="rounded-xl bg-white/10 p-3 backdrop-blur border border-white/20">
            <p className="text-xs text-purple-200">Completed & Verified</p>
            <p className="text-xl font-bold text-emerald-300">
              {orders.filter((o) => o.status === 'COMPLETED').length}
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {['ALL', 'ORDERED', 'SAMPLE_COLLECTED', 'PROCESSING', 'COMPLETED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                filterStatus === status
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search test, order #, patient..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs focus:border-purple-500 focus:outline-none shadow-sm"
          />
        </div>
      </div>

      {/* Orders List */}
      <div className="grid gap-3">
        {filteredOrders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            No laboratory orders match your filter criteria.
          </div>
        ) : (
          filteredOrders.map((order) => {
            const sample = order.samples?.[0];
            return (
              <div
                key={order.id}
                className="flex flex-col md:flex-row md:items-center md:justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                    <FlaskConical className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">{order.testName}</h4>
                      <span className="text-xs text-slate-400 font-mono">#{order.orderNumber}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Patient:{' '}
                      <span className="font-semibold text-slate-800">
                        {order.patient?.user?.firstName} {order.patient?.user?.lastName}
                      </span>{' '}
                      (MRN: {order.patient?.mrn}) • Ordered by Dr.{' '}
                      {order.doctor?.user?.firstName} {order.doctor?.user?.lastName}
                    </p>
                    {order.clinicalNotes && (
                      <p className="text-xs text-slate-600 mt-1 italic">Notes: {order.clinicalNotes}</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-end md:items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      order.status === 'COMPLETED'
                        ? 'bg-emerald-50 text-emerald-700'
                        : order.status === 'PROCESSING'
                        ? 'bg-amber-50 text-amber-700'
                        : order.status === 'SAMPLE_COLLECTED'
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {order.status.replace('_', ' ')}
                  </span>

                  <div className="flex items-center gap-2">
                    {order.status === 'ORDERED' && sample && (
                      <button
                        onClick={() => handleCollectSample(sample.id)}
                        className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition"
                      >
                        Collect Specimen
                      </button>
                    )}

                    {order.status === 'SAMPLE_COLLECTED' && sample && (
                      <button
                        onClick={() => handleProcessSample(sample.id)}
                        className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 transition"
                      >
                        Start Analyzer Run
                      </button>
                    )}

                    {order.status === 'PROCESSING' && (
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-purple-700 transition"
                      >
                        Enter Results
                      </button>
                    )}

                    {order.status === 'COMPLETED' && order.report && (
                      <button
                        onClick={() => {
                          alert(`Report Findings:\n\n${order.report?.findings}\n\nImpression: ${order.report?.impression || 'Normal'}`);
                        }}
                        className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <FileText className="h-3.5 w-3.5 text-slate-500" />
                        View Report
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Enter Results & Publish Report Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-base font-bold text-slate-900 mb-2">Publish Pathology Report</h3>
            <p className="text-xs text-slate-500 mb-4">
              Order: <span className="font-semibold text-slate-800">{selectedOrder.testName}</span> (Order #{selectedOrder.orderNumber}) for{' '}
              {selectedOrder.patient?.user?.firstName} {selectedOrder.patient?.user?.lastName}
            </p>

            <form onSubmit={handlePublishReport} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Quantitative Findings / Lab Values</label>
                <textarea
                  rows={4}
                  value={findings}
                  onChange={(e) => setFindings(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 font-mono text-xs focus:border-purple-500 focus:outline-none"
                  placeholder="e.g. Hemoglobin: 14.2 g/dL (Normal: 13.5 - 17.5), Platelets: 250,000 /mcL, WBC: 6,500 /mcL"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Diagnostic Impression</label>
                <input
                  type="text"
                  value={impression}
                  onChange={(e) => setImpression(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-purple-500 focus:outline-none"
                  placeholder="e.g. Normocytic normochromic blood picture. Within normal anatomical ranges."
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Pathologist Notes / Comments</label>
                <input
                  type="text"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-purple-500 focus:outline-none"
                  placeholder="No acute abnormal blast cells detected."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={publishing}
                  className="rounded-lg bg-purple-600 px-4 py-2 font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
                >
                  {publishing ? 'Publishing...' : 'Sign & Publish Final Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
