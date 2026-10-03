'use client';

import React from 'react';
import { HospitalNavigation } from '../../components/HospitalNavigation';
import { Compass, MapPin } from 'lucide-react';

export default function CampusWayfindingPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20 backdrop-blur border border-blue-400/30">
            <Compass className="h-6 w-6 text-blue-300" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Interactive Campus Navigation & Wayfinding</h1>
            <p className="text-xs text-blue-200 mt-1">
              Multi-building indoor spatial mapping, wing schematics, elevators, and department locations
            </p>
          </div>
        </div>
      </div>

      <HospitalNavigation />
    </div>
  );
}
