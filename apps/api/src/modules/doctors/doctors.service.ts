import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { StaffStatus } from '../../generated/client/enums';

@Injectable()
export class DoctorsService {
  constructor(private prisma: PrismaService) {}

  async findAll(departmentId?: string) {
    const where: any = {};
    if (departmentId) where.departmentId = departmentId;

    return this.prisma.doctor.findMany({
      where,
      include: {
        department: true,
        user: { select: { email: true, phone: true } },
      },
      orderBy: { lastName: 'asc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.doctor.findUnique({
      where: { id },
      include: {
        department: true,
        appointments: { take: 10, orderBy: { appointmentDate: 'desc' }, include: { patient: true } },
      },
    });
  }

  async updateAvailability(id: string, isAvailable: boolean, status: StaffStatus) {
    return this.prisma.doctor.update({
      where: { id },
      data: { isAvailable, status },
    });
  }
}
