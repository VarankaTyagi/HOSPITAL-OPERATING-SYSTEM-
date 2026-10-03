import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { EventsGateway } from '../../gateways/events.gateway';
import { AdmissionStatus, BedStatus, PatientStatus, AdmissionType, DischargeType } from '../../generated/client/enums';

@Injectable()
export class AdmissionsService {
  constructor(
    private prisma: PrismaService,
    private eventsGateway: EventsGateway,
  ) {}

  async findAll(query?: { status?: AdmissionStatus; departmentId?: string; patientId?: string }) {
    const where: any = {};
    if (query?.status) where.status = query.status;
    if (query?.departmentId) where.departmentId = query.departmentId;
    if (query?.patientId) where.patientId = query.patientId;

    return this.prisma.admission.findMany({
      where,
      include: {
        patient: true,
        bed: { include: { room: true } },
        department: true,
        doctor: true,
        discharge: true,
      },
      orderBy: { admissionDate: 'desc' },
    });
  }

  async admitPatient(data: {
    patientId: string;
    bedId: string;
    departmentId: string;
    doctorId: string;
    initialDiagnosis: string;
    type?: AdmissionType;
  }) {
    const bed = await this.prisma.bed.findUnique({ where: { id: data.bedId } });
    if (!bed) throw new NotFoundException('Bed not found');
    if (bed.status !== BedStatus.AVAILABLE) {
      throw new BadRequestException(`Bed ${bed.bedNumber} is not available (Current: ${bed.status})`);
    }

    const count = await this.prisma.admission.count();
    const admissionNumber = `ADM-2026-${String(count + 101).padStart(5, '0')}`;

    // 1. Create Admission
    const admission = await this.prisma.admission.create({
      data: {
        admissionNumber,
        patientId: data.patientId,
        bedId: data.bedId,
        departmentId: data.departmentId,
        doctorId: data.doctorId,
        initialDiagnosis: data.initialDiagnosis,
        type: data.type || AdmissionType.EMERGENCY,
        status: AdmissionStatus.ADMITTED,
        admissionDate: new Date(),
      },
      include: {
        patient: true,
        bed: { include: { room: true } },
        department: true,
        doctor: true,
      },
    });

    // 2. Mark Bed as OCCUPIED
    await this.prisma.bed.update({
      where: { id: data.bedId },
      data: { status: BedStatus.OCCUPIED },
    });

    // 3. Mark Patient as ADMITTED
    await this.prisma.patient.update({
      where: { id: data.patientId },
      data: { currentStatus: PatientStatus.ADMITTED },
    });

    // 4. Real-time updates
    this.eventsGateway.broadcastBedStatus({
      bedId: bed.id,
      bedNumber: bed.bedNumber,
      status: BedStatus.OCCUPIED,
      patientName: `${admission.patient.firstName} ${admission.patient.lastName}`,
    });

    this.eventsGateway.broadcastPatientJourney(data.patientId, {
      currentStatus: PatientStatus.ADMITTED,
      admissionNumber,
      bedNumber: bed.bedNumber,
      department: admission.department.name,
    });

    await this.prisma.hospitalEvent.create({
      data: {
        eventType: 'PATIENT_ADMITTED',
        entityType: 'ADMISSION',
        entityId: admission.id,
        payload: {
          admissionNumber,
          patientName: `${admission.patient.firstName} ${admission.patient.lastName}`,
          bedNumber: bed.bedNumber,
          initialDiagnosis: data.initialDiagnosis,
        },
      },
    });

    return admission;
  }

  async dischargePatient(
    admissionId: string,
    data: {
      dischargeSummary: string;
      followUpInstructions?: string;
      conditionAtDischarge?: string;
      approvedBy: string;
      type?: DischargeType;
    },
  ) {
    const admission = await this.prisma.admission.findUnique({
      where: { id: admissionId },
      include: { bed: true, patient: true },
    });
    if (!admission) throw new NotFoundException('Admission record not found');

    if (admission.status === AdmissionStatus.DISCHARGED) {
      throw new BadRequestException('Patient has already been discharged');
    }

    // 1. Create Discharge record
    const discharge = await this.prisma.discharge.create({
      data: {
        admissionId,
        dischargeDate: new Date(),
        type: data.type || DischargeType.NORMAL,
        dischargeSummary: data.dischargeSummary,
        followUpInstructions: data.followUpInstructions,
        conditionAtDischarge: data.conditionAtDischarge || 'STABLE',
        approvedBy: data.approvedBy,
      },
    });

    // 2. Mark Admission as DISCHARGED
    await this.prisma.admission.update({
      where: { id: admissionId },
      data: { status: AdmissionStatus.DISCHARGED },
    });

    // 3. Mark Bed as CLEANING
    await this.prisma.bed.update({
      where: { id: admission.bedId },
      data: {
        status: BedStatus.CLEANING,
        notes: `Patient discharged. Sanitization scheduled.`,
      },
    });

    // 4. Mark Patient as DISCHARGED
    await this.prisma.patient.update({
      where: { id: admission.patientId },
      data: { currentStatus: PatientStatus.DISCHARGED },
    });

    this.eventsGateway.broadcastBedStatus({
      bedId: admission.bedId,
      bedNumber: admission.bed.bedNumber,
      status: BedStatus.CLEANING,
    });

    this.eventsGateway.broadcastPatientJourney(admission.patientId, {
      currentStatus: PatientStatus.DISCHARGED,
      dischargeDate: discharge.dischargeDate,
      summary: discharge.dischargeSummary,
    });

    await this.prisma.hospitalEvent.create({
      data: {
        eventType: 'PATIENT_DISCHARGED',
        entityType: 'ADMISSION',
        entityId: admission.id,
        payload: {
          admissionNumber: admission.admissionNumber,
          patientName: `${admission.patient.firstName} ${admission.patient.lastName}`,
          bedReleased: admission.bed.bedNumber,
          approvedBy: data.approvedBy,
        },
      },
    });

    return discharge;
  }
}
