import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { EventsGateway } from '../../gateways/events.gateway';
import { EncounterStatus, AppointmentStatus, PatientStatus, AppointmentType } from '../../generated/client/enums';

@Injectable()
export class EncountersService {
  constructor(
    private prisma: PrismaService,
    private eventsGateway: EventsGateway,
  ) {}

  async findAll(query?: { doctorId?: string; patientId?: string; status?: EncounterStatus }) {
    const where: any = {};
    if (query?.doctorId) where.doctorId = query.doctorId;
    if (query?.patientId) where.patientId = query.patientId;
    if (query?.status) where.status = query.status;

    return this.prisma.encounter.findMany({
      where,
      include: {
        patient: true,
        doctor: { include: { department: true } },
        appointment: true,
        labOrders: { include: { samples: true, reports: true } },
        prescriptions: { include: { items: true } },
      },
      orderBy: { startTime: 'desc' },
    });
  }

  async findOne(id: string) {
    const enc = await this.prisma.encounter.findUnique({
      where: { id },
      include: {
        patient: true,
        doctor: { include: { department: true } },
        appointment: true,
        labOrders: { include: { samples: true, reports: true } },
        prescriptions: { include: { items: true } },
        medicalRecords: true,
      },
    });
    if (!enc) throw new NotFoundException(`Encounter ${id} not found`);
    return enc;
  }

  async startEncounter(data: {
    patientId: string;
    doctorId: string;
    appointmentId?: string;
    chiefComplaint: string;
    vitals?: any;
    type?: AppointmentType;
  }) {
    const count = await this.prisma.encounter.count();
    const encounterNo = `ENC-2026-${String(count + 101).padStart(5, '0')}`;

    const encounter = await this.prisma.encounter.create({
      data: {
        encounterNo,
        patientId: data.patientId,
        doctorId: data.doctorId,
        appointmentId: data.appointmentId,
        chiefComplaint: data.chiefComplaint,
        vitals: data.vitals || null,
        type: data.type || AppointmentType.OPD,
        status: EncounterStatus.IN_PROGRESS,
        startTime: new Date(),
      },
      include: {
        patient: true,
        doctor: true,
      },
    });

    // Update patient status to CONSULTATION
    await this.prisma.patient.update({
      where: { id: data.patientId },
      data: { currentStatus: PatientStatus.CONSULTATION },
    });

    if (data.appointmentId) {
      await this.prisma.appointment.update({
        where: { id: data.appointmentId },
        data: { status: AppointmentStatus.IN_PROGRESS },
      });
    }

    this.eventsGateway.broadcastPatientJourney(data.patientId, {
      currentStatus: PatientStatus.CONSULTATION,
      encounterNo,
      doctorName: `Dr. ${encounter.doctor.firstName} ${encounter.doctor.lastName}`,
    });

    await this.prisma.hospitalEvent.create({
      data: {
        eventType: 'CONSULTATION_STARTED',
        entityType: 'ENCOUNTER',
        entityId: encounter.id,
        payload: {
          encounterNo,
          patientName: `${encounter.patient.firstName} ${encounter.patient.lastName}`,
          chiefComplaint: encounter.chiefComplaint,
        },
      },
    });

    return encounter;
  }

  async completeEncounter(
    id: string,
    data: {
      diagnosis?: string;
      icdCode?: string;
      examinationNotes?: string;
      followUpDate?: string;
    },
  ) {
    const encounter = await this.prisma.encounter.update({
      where: { id },
      data: {
        diagnosis: data.diagnosis,
        icdCode: data.icdCode,
        examinationNotes: data.examinationNotes,
        followUpDate: data.followUpDate ? new Date(data.followUpDate) : null,
        status: EncounterStatus.COMPLETED,
        endTime: new Date(),
      },
      include: {
        patient: true,
        doctor: true,
        appointment: true,
        labOrders: true,
        prescriptions: true,
      },
    });

    if (encounter.appointmentId) {
      await this.prisma.appointment.update({
        where: { id: encounter.appointmentId },
        data: { status: AppointmentStatus.COMPLETED, completedTime: new Date() },
      });
    }

    // Determine next patient status in journey
    let nextStatus: PatientStatus = PatientStatus.BILLING;
    if (encounter.labOrders.length > 0) {
      nextStatus = PatientStatus.LABORATORY;
    } else if (encounter.prescriptions.length > 0) {
      nextStatus = PatientStatus.PHARMACY;
    }

    await this.prisma.patient.update({
      where: { id: encounter.patientId },
      data: { currentStatus: nextStatus },
    });

    this.eventsGateway.broadcastPatientJourney(encounter.patientId, {
      currentStatus: nextStatus,
      completedEncounter: encounter.encounterNo,
      diagnosis: encounter.diagnosis,
    });

    await this.prisma.hospitalEvent.create({
      data: {
        eventType: 'CONSULTATION_COMPLETED',
        entityType: 'ENCOUNTER',
        entityId: encounter.id,
        payload: {
          encounterNo: encounter.encounterNo,
          patientName: `${encounter.patient.firstName} ${encounter.patient.lastName}`,
          diagnosis: encounter.diagnosis,
          nextStage: nextStatus,
        },
      },
    });

    return encounter;
  }
}
