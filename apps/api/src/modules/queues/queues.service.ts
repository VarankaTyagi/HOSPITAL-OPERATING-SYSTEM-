import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { EventsGateway } from '../../gateways/events.gateway';
import { TicketStatus, PriorityLevel, PatientStatus } from '../../generated/client/enums';

@Injectable()
export class QueuesService {
  constructor(
    private prisma: PrismaService,
    private eventsGateway: EventsGateway,
  ) {}

  async findAll() {
    return this.prisma.queue.findMany({
      include: {
        department: true,
        doctor: true,
        tickets: {
          where: {
            status: { in: [TicketStatus.WAITING, TicketStatus.CALLED, TicketStatus.IN_SERVICE] },
          },
          include: { patient: true },
          orderBy: { issuedAt: 'asc' },
        },
      },
    });
  }

  async findOne(id: string) {
    const queue = await this.prisma.queue.findUnique({
      where: { id },
      include: {
        department: true,
        doctor: true,
        tickets: {
          include: { patient: true },
          orderBy: { issuedAt: 'asc' },
        },
      },
    });
    if (!queue) throw new NotFoundException(`Queue ${id} not found`);
    return queue;
  }

  async generateToken(queueId: string, patientId: string, priority: PriorityLevel = PriorityLevel.NORMAL, appointmentId?: string) {
    const queue = await this.prisma.queue.findUnique({ where: { id: queueId } });
    if (!queue) throw new NotFoundException(`Queue ${queueId} not found`);

    const ticketCount = await this.prisma.queueTicket.count({ where: { queueId } });
    const prefix = queue.code.replace('Q-', '');
    const ticketNumber = `${prefix}-${String(ticketCount + 101).padStart(3, '0')}`;

    const waitingCount = await this.prisma.queueTicket.count({
      where: { queueId, status: TicketStatus.WAITING },
    });
    const estWaitMins = waitingCount * queue.avgWaitTime;

    const ticket = await this.prisma.queueTicket.create({
      data: {
        ticketNumber,
        queueId,
        patientId,
        appointmentId,
        priority,
        estWaitMins,
        status: TicketStatus.WAITING,
      },
      include: {
        patient: true,
        queue: { include: { department: true } },
      },
    });

    // Update patient current status to WAITING
    await this.prisma.patient.update({
      where: { id: patientId },
      data: { currentStatus: PatientStatus.WAITING },
    });

    // Record Hospital Event
    await this.prisma.hospitalEvent.create({
      data: {
        eventType: 'QUEUE_TOKEN_ISSUED',
        entityType: 'QUEUE',
        entityId: queue.id,
        payload: {
          ticketId: ticket.id,
          ticketNumber: ticket.ticketNumber,
          patientName: `${ticket.patient.firstName} ${ticket.patient.lastName}`,
          estWaitMins,
        },
      },
    });

    // Real-time broadcast
    this.eventsGateway.broadcastQueueUpdate({
      queueId,
      action: 'TOKEN_ISSUED',
      ticket,
    });

    return ticket;
  }

  async callNextTicket(queueId: string, doctorId?: string) {
    const queue = await this.prisma.queue.findUnique({ where: { id: queueId } });
    if (!queue) throw new NotFoundException(`Queue ${queueId} not found`);

    // Complete any currently IN_SERVICE ticket if needed
    await this.prisma.queueTicket.updateMany({
      where: { queueId, status: TicketStatus.CALLED },
      data: { status: TicketStatus.IN_SERVICE, inServiceAt: new Date() },
    });

    // Fetch next waiting ticket (Emergency / Urgent prioritized)
    const nextTicket = await this.prisma.queueTicket.findFirst({
      where: { queueId, status: TicketStatus.WAITING },
      orderBy: [
        { priority: 'desc' },
        { issuedAt: 'asc' },
      ],
      include: { patient: true, queue: { include: { department: true } } },
    });

    if (!nextTicket) {
      throw new BadRequestException('No waiting patients in this queue');
    }

    const updatedTicket = await this.prisma.queueTicket.update({
      where: { id: nextTicket.id },
      data: {
        status: TicketStatus.CALLED,
        calledAt: new Date(),
      },
      include: { patient: true, queue: true },
    });

    // Update Queue's current token
    await this.prisma.queue.update({
      where: { id: queueId },
      data: { currentToken: updatedTicket.ticketNumber },
    });

    // Update patient status to CALLED
    await this.prisma.patient.update({
      where: { id: nextTicket.patientId },
      data: { currentStatus: PatientStatus.CALLED },
    });

    // Record Event
    await this.prisma.hospitalEvent.create({
      data: {
        eventType: 'PATIENT_CALLED',
        entityType: 'QUEUE',
        entityId: queueId,
        payload: {
          ticketNumber: updatedTicket.ticketNumber,
          patientId: updatedTicket.patientId,
          patientName: `${updatedTicket.patient.firstName} ${updatedTicket.patient.lastName}`,
        },
      },
    });

    // Real-time broadcast
    this.eventsGateway.broadcastTicketCalled({
      queueId,
      ticket: updatedTicket,
      patientId: updatedTicket.patientId,
    });

    return updatedTicket;
  }

  async updateTicketStatus(ticketId: string, status: TicketStatus) {
    const ticket = await this.prisma.queueTicket.update({
      where: { id: ticketId },
      data: {
        status,
        ...(status === TicketStatus.COMPLETED ? { completedAt: new Date() } : {}),
        ...(status === TicketStatus.IN_SERVICE ? { inServiceAt: new Date() } : {}),
      },
      include: { patient: true, queue: true },
    });

    if (status === TicketStatus.COMPLETED) {
      await this.prisma.patient.update({
        where: { id: ticket.patientId },
        data: { currentStatus: PatientStatus.CONSULTATION },
      });
    }

    this.eventsGateway.broadcastQueueUpdate({
      queueId: ticket.queueId,
      action: 'TICKET_STATUS_CHANGED',
      ticket,
    });

    return ticket;
  }
}
