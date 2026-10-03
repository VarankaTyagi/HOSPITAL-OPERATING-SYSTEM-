'use client';

import React, { useState, useEffect } from 'react';
import {
  Activity,
  AlertTriangle,
  RefreshCw,
  BedDouble,
  Users,
  Clock,
  FlaskConical,
  Pill,
  HeartPulse,
  Radio,
  CheckCircle2,
  XCircle,
  Building,
  ShieldAlert,
} from 'lucide-react';
import { digitalTwinService } from '../services/digital-twin.service';
import { socketService } from '../services/socket.service';
import { DigitalTwinState, BottleneckAlert } from '../types';

export function DigitalTwinView() {
  const [twinState, setTwinState] = useState<DigitalTwinState | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [selectedDept, setSelectedDept] = useState<string | null>(null);

  const fetchState = async () => {
    try {
      const data = await digitalTwinService.getState();
      setTwinState(data);
    } catch (err) {
      console.error('Failed to load digital twin state:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchState();

    // Subscribe to live Digital Twin updates via WebSocket
    const unsubState = socketService.subscribe('digital-twin:state', (updatedState) => {
      setTwinState(updatedState);
    });

    const unsubBed = socketService.subscribe('bed:status-change', () => {
      fetchState();
    });

    const unsubQueue = socketService.subscribe('queue:update', () => {
      fetchState();
    });

    return () => {
      unsubState();
      unsubBed();
      unsubQueue();
    };
  }, []);

  const handleManualSync = async () => {
    setSyncing(true);
    try {
      const updated = await digitalTwinService.sync();
      setTwinState(updated);
    } catch (err) {
      console.error('Sync failed:', err);
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 space-y-4">
        <RefreshCw className="w-8 h-8 text-sky-600 animate-spin" />
        <p className="text-sm font-medium text-slate-600">Connecting to Real-Time Digital Twin...</p>
      </div>
    );
  }

  if (!twinState) {
    return (
      <div className="p-8 text-center text-slate-500">
        Unable to load Hospital Digital Twin state. Verify backend connection.
      </div>
    );
  }

  const { summary, bottlenecks, departments, queues, beds, laboratory, pharmacy, recentEvents } =
    twinState;

  return (
    <div className="space-y-6">
      {/* Header with Live Sync Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Hospital Operational Digital Twin</h2>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>SYNCHRONIZED (LIVE)</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time operational model representing beds, departments, queues, staff, lab, and pharmacy states.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-xs text-slate-400">
            Updated: {new Date(twinState.timestamp).toLocaleTimeString()}
          </span>
          <button
            onClick={handleManualSync}
            disabled={syncing}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-lg text-xs font-semibold transition border border-sky-200"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            <span>Force Resync</span>
          </button>
        </div>
      </div>

      {/* Rule-Based Operational Bottleneck Alerts */}
      {bottlenecks && bottlenecks.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-rose-700">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <span>Active Operational Bottlenecks Detected ({bottlenecks.length})</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {bottlenecks.map((b, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border flex items-start space-x-3 ${
                  b.severity === 'CRITICAL' || b.severity === 'HIGH'
                    ? 'bg-rose-50/80 border-rose-200 text-rose-900'
                    : 'bg-amber-50/80 border-amber-200 text-amber-900'
                }`}
              >
                <AlertTriangle
                  className={`w-5 h-5 shrink-0 mt-0.5 ${
                    b.severity === 'CRITICAL' || b.severity === 'HIGH'
                      ? 'text-rose-600'
                      : 'text-amber-600'
                  }`}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">{b.type.replace(/_/g, ' ')}</span>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-white/80 border">
                      {b.severity}
                    </span>
                  </div>
                  <p className="text-xs mt-0.5 leading-relaxed">{b.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Operational KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Patients Active</span>
            <Users className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{summary.totalPatients}</div>
          <div className="text-[10px] text-emerald-600 font-medium mt-1">● Database verified</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Consultations</span>
            <HeartPulse className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{summary.activeConsultations}</div>
          <div className="text-[10px] text-slate-500 mt-1">Active doctor sessions</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Waiting in Queue</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600 mt-2">{summary.totalWaitingPatients}</div>
          <div className="text-[10px] text-slate-500 mt-1">{summary.totalInService} in service</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Bed Occupancy</span>
            <BedDouble className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{summary.occupancyRate}%</div>
          <div className="text-[10px] text-slate-500 mt-1">
            {summary.occupiedBeds} / {summary.totalBeds} occupied
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Lab Workload</span>
            <FlaskConical className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{summary.activeLabOrders}</div>
          <div className="text-[10px] text-slate-500 mt-1">Pending specimens</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Doctors on Duty</span>
            <Activity className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{summary.doctorsOnDuty}</div>
          <div className="text-[10px] text-emerald-600 mt-1">Available in OPD / ER</div>
        </div>
      </div>

      {/* Main Digital Twin Floor Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Department Operations Grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Building className="w-4 h-4 text-sky-600" />
              <span>Department Operational Nodes</span>
            </h3>
            <span className="text-xs text-slate-500">{departments.length} departments monitored</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {departments.map((dept) => {
              const deptQueue = queues.find((q) => q.department?.id === dept.id || (q as any).departmentId === dept.id);
              const deptBeds = beds.list.filter((b) => b.departmentId === dept.id);

              return (
                <div
                  key={dept.id}
                  onClick={() => setSelectedDept(dept.id)}
                  className={`p-4 rounded-xl border transition cursor-pointer ${
                    selectedDept === dept.id
                      ? 'border-sky-500 bg-sky-50/30 ring-2 ring-sky-500/20'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 text-sm">{dept.name}</span>
                      <p className="text-[11px] text-slate-500">
                        {dept.building} • Floor {dept.floor}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-100 text-slate-700">
                      {dept.code}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center">
                    <div className="bg-slate-50 p-1.5 rounded-lg">
                      <div className="text-[10px] text-slate-500">Token</div>
                      <div className="text-xs font-bold text-sky-700">
                        {deptQueue?.currentToken || '—'}
                      </div>
                    </div>
                    <div className="bg-slate-50 p-1.5 rounded-lg">
                      <div className="text-[10px] text-slate-500">Waiting</div>
                      <div className="text-xs font-bold text-amber-600">
                        {deptQueue?.waitingCount || 0}
                      </div>
                    </div>
                    <div className="bg-slate-50 p-1.5 rounded-lg">
                      <div className="text-[10px] text-slate-500">Beds</div>
                      <div className="text-xs font-bold text-slate-800">
                        {deptBeds.filter((b) => b.status === 'AVAILABLE').length}/{deptBeds.length}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Real-time Bed Status Matrix */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <BedDouble className="w-4 h-4 text-indigo-600" />
                <span>Hospital Bed Status Matrix</span>
              </h4>
              <div className="flex items-center space-x-3 text-xs">
                <span className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span className="text-slate-600">Available ({beds.available})</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-600"></span>
                  <span className="text-slate-600">Occupied ({beds.occupied})</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span className="text-slate-600">Cleaning ({beds.cleaning})</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {beds.list.map((bed) => {
                const statusStyles: Record<string, string> = {
                  AVAILABLE: 'bg-emerald-50 border-emerald-200 text-emerald-800',
                  OCCUPIED: 'bg-sky-50 border-sky-300 text-sky-900',
                  CLEANING: 'bg-amber-50 border-amber-200 text-amber-800',
                  MAINTENANCE: 'bg-rose-50 border-rose-200 text-rose-800',
                  RESERVED: 'bg-indigo-50 border-indigo-200 text-indigo-800',
                };

                return (
                  <div
                    key={bed.id}
                    className={`p-3 rounded-lg border flex flex-col justify-between ${
                      statusStyles[bed.status] || 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">{bed.bedNumber}</span>
                      <span className="text-[10px] font-semibold uppercase">{bed.type}</span>
                    </div>
                    <div className="mt-2 text-[11px] font-medium flex items-center justify-between">
                      <span>{bed.status}</span>
                      <span className="text-[10px] text-slate-500">{bed.department?.name.split(' ')[0]}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Live Operational Events Stream */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Radio className="w-4 h-4 text-rose-500 animate-pulse" />
                <span>Live Event Stream</span>
              </h3>
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                Connected
              </span>
            </div>

            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {recentEvents && recentEvents.length > 0 ? (
                recentEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100/80 transition text-xs border border-slate-100"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900">
                        {evt.eventType.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(evt.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="mt-1 text-[11px] text-slate-600 font-mono">
                      {typeof evt.payload === 'object'
                        ? Object.entries(evt.payload)
                            .slice(0, 3)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(' • ')
                        : JSON.stringify(evt.payload)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-slate-500">No recent events recorded</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
