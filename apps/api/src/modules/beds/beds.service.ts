import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { EventsGateway } from '../../gateways/events.gateway';
import { BedStatus } from '../../generated/client/enums';

@Injectable()
export class BedsService {
  constructor(
    private prisma: PrismaService,
    private eventsGateway: EventsGateway,
  ) {}

  async findAll(query?: { departmentId?: string; status?: BedStatus }) {
    const where: any = {};
    if (query?.departmentId) where.departmentId = query.departmentId;
    if (query?.status) where.status = query.status;

    return this.prisma.bed.findMany({
      where,
      include: {
        department: true,
        room: true,
        admissions: {
          where: { status: 'ADMITTED' },
          include: { patient: true, doctor: true },
        },
      },
      orderBy: { bedNumber: 'asc' },
    });
  }

  async updateStatus(id: string, status: BedStatus, notes?: string) {
    const bed = await this.prisma.bed.update({
      where: { id },
      data: {
        status,
        ...(notes !== undefined ? { notes } : {}),
      },
      include: { department: true, room: true },
    });

    this.eventsGateway.broadcastBedStatus({
      bedId: bed.id,
      bedNumber: bed.bedNumber,
      status: bed.status,
      department: bed.department.name,
      room: bed.room.roomNumber,
    });

    await this.prisma.hospitalEvent.create({
      data: {
        eventType: 'BED_STATUS_CHANGED',
        entityType: 'BED',
        entityId: bed.id,
        payload: {
          bedNumber: bed.bedNumber,
          status: bed.status,
          department: bed.department.name,
        },
      },
    });

    return bed;
  }
}
