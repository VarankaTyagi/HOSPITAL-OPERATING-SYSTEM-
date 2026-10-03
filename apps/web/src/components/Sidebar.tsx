'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Cpu,
  Route,
  Stethoscope,
  HeartPulse,
  Ticket,
  FlaskConical,
  Pill,
  BedDouble,
  Receipt,
  Compass,
  BarChart3,
  ShieldCheck,
} from 'lucide-react';

interface SidebarProps {
  currentRole?: string;
}

export function Sidebar({ currentRole = 'ADMIN' }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { label: 'Command Center', href: '/admin', icon: LayoutDashboard },
    { label: 'Live Digital Twin', href: '/admin?tab=twin', icon: Cpu, badge: 'Live' },
    { label: 'Patient Journey', href: '/patient?tab=journey', icon: Route },
    { label: 'Doctor Workstation', href: '/doctor', icon: Stethoscope },
    { label: 'Nursing Station', href: '/nurse', icon: HeartPulse },
    { label: 'Reception & Queues', href: '/reception', icon: Ticket },
    { label: 'Diagnostic Laboratory', href: '/laboratory', icon: FlaskConical },
    { label: 'Pharmacy & Stock', href: '/pharmacy', icon: Pill },
    { label: 'Bed & Admissions', href: '/admin?tab=beds', icon: BedDouble },
    { label: 'Billing & Cashier', href: '/admin?tab=billing', icon: Receipt },
    { label: 'Hospital Navigation', href: '/navigation', icon: Compass },
    { label: 'Analytics & KPIs', href: '/admin?tab=analytics', icon: BarChart3 },
    { label: 'Audit Trail', href: '/admin?tab=audit', icon: ShieldCheck },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-[calc(100vh-4rem)] border-r border-slate-800">
      <div className="p-4 border-b border-slate-800">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Operations Navigator
        </div>
        <div className="text-xs text-slate-500 mt-0.5">Active View: {currentRole}</div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition ${
                isActive
                  ? 'bg-sky-600 text-white font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-800 text-[11px] text-slate-500">
        <div className="flex items-center justify-between">
          <span>Database State</span>
          <span className="text-emerald-400 font-semibold">PostgreSQL Live</span>
        </div>
        <div className="flex items-center justify-between mt-1">
          <span>Sync Engine</span>
          <span className="text-sky-400 font-semibold">Socket.IO Active</span>
        </div>
      </div>
    </aside>
  );
}
