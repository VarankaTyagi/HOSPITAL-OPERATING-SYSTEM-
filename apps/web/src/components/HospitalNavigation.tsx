'use client';

import React, { useState } from 'react';
import {
  Compass,
  MapPin,
  Building,
  Layers,
  Search,
  Activity,
  HeartPulse,
  FlaskConical,
  Pill,
  BedDouble,
  Receipt,
  PhoneCall,
  Clock,
} from 'lucide-react';

interface LocationNode {
  id: string;
  name: string;
  code: string;
  floor: number;
  building: string;
  category: 'CLINICAL' | 'DIAGNOSTIC' | 'ADMINISTRATIVE' | 'INPATIENT' | 'CRITICAL';
  description: string;
  roomNumbers: string[];
  directions: string;
  openHours: string;
}

const hospitalLocations: LocationNode[] = [
  {
    id: 'loc-er',
    name: 'Emergency & Trauma Care (Level 1)',
    code: 'EMERGENCY',
    floor: 1,
    building: 'Block A - Critical Care',
    category: 'CRITICAL',
    description: 'Resuscitation bays, 24/7 acute trauma team, dedicated ambulance entrance.',
    roomNumbers: ['ER-BAY-1', 'ER-BAY-2', 'TRAUMA-OR-1'],
    directions: 'Enter via North Gate, follow red priority ground markings to Emergency triage entrance.',
    openHours: '24 Hours / 7 Days',
  },
  {
    id: 'loc-reg',
    name: 'Main Reception, Triage & Queue Tokens',
    code: 'FRONT_DESK',
    floor: 1,
    building: 'Block A - Main Lobby',
    category: 'ADMINISTRATIVE',
    description: 'Patient check-in, token dispenser kiosk, appointment booking desk.',
    roomNumbers: ['KIOSK-1', 'KIOSK-2', 'DESK-A'],
    directions: 'Directly facing Main Hospital Entrance revolving doors.',
    openHours: '06:00 AM - 10:00 PM',
  },
  {
    id: 'loc-lab',
    name: 'Pathology & Diagnostic Laboratory',
    code: 'PATHOLOGY',
    floor: 1,
    building: 'Block A - Diagnostics Wing',
    category: 'DIAGNOSTIC',
    description: 'Blood sample accessioning, automated hematology & biochemistry analyzers.',
    roomNumbers: ['LAB-COLLECT-1', 'LAB-ROOM-102'],
    directions: 'Turn right from Main Reception, corridor past Diagnostic Radiology.',
    openHours: '24 Hours / 7 Days',
  },
  {
    id: 'loc-pharm',
    name: 'Central Pharmacy & Dispensary',
    code: 'PHARMACY',
    floor: 1,
    building: 'Block A - Outpatient',
    category: 'CLINICAL',
    description: 'Prescription dispensing, medication counseling, controlled drugs vault.',
    roomNumbers: ['DISPENSE-1', 'DISPENSE-2', 'RACK-VAULT'],
    directions: 'Adjacent to Main OPD waiting lounge and billing counters.',
    openHours: '24 Hours / 7 Days',
  },
  {
    id: 'loc-bill',
    name: 'Patient Billing & Cashier Counter',
    code: 'BILLING',
    floor: 1,
    building: 'Block A - Main Lobby',
    category: 'ADMINISTRATIVE',
    description: 'Invoice settlements, insurance claims pre-authorization, payment receipts.',
    roomNumbers: ['BILL-WIN-1', 'BILL-WIN-2', 'INSURANCE-DESK'],
    directions: 'Opposite to Pharmacy, near elevators to Inpatient wings.',
    openHours: '07:00 AM - 09:00 PM',
  },
  {
    id: 'loc-card',
    name: 'Cardiology & Cardiovascular Center',
    code: 'CARDIOLOGY',
    floor: 2,
    building: 'Block B - Specialty Wing',
    category: 'CLINICAL',
    description: 'Senior cardiologist consultation suites, ECG, Echocardiography, and Cath Lab.',
    roomNumbers: ['OPD-201', 'OPD-202', 'OPD-204', 'CATH-LAB-1'],
    directions: 'Take Elevator B to Floor 2, exit left into Heart Health Wing.',
    openHours: '08:00 AM - 06:00 PM',
  },
  {
    id: 'loc-icu',
    name: 'Cardiac & Surgical Intensive Care Unit (ICU-B)',
    code: 'ICU_B',
    floor: 2,
    building: 'Block B - Specialty Wing',
    category: 'CRITICAL',
    description: 'Ventilator-equipped intensive care beds, central continuous patient telemetry.',
    roomNumbers: ['ICU-B-01', 'ICU-B-02', 'ICU-B-03', 'ICU-B-04'],
    directions: 'Floor 2, secure swipe-access double doors past Cath Lab.',
    openHours: '24 Hours (Visitor hours: 04:00 PM - 06:00 PM)',
  },
  {
    id: 'loc-gen',
    name: 'Internal & General Medicine OPD',
    code: 'GENERAL_MED',
    floor: 1,
    building: 'Block A - Outpatient',
    category: 'CLINICAL',
    description: 'Primary care clinics, chronic illness follow-up, routine consultations.',
    roomNumbers: ['OPD-101', 'OPD-102', 'OPD-103'],
    directions: 'Ground Floor corridor leading to West Garden Courtyard.',
    openHours: '08:00 AM - 08:00 PM',
  },
  {
    id: 'loc-ped',
    name: 'Pediatrics & Neonatal Care (NICU)',
    code: 'PEDIATRICS',
    floor: 3,
    building: 'Block C - Maternal & Child',
    category: 'INPATIENT',
    description: 'Well-baby nursery, pediatric outpatient exam rooms, Level III NICU.',
    roomNumbers: ['PED-301', 'NICU-BAY-1'],
    directions: 'Take Elevator C to Floor 3, colorful child-friendly entrance corridor.',
    openHours: '24 Hours / 7 Days',
  },
];

