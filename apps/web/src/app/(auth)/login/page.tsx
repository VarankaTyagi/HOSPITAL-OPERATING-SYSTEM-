'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldAlert,
  Lock,
  Mail,
  ArrowRight,
  UserCheck,
  Stethoscope,
  HeartPulse,
  Ticket,
  FlaskConical,
  Pill,
  User,
  Activity,
} from 'lucide-react';
import { authService } from '../../../services/auth.service';

const DEMO_ACCOUNTS = [
  {
    role: 'ADMIN',
    title: 'Hospital Administrator',
    email: 'admin@hospitalos.org',
    redirect: '/admin',
    icon: ShieldAlert,
    color: 'from-slate-800 to-slate-900 text-white',
  },
  {
    role: 'DOCTOR',
    title: 'Attending Physician',
    email: 'dr.sharma@hospitalos.org',
    redirect: '/doctor',
    icon: Stethoscope,
    color: 'from-blue-600 to-indigo-700 text-white',
  },
  {
    role: 'NURSE',
    title: 'Inpatient Nurse',
    email: 'nurse.sarah@hospitalos.org',
    redirect: '/nurse',
    icon: HeartPulse,
    color: 'from-rose-500 to-pink-600 text-white',
  },
  {
    role: 'RECEPTIONIST',
    title: 'Reception Front Desk',
    email: 'reception@hospitalos.org',
    redirect: '/reception',
    icon: Ticket,
    color: 'from-emerald-600 to-teal-700 text-white',
  },
  {
    role: 'LAB_STAFF',
    title: 'Pathology Lab Tech',
    email: 'lab.tech@hospitalos.org',
    redirect: '/laboratory',
    icon: FlaskConical,
    color: 'from-purple-600 to-violet-700 text-white',
  },
  {
    role: 'PHARMACY_STAFF',
    title: 'Dispensary Pharmacist',
    email: 'pharmacist@hospitalos.org',
    redirect: '/pharmacy',
    icon: Pill,
    color: 'from-amber-500 to-orange-600 text-white',
  },
  {
    role: 'PATIENT',
    title: 'Registered Patient',
    email: 'patient.john@hospitalos.org',
    redirect: '/patient',
    icon: User,
    color: 'from-cyan-600 to-blue-700 text-white',
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Password123!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const data = await authService.login(email, password);
      // Route based on role
      const role = data.user?.role;
      if (role === 'ADMIN') router.push('/admin');
      else if (role === 'DOCTOR') router.push('/doctor');
      else if (role === 'NURSE') router.push('/nurse');
      else if (role === 'RECEPTIONIST') router.push('/reception');
      else if (role === 'LAB_STAFF') router.push('/laboratory');
      else if (role === 'PHARMACY_STAFF') router.push('/pharmacy');
      else router.push('/patient');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demo: (typeof DEMO_ACCOUNTS)[0]) => {
    try {
      setLoading(true);
      setError('');
      await authService.login(demo.email, 'Password123!');
      router.push(demo.redirect);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-500/20">
            <Activity className="h-8 w-8" />
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">HospitalOS Authentication</h1>
          <p className="mt-1 text-sm text-slate-500">
            Role-Based Access Control • Digital Twin Synchronization • Enterprise Clinical Portal
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Credentials Login Form */}
          <div className="md:col-span-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-4">Enterprise Account Login</h2>

            {error && (
              <div className="mb-4 rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 py-2 pl-9 pr-3 text-xs focus:border-blue-500 focus:outline-none"
                    placeholder="name@hospitalos.org"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 py-2 pl-9 pr-3 text-xs focus:border-blue-500 focus:outline-none"
                    placeholder="••••••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {loading ? 'Authenticating...' : 'Sign In to Portal'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>

          {/* Quick 1-Click Role Login for Evaluator / Testing */}
          <div className="md:col-span-6 space-y-3">
            <h2 className="text-base font-bold text-slate-900">1-Click Role Switching (Instant Access)</h2>
            <p className="text-xs text-slate-500">
              Select any clinical or administrative role below to immediately log in with verified seeded credentials:
            </p>

            <div className="grid grid-cols-1 gap-2 pt-2">
              {DEMO_ACCOUNTS.map((demo) => {
                const Icon = demo.icon;
                return (
                  <button
                    key={demo.role}
                    type="button"
                    onClick={() => handleQuickLogin(demo)}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 hover:border-slate-400 hover:shadow-sm transition text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-r ${demo.color} shadow-sm`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600">
                          {demo.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 font-mono">{demo.email}</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 group-hover:text-blue-600 transition" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
