import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { EventsGateway } from '../../gateways/events.gateway';
import { NotificationType, UserRole } from '../../generated/client/enums';

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private eventsGateway: EventsGateway,
  ) {}

  async findForUser(userId?: string, role?: UserRole) {
    const where: any = {};
    if (userId && role) {
      where.OR = [
        { recipientUserId: userId },
        { recipientRole: role },
        { recipientRole: null, recipientUserId: null },
      ];
    } else if (userId) {
      where.recipientUserId = userId;
    } else if (role) {
      where.recipientRole = role;
    }

    return this.prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markAsRead(id: string) {
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async create(data: {
    recipientUserId?: string;
    recipientRole?: UserRole;
    title: string;
    message: string;
    type?: NotificationType;
    metadata?: any;
  }) {
    const notif = await this.prisma.notification.create({
      data: {
        recipientUserId: data.recipientUserId,
        recipientRole: data.recipientRole,
        title: data.title,
        message: data.message,
        type: data.type || NotificationType.GENERAL,
        metadata: data.metadata || null,
      },
    });

    this.eventsGateway.broadcastNotification(
      data.recipientUserId || null,
      data.recipientRole || null,
      notif,
    );

    return notif;
  }
}
