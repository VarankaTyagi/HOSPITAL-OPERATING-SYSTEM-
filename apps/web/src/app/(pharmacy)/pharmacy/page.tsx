'use client';

import React, { useState, useEffect } from 'react';
import {
  Pill,
  CheckCircle,
  AlertTriangle,
  Package,
  Search,
  RefreshCw,
  Clock,
  CheckCircle2,
  Box,
} from 'lucide-react';
import { pharmacyService } from '../../../services/pharmacy.service';
import { Prescription, Inventory, Medicine } from '../../../types';

export default function PharmacyDashboard() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'queue' | 'inventory'>('queue');
  const [searchQuery, setSearchQuery] = useState('');
  const [dispensingId, setDispensingId] = useState<string | null>(null);

  useEffect(() => {
    loadPharmacyData();
  }, []);

  const loadPharmacyData = async () => {
    try {
      setLoading(true);
      const [rxs, inv] = await Promise.all([
        pharmacyService.getPrescriptions(),
        pharmacyService.getInventory(),
      ]);
      setPrescriptions(rxs || []);
      setInventory(inv || []);
    } catch (err) {
      console.error('Failed to load pharmacy data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDispense = async (prescriptionId: string) => {
    try {
      setDispensingId(prescriptionId);
      await pharmacyService.dispense(prescriptionId, 'Staff Pharmacist');
      alert('Medications verified & dispensed! Pharmacy inventory updated.');
      loadPharmacyData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to dispense prescription');
    } finally {
      setDispensingId(null);
    }
  };

  const pendingPrescriptions = prescriptions.filter(
    (p) => (p.status as any) === 'PENDING' || (p.status as any) === 'ISSUED'
  );
  const lowStockItems = inventory.filter(
    (i) => i.status === 'LOW_STOCK' || (i.quantity ?? i.currentStock ?? 0) <= (i.reorderLevel ?? i.minStockLevel ?? 10)
  );

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Pill className="h-7 w-7 text-amber-200" />
              <h1 className="text-2xl font-bold">Hospital Pharmacy & Dispensary</h1>
            </div>
            <p className="text-xs text-amber-100 mt-1">
              Prescription Verification, Batch Inventory Control, Drug Safety & Automated Dispensing
            </p>
          </div>
          <button
            onClick={loadPharmacyData}
            className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3.5 py-2 text-xs font-semibold backdrop-blur hover:bg-white/20 transition"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Sync Dispensary
          </button>
        </div>

        {/* Quick Stats */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-xl bg-white/10 p-3 backdrop-blur border border-white/20">
            <p className="text-xs text-amber-100">Prescription Orders</p>
            <p className="text-xl font-bold">{prescriptions.length}</p>
          </div>
          <div className="rounded-xl bg-white/10 p-3 backdrop-blur border border-white/20">
            <p className="text-xs text-amber-100">Awaiting Dispense</p>
            <p className="text-xl font-bold text-amber-200">{pendingPrescriptions.length}</p>
          </div>
          <div className="rounded-xl bg-white/10 p-3 backdrop-blur border border-white/20">
            <p className="text-xs text-amber-100">Total Formulary SKUs</p>
            <p className="text-xl font-bold">{inventory.length}</p>
          </div>
          <div className="rounded-xl bg-white/10 p-3 backdrop-blur border border-white/20">
            <p className="text-xs text-amber-100">Low Stock Warnings</p>
            <p className="text-xl font-bold text-red-200">{lowStockItems.length}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab('queue')}
          className={`pb-3 text-sm font-medium transition border-b-2 flex items-center gap-2 ${
            activeTab === 'queue'
              ? 'border-amber-600 text-amber-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="h-4 w-4" />
          Dispensing Queue ({pendingPrescriptions.length})
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`pb-3 text-sm font-medium transition border-b-2 flex items-center gap-2 ${
            activeTab === 'inventory'
              ? 'border-amber-600 text-amber-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Package className="h-4 w-4" />
          Formulary Inventory ({inventory.length})
        </button>
      </div>

      {/* Tab: Prescriptions Queue */}
      {activeTab === 'queue' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold text-slate-800">Pending & Dispensed Electronic Prescriptions</h2>
          </div>

          <div className="grid gap-4">
            {prescriptions.map((rx) => (
              <div
                key={rx.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3 gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">
                        {rx.patient?.user?.firstName} {rx.patient?.user?.lastName}
                      </h4>
                      <span className="font-mono text-xs text-slate-400">MRN: {rx.patient?.mrn}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Prescription #{rx.prescriptionNumber} • Prescribed by Dr. {rx.doctor?.user?.firstName} {rx.doctor?.user?.lastName} on{' '}
                      {new Date(rx.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        rx.status === 'DISPENSED'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {rx.status}
                    </span>

                    {rx.status === 'PENDING' && (
                      <button
                        onClick={() => handleDispense(rx.id)}
                        disabled={dispensingId === rx.id}
                        className="rounded-xl bg-amber-600 px-4 py-1.5 text-xs font-bold text-white shadow hover:bg-amber-700 disabled:opacity-50 transition"
                      >
                        {dispensingId === rx.id ? 'Dispensing...' : 'Dispense Medications'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Items */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {rx.items?.map((item, idx) => (
                    <div key={idx} className="rounded-xl bg-slate-50 p-2.5 border border-slate-100 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">{item.medicine?.name}</span>
                        <span className="rounded bg-slate-200 px-1.5 py-0.2 font-mono text-[10px]">
                          Qty: {item.quantity}
                        </span>
                      </div>
                      <p className="text-slate-600 mt-1">
                        {item.dosage} • {item.frequency}
                      </p>
                      <p className="text-[11px] text-slate-400">Duration: {item.duration}</p>
                      {item.instructions && (
                        <p className="text-[11px] text-amber-700 mt-0.5 italic">{item.instructions}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Inventory Stock */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800">Pharmacy Inventory & Stock Batches</h2>
            <div className="relative w-64">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search medication stock..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="p-3 font-semibold">Medication Name</th>
                  <th className="p-3 font-semibold">Batch #</th>
                  <th className="p-3 font-semibold">In Stock</th>
                  <th className="p-3 font-semibold">Reorder Threshold</th>
                  <th className="p-3 font-semibold">Expiry Date</th>
                  <th className="p-3 font-semibold">Stock Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inventory
                  .filter((inv) =>
                    inv.medicine?.name.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/50">
                      <td className="p-3">
                        <span className="font-bold text-slate-800">{inv.medicine?.name}</span>
                        <span className="block text-[10px] text-slate-400 font-mono">
                          {inv.medicine?.sku || inv.medicine?.code || 'MED'}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-slate-600">{inv.batchNumber}</td>
                      <td className="p-3 font-bold text-slate-800">{inv.quantity ?? inv.currentStock ?? 0} units</td>
                      <td className="p-3 text-slate-500">{inv.reorderLevel ?? inv.minStockLevel ?? 0} units</td>
                      <td className="p-3 text-slate-600">
                        {new Date(inv.expiryDate).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            (inv.quantity ?? inv.currentStock ?? 0) <= (inv.reorderLevel ?? inv.minStockLevel ?? 10)
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {(inv.quantity ?? inv.currentStock ?? 0) <= (inv.reorderLevel ?? inv.minStockLevel ?? 10) ? 'LOW STOCK' : 'IN STOCK'}
                        </span>
                      </td>
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
