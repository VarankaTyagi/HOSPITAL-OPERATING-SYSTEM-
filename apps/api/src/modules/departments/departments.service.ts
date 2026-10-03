import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class DepartmentsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.department.findMany({
      include: {
        doctors: true,
        nurses: true,
        rooms: { include: { beds: true } },
        queues: true,
      },
      orderBy: { floor: 'asc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.department.findUnique({
      where: { id },
      include: {
        doctors: true,
        nurses: true,
        rooms: { include: { beds: true } },
        queues: true,
        resources: true,
      },
    });
  }
}
