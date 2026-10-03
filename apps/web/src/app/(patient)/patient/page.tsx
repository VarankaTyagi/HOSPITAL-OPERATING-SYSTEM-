'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  FileText,
  Activity,
  CreditCard,
  User,
  AlertCircle,
  CheckCircle,
  PlusCircle,
  Bell,
  Stethoscope,
  Pill,
  Download,
  Building,
} from 'lucide-react';
import { patientService } from '../../../services/patient.service';
import { appointmentService } from '../../../services/appointment.service';
import { pharmacyService } from '../../../services/pharmacy.service';
import { laboratoryService } from '../../../services/laboratory.service';
import { billingService } from '../../../services/billing.service';
import { queueService } from '../../../services/queue.service';
import { PatientJourneyTimeline } from '../../../components/PatientJourneyTimeline';
import { Patient, Appointment, Prescription, LabOrder, Bill, QueueTicket } from '../../../types';

export default function PatientDashboard() {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [labOrders, setLabOrders] = useState<LabOrder[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [activeTicket, setActiveTicket] = useState<QueueTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'journey' | 'appointments' | 'prescriptions' | 'labs' | 'billing'>('journey');

  // Book Appointment Modal State
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [bookDoctorId, setBookDoctorId] = useState('');
  const [bookDeptId, setBookDeptId] = useState('');
  const [bookDate, setBookDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookTime, setBookTime] = useState('10:00 AM');
  const [bookReason, setBookReason] = useState('Routine Checkup');
  const [submittingBook, setSubmittingBook] = useState(false);

  // Pay Modal State
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    loadPatientData();
  }, []);

  const loadPatientData = async () => {
    try {
      setLoading(true);
      // Get patients list, use first patient (John Doe or seeded patient)
      const res = await patientService.getAll({ limit: 1 });
      const currentPatient = res.data?.[0];
      if (currentPatient) {
        setPatient(currentPatient);
        // Load patient specific entities
        const [appts, rxs, labs, billsList, queues] = await Promise.all([
          appointmentService.getAll({ patientId: currentPatient.id }),
          pharmacyService.getPrescriptions({ patientId: currentPatient.id }),
          laboratoryService.getOrders({ patientId: currentPatient.id }),
          billingService.getAll({ patientId: currentPatient.id }),
          queueService.getAll(),
        ]);

        setAppointments(appts || []);
        setPrescriptions(rxs || []);
        setLabOrders(labs || []);
        setBills(billsList || []);

        // Find active queue ticket for this patient
        let foundTicket: QueueTicket | null = null;
        for (const q of queues || []) {
          const match = q.tickets?.find(
            (t: any) => t.patientId === currentPatient.id && t.status !== 'COMPLETED' && t.status !== 'CANCELLED'
          );
          if (match) {
            foundTicket = match;
            break;
          }
        }
        setActiveTicket(foundTicket);
      }
    } catch (err) {
      console.error('Failed to load patient dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (appointmentId: string) => {
    try {
      const res = await appointmentService.checkIn(appointmentId);
      alert(`Check-in successful! Your Queue Token: ${res.ticket?.ticketNumber || 'Assigned'}`);
      loadPatientData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Check-in failed');
    }
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient) return;
    try {
      setSubmittingBook(true);
      await appointmentService.create({
        patientId: patient.id,
        doctorId: bookDoctorId || 'cm81d0ct0r1d0001', // fallbacks or dynamically picked
        departmentId: bookDeptId || 'cm81dept1d0001',
        appointmentDate: new Date(bookDate).toISOString(),
        timeSlot: bookTime,
        reason: bookReason,
      });
      setIsBookModalOpen(false);
      alert('Appointment booked successfully!');
      loadPatientData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to book appointment');
    } finally {
      setSubmittingBook(false);
    }
  };

  const handlePayBill = async () => {
    if (!selectedBill) return;
    try {
      setPaying(true);
      await billingService.recordPayment({
        billId: selectedBill.id,
        amount: Number(selectedBill.totalAmount),
        method: 'CREDIT_CARD',
        transactionRef: `TXN-${Date.now()}`,
      });
      alert('Payment successful!');
      setSelectedBill(null);
      loadPatientData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Payment failed');
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Activity className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm font-medium text-slate-600">Loading Patient Portal...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-12 text-center">
        <AlertCircle className="mx-auto h-10 w-10 text-amber-500" />
        <h3 className="mt-2 text-lg font-semibold text-slate-800">No Patient Record Found</h3>
        <p className="text-sm text-slate-500">Please contact reception to create or link your patient chart.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Profile Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 p-6 text-white shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-2xl font-bold backdrop-blur">
              {patient.user?.firstName?.[0]}
              {patient.user?.lastName?.[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">
                  {patient.user?.firstName} {patient.user?.lastName}
                </h1>
                <span className="rounded-full bg-blue-500/30 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-blue-100 border border-blue-400/30">
                  {patient.status}
                </span>
              </div>
              <p className="text-xs text-blue-200 mt-1">
                MRN: <span className="font-mono font-medium text-white">{patient.mrn}</span> • Blood Group:{' '}
                <span className="font-semibold text-white">{patient.bloodGroup || 'O+'}</span> • Gender:{' '}
                <span className="text-white">{patient.gender}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsBookModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-blue-900 shadow hover:bg-blue-50 transition"
            >
              <PlusCircle className="h-4 w-4 text-blue-600" />
              Book Appointment
            </button>
          </div>
        </div>

        {/* Live Token alert if active */}
        {activeTicket && (
          <div className="mt-4 rounded-xl bg-white/10 p-3 backdrop-blur border border-white/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-400/30">
                #{activeTicket.ticketNumber}
              </div>
              <div>
                <p className="text-xs font-medium text-blue-200">Current Queue Position</p>
                <p className="text-sm font-semibold text-white">
                  Token #{activeTicket.ticketNumber} — Status:{' '}
                  <span className="text-emerald-300 capitalize">{activeTicket.status.toLowerCase()}</span>
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-blue-200">Priority: {activeTicket.priority}</span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab('journey')}
          className={`pb-3 text-sm font-medium transition border-b-2 flex items-center gap-2 ${
            activeTab === 'journey'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Activity className="h-4 w-4" />
          Patient Journey Timeline
        </button>
        <button
          onClick={() => setActiveTab('appointments')}
          className={`pb-3 text-sm font-medium transition border-b-2 flex items-center gap-2 ${
            activeTab === 'appointments'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="h-4 w-4" />
          Appointments ({appointments.length})
        </button>
        <button
          onClick={() => setActiveTab('prescriptions')}
          className={`pb-3 text-sm font-medium transition border-b-2 flex items-center gap-2 ${
            activeTab === 'prescriptions'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Pill className="h-4 w-4" />
          Prescriptions ({prescriptions.length})
        </button>
        <button
          onClick={() => setActiveTab('labs')}
          className={`pb-3 text-sm font-medium transition border-b-2 flex items-center gap-2 ${
            activeTab === 'labs'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="h-4 w-4" />
          Lab Results ({labOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('billing')}
          className={`pb-3 text-sm font-medium transition border-b-2 flex items-center gap-2 ${
            activeTab === 'billing'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CreditCard className="h-4 w-4" />
          Billing & Invoices ({bills.length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'journey' && (
        <div className="space-y-6">
          <PatientJourneyTimeline patient={patient} />
        </div>
      )}

      {activeTab === 'appointments' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-semibold text-slate-800">Your Consultations & Visits</h2>
            <button
              onClick={() => setIsBookModalOpen(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              <PlusCircle className="h-4 w-4" />
              Book New
            </button>
          </div>

          <div className="grid gap-3">
            {appointments.length === 0 ? (
              <p className="text-sm text-slate-500">No scheduled appointments.</p>
            ) : (
              appointments.map((appt) => (
                <div
                  key={appt.id}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <Stethoscope className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800">
                        Dr. {appt.doctor?.user?.firstName} {appt.doctor?.user?.lastName} —{' '}
                        <span className="text-slate-500 font-normal">{appt.department?.name}</span>
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Date: {new Date(appt.appointmentDate).toLocaleDateString()} at {appt.timeSlot} • Reason:{' '}
                        {appt.reason || 'Consultation'}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            appt.status === 'COMPLETED'
                              ? 'bg-emerald-50 text-emerald-700'
                              : appt.status === 'CHECKED_IN'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {appt.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    {appt.status === 'SCHEDULED' && (
                      <button
                        onClick={() => handleCheckIn(appt.id)}
                        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
                      >
                        Self Check-In
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'prescriptions' && (
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-slate-800">Medication Orders & Prescriptions</h2>
          <div className="grid gap-3">
            {prescriptions.length === 0 ? (
              <p className="text-sm text-slate-500">No prescriptions found.</p>
            ) : (
              prescriptions.map((rx) => (
                <div key={rx.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <p className="text-xs text-slate-400">Prescription #{rx.prescriptionNumber}</p>
                      <p className="text-sm font-semibold text-slate-800">
                        Prescribed by Dr. {rx.doctor?.user?.firstName} {rx.doctor?.user?.lastName}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        rx.status === 'DISPENSED'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {rx.status}
                    </span>
                  </div>
                  <div className="mt-3 space-y-2">
                    {rx.items?.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs bg-slate-50 p-2 rounded-lg">
                        <span className="font-semibold text-slate-800">{item.medicine?.name || item.medicineName}</span>
                        <span className="text-slate-600">
                          {item.dosage} • {item.frequency} • {item.duration}
                        </span>
                        <span className="text-slate-500">Qty: {item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'labs' && (
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-slate-800">Diagnostic Reports</h2>
          <div className="grid gap-3">
            {labOrders.length === 0 ? (
              <p className="text-sm text-slate-500">No laboratory test orders found.</p>
            ) : (
              labOrders.map((lab) => (
                <div key={lab.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800">{lab.testName}</h4>
                      <p className="text-xs text-slate-400">Order #{lab.orderNumber} • Ordered on {new Date(lab.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        lab.status === 'COMPLETED'
                          ? 'bg-emerald-50 text-emerald-700'
                          : lab.status === 'PROCESSING'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {lab.status}
                    </span>
                  </div>

                  {lab.report && (
                    <div className="mt-3 border-t border-slate-100 pt-3 text-xs">
                      <p className="font-semibold text-slate-700">Lab Results / Findings:</p>
                      <p className="text-slate-600 mt-1 whitespace-pre-wrap">{lab.report.findings}</p>
                      {lab.report.comments && (
                        <p className="text-slate-500 italic mt-1">Comments: {lab.report.comments}</p>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'billing' && (
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-slate-800">Invoices & Statements</h2>
          <div className="grid gap-3">
            {bills.length === 0 ? (
              <p className="text-sm text-slate-500">No billing invoices found.</p>
            ) : (
              bills.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800">Invoice #{b.billNumber}</h4>
                    <p className="text-xs text-slate-500">
                      Total: <span className="font-semibold text-slate-800">${Number(b.totalAmount).toFixed(2)}</span> • Paid: ${Number(b.paidAmount).toFixed(2)}
                    </p>
                    <span
                      className={`mt-1.5 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        b.status === 'PAID'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>

                  <div>
                    {b.status !== 'PAID' && (
                      <button
                        onClick={() => setSelectedBill(b)}
                        className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition"
                      >
                        Pay Invoice
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Book Appointment Modal */}
      {isBookModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Book New Appointment</h3>
            <form onSubmit={handleBookAppointment} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Reason for Visit</label>
                <input
                  type="text"
                  value={bookReason}
                  onChange={(e) => setBookReason(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Date</label>
                <input
                  type="date"
                  value={bookDate}
                  onChange={(e) => setBookDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Time Slot</label>
                <select
                  value={bookTime}
                  onChange={(e) => setBookTime(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 focus:border-blue-500 focus:outline-none"
                >
                  <option>09:00 AM</option>
                  <option>10:00 AM</option>
                  <option>11:30 AM</option>
                  <option>02:00 PM</option>
                  <option>03:30 PM</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBookModalOpen(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingBook}
                  className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {submittingBook ? 'Booking...' : 'Confirm Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pay Modal */}
      {selectedBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl text-center">
            <CreditCard className="mx-auto h-10 w-10 text-blue-600" />
            <h3 className="mt-2 text-base font-bold text-slate-900">Pay Bill #{selectedBill.billNumber}</h3>
            <p className="mt-1 text-2xl font-bold text-slate-800">${Number(selectedBill.totalAmount).toFixed(2)}</p>
            <p className="mt-2 text-xs text-slate-500">Secure simulated healthcare payment gateway.</p>

            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setSelectedBill(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={paying}
                onClick={handlePayBill}
                className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {paying ? 'Processing...' : 'Confirm & Pay'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
