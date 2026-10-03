'use client';

import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  Ticket,
  Calendar,
  CheckCircle,
  Clock,
  Search,
  Users,
  AlertCircle,
  Megaphone,
  CreditCard,
  Building,
} from 'lucide-react';
import { patientService } from '../../../services/patient.service';
import { appointmentService } from '../../../services/appointment.service';
import { queueService } from '../../../services/queue.service';
import { Patient, Appointment, Queue, PriorityLevel } from '../../../types';

export default function ReceptionDashboard() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [queues, setQueues] = useState<Queue[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'tokens' | 'appointments' | 'register'>('tokens');

  // New Patient Registration Form
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('MALE');
  const [dob, setDob] = useState('1990-01-01');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [registering, setRegistering] = useState(false);

  // Walk-in Token Generator
  const [selectedQueueId, setSelectedQueueId] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [tokenPriority, setTokenPriority] = useState<PriorityLevel>('NORMAL');
  const [generatingToken, setGeneratingToken] = useState(false);

  useEffect(() => {
    loadReceptionData();
  }, []);

  const loadReceptionData = async () => {
    try {
      setLoading(true);
      const [pts, appts, qList] = await Promise.all([
        patientService.getAll({ limit: 100 }),
        appointmentService.getAll(),
        queueService.getAll(),
      ]);
      setPatients(pts.data || []);
      setAppointments(appts || []);
      setQueues(qList || []);
      if (qList && qList.length > 0) {
        setSelectedQueueId(qList[0].id);
      }
    } catch (err) {
      console.error('Failed to load reception data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setRegistering(true);
      const newPt = await patientService.create({
        gender,
        dateOfBirth: new Date(dob).toISOString(),
        bloodGroup,
        emergencyContact,
        user: {
          firstName,
          lastName,
          email,
          phone,
          role: 'PATIENT',
        } as any,
      });
      alert(`Patient registered successfully! Generated MRN: ${newPt.mrn}`);
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      loadReceptionData();
      setActiveTab('tokens');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to register patient');
    } finally {
      setRegistering(false);
    }
  };

  const handleGenerateToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQueueId || !selectedPatientId) {
      alert('Please select both a Queue and a Patient');
      return;
    }
    try {
      setGeneratingToken(true);
      const ticket = await queueService.generateToken(
        selectedQueueId,
        selectedPatientId,
        tokenPriority,
      );
      alert(`Token #${ticket.ticketNumber} successfully generated for Queue! Priority: ${ticket.priority}`);
      loadReceptionData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to generate token');
    } finally {
      setGeneratingToken(false);
    }
  };

  const handleCheckIn = async (appointmentId: string) => {
    try {
      const res = await appointmentService.checkIn(appointmentId);
      alert(`Check-in successful! Generated Token #${res.ticket?.ticketNumber || 'Assigned'}`);
      loadReceptionData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to check-in appointment');
    }
  };

  const handleCallNext = async (queueId: string) => {
    try {
      const ticket = await queueService.callNext(queueId);
      alert(`Now Calling Token #${ticket.ticketNumber} to consultation counter!`);
      loadReceptionData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'No patients waiting in this queue');
    }
  };

  const filteredPatients = patients.filter(
    (p) =>
      p.user?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.user?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.mrn?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-900 p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Ticket className="h-7 w-7 text-emerald-300" />
              <h1 className="text-2xl font-bold">Front Desk & Reception Desk</h1>
            </div>
            <p className="text-xs text-emerald-100 mt-1">
              Patient Check-In, Walk-in Token Dispensation, Registration & Queue Directing
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('register')}
              className="flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-semibold text-emerald-900 shadow hover:bg-emerald-50 transition"
            >
              <UserPlus className="h-4 w-4 text-emerald-600" />
              New Patient
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab('tokens')}
          className={`pb-3 text-sm font-medium transition border-b-2 flex items-center gap-2 ${
            activeTab === 'tokens'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Ticket className="h-4 w-4" />
          Queue & Token Management
        </button>
        <button
          onClick={() => setActiveTab('appointments')}
          className={`pb-3 text-sm font-medium transition border-b-2 flex items-center gap-2 ${
            activeTab === 'appointments'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="h-4 w-4" />
          Today's Appointments ({appointments.length})
        </button>
        <button
          onClick={() => setActiveTab('register')}
          className={`pb-3 text-sm font-medium transition border-b-2 flex items-center gap-2 ${
            activeTab === 'register'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <UserPlus className="h-4 w-4" />
          Patient Registration
        </button>
      </div>

      {/* Tab: Queue & Token Management */}
      {activeTab === 'tokens' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Issue Token Form */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Ticket className="h-4 w-4 text-emerald-600" />
              Issue Walk-In Queue Token
            </h2>

            <form onSubmit={handleGenerateToken} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Target Department Queue</label>
                <select
                  value={selectedQueueId}
                  onChange={(e) => setSelectedQueueId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs"
                  required
                >
                  {queues.map((q) => (
                    <option key={q.id} value={q.id}>
                      {q.name} ({q.department?.name || 'General'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Select Patient</label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs"
                  required
                >
                  <option value="">-- Choose Patient --</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.user?.firstName} {p.user?.lastName} (MRN: {p.mrn})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Triage Priority</label>
                <select
                  value={tokenPriority}
                  onChange={(e) => setTokenPriority(e.target.value as PriorityLevel)}
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs font-semibold"
                >
                  <option value="NORMAL">NORMAL</option>
                  <option value="URGENT">URGENT</option>
                  <option value="EMERGENCY">EMERGENCY</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={generatingToken}
                className="w-full rounded-xl bg-emerald-600 py-2.5 font-bold text-white shadow hover:bg-emerald-700 disabled:opacity-50 transition"
              >
                {generatingToken ? 'Issuing Token...' : 'Print & Issue Token'}
              </button>
            </form>
          </div>

          {/* Live Queues Overview */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-sm font-bold text-slate-800">Active Live Waiting Queues</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {queues.map((q) => {
                const waitingTickets = q.tickets?.filter((t) => t.status === 'WAITING') || [];
                const calledTicket = q.tickets?.find((t) => t.status === 'CALLED');
                return (
                  <div key={q.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{q.name}</h4>
                        <p className="text-xs text-slate-400">{q.department?.name}</p>
                      </div>
                      <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                        {q.status}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-center">
                      <div className="rounded-xl bg-slate-50 p-2.5">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Current Serving</p>
                        <p className="text-2xl font-bold text-emerald-600">
                          {calledTicket ? `#${calledTicket.ticketNumber}` : '—'}
                        </p>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-2.5">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Waiting</p>
                        <p className="text-2xl font-bold text-slate-800">{waitingTickets.length}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleCallNext(q.id)}
                      className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-slate-900 py-2 text-xs font-bold text-white hover:bg-slate-800 transition"
                    >
                      <Megaphone className="h-3.5 w-3.5" />
                      Announce Next Token
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Appointments Check-in */}
      {activeTab === 'appointments' && (
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-800">Scheduled Consultations For Today</h2>
          <div className="grid gap-3">
            {appointments.map((appt) => (
              <div
                key={appt.id}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-600 font-bold">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800">
                      {appt.patient?.user?.firstName} {appt.patient?.user?.lastName} (MRN: {appt.patient?.mrn})
                    </h4>
                    <p className="text-xs text-slate-500">
                      With Dr. {appt.doctor?.user?.firstName} {appt.doctor?.user?.lastName} • {appt.department?.name} • Time: {appt.timeSlot}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      appt.status === 'CHECKED_IN'
                        ? 'bg-blue-50 text-blue-700'
                        : appt.status === 'COMPLETED'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {appt.status}
                  </span>

                  {appt.status === 'SCHEDULED' && (
                    <button
                      onClick={() => handleCheckIn(appt.id)}
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 shadow-sm transition"
                    >
                      Check In Patient
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Patient Registration */}
      {activeTab === 'register' && (
        <div className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-emerald-600" />
            New Patient Demographic Intake Form
          </h2>

          <form onSubmit={handleRegisterPatient} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-slate-700 mb-1">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2"
                  placeholder="John"
                  required
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2"
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2"
                  placeholder="john.doe@example.com"
                  required
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Contact Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2"
                  placeholder="+1-555-0199"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Blood Group</label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2"
                >
                  <option>O+</option>
                  <option>O-</option>
                  <option>A+</option>
                  <option>A-</option>
                  <option>B+</option>
                  <option>B-</option>
                  <option>AB+</option>
                  <option>AB-</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Emergency Contact (Name & Phone)</label>
              <input
                type="text"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2"
                placeholder="Jane Doe (+1-555-0198)"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="submit"
                disabled={registering}
                className="rounded-xl bg-emerald-600 px-6 py-2.5 font-bold text-white shadow hover:bg-emerald-700 disabled:opacity-50 transition"
              >
                {registering ? 'Creating MRN Chart...' : 'Register & Generate MRN'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
