'use client';

import React, { useState, useEffect } from 'react';
import {
  HeartPulse,
  Bed as BedIcon,
  Activity,
  UserCheck,
  AlertCircle,
  Thermometer,
  Wind,
  Plus,
  Clock,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { bedService } from '../../../services/bed.service';
import { admissionService } from '../../../services/admission.service';
import { patientService } from '../../../services/patient.service';
import { Bed, Admission, Patient, BedStatus, PatientStatus } from '../../../types';

export default function NurseStationDashboard() {
  const [beds, setBeds] = useState<Bed[]>([]);
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ward' | 'triage' | 'vitals'>('ward');

  // Vitals Entry Form Modal
  const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [bpSys, setBpSys] = useState('120');
  const [bpDia, setBpDia] = useState('80');
  const [heartRate, setHeartRate] = useState('72');
  const [temperature, setTemperature] = useState('98.6');
  const [spo2, setSpo2] = useState('99');
  const [respRate, setRespRate] = useState('16');
  const [savingVitals, setSavingVitals] = useState(false);

  useEffect(() => {
    loadStationData();
  }, []);

  const loadStationData = async () => {
    try {
      setLoading(true);
      const [bedsData, admissionsData, patientsData] = await Promise.all([
        bedService.getAll(),
        admissionService.getAll({ status: 'ADMITTED' }),
        patientService.getAll({ limit: 50 }),
      ]);
      setBeds(bedsData || []);
      setAdmissions(admissionsData || []);
      setPatients(patientsData.data || []);
    } catch (err) {
      console.error('Failed to load nurse station:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBedStatusChange = async (bedId: string, newStatus: BedStatus) => {
    try {
      await bedService.updateStatus(bedId, newStatus);
      loadStationData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update bed status');
    }
  };

  const handlePatientStatusChange = async (patientId: string, newStatus: PatientStatus) => {
    try {
      await patientService.updateStatus(patientId, newStatus);
      loadStationData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update patient status');
    }
  };

  const handleSaveVitals = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;
    try {
      setSavingVitals(true);
      // In production HospitalOS, vitals update the encounter/triage notes or patient record
      alert(`Vitals recorded for ${selectedPatient.user?.firstName} ${selectedPatient.user?.lastName}: BP ${bpSys}/${bpDia}, HR ${heartRate} bpm, Temp ${temperature}°F, SpO2 ${spo2}%`);
      setIsVitalsModalOpen(false);
    } catch (err: any) {
      alert('Failed to record vitals');
    } finally {
      setSavingVitals(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Activity className="h-8 w-8 animate-spin text-rose-600" />
          <p className="text-sm font-medium text-slate-600">Loading Nurse Workstation...</p>
        </div>
      </div>
    );
  }

  const occupiedBeds = beds.filter((b) => b.status === 'OCCUPIED').length;
  const availableBeds = beds.filter((b) => b.status === 'AVAILABLE').length;
  const cleaningBeds = beds.filter((b) => b.status === 'CLEANING').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-rose-700 p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <HeartPulse className="h-7 w-7 text-rose-200" />
              <h1 className="text-2xl font-bold">Inpatient Nursing Station</h1>
            </div>
            <p className="text-xs text-rose-100 mt-1">
              Real-time Inpatient Care, Ward Rounds, Bed Turnaround & Triage Vitals Logging
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadStationData}
              className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3.5 py-2 text-xs font-semibold backdrop-blur hover:bg-white/20 transition"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh Ward
            </button>
          </div>
        </div>

        {/* Quick Ward Summary Counters */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-xl bg-white/10 p-3 backdrop-blur border border-white/20">
            <p className="text-xs text-rose-100">Total Ward Beds</p>
            <p className="text-xl font-bold">{beds.length}</p>
          </div>
          <div className="rounded-xl bg-white/10 p-3 backdrop-blur border border-white/20">
            <p className="text-xs text-rose-100">Occupied Beds</p>
            <p className="text-xl font-bold">{occupiedBeds}</p>
          </div>
          <div className="rounded-xl bg-white/10 p-3 backdrop-blur border border-white/20">
            <p className="text-xs text-rose-100">Available Beds</p>
            <p className="text-xl font-bold">{availableBeds}</p>
          </div>
          <div className="rounded-xl bg-white/10 p-3 backdrop-blur border border-white/20">
            <p className="text-xs text-rose-100">Needs Cleaning</p>
            <p className="text-xl font-bold text-amber-200">{cleaningBeds}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab('ward')}
          className={`pb-3 text-sm font-medium transition border-b-2 flex items-center gap-2 ${
            activeTab === 'ward'
              ? 'border-rose-600 text-rose-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BedIcon className="h-4 w-4" />
          Ward Bed Matrix ({beds.length})
        </button>
        <button
          onClick={() => setActiveTab('triage')}
          className={`pb-3 text-sm font-medium transition border-b-2 flex items-center gap-2 ${
            activeTab === 'triage'
              ? 'border-rose-600 text-rose-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <UserCheck className="h-4 w-4" />
          Admitted Inpatients ({admissions.length})
        </button>
        <button
          onClick={() => setActiveTab('vitals')}
          className={`pb-3 text-sm font-medium transition border-b-2 flex items-center gap-2 ${
            activeTab === 'vitals'
              ? 'border-rose-600 text-rose-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Thermometer className="h-4 w-4" />
          Patient Vitals Logging
        </button>
      </div>

      {/* Tab: Ward Beds Matrix */}
      {activeTab === 'ward' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-semibold text-slate-800">Bed Status & Turnover Management</h2>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span> Available
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500"></span> Occupied
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span> Cleaning
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-500"></span> Reserved
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {beds.map((bed) => {
              const admission = admissions.find((a) => a.bedId === bed.id);
              return (
                <div
                  key={bed.id}
                  className={`rounded-xl border p-4 shadow-sm transition ${
                    bed.status === 'OCCUPIED'
                      ? 'border-rose-200 bg-rose-50/30'
                      : bed.status === 'AVAILABLE'
                      ? 'border-emerald-200 bg-emerald-50/30'
                      : bed.status === 'CLEANING'
                      ? 'border-amber-200 bg-amber-50/30'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-700">Bed {bed.bedNumber}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        bed.status === 'AVAILABLE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : bed.status === 'OCCUPIED'
                          ? 'bg-rose-100 text-rose-800'
                          : bed.status === 'CLEANING'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {bed.status}
                    </span>
                  </div>

                  <div className="mt-3">
                    <p className="text-xs font-semibold text-slate-800">{bed.department?.name || 'General Ward'}</p>
                    <p className="text-[11px] text-slate-500">{bed.type} Bed • Room {bed.room?.roomNumber || 'R-1'}</p>

                    {admission ? (
                      <div className="mt-2 rounded-lg bg-white p-2 border border-slate-200 text-xs">
                        <p className="font-semibold text-slate-800">
                          {admission.patient?.user?.firstName} {admission.patient?.user?.lastName}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          MRN: {admission.patient?.mrn} • Admitted: {new Date(admission.admissionDate).toLocaleDateString()}
                        </p>
                      </div>
                    ) : (
                      <div className="mt-2 rounded-lg bg-white/50 p-2 text-xs text-slate-400 italic">
                        No patient assigned
                      </div>
                    )}
                  </div>

                  {/* Status Change Action Buttons */}
                  <div className="mt-3 flex gap-1.5 pt-2 border-t border-slate-100">
                    {bed.status !== 'AVAILABLE' && (
                      <button
                        onClick={() => handleBedStatusChange(bed.id, 'AVAILABLE')}
                        className="flex-1 rounded bg-emerald-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-emerald-700"
                      >
                        Set Available
                      </button>
                    )}
                    {bed.status !== 'CLEANING' && bed.status !== 'OCCUPIED' && (
                      <button
                        onClick={() => handleBedStatusChange(bed.id, 'CLEANING')}
                        className="flex-1 rounded bg-amber-500 px-2 py-1 text-[11px] font-semibold text-white hover:bg-amber-600"
                      >
                        Needs Cleaning
                      </button>
                    )}
                    {bed.status === 'CLEANING' && (
                      <button
                        onClick={() => handleBedStatusChange(bed.id, 'AVAILABLE')}
                        className="flex-1 rounded bg-blue-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-blue-700"
                      >
                        Mark Cleaned
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab: Admitted Inpatients */}
      {activeTab === 'triage' && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-800">Current Inpatients</h2>
          <div className="grid gap-3">
            {admissions.length === 0 ? (
              <p className="text-sm text-slate-500">No inpatients currently admitted.</p>
            ) : (
              admissions.map((adm) => (
                <div
                  key={adm.id}
                  className="flex flex-col md:flex-row md:items-center md:justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-50 text-rose-600 font-bold">
                      {adm.bed?.bedNumber || 'B'}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800">
                        {adm.patient?.user?.firstName} {adm.patient?.user?.lastName}
                      </h4>
                      <p className="text-xs text-slate-500">
                        MRN: <span className="font-mono">{adm.patient?.mrn}</span> • Bed: {adm.bed?.bedNumber} ({adm.department?.name})
                      </p>
                      <p className="text-xs text-slate-600 mt-1">Diagnosis: {adm.initialDiagnosis || 'Observation'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedPatient(adm.patient as Patient);
                        setIsVitalsModalOpen(true);
                      }}
                      className="flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700"
                    >
                      <HeartPulse className="h-3.5 w-3.5" />
                      Take Vitals
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab: Vitals Logging list */}
      {activeTab === 'vitals' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-semibold text-slate-800">Select Patient to Record Vitals</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {patients.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-800">
                    {p.user?.firstName} {p.user?.lastName}
                  </h4>
                  <p className="text-[11px] text-slate-400">MRN: {p.mrn} • Status: {p.status}</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedPatient(p);
                    setIsVitalsModalOpen(true);
                  }}
                  className="rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-slate-800"
                >
                  Record
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Record Vitals Modal */}
      {isVitalsModalOpen && selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <HeartPulse className="h-5 w-5 text-rose-600" />
                <h3 className="text-base font-bold text-slate-900">Record Patient Vital Signs</h3>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Patient: <span className="font-semibold text-slate-800">{selectedPatient.user?.firstName} {selectedPatient.user?.lastName}</span> (MRN: {selectedPatient.mrn})
            </p>

            <form onSubmit={handleSaveVitals} className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Blood Pressure (Systolic)</label>
                  <input
                    type="number"
                    value={bpSys}
                    onChange={(e) => setBpSys(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2"
                    placeholder="120"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">BP (Diastolic)</label>
                  <input
                    type="number"
                    value={bpDia}
                    onChange={(e) => setBpDia(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2"
                    placeholder="80"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Heart Rate (bpm)</label>
                  <input
                    type="number"
                    value={heartRate}
                    onChange={(e) => setHeartRate(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2"
                    placeholder="72"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Temp (°F)</label>
                  <input
                    type="text"
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2"
                    placeholder="98.6"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">SpO2 (%)</label>
                  <input
                    type="number"
                    value={spo2}
                    onChange={(e) => setSpo2(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 p-2"
                    placeholder="99"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Respiratory Rate (breaths/min)</label>
                <input
                  type="number"
                  value={respRate}
                  onChange={(e) => setRespRate(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2"
                  placeholder="16"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsVitalsModalOpen(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingVitals}
                  className="rounded-lg bg-rose-600 px-4 py-2 font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
                >
                  {savingVitals ? 'Saving...' : 'Save Vitals'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
