'use client';

import React from 'react';
import {
  CheckCircle2,
  Clock,
  Circle,
  Calendar,
  Ticket,
  Stethoscope,
  FlaskConical,
  Pill,
  Receipt,
  BedDouble,
  UserCheck,
  ArrowRight,
} from 'lucide-react';
import { Patient, PatientStatus } from '../types';

interface PatientJourneyTimelineProps {
  patient: Patient;
}

export function PatientJourneyTimeline({ patient }: PatientJourneyTimelineProps) {
  const appointment = patient.appointments?.[0];
  const queueTicket = patient.queueTickets?.[0];
  const encounter = patient.encounters?.[0];
  const labOrder = patient.labOrders?.[0];
  const prescription = patient.prescriptions?.[0];
  const bill = patient.bills?.[0];
  const admission = patient.admissions?.[0];

  const stages = [
    {
      id: 'REGISTRATION',
      title: '1. Registration',
      subtitle: `MRN: ${patient.mrn}`,
      icon: UserCheck,
      isCompleted: true,
      timestamp: patient.createdAt,
      details: `Registered on ${new Date(patient.createdAt || Date.now()).toLocaleDateString()} • Blood Group: ${patient.bloodGroup || 'N/A'}`,
    },
    {
      id: 'APPOINTMENT',
      title: '2. Appointment',
      subtitle: appointment ? appointment.appointmentNo : 'Scheduled',
      icon: Calendar,
      isCompleted: !!appointment,
      timestamp: appointment?.appointmentDate,
      details: appointment
        ? `With Dr. ${appointment.doctor?.firstName || ''} ${appointment.doctor?.lastName || ''} at ${appointment.timeSlot} (${appointment.type})`
        : 'No appointment scheduled yet',
    },
    {
      id: 'CHECK_IN',
      title: '3. Check-In',
      subtitle: appointment?.checkInTime ? 'Checked In' : 'Pending Arrival',
      icon: CheckCircle2,
      isCompleted: !!appointment?.checkInTime,
      timestamp: appointment?.checkInTime,
      details: appointment?.checkInTime
        ? `Arrived at hospital on ${new Date(appointment.checkInTime).toLocaleTimeString()}`
        : 'Awaiting patient arrival at front desk',
    },
    {
      id: 'QUEUE',
      title: '4. OPD Queue',
      subtitle: queueTicket ? `Token ${queueTicket.ticketNumber}` : 'Waiting Token',
      icon: Ticket,
      isCompleted: !!queueTicket && (queueTicket.status === 'IN_SERVICE' || queueTicket.status === 'COMPLETED'),
      timestamp: queueTicket?.issuedAt,
      details: queueTicket
        ? `Token ${queueTicket.ticketNumber} • Status: ${queueTicket.status} • Est. Wait: ${queueTicket.estWaitMins}m`
        : 'Token will be issued upon check-in',
    },
    {
      id: 'CONSULTATION',
      title: '5. Consultation',
      subtitle: encounter ? encounter.encounterNo : 'Doctor Exam',
      icon: Stethoscope,
      isCompleted: !!encounter && encounter.status === 'COMPLETED',
      timestamp: encounter?.startTime,
      details: encounter
        ? `Diagnosis: ${encounter.diagnosis || 'Clinical evaluation in progress'} • Notes: ${encounter.examinationNotes || 'None'}`
        : 'Doctor consultation pending',
    },
    {
      id: 'LABORATORY',
      title: '6. Lab / Radiology',
      subtitle: labOrder ? labOrder.orderNumber : 'Diagnostic Orders',
      icon: FlaskConical,
      isCompleted: !!labOrder && labOrder.status === 'COMPLETED',
      timestamp: labOrder?.createdAt,
      details: labOrder
        ? `Status: ${labOrder.status} • Tests: ${labOrder.samples?.map((s) => s.testName).join(', ') || 'Diagnostic investigation ordered'}`
        : 'No laboratory tests ordered',
    },
    {
      id: 'PRESCRIPTION',
      title: '7. Prescription',
      subtitle: prescription ? prescription.prescriptionNumber : 'Rx Issued',
      icon: Pill,
      isCompleted: !!prescription,
      timestamp: prescription?.createdAt,
      details: prescription
        ? `${prescription.items?.length || 0} prescribed medicines: ${prescription.items?.map((i) => i.medicineName).join(', ')}`
        : 'No prescription issued',
    },
    {
      id: 'PHARMACY',
      title: '8. Pharmacy',
      subtitle: prescription?.status === 'DISPENSED' ? 'Dispensed' : 'Pharmacy Order',
      icon: Pill,
      isCompleted: prescription?.status === 'DISPENSED',
      timestamp: prescription?.dispensedAt,
      details:
        prescription?.status === 'DISPENSED'
          ? `Medicines dispensed on ${new Date(prescription.dispensedAt!).toLocaleTimeString()} by ${prescription.dispensedBy || 'Staff'}`
          : 'Pending dispensary verification & collection',
    },
    {
      id: 'BILLING',
      title: '9. Billing & Cashier',
      subtitle: bill ? `Invoice ${bill.invoiceNumber}` : 'Account Settlement',
      icon: Receipt,
      isCompleted: bill?.status === 'PAID',
      timestamp: bill?.createdAt,
      details: bill
        ? `Total: $${bill.netAmount} • Paid: $${bill.paidAmount} • Status: ${bill.status}`
        : 'Billing statement generated upon service completion',
    },
    {
      id: 'ADMISSION',
      title: '10. Admission / Discharge',
      subtitle: admission ? (admission as any).admissionNumber || 'Inpatient' : 'Inpatient Care',
      icon: BedDouble,
      isCompleted: !!admission?.discharge,
      timestamp: admission?.admissionDate,
      details: admission
        ? `Bed ${admission.bed?.bedNumber || ''} • Diagnosis: ${admission.initialDiagnosis} • ${admission.discharge ? `Discharged: ${new Date(admission.discharge.dischargeDate).toLocaleDateString()}` : 'Currently Admitted'}`
        : 'Outpatient patient (no admission required)',
    },
  ];

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-2">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Patient Journey Timeline</h3>
            <span className="px-2 py-0.5 text-xs font-bold rounded-md bg-sky-100 text-sky-800">
              {patient.currentStatus}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time verified operational timeline for {patient.firstName} {patient.lastName} (MRN: {patient.mrn})
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs font-semibold text-slate-700">Phone: {patient.phone}</span>
          <span className="text-xs text-slate-400 block">{patient.email}</span>
        </div>
      </div>

      {/* Horizontal Step Indicator on large screens */}
      <div className="hidden xl:grid grid-cols-10 gap-2 pb-4 border-b border-slate-100">
        {stages.map((stage, idx) => {
          const statusVal = patient.currentStatus || patient.status || '';
          const isCurrent = statusVal.includes(stage.id) || (idx === 0 && !statusVal);
          return (
            <div
              key={stage.id}
              className={`p-2 rounded-lg text-center transition ${
                stage.isCompleted
                  ? 'bg-emerald-50 border border-emerald-200'
                  : isCurrent
                    ? 'bg-sky-50 border-2 border-sky-500 ring-2 ring-sky-500/20'
                    : 'bg-slate-50 border border-slate-200 opacity-60'
              }`}
            >
              <div className="flex justify-center mb-1">
                {stage.isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : isCurrent ? (
                  <Clock className="w-4 h-4 text-sky-600 animate-spin" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-400" />
                )}
              </div>
              <div className="text-[10px] font-bold text-slate-800 truncate">{stage.title.split('. ')[1]}</div>
              <div className="text-[9px] text-slate-500 truncate">{stage.subtitle}</div>
            </div>
          );
        })}
      </div>

      {/* Detailed Vertical Timeline */}
      <div className="relative border-l-2 border-slate-200 ml-4 pl-6 space-y-6">
        {stages.map((stage, idx) => {
          const Icon = stage.icon;
          const isCurrent = (patient.currentStatus || patient.status || '').includes(stage.id);

          return (
            <div key={stage.id} className="relative group">
              {/* Bullet Icon */}
              <div
                className={`absolute -left-[35px] top-0.5 w-8 h-8 rounded-full border-2 flex items-center justify-center transition ${
                  stage.isCompleted
                    ? 'bg-emerald-500 border-white text-white shadow-sm'
                    : isCurrent
                      ? 'bg-sky-600 border-sky-300 text-white shadow-md animate-pulse'
                      : 'bg-white border-slate-300 text-slate-400'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>

              {/* Stage Card */}
              <div
                className={`p-4 rounded-xl border transition ${
                  stage.isCompleted
                    ? 'bg-emerald-50/30 border-emerald-200'
                    : isCurrent
                      ? 'bg-sky-50/40 border-sky-400 ring-2 ring-sky-500/10'
                      : 'bg-slate-50/50 border-slate-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 text-sm">{stage.title}</span>
                    <span className="text-xs font-semibold text-slate-600">• {stage.subtitle}</span>
                  </div>
                  {stage.timestamp && (
                    <span className="text-xs font-mono text-slate-500">
                      {new Date(stage.timestamp).toLocaleString()}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{stage.details}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
