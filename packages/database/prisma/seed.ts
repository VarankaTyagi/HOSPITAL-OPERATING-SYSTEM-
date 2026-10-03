import { PrismaClient, UserRole, Gender, BloodGroup, PatientStatus, AppointmentStatus, AppointmentType, QueueStatus, TicketStatus, PriorityLevel, EncounterStatus, LabOrderStatus, LabTestCategory, LabReportStatus, PrescriptionStatus, MedicineForm, InventoryStatus, RoomType, BedStatus, BedType, AdmissionStatus, AdmissionType, DischargeType, BillStatus, BillCategory, PaymentMethod, PaymentStatus, NotificationType, StaffStatus, ResourceStatus, ResourceType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting HospitalOS Realistic Database Seed ---');

  // Clean existing operational data
  await prisma.auditLog.deleteMany({});
  await prisma.hospitalEvent.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.billItem.deleteMany({});
  await prisma.bill.deleteMany({});
  await prisma.discharge.deleteMany({});
  await prisma.admission.deleteMany({});
  await prisma.bed.deleteMany({});
  await prisma.room.deleteMany({});
  await prisma.resource.deleteMany({});
  await prisma.prescriptionItem.deleteMany({});
  await prisma.prescription.deleteMany({});
  await prisma.inventory.deleteMany({});
  await prisma.medicine.deleteMany({});
  await prisma.labReport.deleteMany({});
  await prisma.labSample.deleteMany({});
  await prisma.labOrder.deleteMany({});
  await prisma.medicalRecord.deleteMany({});
  await prisma.encounter.deleteMany({});
  await prisma.queueTicket.deleteMany({});
  await prisma.queue.deleteMany({});
  await prisma.appointment.deleteMany({});
  await prisma.nurse.deleteMany({});
  await prisma.doctor.deleteMany({});
  await prisma.patient.deleteMany({});
  await prisma.department.deleteMany({});
  await prisma.user.deleteMany({});

  const defaultPasswordHash = await bcrypt.hash('Password123!', 10);

  // 1. Create Core Departments
  console.log('Seeding Departments...');
  const emergencyDept = await prisma.department.create({
    data: {
      name: 'Emergency & Trauma Care',
      code: 'EMERGENCY',
      description: '24/7 Level 1 Trauma, Resuscitation and Urgent Care Center',
      floor: 1,
      building: 'Block A - Critical Care',
      status: 'ACTIVE',
    },
  });

  const cardiologyDept = await prisma.department.create({
    data: {
      name: 'Cardiology & Cardiovascular Surgery',
      code: 'CARDIOLOGY',
      description: 'Comprehensive Cardiac Care, Cath Lab and Heart Health Center',
      floor: 2,
      building: 'Block B - Specialty Wing',
      status: 'ACTIVE',
    },
  });

  const generalMedDept = await prisma.department.create({
    data: {
      name: 'Internal & General Medicine',
      code: 'GENERAL_MED',
      description: 'Primary Care, Chronic Disease Management and Outpatient Consultations',
      floor: 1,
      building: 'Block A - Outpatient',
      status: 'ACTIVE',
    },
  });

  const orthopedicsDept = await prisma.department.create({
    data: {
      name: 'Orthopedics & Joint Replacement',
      code: 'ORTHOPEDICS',
      description: 'Musculoskeletal Care, Sports Medicine and Trauma Orthopedics',
      floor: 2,
      building: 'Block B - Specialty Wing',
      status: 'ACTIVE',
    },
  });

  const pediatricsDept = await prisma.department.create({
    data: {
      name: 'Pediatrics & Neonatology',
      code: 'PEDIATRICS',
      description: 'Child Health, Pediatric Intensive Care and Well-Baby Clinic',
      floor: 3,
      building: 'Block C - Maternal & Child',
      status: 'ACTIVE',
    },
  });

  const pathologyDept = await prisma.department.create({
    data: {
      name: 'Pathology & Diagnostic Laboratory',
      code: 'PATHOLOGY',
      description: 'Fully automated diagnostic hematology, biochemistry and microbiology labs',
      floor: 1,
      building: 'Block A - Diagnostics Wing',
      status: 'ACTIVE',
    },
  });

  // 2. Create Users & Staff Profiles
  console.log('Seeding Users & Staff...');
  // Administrator
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@hospitalos.org',
      passwordHash: defaultPasswordHash,
      role: UserRole.ADMIN,
      firstName: 'Chief',
      lastName: 'Administrator',
      phone: '+1-555-0100',
    },
  });

  // Doctors
  const doc1User = await prisma.user.create({
    data: {
      email: 'dr.sharma@hospitalos.org',
      passwordHash: defaultPasswordHash,
      role: UserRole.DOCTOR,
      firstName: 'Vikram',
      lastName: 'Sharma',
      phone: '+1-555-0101',
    },
  });

  const doc1 = await prisma.doctor.create({
    data: {
      userId: doc1User.id,
      departmentId: cardiologyDept.id,
      firstName: 'Vikram',
      lastName: 'Sharma',
      specialization: 'Senior Interventional Cardiologist',
      licenseNumber: 'MD-CARD-88391',
      roomNumber: 'OPD-204',
      consultationFee: 750.0,
      phone: '+1-555-0101',
      status: StaffStatus.IN_CONSULTATION,
      isAvailable: true,
    },
  });

  const doc2User = await prisma.user.create({
    data: {
      email: 'dr.chen@hospitalos.org',
      passwordHash: defaultPasswordHash,
      role: UserRole.DOCTOR,
      firstName: 'Emily',
      lastName: 'Chen',
      phone: '+1-555-0102',
    },
  });

  const doc2 = await prisma.doctor.create({
    data: {
      userId: doc2User.id,
      departmentId: emergencyDept.id,
      firstName: 'Emily',
      lastName: 'Chen',
      specialization: 'Emergency Medicine Specialist',
      licenseNumber: 'MD-EMERG-44120',
      roomNumber: 'ER-BAY-1',
      consultationFee: 600.0,
      phone: '+1-555-0102',
      status: StaffStatus.AVAILABLE,
      isAvailable: true,
    },
  });

  const doc3User = await prisma.user.create({
    data: {
      email: 'dr.patel@hospitalos.org',
      passwordHash: defaultPasswordHash,
      role: UserRole.DOCTOR,
      firstName: 'Aarav',
      lastName: 'Patel',
      phone: '+1-555-0103',
    },
  });

  const doc3 = await prisma.doctor.create({
    data: {
      userId: doc3User.id,
      departmentId: generalMedDept.id,
      firstName: 'Aarav',
      lastName: 'Patel',
      specialization: 'Internal Medicine Consultant',
      licenseNumber: 'MD-GEN-92014',
      roomNumber: 'OPD-102',
      consultationFee: 500.0,
      phone: '+1-555-0103',
      status: StaffStatus.AVAILABLE,
      isAvailable: true,
    },
  });

  // Nurses
  const nurse1User = await prisma.user.create({
    data: {
      email: 'nurse.sarah@hospitalos.org',
      passwordHash: defaultPasswordHash,
      role: UserRole.NURSE,
      firstName: 'Sarah',
      lastName: 'Jenkins',
      phone: '+1-555-0201',
    },
  });

  const nurse1 = await prisma.nurse.create({
    data: {
      userId: nurse1User.id,
      departmentId: cardiologyDept.id,
      firstName: 'Sarah',
      lastName: 'Jenkins',
      licenseNumber: 'RN-CC-10928',
      shift: 'MORNING (07:00 - 15:00)',
      status: StaffStatus.ASSIGNED,
      phone: '+1-555-0201',
    },
  });

  // Receptionist
  const recUser = await prisma.user.create({
    data: {
      email: 'reception@hospitalos.org',
      passwordHash: defaultPasswordHash,
      role: UserRole.RECEPTIONIST,
      firstName: 'Carlos',
      lastName: 'Mendez',
      phone: '+1-555-0301',
    },
  });

  // Lab Staff
  const labUser = await prisma.user.create({
    data: {
      email: 'lab.tech@hospitalos.org',
      passwordHash: defaultPasswordHash,
      role: UserRole.LAB_STAFF,
      firstName: 'Maya',
      lastName: 'Lin',
      phone: '+1-555-0401',
    },
  });

  // Pharmacy Staff
  const pharmUser = await prisma.user.create({
    data: {
      email: 'pharmacist@hospitalos.org',
      passwordHash: defaultPasswordHash,
      role: UserRole.PHARMACY_STAFF,
      firstName: 'David',
      lastName: 'O\'Connor',
      phone: '+1-555-0501',
    },
  });

  // Patients & Users
  console.log('Seeding Patients...');
  const pat1User = await prisma.user.create({
    data: {
      email: 'patient.john@hospitalos.org',
      passwordHash: defaultPasswordHash,
      role: UserRole.PATIENT,
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1-555-0601',
    },
  });

  const patient1 = await prisma.patient.create({
    data: {
      userId: pat1User.id,
      mrn: 'HOS-2026-000101',
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: new Date('1985-06-15'),
      gender: Gender.MALE,
      bloodGroup: BloodGroup.O_POSITIVE,
      phone: '+1-555-0601',
      email: 'patient.john@hospitalos.org',
      address: '742 Evergreen Terrace, Springfield',
      emergencyContact: 'Jane Doe (+1-555-0602)',
      allergies: 'Penicillin, Peanuts',
      currentStatus: PatientStatus.CONSULTATION,
    },
  });

  const pat2User = await prisma.user.create({
    data: {
      email: 'patient.anita@hospitalos.org',
      passwordHash: defaultPasswordHash,
      role: UserRole.PATIENT,
      firstName: 'Anita',
      lastName: 'Roy',
      phone: '+1-555-0603',
    },
  });

  const patient2 = await prisma.patient.create({
    data: {
      userId: pat2User.id,
      mrn: 'HOS-2026-000102',
      firstName: 'Anita',
      lastName: 'Roy',
      dateOfBirth: new Date('1992-11-20'),
      gender: Gender.FEMALE,
      bloodGroup: BloodGroup.B_POSITIVE,
      phone: '+1-555-0603',
      email: 'patient.anita@hospitalos.org',
      address: '124 Conch Street, Metroville',
      emergencyContact: 'Raj Roy (+1-555-0604)',
      allergies: 'Sulfa Drugs',
      currentStatus: PatientStatus.WAITING,
    },
  });

  const patient3 = await prisma.patient.create({
    data: {
      mrn: 'HOS-2026-000103',
      firstName: 'Robert',
      lastName: 'Miller',
      dateOfBirth: new Date('1968-03-25'),
      gender: Gender.MALE,
      bloodGroup: BloodGroup.A_POSITIVE,
      phone: '+1-555-0605',
      email: 'robert.miller@example.com',
      address: '88 Baker Street, West End',
      emergencyContact: 'Mary Miller (+1-555-0606)',
      allergies: 'None known',
      currentStatus: PatientStatus.ADMITTED,
    },
  });

  // 3. Rooms & Beds
  console.log('Seeding Rooms & Beds...');
  const icuRoom = await prisma.room.create({
    data: {
      departmentId: cardiologyDept.id,
      roomNumber: 'ICU-B',
      type: RoomType.ICU,
      floor: 2,
      totalBeds: 4,
    },
  });

  const bedIcu1 = await prisma.bed.create({
    data: {
      roomId: icuRoom.id,
      departmentId: cardiologyDept.id,
      bedNumber: 'ICU-B-01',
      type: BedType.ICU,
      status: BedStatus.OCCUPIED,
      dailyRate: 4500.0,
      notes: 'Equipped with Philips IntelliVue Monitor & Maquet Ventilator',
    },
  });

  const bedIcu2 = await prisma.bed.create({
    data: {
      roomId: icuRoom.id,
      departmentId: cardiologyDept.id,
      bedNumber: 'ICU-B-02',
      type: BedType.ICU,
      status: BedStatus.AVAILABLE,
      dailyRate: 4500.0,
      notes: 'Cleaned, sanitized and ready for admission',
    },
  });

  const genRoom = await prisma.room.create({
    data: {
      departmentId: generalMedDept.id,
      roomNumber: 'WARD-101',
      type: RoomType.GENERAL_WARD,
      floor: 1,
      totalBeds: 6,
    },
  });

  const bedGen1 = await prisma.bed.create({
    data: {
      roomId: genRoom.id,
      departmentId: generalMedDept.id,
      bedNumber: 'GW-101-A',
      type: BedType.STANDARD,
      status: BedStatus.AVAILABLE,
      dailyRate: 1200.0,
    },
  });

  const bedGen2 = await prisma.bed.create({
    data: {
      roomId: genRoom.id,
      departmentId: generalMedDept.id,
      bedNumber: 'GW-101-B',
      type: BedType.STANDARD,
      status: BedStatus.CLEANING,
      dailyRate: 1200.0,
      notes: 'Patient discharged. Housekeeping in progress.',
    },
  });

  // 4. Queues & Tickets
  console.log('Seeding Queues & Tokens...');
  const cardQueue = await prisma.queue.create({
    data: {
      code: 'Q-CARD-OPD',
      name: 'Cardiology OPD Daily Queue',
      departmentId: cardiologyDept.id,
      doctorId: doc1.id,
      status: QueueStatus.ACTIVE,
      currentToken: 'CARD-101',
      avgWaitTime: 12,
    },
  });

  const genQueue = await prisma.queue.create({
    data: {
      code: 'Q-GEN-OPD',
      name: 'General Medicine Walk-in Queue',
      departmentId: generalMedDept.id,
      doctorId: doc3.id,
      status: QueueStatus.ACTIVE,
      currentToken: 'GEN-201',
      avgWaitTime: 10,
    },
  });

  // 5. Appointments
  console.log('Seeding Appointments...');
  const appt1 = await prisma.appointment.create({
    data: {
      appointmentNo: 'APT-2026-00891',
      patientId: patient1.id,
      doctorId: doc1.id,
      departmentId: cardiologyDept.id,
      appointmentDate: new Date(),
      timeSlot: '10:00 AM',
      type: AppointmentType.OPD,
      status: AppointmentStatus.IN_PROGRESS,
      reason: 'Recurrent palpitation and exertional shortness of breath',
      checkInTime: new Date(Date.now() - 3600000), // 1 hour ago
    },
  });

  const appt2 = await prisma.appointment.create({
    data: {
      appointmentNo: 'APT-2026-00892',
      patientId: patient2.id,
      doctorId: doc1.id,
      departmentId: cardiologyDept.id,
      appointmentDate: new Date(),
      timeSlot: '10:30 AM',
      type: AppointmentType.OPD,
      status: AppointmentStatus.CHECKED_IN,
      reason: 'Hypertension follow-up and ECG review',
      checkInTime: new Date(Date.now() - 1200000), // 20 mins ago
    },
  });

  // Queue Tickets for patients
  await prisma.queueTicket.create({
    data: {
      ticketNumber: 'CARD-101',
      queueId: cardQueue.id,
      patientId: patient1.id,
      appointmentId: appt1.id,
      status: TicketStatus.IN_SERVICE,
      priority: PriorityLevel.NORMAL,
      issuedAt: new Date(Date.now() - 3600000),
      calledAt: new Date(Date.now() - 900000),
      inServiceAt: new Date(Date.now() - 600000),
      estWaitMins: 0,
    },
  });

  await prisma.queueTicket.create({
    data: {
      ticketNumber: 'CARD-102',
      queueId: cardQueue.id,
      patientId: patient2.id,
      appointmentId: appt2.id,
      status: TicketStatus.WAITING,
      priority: PriorityLevel.NORMAL,
      issuedAt: new Date(Date.now() - 1200000),
      estWaitMins: 15,
    },
  });

  // 6. Consultations / Encounters
  console.log('Seeding Consultations & Clinical Data...');
  const encounter1 = await prisma.encounter.create({
    data: {
      encounterNo: 'ENC-2026-00441',
      patientId: patient1.id,
      doctorId: doc1.id,
      appointmentId: appt1.id,
      type: AppointmentType.OPD,
      status: EncounterStatus.IN_PROGRESS,
      chiefComplaint: 'Chest tightness for 3 days, worsens upon climbing stairs',
      vitals: {
        bp: '138/88 mmHg',
        pulse: 84,
        respiratoryRate: 18,
        temp: 98.4,
        spo2: 98,
        weightKg: 74,
      },
      examinationNotes: 'S1 S2 heard normal, no murmurs. Mild bilateral pedal edema.',
      diagnosis: 'Suspected Angina Pectoris / Ischemic Heart Disease Rule Out',
      icdCode: 'I20.9',
      startTime: new Date(Date.now() - 600000),
    },
  });

  // 7. Laboratory Orders & Reports
  console.log('Seeding Laboratory Orders & Reports...');
  const labOrder1 = await prisma.labOrder.create({
    data: {
      orderNumber: 'LAB-2026-00310',
      patientId: patient1.id,
      doctorId: doc1.id,
      encounterId: encounter1.id,
      status: LabOrderStatus.SAMPLE_COLLECTED,
      priority: PriorityLevel.URGENT,
      notes: 'Stat Troponin-I, Lipid Profile and Complete Blood Count',
    },
  });

  const sample1 = await prisma.labSample.create({
    data: {
      labOrderId: labOrder1.id,
      testName: 'High-Sensitivity Troponin-I (Cardiac Biomarker)',
      testCode: 'TROP-I-HS',
      category: LabTestCategory.BIOCHEMISTRY,
      specimenType: 'Venous Blood (Heparin)',
      barcode: 'SMP-2026-88192',
      status: LabOrderStatus.PROCESSING,
      collectedAt: new Date(Date.now() - 1800000),
      collectedBy: 'Maya Lin (Lab Tech)',
    },
  });

  // Completed lab order for Patient 3 (Inpatient)
  const labOrder2 = await prisma.labOrder.create({
    data: {
      orderNumber: 'LAB-2026-00298',
      patientId: patient3.id,
      doctorId: doc1.id,
      status: LabOrderStatus.COMPLETED,
      priority: PriorityLevel.NORMAL,
      notes: 'Routine Inpatient Electrolytes and Serum Creatinine',
    },
  });

  const sample2 = await prisma.labSample.create({
    data: {
      labOrderId: labOrder2.id,
      testName: 'Comprehensive Renal Function Panel',
      testCode: 'RFT-01',
      category: LabTestCategory.BIOCHEMISTRY,
      specimenType: 'Serum',
      barcode: 'SMP-2026-77312',
      status: LabOrderStatus.COMPLETED,
      collectedAt: new Date(Date.now() - 86400000),
      collectedBy: 'Maya Lin',
      processedAt: new Date(Date.now() - 80000000),
      processedBy: 'Dr. Arthur Hall, Pathologist',
    },
  });

  await prisma.labReport.create({
    data: {
      labOrderId: labOrder2.id,
      labSampleId: sample2.id,
      reportNumber: 'REP-2026-00192',
      summary: 'Renal panel parameters within normal adult clinical tolerance limits.',
      results: [
        { parameter: 'Serum Creatinine', value: 0.95, unit: 'mg/dL', range: '0.7 - 1.3', flag: 'NORMAL' },
        { parameter: 'Blood Urea Nitrogen', value: 16.0, unit: 'mg/dL', range: '7.0 - 20.0', flag: 'NORMAL' },
        { parameter: 'Serum Sodium (Na+)', value: 140, unit: 'mEq/L', range: '136 - 145', flag: 'NORMAL' },
        { parameter: 'Serum Potassium (K+)', value: 4.2, unit: 'mEq/L', range: '3.5 - 5.1', flag: 'NORMAL' },
      ],
      conclusion: 'Normal renal biochemistry. No signs of acute kidney impairment.',
      status: LabReportStatus.PUBLISHED,
      verifiedBy: 'Dr. Arthur Hall (Consultant Pathologist)',
      publishedAt: new Date(Date.now() - 75000000),
    },
  });

  // 8. Medicines & Pharmacy Inventory
  console.log('Seeding Pharmacy Medicines & Stock...');
  const med1 = await prisma.medicine.create({
    data: {
      code: 'MED-ATRV-20',
      name: 'Atorvastatin Calcium 20mg',
      genericName: 'Atorvastatin',
      category: 'Lipid-lowering / Statin',
      form: MedicineForm.TABLET,
      strength: '20mg',
      unitPrice: 18.5,
      reorderLevel: 50,
    },
  });

  const med2 = await prisma.medicine.create({
    data: {
      code: 'MED-AMOX-500',
      name: 'Amoxicillin & Clavulanate 625mg',
      genericName: 'Amoxicillin + Clavulanic Acid',
      category: 'Broad-Spectrum Antibiotic',
      form: MedicineForm.TABLET,
      strength: '625mg',
      unitPrice: 32.0,
      reorderLevel: 40,
    },
  });

  const med3 = await prisma.medicine.create({
    data: {
      code: 'MED-PARA-650',
      name: 'Paracetamol 650mg',
      genericName: 'Acetaminophen',
      category: 'Antipyretic / Analgesic',
      form: MedicineForm.TABLET,
      strength: '650mg',
      unitPrice: 3.5,
      reorderLevel: 100,
    },
  });

  const med4 = await prisma.medicine.create({
    data: {
      code: 'MED-ASPR-75',
      name: 'Ecosprin 75mg Gastro-resistant',
      genericName: 'Aspirin',
      category: 'Antiplatelet',
      form: MedicineForm.TABLET,
      strength: '75mg',
      unitPrice: 5.0,
      reorderLevel: 60,
    },
  });

  // Inventory records
  await prisma.inventory.create({
    data: {
      medicineId: med1.id,
      batchNumber: 'ATV-2026-B1',
      expiryDate: new Date('2028-05-31'),
      currentStock: 320,
      reservedStock: 14,
      minStockLevel: 50,
      maxStockLevel: 1000,
      location: 'Rack C - Shelf 2',
      supplier: 'Sun Pharma Logistics',
      status: InventoryStatus.IN_STOCK,
    },
  });

  await prisma.inventory.create({
    data: {
      medicineId: med2.id,
      batchNumber: 'AMX-2026-X9',
      expiryDate: new Date('2027-10-31'),
      currentStock: 25, // LOW STOCK to demonstrate bottleneck alert!
      reservedStock: 10,
      minStockLevel: 40,
      maxStockLevel: 600,
      location: 'Rack A - Shelf 1',
      supplier: 'Cipla Healthcare',
      status: InventoryStatus.LOW_STOCK,
    },
  });

  await prisma.inventory.create({
    data: {
      medicineId: med3.id,
      batchNumber: 'PCM-2026-K4',
      expiryDate: new Date('2028-12-31'),
      currentStock: 850,
      reservedStock: 20,
      minStockLevel: 100,
      maxStockLevel: 2000,
      location: 'Rack D - Bulk Bin 1',
      supplier: 'GSK Life Sciences',
      status: InventoryStatus.IN_STOCK,
    },
  });

  // Prescription for Patient 1
  const rx1 = await prisma.prescription.create({
    data: {
      prescriptionNumber: 'RX-2026-00441',
      patientId: patient1.id,
      doctorId: doc1.id,
      encounterId: encounter1.id,
      status: PrescriptionStatus.ISSUED,
      notes: 'Take after meals with plenty of water. Monitor blood pressure daily.',
    },
  });

  await prisma.prescriptionItem.create({
    data: {
      prescriptionId: rx1.id,
      medicineId: med1.id,
      medicineName: med1.name,
      dosage: '20mg',
      frequency: '0-0-1 (Once at bedtime)',
      durationDays: 30,
      quantity: 30,
      dispensedQty: 0,
      instructions: 'Take 1 tablet every night at bedtime',
    },
  });

  await prisma.prescriptionItem.create({
    data: {
      prescriptionId: rx1.id,
      medicineId: med4.id,
      medicineName: med4.name,
      dosage: '75mg',
      frequency: '1-0-0 (Morning after food)',
      durationDays: 30,
      quantity: 30,
      dispensedQty: 0,
      instructions: 'Take 1 tablet in the morning after breakfast',
    },
  });

  // 9. Inpatient Admission
  console.log('Seeding Admissions & Inpatient Care...');
  const adm1 = await prisma.admission.create({
    data: {
      admissionNumber: 'ADM-2026-00109',
      patientId: patient3.id,
      bedId: bedIcu1.id,
      departmentId: cardiologyDept.id,
      doctorId: doc1.id,
      admissionDate: new Date(Date.now() - 172800000), // 2 days ago
      type: AdmissionType.EMERGENCY,
      initialDiagnosis: 'Acute Coronary Syndrome with Hemodynamic Instability',
      status: AdmissionStatus.ADMITTED,
    },
  });

  // 10. Billing & Payments
  console.log('Seeding Billing & Invoices...');
  const bill1 = await prisma.bill.create({
    data: {
      invoiceNumber: 'INV-2026-00501',
      patientId: patient1.id,
      encounterId: encounter1.id,
      totalAmount: 1850.0,
      discountAmount: 100.0,
      taxAmount: 87.5,
      netAmount: 1837.5,
      paidAmount: 750.0,
      balanceAmount: 1087.5,
      status: BillStatus.PARTIALLY_PAID,
      dueDate: new Date(Date.now() + 86400000),
    },
  });

  await prisma.billItem.create({
    data: {
      billId: bill1.id,
      description: 'Senior Cardiologist OPD Consultation Fee',
      category: BillCategory.CONSULTATION,
      quantity: 1,
      unitPrice: 750.0,
      amount: 750.0,
    },
  });

  await prisma.billItem.create({
    data: {
      billId: bill1.id,
      description: 'High-Sensitivity Troponin-I Lab Investigation',
      category: BillCategory.LABORATORY,
      quantity: 1,
      unitPrice: 1100.0,
      amount: 1100.0,
    },
  });

  await prisma.payment.create({
    data: {
      receiptNumber: 'REC-2026-00991',
      billId: bill1.id,
      amount: 750.0,
      method: PaymentMethod.UPI,
      transactionRef: 'UPI/HDFC/20260904001',
      status: PaymentStatus.SUCCESS,
      receivedBy: 'Carlos Mendez (Front Desk)',
    },
  });

  // 11. Hospital Resources & Equipment
  console.log('Seeding Hospital Resources & Equipment...');
  await prisma.resource.create({
    data: {
      departmentId: cardiologyDept.id,
      name: 'Philips IntelliVue MX750 Patient Monitor',
      code: 'MON-CARD-01',
      type: ResourceType.MONITOR,
      status: ResourceStatus.IN_USE,
      serialNumber: 'SN-MX750-9921',
      location: 'ICU-B-01',
    },
  });

  await prisma.resource.create({
    data: {
      departmentId: emergencyDept.id,
      name: 'Zoll R-Series Defibrillator & Pacer',
      code: 'DEFIB-ER-01',
      type: ResourceType.DEFIBRILLATOR,
      status: ResourceStatus.AVAILABLE,
      serialNumber: 'SN-ZOLL-4412',
      location: 'Emergency Trauma Bay 1',
    },
  });

  await prisma.resource.create({
    data: {
      departmentId: emergencyDept.id,
      name: 'Hamilton-G5 Mechanical Ventilator',
      code: 'VENT-ER-02',
      type: ResourceType.VENTILATOR,
      status: ResourceStatus.MAINTENANCE,
      serialNumber: 'SN-HAM-8819',
      location: 'Biomedical Workshop Floor -1',
      notes: 'Scheduled 6-month calibration and filter replacement in progress',
    },
  });

  // 12. Real-Time Operational Events & Audit Logs
  console.log('Seeding Real-Time Events & Audit Logs...');
  await prisma.hospitalEvent.create({
    data: {
      eventType: 'PATIENT_CHECKED_IN',
      entityType: 'PATIENT',
      entityId: patient1.id,
      payload: {
        patientName: `${patient1.firstName} ${patient1.lastName}`,
        mrn: patient1.mrn,
        department: 'Cardiology',
        token: 'CARD-101',
      },
      triggeredByUserId: recUser.id,
    },
  });

  await prisma.hospitalEvent.create({
    data: {
      eventType: 'PATIENT_CALLED',
      entityType: 'QUEUE',
      entityId: cardQueue.id,
      payload: {
        token: 'CARD-101',
        doctor: 'Dr. Vikram Sharma',
        room: 'OPD-204',
      },
      triggeredByUserId: doc1User.id,
    },
  });

  await prisma.hospitalEvent.create({
    data: {
      eventType: 'LAB_ORDER_PLACED',
      entityType: 'LAB',
      entityId: labOrder1.id,
      payload: {
        orderNumber: labOrder1.orderNumber,
        test: 'High-Sensitivity Troponin-I',
        priority: 'URGENT',
      },
      triggeredByUserId: doc1User.id,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: adminUser.id,
      userRole: UserRole.ADMIN,
      action: 'SYSTEM_BOOTSTRAP',
      entity: 'System',
      entityId: 'ROOT',
      ipAddress: '127.0.0.1',
      metadata: { event: 'HospitalOS initial operational dataset loaded' },
    },
  });

  console.log('--- HospitalOS Database Seed Completed Successfully ---');
}

main()
  .catch((e) => {
    console.error('Seed Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
