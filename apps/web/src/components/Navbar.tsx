'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Activity,
  Bell,
  User as UserIcon,
  LogOut,
  Hospital,
  AlertTriangle,
  ChevronDown,
} from 'lucide-react';
import { authService } from '../services/auth.service';
import { notificationService } from '../services/notification.service';
import { socketService } from '../services/socket.service';

export function Navbar({ activeRole = 'ADMIN' }: { activeRole?: string }) {
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);

    // Load initial notifications
    notificationService.getMyNotifications().then(setNotifications).catch(() => {});

    // Listen for live notifications
    const unsub = socketService.subscribe('notification:broadcast', (newNotif) => {
      setNotifications((prev) => [newNotif, ...prev]);
    });

    return () => {
      unsub();
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const roleRoutes: Record<string, string> = {
    ADMIN: '/admin',
    DOCTOR: '/doctor',
    PATIENT: '/patient',
    NURSE: '/nurse',
    RECEPTIONIST: '/reception',
    LAB_STAFF: '/laboratory',
    PHARMACY_STAFF: '/pharmacy',
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Live Indicator */}
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <Hospital className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">HospitalOS</span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                  v2.0
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Digital Twin & Operations Platform</p>
            </div>
          </Link>

          {/* Live WebSocket Status */}
          <div className="hidden md:flex items-center space-x-2 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>REAL-TIME DIGITAL TWIN SYNC</span>
          </div>
        </div>

        {/* Role Portal Switcher */}
        <div className="flex items-center space-x-3">
          <div className="hidden lg:flex items-center space-x-1 bg-slate-100 p-1 rounded-lg text-xs font-medium">
            <Link
              href="/admin"
              className={`px-2.5 py-1 rounded-md transition ${activeRole === 'ADMIN' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Command Center
            </Link>
            <Link
              href="/doctor"
              className={`px-2.5 py-1 rounded-md transition ${activeRole === 'DOCTOR' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Doctor
            </Link>
            <Link
              href="/patient"
              className={`px-2.5 py-1 rounded-md transition ${activeRole === 'PATIENT' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Patient
            </Link>
            <Link
              href="/reception"
              className={`px-2.5 py-1 rounded-md transition ${activeRole === 'RECEPTIONIST' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Reception
            </Link>
            <Link
              href="/laboratory"
              className={`px-2.5 py-1 rounded-md transition ${activeRole === 'LAB_STAFF' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Lab
            </Link>
            <Link
              href="/pharmacy"
              className={`px-2.5 py-1 rounded-md transition ${activeRole === 'PHARMACY_STAFF' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Pharmacy
            </Link>
            <Link
              href="/navigation"
              className="px-2.5 py-1 rounded-md text-teal-700 hover:bg-teal-50 transition"
            >
              Wayfinding
            </Link>
          </div>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifs && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <span className="font-semibold text-sm text-slate-900">Hospital Notifications</span>
                  <span className="text-xs text-slate-500">{notifications.length} updates</span>
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500">No new notifications</div>
                  ) : (
                    notifications.map((notif, idx) => (
                      <div
                        key={idx}
                        className={`p-3 text-xs hover:bg-slate-50 transition ${!notif.isRead ? 'bg-sky-50/40' : ''}`}
                      >
                        <div className="font-semibold text-slate-800">{notif.title}</div>
                        <p className="text-slate-600 mt-0.5">{notif.message}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          {new Date(notif.createdAt || Date.now()).toLocaleTimeString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile / Logout */}
          <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs">
              {user?.firstName?.[0] || 'A'}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold text-slate-900 leading-tight">
                {user ? `${user.firstName} ${user.lastName}` : 'Administrator'}
              </div>
              <div className="text-[10px] text-slate-500">{user?.role || activeRole}</div>
            </div>
            <button
              onClick={() => authService.logout()}
              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
