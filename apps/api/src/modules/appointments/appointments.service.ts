import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { EventsGateway } from '../../gateways/events.gateway';
import { AppointmentStatus, AppointmentType, PatientStatus, TicketStatus, PriorityLevel } from '../../generated/client/enums';

@Injectable()
export class AppointmentsService {
  constructor(
    private prisma: PrismaService,
    private eventsGateway: EventsGateway,
  ) {}

  async findAll(query?: {
    status?: AppointmentStatus;
    doctorId?: string;
    patientId?: string;
    departmentId?: string;
    date?: string;
  }) {
    const where: any = {};
    if (query?.status) where.status = query.status;
    if (query?.doctorId) where.doctorId = query.doctorId;
    if (query?.patientId) where.patientId = query.patientId;
    if (query?.departmentId) where.departmentId = query.departmentId;

    if (query?.date) {
      const start = new Date(query.date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(query.date);
      end.setHours(23, 59, 59, 999);
      where.appointmentDate = { gte: start, lte: end };
    }

    return this.prisma.appointment.findMany({
      where,
      include: {
        patient: true,
        doctor: { include: { department: true } },
        department: true,
        queueTicket: true,
      },
      orderBy: { appointmentDate: 'asc' },
    });
  }

  async findOne(id: string) {
    const appt = await this.prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: true,
        doctor: { include: { department: true } },
        department: true,
        queueTicket: true,
        encounter: true,
      },
    });
    if (!appt) throw new NotFoundException(`Appointment ${id} not found`);
    return appt;
  }

  async create(data: {
    patientId: string;
    doctorId: string;
    departmentId: string;
    appointmentDate: string | Date;
    timeSlot: string;
    type?: AppointmentType;
    reason?: string;
  }) {
    const count = await this.prisma.appointment.count();
    const appointmentNo = `APT-2026-${String(count + 101).padStart(5, '0')}`;

    const appointment = await this.prisma.appointment.create({
      data: {
        appointmentNo,
        patientId: data.patientId,
        doctorId: data.doctorId,
        departmentId: data.departmentId,
        appointmentDate: new Date(data.appointmentDate),
        timeSlot: data.timeSlot,
        type: data.type || AppointmentType.OPD,
        reason: data.reason,
        status: AppointmentStatus.SCHEDULED,
      },
      include: {
        patient: true,
        doctor: true,
        department: true,
      },
    });

    // Update patient status to APPOINTMENT_SCHEDULED
    await this.prisma.patient.update({
      where: { id: data.patientId },
      data: { currentStatus: PatientStatus.APPOINTMENT_SCHEDULED },
    });

    // Create Notification
    await this.prisma.notification.create({
      data: {
        recipientRole: 'PATIENT',
        title: 'Appointment Confirmed',
        message: `Your appointment with Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName} is confirmed for ${appointment.timeSlot}.`,
        type: 'APPOINTMENT',
      },
    });

    await this.prisma.hospitalEvent.create({
      data: {
        eventType: 'APPOINTMENT_CREATED',
        entityType: 'APPOINTMENT',
        entityId: appointment.id,
        payload: {
          appointmentNo,
          patientName: `${appointment.patient.firstName} ${appointment.patient.lastName}`,
          timeSlot: appointment.timeSlot,
        },
      },
    });

    return appointment;
  }

  async checkIn(id: string) {
    const appt = await this.prisma.appointment.findUnique({
      where: { id },
      include: { patient: true, doctor: true, department: true },
    });
    if (!appt) throw new NotFoundException(`Appointment ${id} not found`);

    if (appt.status === AppointmentStatus.CHECKED_IN) {
      throw new BadRequestException('Patient is already checked in');
    }

    const checkInTime = new Date();

    // 1. Update Appointment
    const updatedAppt = await this.prisma.appointment.update({
      where: { id },
      data: {
        status: AppointmentStatus.CHECKED_IN,
        checkInTime,
      },
      include: { patient: true, doctor: true, department: true },
    });

    // 2. Update Patient status to CHECKED_IN
    await this.prisma.patient.update({
      where: { id: appt.patientId },
      data: { currentStatus: PatientStatus.CHECKED_IN },
    });

    // 3. Find or join active queue for this department / doctor
    let queue = await this.prisma.queue.findFirst({
      where: {
        departmentId: appt.departmentId,
        doctorId: appt.doctorId,
      },
    });

    if (!queue) {
      queue = await this.prisma.queue.findFirst({
        where: { departmentId: appt.departmentId },
      });
    }

    let ticket: any = null;
    if (queue) {
      const ticketCount = await this.prisma.queueTicket.count({ where: { queueId: queue.id } });
      const prefix = queue.code.replace('Q-', '');
      const ticketNumber = `${prefix}-${String(ticketCount + 101).padStart(3, '0')}`;

      ticket = await this.prisma.queueTicket.create({
        data: {
          ticketNumber,
          queueId: queue.id,
          patientId: appt.patientId,
          appointmentId: appt.id,
          status: TicketStatus.WAITING,
          priority: PriorityLevel.NORMAL,
          estWaitMins: 15,
        },
      });

      this.eventsGateway.broadcastQueueUpdate({
        queueId: queue.id,
        action: 'CHECK_IN_QUEUE',
        ticket,
      });
    }

    // 4. Broadcast Real-Time Events
    this.eventsGateway.broadcastPatientJourney(appt.patientId, {
      currentStatus: PatientStatus.CHECKED_IN,
      checkInTime,
      ticketNumber: ticket?.ticketNumber,
    });

    await this.prisma.hospitalEvent.create({
      data: {
        eventType: 'PATIENT_CHECKED_IN',
        entityType: 'APPOINTMENT',
        entityId: appt.id,
        payload: {
          patientName: `${appt.patient.firstName} ${appt.patient.lastName}`,
          token: ticket?.ticketNumber,
          department: appt.department.name,
        },
      },
    });

    return { appointment: updatedAppt, ticket };
  }

  async updateStatus(id: string, status: AppointmentStatus) {
    return this.prisma.appointment.update({
      where: { id },
      data: { status },
      include: { patient: true, doctor: true },
    });
  }
}
