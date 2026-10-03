export type UserRole =
  | 'PATIENT'
  | 'DOCTOR'
  | 'NURSE'
  | 'RECEPTIONIST'
  | 'LAB_STAFF'
  | 'PHARMACY_STAFF'
  | 'ADMIN';

export type PatientStatus =
  | 'REGISTERED'
  | 'APPOINTMENT_SCHEDULED'
  | 'CHECKED_IN'
  | 'WAITING'
  | 'CALLED'
  | 'CONSULTATION'
  | 'LABORATORY'
  | 'PHARMACY'
  | 'BILLING'
  | 'ADMITTED'
  | 'DISCHARGED';

export type AppointmentStatus =
  | 'SCHEDULED'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW';

export type TicketStatus =
  | 'WAITING'
  | 'CALLED'
  | 'IN_SERVICE'
  | 'COMPLETED'
  | 'SKIPPED'
  | 'CANCELLED';

export type PriorityLevel = 'LOW' | 'NORMAL' | 'URGENT' | 'EMERGENCY';

export type BedStatus =
  | 'AVAILABLE'
  | 'OCCUPIED'
  | 'RESERVED'
  | 'CLEANING'
  | 'MAINTENANCE'
  | 'BLOCKED';

export type LabOrderStatus =
  | 'ORDERED'
  | 'SAMPLE_COLLECTED'
  | 'PROCESSING'
  | 'REPORT_READY'
  | 'COMPLETED'
  | 'CANCELLED';

export type PrescriptionStatus =
  | 'PENDING'
  | 'ISSUED'
  | 'PARTIALLY_DISPENSED'
  | 'DISPENSED'
  | 'CANCELLED';

export type BillStatus = 'PENDING' | 'PARTIALLY_PAID' | 'PAID' | 'CANCELLED';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone?: string;
  patientId?: string;
  doctorId?: string;
  nurseId?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  floor: number;
  building: string;
  status: string;
  staffCount?: number;
  bedCount?: number;
  appointmentCount?: number;
}

export interface Patient {
  id: string;
  userId?: string;
  user?: User;
  mrn: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: string;
  bloodGroup?: string;
  phone?: string;
  email?: string;
  address?: string;
  emergencyContact?: string;
  allergies?: string;
  currentStatus?: PatientStatus;
  status?: PatientStatus;
  createdAt?: string;
  updatedAt?: string;
  appointments?: Appointment[];
  queueTickets?: QueueTicket[];
  encounters?: Encounter[];
  labOrders?: LabOrder[];
  prescriptions?: Prescription[];
  admissions?: Admission[];
  bills?: Bill[];
}

export interface Doctor {
  id: string;
  userId?: string;
  user?: User;
  departmentId?: string;
  firstName?: string;
  lastName?: string;
  specialization?: string;
  licenseNumber?: string;
  roomNumber?: string;
  consultationFee?: number;
  phone?: string;
  status?: string;
  isAvailable?: boolean;
  department?: Department;
}

export interface Appointment {
  id: string;
  appointmentNo: string;
  patientId: string;
  doctorId: string;
  departmentId: string;
  appointmentDate: string;
  timeSlot: string;
  type: string;
  status: AppointmentStatus;
  reason?: string;
  checkInTime?: string;
  completedTime?: string;
  patient?: Patient;
  doctor?: Doctor;
  department?: Department;
  queueTicket?: QueueTicket;
}

export interface QueueTicket {
  id: string;
  ticketNumber: string;
  queueId: string;
  patientId: string;
  appointmentId?: string;
  status: TicketStatus;
  priority: PriorityLevel;
  issuedAt: string;
  calledAt?: string;
  inServiceAt?: string;
  completedAt?: string;
  estWaitMins: number;
  patient?: Patient;
  queue?: Queue;
}

export interface Queue {
  id: string;
  code: string;
  name: string;
  departmentId: string;
  doctorId?: string;
  status: string;
  currentToken?: string;
  avgWaitTime: number;
  waitingCount?: number;
  department?: Department;
  doctor?: Doctor;
  tickets?: QueueTicket[];
}

export interface Encounter {
  id: string;
  encounterNo: string;
  patientId: string;
  doctorId: string;
  appointmentId?: string;
  type: string;
  status: string;
  chiefComplaint: string;
  vitals?: any;
  examinationNotes?: string;
  diagnosis?: string;
  icdCode?: string;
  followUpDate?: string;
  startTime: string;
  endTime?: string;
  patient?: Patient;
  doctor?: Doctor;
  labOrders?: LabOrder[];
  prescriptions?: Prescription[];
}

export interface LabSample {
  id: string;
  labOrderId: string;
  testName: string;
  testCode: string;
  category: string;
  specimenType: string;
  barcode: string;
  status: LabOrderStatus;
  collectedAt?: string;
  collectedBy?: string;
  processedAt?: string;
  processedBy?: string;
}