export function HospitalNavigation() {
  const [selectedFloor, setSelectedFloor] = useState<number | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<LocationNode>(hospitalLocations[0]);

  const filtered = hospitalLocations.filter((loc) => {
    const matchesFloor = selectedFloor === 'ALL' || loc.floor === selectedFloor;
    const matchesSearch =
      loc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loc.building.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loc.roomNumbers.some((r) => r.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFloor && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Compass className="w-5 h-5 text-teal-600" />
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Hospital Wayfinding & Campus Directory</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Navigate departments, consultation rooms, diagnostic facilities, pharmacy, and critical care units.
          </p>
        </div>

        {/* Floor Filter Buttons */}
        <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          {['ALL', 1, 2, 3].map((floor) => (
            <button
              key={floor}
              onClick={() => setSelectedFloor(floor as any)}
              className={`px-3 py-1.5 rounded-lg transition ${
                selectedFloor === floor
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              {floor === 'ALL' ? 'All Floors' : `Floor ${floor}`}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by department, room number (e.g. ICU-B, OPD-204), or service..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 shadow-xs"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Directory List */}
        <div className="lg:col-span-2 space-y-3">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Directory Results ({filtered.length} locations)
          </div>

          <div className="space-y-3">
            {filtered.map((loc) => {
              const isSelected = selectedLocation.id === loc.id;
              const categoryColor: Record<string, string> = {
                CRITICAL: 'bg-rose-50 text-rose-700 border-rose-200',
                CLINICAL: 'bg-sky-50 text-sky-700 border-sky-200',
                DIAGNOSTIC: 'bg-purple-50 text-purple-700 border-purple-200',
                ADMINISTRATIVE: 'bg-slate-100 text-slate-700 border-slate-200',
                INPATIENT: 'bg-teal-50 text-teal-700 border-teal-200',
              };

              return (
                <div
                  key={loc.id}
                  onClick={() => setSelectedLocation(loc)}
                  className={`p-4 rounded-xl border transition cursor-pointer ${
                    isSelected
                      ? 'border-teal-500 bg-teal-50/20 ring-2 ring-teal-500/20 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 text-sm">{loc.name}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${categoryColor[loc.category]}`}>
                          {loc.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{loc.description}</p>
                    </div>
                    <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-1 rounded-lg shrink-0">
                      Floor {loc.floor}
                    </span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
                    <span className="flex items-center space-x-1">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      <span>{loc.building}</span>
                    </span>
                    <span className="flex items-center space-x-1 font-mono">
                      <span>Rooms: {loc.roomNumbers.join(', ')}</span>
                    </span>
                    <span className="flex items-center space-x-1 text-emerald-600 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{loc.openHours}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Location Wayfinding Guide */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 sticky top-24">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600">Selected Wayfinding Node</span>
              <h3 className="font-bold text-base text-slate-900 mt-1">{selectedLocation.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{selectedLocation.building} • Floor {selectedLocation.floor}</p>
            </div>

            {/* Visual Floor Schematics Map representation */}
            <div className="h-44 rounded-xl bg-slate-900 p-4 text-white relative overflow-hidden flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono">CAMPUS BLUEPRINT // 2026</span>
                <span className="text-emerald-400 font-bold">LEVEL {selectedLocation.floor}</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-teal-300">
                  <MapPin className="w-5 h-5 animate-bounce" />
                  <span className="font-bold text-sm">{selectedLocation.roomNumbers[0]}</span>
                </div>
                <div className="text-[11px] text-slate-300 font-mono">
                  {selectedLocation.building}
                </div>
              </div>

              <div className="text-[10px] text-slate-500 border-t border-slate-800 pt-2 flex items-center justify-between">
                <span>Hospital Core Nav Grid</span>
                <span>Coordinates: [{selectedLocation.floor * 10}, 42]</span>
              </div>
            </div>

            {/* Turn-by-Turn Directions */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700">Turn-by-Turn Walking Directions:</span>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                {selectedLocation.directions}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex items-center justify-between">
                <span>Operating Hours:</span>
                <span className="font-semibold text-slate-900">{selectedLocation.openHours}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Emergency Help Desk:</span>
                <span className="font-semibold text-sky-700">+1-555-0100 (Ext. 9)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
