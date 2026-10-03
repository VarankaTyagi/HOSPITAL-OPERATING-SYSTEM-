import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { UserRole } from '../../generated/client/enums';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async findAll(query?: { limit?: number; offset?: number; entity?: string; action?: string }) {
    const limit = Number(query?.limit) || 50;
    const skip = Number(query?.offset) || 0;
    const where: any = {};
    if (query?.entity) where.entity = query.entity;
    if (query?.action) where.action = query.action;

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        include: { user: { select: { email: true, firstName: true, lastName: true, role: true } } },
        orderBy: { timestamp: 'desc' },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { logs, total };
  }

  async logAction(data: {
    userId?: string;
    userRole?: UserRole;
    action: string;
    entity: string;
    entityId: string;
    ipAddress?: string;
    userAgent?: string;
    beforeState?: any;
    afterState?: any;
  }) {
    return this.prisma.auditLog.create({
      data: {
        userId: data.userId,
        userRole: data.userRole,
        action: data.action,
        entity: data.entity,
        entityId: data.entityId,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        beforeState: data.beforeState || null,
        afterState: data.afterState || null,
      },
    });
  }
}
