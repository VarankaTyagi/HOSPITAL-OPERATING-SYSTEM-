'use client';

import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  Users,
  Ticket,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Plus,
  Send,
  FlaskConical,
  Pill,
  Activity,
  HeartPulse,
} from 'lucide-react';
import { appointmentService } from '../../../services/appointment.service';
import { queueService } from '../../../services/queue.service';
import { encounterService } from '../../../services/encounter.service';
import { laboratoryService } from '../../../services/laboratory.service';
import { pharmacyService } from '../../../services/pharmacy.service';
import { patientService } from '../../../services/patient.service';
import { Appointment, QueueTicket, Patient, Medicine, Encounter } from '../../../types';

export default function DoctorPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [activePatient, setActivePatient] = useState<Patient | null>(null);
  const [activeEncounter, setActiveEncounter] = useState<Encounter | null>(null);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [calledTicket, setCalledTicket] = useState<QueueTicket | null>(null);

  // Clinical Consultation Form state
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [icdCode, setIcdCode] = useState('');
  const [examNotes, setExamNotes] = useState('');
  const [bp, setBp] = useState('120/80');
  const [pulse, setPulse] = useState('72');
  const [temp, setTemp] = useState('98.6');
  const [spo2, setSpo2] = useState('99');

  // Prescriptions state
  const [prescribedItems, setPrescribedItems] = useState<any[]>([]);
  const [selectedMedId, setSelectedMedId] = useState('');
  const [dosage, setDosage] = useState('500mg');
  const [frequency, setFrequency] = useState('1-0-1 After Meals');
  const [durationDays, setDurationDays] = useState(5);
  const [quantity, setQuantity] = useState(10);

  // Lab orders state
  const [selectedTests, setSelectedTests] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const loadDoctorData = async () => {
    try {
      const [appts, meds, patientsRes] = await Promise.all([
        appointmentService.getAll(),
        pharmacyService.getMedicines(),
        patientService.getAll(),
      ]);
      setAppointments(appts);
      setMedicines(meds);

      // Select first patient with ongoing encounter or active appointment
      if (patientsRes.data && patientsRes.data.length > 0) {
        const fullPatient = await patientService.getById(patientsRes.data[0].id);
        setActivePatient(fullPatient);
        if (fullPatient.encounters && fullPatient.encounters.length > 0) {
          const enc = fullPatient.encounters[0];
          setActiveEncounter(enc);
          setChiefComplaint(enc.chiefComplaint || '');
          setDiagnosis(enc.diagnosis || '');
          setExamNotes(enc.examinationNotes || '');
        }
      }
    } catch (err) {
      console.error('Error loading doctor data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctorData();
  }, []);

  const handleCallNextPatient = async () => {
    try {
      const queues = await queueService.getAll();
      if (queues.length > 0) {
        const ticket = await queueService.callNext(queues[0].id);
        setCalledTicket(ticket);
        const p = await patientService.getById(ticket.patientId);
        setActivePatient(p);
        setMessage(`Called Patient: ${ticket.ticketNumber} (${p.firstName} ${p.lastName})`);
      }
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'No patients waiting in queue');
    }
  };

  const handleStartConsultation = async () => {
    if (!activePatient) return;
    setSaving(true);
    try {
      const doctors = appointments[0]?.doctor;
      const enc = await encounterService.start({
        patientId: activePatient.id,
        doctorId: doctors?.id || appointments[0]?.doctorId,
        appointmentId: appointments[0]?.id,
        chiefComplaint: chiefComplaint || 'Patient consultation review',
        vitals: { bp, pulse: Number(pulse), temp: Number(temp), spo2: Number(spo2) },
      });
      setActiveEncounter(enc);
      setMessage('Consultation initiated! Patient status updated to CONSULTATION.');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddMedicine = () => {
    const med = medicines.find((m) => m.id === selectedMedId);
    if (!med) return;
    setPrescribedItems([
      ...prescribedItems,
      {
        medicineId: med.id,
        medicineName: med.name,
        dosage,
        frequency,
        durationDays,
        quantity,
      },
    ]);
  };

  const handleCompleteConsultation = async () => {
    if (!activeEncounter) return;
    setSaving(true);
    try {
      // 1. Issue Prescription if any items added
      if (prescribedItems.length > 0) {
        await pharmacyService.createPrescription({
          patientId: activePatient!.id,
          doctorId: activeEncounter.doctorId,
          encounterId: activeEncounter.id,
          items: prescribedItems,
          notes: 'Take as directed.',
        });
      }

      // 2. Order Lab Tests if selected
      if (selectedTests.length > 0) {
        await laboratoryService.createOrder({
          patientId: activePatient!.id,
          doctorId: activeEncounter.doctorId,
          encounterId: activeEncounter.id,
          priority: 'NORMAL',
          tests: selectedTests.map((t) => ({ name: t, code: t.replace(/\s+/g, '-').toUpperCase() })),
        });
      }

      // 3. Complete Encounter
      await encounterService.complete(activeEncounter.id, {
        diagnosis,
        icdCode,
        examinationNotes: examNotes,
      });

      setMessage('Consultation completed successfully! Orders routed to Lab/Pharmacy.');
      loadDoctorData();
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Error completing consultation');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Stethoscope className="w-5 h-5 text-teal-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Doctor Clinical Workstation</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Conduct consultations, record vitals, place diagnostic lab orders, and issue digital prescriptions.
          </p>
        </div>

        <button
          onClick={handleCallNextPatient}
          className="flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-500 hover:to-sky-500 text-white font-bold text-xs rounded-xl shadow-md shadow-teal-500/20 transition"
        >
          <Ticket className="w-4 h-4" />
          <span>Call Next Patient</span>
        </button>
      </div>

      {message && (
        <div className="p-3 bg-sky-50 border border-sky-200 text-sky-800 text-xs rounded-xl flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage('')} className="text-slate-400 hover:text-slate-600 font-bold">
            ×
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Scheduled Appointments & Queue Patients */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between">
              <span>Today's Consultation List</span>
              <span className="text-xs text-slate-500">{appointments.length} patients</span>
            </h3>

            <div className="space-y-2">
              {appointments.map((appt) => (
                <div
                  key={appt.id}
                  onClick={async () => {
                    const full = await patientService.getById(appt.patientId);
                    setActivePatient(full);
                  }}
                  className={`p-3 rounded-xl border text-xs transition cursor-pointer ${
                    activePatient?.id === appt.patientId
                      ? 'border-teal-500 bg-teal-50/30 ring-2 ring-teal-500/10'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">
                      {appt.patient?.firstName} {appt.patient?.lastName}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">{appt.timeSlot}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">MRN: {appt.patient?.mrn}</div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[10px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded font-semibold">
                      {appt.type}
                    </span>
                    <span className="text-[10px] text-slate-600 font-medium">{appt.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center & Right Column: Active Clinical Encounter */}
        <div className="lg:col-span-2 space-y-4">
          {activePatient ? (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
              {/* Patient Profile Card */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-lg font-bold text-slate-900">
                      {activePatient.firstName} {activePatient.lastName}
                    </h2>
                    <span className="text-xs text-slate-500">
                      ({activePatient.gender}, {activePatient.bloodGroup})
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-sky-100 text-sky-800">
                      {activePatient.currentStatus}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    MRN: {activePatient.mrn} • Allergies: {activePatient.allergies || 'None reported'}
                  </p>
                </div>

                {!activeEncounter && (
                  <button
                    onClick={handleStartConsultation}
                    disabled={saving}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl shadow-xs transition"
                  >
                    Start Consultation
                  </button>
                )}
              </div>

              {/* Vitals Signs Grid */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <HeartPulse className="w-4 h-4 text-rose-500" />
                  <span>Vital Signs</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Blood Pressure</span>
                    <input
                      type="text"
                      value={bp}
                      onChange={(e) => setBp(e.target.value)}
                      className="font-bold text-slate-900 mt-1 bg-transparent w-full focus:outline-hidden"
                    />
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Pulse (BPM)</span>
                    <input
                      type="text"
                      value={pulse}
                      onChange={(e) => setPulse(e.target.value)}
                      className="font-bold text-slate-900 mt-1 bg-transparent w-full focus:outline-hidden"
                    />
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Temperature (°F)</span>
                    <input
                      type="text"
                      value={temp}
                      onChange={(e) => setTemp(e.target.value)}
                      className="font-bold text-slate-900 mt-1 bg-transparent w-full focus:outline-hidden"
                    />
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">SpO2 (%)</span>
                    <input
                      type="text"
                      value={spo2}
                      onChange={(e) => setSpo2(e.target.value)}
                      className="font-bold text-slate-900 mt-1 bg-transparent w-full focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Chief Complaint & Clinical Diagnosis */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Chief Complaint</label>
                  <textarea
                    rows={2}
                    value={chiefComplaint}
                    onChange={(e) => setChiefComplaint(e.target.value)}
                    placeholder="Patient describes chest pain, fever, coughing..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Provisional Diagnosis</label>
                    <input
                      type="text"
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                      placeholder="e.g. Acute Bronchitis, Angina Pectoris"
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">ICD-10 Code</label>
                    <input
                      type="text"
                      value={icdCode}
                      onChange={(e) => setIcdCode(e.target.value)}
                      placeholder="e.g. I20.9, J20.9"
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Examination Notes</label>
                  <textarea
                    rows={2}
                    value={examNotes}
                    onChange={(e) => setExamNotes(e.target.value)}
                    placeholder="Bilateral breath sounds clear, heart sounds normal..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
                  />
                </div>
              </div>

              {/* Order Lab Tests Section */}
              <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-200 space-y-3">
                <div className="flex items-center space-x-2 text-xs font-bold text-purple-900">
                  <FlaskConical className="w-4 h-4 text-purple-600" />
                  <span>Order Diagnostic Laboratory Tests</span>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  {[
                    'Complete Blood Count (CBC)',
                    'High-Sensitivity Troponin-I',
                    'Lipid Profile Comprehensive',
                    'Renal Function Panel (RFT)',
                    'Liver Function Test (LFT)',
                    'HbA1c Glycated Hemoglobin',
                  ].map((test) => {
                    const isChecked = selectedTests.includes(test);
                    return (
                      <button
                        key={test}
                        type="button"
                        onClick={() =>
                          setSelectedTests(
                            isChecked ? selectedTests.filter((t) => t !== test) : [...selectedTests, test],
                          )
                        }
                        className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition ${
                          isChecked
                            ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                            : 'bg-white text-slate-700 border-purple-200 hover:bg-purple-100/50'
                        }`}
                      >
                        {isChecked ? '✓ ' : '+ '}
                        {test}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* E-Prescription Builder */}
              <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                  <div className="flex items-center space-x-2">
                    <Pill className="w-4 h-4 text-emerald-600" />
                    <span>Prescribe Medication</span>
                  </div>
                  <span className="text-[11px] text-emerald-700">{prescribedItems.length} items added</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                  <select
                    value={selectedMedId}
                    onChange={(e) => setSelectedMedId(e.target.value)}
                    className="p-2 bg-white border border-emerald-200 rounded-lg sm:col-span-2"
                  >
                    <option value="">Select Medicine from Catalogue...</option>
                    {medicines.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.strength}) - ${m.unitPrice}
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    placeholder="Frequency (e.g. 1-0-1)"
                    className="p-2 bg-white border border-emerald-200 rounded-lg"
                  />

                  <button
                    type="button"
                    onClick={handleAddMedicine}
                    className="px-3 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-500 transition"
                  >
                    + Add Drug
                  </button>
                </div>

                {prescribedItems.length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    {prescribedItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2 bg-white rounded-lg border border-emerald-200 text-xs flex items-center justify-between"
                      >
                        <span className="font-bold text-slate-800">{item.medicineName}</span>
                        <span className="text-slate-600">{item.frequency} • {item.durationDays} days (Qty: {item.quantity})</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Complete Action */}
              <div className="pt-4 border-t border-slate-200 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCompleteConsultation}
                  disabled={saving || !activeEncounter}
                  className="px-6 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-xs rounded-xl shadow-md shadow-teal-500/20 transition flex items-center space-x-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Finalize & Complete Consultation</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-500 text-xs">
              Select an appointment or call a patient from the queue to start consultation.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
