'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Activity,
  Users,
  Calendar,
  Ticket,
  Stethoscope,
  HeartPulse,
  FlaskConical,
  Pill,
  BedDouble,
  Receipt,
  Compass,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { DigitalTwinView } from '../components/DigitalTwinView';
import { digitalTwinService } from '../services/digital-twin.service';
import { DigitalTwinState } from '../types';

export default function HomePage() {
  const [twin, setTwin] = useState<DigitalTwinState | null>(null);

  useEffect(() => {
    digitalTwinService.getState().then(setTwin).catch(() => {});
  }, []);

  const roles = [
    {
      title: 'Patient Portal',
      role: 'PATIENT',
      href: '/patient',
      icon: Users,
      color: 'from-sky-500 to-blue-600',
      description: 'Book appointments, track queue tokens, view lab reports, e-prescriptions, and 10-stage journey.',
      badge: 'Self-Service',
    },
    {
      title: 'Doctor Workstation',
      role: 'DOCTOR',
      href: '/doctor',
      icon: Stethoscope,
      color: 'from-teal-500 to-emerald-600',
      description: 'Call next patient, review clinical history, record ICD diagnoses, order tests, and issue e-prescriptions.',
      badge: 'Clinical',
    },
    {
      title: 'Nursing Station',
      role: 'NURSE',
      href: '/nurse',
      icon: HeartPulse,
      color: 'from-rose-500 to-pink-600',
      description: 'Manage ward bed allocations, record patient vital signs, and coordinate inpatient admissions.',
      badge: 'Care Ward',
    },
    {
      title: 'Reception & Queues',
      role: 'RECEPTIONIST',
      href: '/reception',
      icon: Ticket,
      color: 'from-indigo-500 to-purple-600',
      description: 'Patient check-in, walk-in token generation, queue management, and appointment confirmation.',
      badge: 'Front Desk',
    },
    {
      title: 'Diagnostic Laboratory',
      role: 'LAB_STAFF',
      href: '/laboratory',
      icon: FlaskConical,
      color: 'from-amber-500 to-orange-600',
      description: 'Receive specimen samples with barcodes, process automated analyzers, and publish verified reports.',
      badge: 'Diagnostics',
    },
    {
      title: 'Pharmacy & Dispensary',
      role: 'PHARMACY_STAFF',
      href: '/pharmacy',
      icon: Pill,
      color: 'from-emerald-500 to-teal-700',
      description: 'Verify digital prescriptions, dispense medicines, deduct inventory batches, and monitor stock levels.',
      badge: 'Dispensary',
    },
    {
      title: 'Command Center & Twin',
      role: 'ADMIN',
      href: '/admin',
      icon: Cpu,
      color: 'from-slate-800 to-slate-950',
      description: 'Executive operational overview, live digital twin, bed capacity, bottleneck monitoring, and audit logs.',
      badge: 'Executive',
    },
    {
      title: 'Hospital Navigation',
      role: 'WAYFINDING',
      href: '/navigation',
      icon: Compass,
      color: 'from-cyan-600 to-teal-600',
      description: 'Campus floor-by-floor directory, department maps, room wayfinding, and operating hours.',
      badge: 'Campus Map',
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 p-8 sm:p-10 text-white shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-semibold border border-sky-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Hospital Operations & Patient Journey Platform</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            One Connected Hospital Ecosystem.
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Digitally unifying patients, clinicians, nurses, laboratory scientists, pharmacists, and administrators.
            Powered by a real-time PostgreSQL operational Digital Twin with live WebSocket synchronization.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/admin"
              className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs transition shadow-lg shadow-sky-500/25 flex items-center space-x-2"
            >
              <Cpu className="w-4 h-4" />
              <span>Launch Command Center</span>
            </Link>
            <Link
              href="/patient"
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition border border-white/20 flex items-center space-x-2"
            >
              <span>Patient Self-Service</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Subtle decorative glowing background orbs */}
        <div className="absolute right-0 top-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-sky-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute right-40 bottom-0 -mb-12 w-64 h-64 rounded-full bg-teal-500/10 blur-2xl pointer-events-none"></div>
      </div>

      {/* Role Workstation Portals */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Role-Based Workstations</h2>
            <p className="text-xs text-slate-500">Access tailored operational dashboards based on your clinical or administrative role.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {roles.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.title}
                href={item.href}
                className="group bg-white p-5 rounded-2xl border border-slate-200 hover:border-sky-500 hover:shadow-md transition flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${item.color} text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      {item.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-slate-900 group-hover:text-sky-600 transition">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-sky-600 group-hover:translate-x-0.5 transition-transform">
                  <span>Enter Portal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Live Digital Twin Preview on Home */}
      <div className="pt-4 border-t border-slate-200">
        <DigitalTwinView />
      </div>
    </div>
  );
}