export interface LabReport {
  id: string;
  labOrderId: string;
  reportNumber: string;
  summary?: string;
  results: Array<{ parameter: string; value: any; unit: string; range: string; flag: string }>;
  conclusion?: string;
  status: string;
  verifiedBy?: string;
  publishedAt?: string;
}

export interface LabOrder {
  id: string;
  orderNumber: string;
  patientId: string;
  doctorId: string;
  encounterId?: string;
  status: LabOrderStatus;
  priority: PriorityLevel;
  notes?: string;
  testName?: string;
  clinicalNotes?: string;
  createdAt: string;
  patient?: Patient;
  doctor?: Doctor;
  samples?: LabSample[];
  reports?: LabReport[];
  report?: any;
}

export interface Medicine {
  id: string;
  code?: string;
  sku?: string;
  name: string;
  genericName?: string;
  category?: string;
  form?: string;
  strength?: string;
  unitPrice?: number;
  reorderLevel?: number;
  inventory?: Inventory[];
}

export interface Inventory {
  id: string;
  medicineId: string;
  batchNumber: string;
  expiryDate: string;
  quantity?: number;
  reorderLevel?: number;
  currentStock?: number;
  reservedStock?: number;
  minStockLevel?: number;
  maxStockLevel?: number;
  location?: string;
  supplier?: string;
  status: string;
  medicine?: Medicine;
}

export interface PrescriptionItem {
  id: string;
  prescriptionId: string;
  medicineId: string;
  medicineName?: string;
  medicine?: Medicine;
  dosage: string;
  frequency: string;
  duration?: string;
  durationDays?: number;
  quantity: number;
  dispensedQty?: number;
  instructions?: string;
}

export interface Prescription {
  id: string;
  prescriptionNumber: string;
  patientId: string;
  doctorId: string;
  status: PrescriptionStatus;
  notes?: string;
  dispensedAt?: string;
  dispensedBy?: string;
  createdAt: string;
  patient?: Patient;
  doctor?: Doctor;
  items?: PrescriptionItem[];
}

export interface Bed {
  id: string;
  roomId: string;
  departmentId: string;
  bedNumber: string;
  type: string;
  status: BedStatus;
  dailyRate: number;
  notes?: string;
  department?: Department;
  room?: { roomNumber: string; type: string };
  admissions?: Admission[];
}

export interface Admission {
  id: string;
  admissionNumber: string;
  patientId: string;
  bedId: string;
  departmentId: string;
  doctorId: string;
  admissionDate: string;
  type: string;
  initialDiagnosis: string;
  status: string;
  patient?: Patient;
  bed?: Bed;
  department?: Department;
  doctor?: Doctor;
  discharge?: Discharge;
}

export interface Discharge {
  id: string;
  admissionId: string;
  dischargeDate: string;
  type: string;
  dischargeSummary: string;
  followUpInstructions?: string;
  conditionAtDischarge: string;
  approvedBy: string;
}

export interface BillItem {
  id: string;
  billId: string;
  description: string;
  category: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Payment {
  id: string;
  receiptNumber: string;
  billId: string;
  amount: number;
  method: string;
  transactionRef?: string;
  status: string;
  receivedBy?: string;
  paidAt: string;
}

export interface Bill {
  id: string;
  invoiceNumber?: string;
  billNumber?: string;
  patientId: string;
  admissionId?: string;
  encounterId?: string;
  totalAmount: number;
  discountAmount?: number;
  taxAmount?: number;
  netAmount?: number;
  paidAmount: number;
  balanceAmount?: number;
  status: BillStatus;
  dueDate?: string;
  createdAt: string;
  patient?: Patient;
  items?: BillItem[];
  payments?: Payment[];
}

export interface BottleneckAlert {
  type: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  message: string;
  [key: string]: any;
}

export interface DigitalTwinState {
  timestamp: string;
  summary: {
    totalPatients: number;
    activeConsultations: number;
    totalWaitingPatients: number;
    totalInService: number;
    totalBeds: number;
    occupiedBeds: number;
    availableBeds: number;
    cleaningBeds: number;
    maintenanceBeds: number;
    occupancyRate: number;
    activeLabOrders: number;
    doctorsOnDuty: number;
    bottlenecksCount: number;
  };
  bottlenecks: BottleneckAlert[];
  departments: Department[];
  queues: Queue[];
  beds: {
    total: number;
    occupied: number;
    available: number;
    cleaning: number;
    maintenance: number;
    list: Bed[];
  };
  laboratory: {
    activeOrders: LabOrder[];
    pendingCount: number;
  };
  pharmacy: {
    inventory: Inventory[];
    lowStockItems: BottleneckAlert[];
  };
  resources: any[];
  recentEvents: any[];
}
