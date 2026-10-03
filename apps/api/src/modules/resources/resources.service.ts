import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { ResourceStatus, ResourceType } from '../../generated/client/enums';

@Injectable()
export class ResourcesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query?: { departmentId?: string; type?: ResourceType; status?: ResourceStatus }) {
    const where: any = {};
    if (query?.departmentId) where.departmentId = query.departmentId;
    if (query?.type) where.type = query.type;
    if (query?.status) where.status = query.status;

    return this.prisma.resource.findMany({
      where,
      include: { department: true },
      orderBy: { name: 'asc' },
    });
  }

  async updateStatus(id: string, status: ResourceStatus, notes?: string) {
    return this.prisma.resource.update({
      where: { id },
      data: {
        status,
        ...(notes !== undefined ? { notes } : {}),
        lastInspection: new Date(),
      },
      include: { department: true },
    });
  }
}
