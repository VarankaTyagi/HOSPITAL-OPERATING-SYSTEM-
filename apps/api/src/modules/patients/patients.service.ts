import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { EventsGateway } from '../../gateways/events.gateway';
import { PatientStatus, Gender, BloodGroup } from '../../generated/client/enums';

@Injectable()
export class PatientsService {
  constructor(
    private prisma: PrismaService,
    private eventsGateway: EventsGateway,
  ) {}

  async findAll(query?: { search?: string; status?: PatientStatus; page?: number; limit?: number }) {
    const page = Number(query?.page) || 1;
    const limit = Number(query?.limit) || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query?.status) {
      where.currentStatus = query.status;
    }
    if (query?.search) {
      where.OR = [
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
        { mrn: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search } },
      ];
    }

    const [patients, total] = await Promise.all([
      this.prisma.patient.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.patient.count({ where }),
    ]);

    return {
      data: patients,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { id },
      include: {
        appointments: { include: { doctor: true, department: true }, orderBy: { appointmentDate: 'desc' } },
        encounters: { include: { doctor: true }, orderBy: { startTime: 'desc' } },
        labOrders: { include: { samples: true, reports: true }, orderBy: { createdAt: 'desc' } },
        prescriptions: { include: { items: true }, orderBy: { createdAt: 'desc' } },
        admissions: { include: { bed: true, department: true, discharge: true }, orderBy: { admissionDate: 'desc' } },
        bills: { include: { items: true, payments: true }, orderBy: { createdAt: 'desc' } },
        queueTickets: { include: { queue: true }, orderBy: { issuedAt: 'desc' } },
      },
    });

    if (!patient) throw new NotFoundException(`Patient ${id} not found`);
    return patient;
  }

  async create(data: {
    firstName: string;
    lastName: string;
    dateOfBirth: string | Date;
    gender: Gender;
    bloodGroup?: BloodGroup;
    phone: string;
    email?: string;
    address?: string;
    emergencyContact?: string;
    allergies?: string;
  }) {
    const count = await this.prisma.patient.count();
    const mrn = `HOS-2026-${String(count + 101).padStart(6, '0')}`;

    const patient = await this.prisma.patient.create({
      data: {
        mrn,
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: new Date(data.dateOfBirth),
        gender: data.gender,
        bloodGroup: data.bloodGroup || BloodGroup.UNKNOWN,
        phone: data.phone,
        email: data.email,
        address: data.address,
        emergencyContact: data.emergencyContact,
        allergies: data.allergies,
        currentStatus: PatientStatus.REGISTERED,
      },
    });

    await this.prisma.hospitalEvent.create({
      data: {
        eventType: 'PATIENT_REGISTERED',
        entityType: 'PATIENT',
        entityId: patient.id,
        payload: {
          mrn: patient.mrn,
          name: `${patient.firstName} ${patient.lastName}`,
          phone: patient.phone,
        },
      },
    });

    return patient;
  }

  async updateStatus(id: string, status: PatientStatus) {
    const patient = await this.prisma.patient.update({
      where: { id },
      data: { currentStatus: status },
    });

    this.eventsGateway.broadcastPatientJourney(id, {
      currentStatus: status,
      updatedAt: new Date().toISOString(),
    });

    await this.prisma.hospitalEvent.create({
      data: {
        eventType: 'PATIENT_STATUS_CHANGED',
        entityType: 'PATIENT',
        entityId: id,
        payload: { status },
      },
    });

    return patient;
  }
}
