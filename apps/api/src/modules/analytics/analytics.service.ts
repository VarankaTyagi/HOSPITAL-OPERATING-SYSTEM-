import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getOperationalMetrics() {
    const [
      departments,
      totalPatients,
      totalAppointments,
      totalAdmissions,
      bills,
      encounters,
      beds,
      labOrders,
    ] = await Promise.all([
      this.prisma.department.findMany({
        include: {
          _count: {
            select: { appointments: true, admissions: true, doctors: true, beds: true },
          },
        },
      }),
      this.prisma.patient.count(),
      this.prisma.appointment.count(),
      this.prisma.admission.count(),
      this.prisma.bill.findMany({ select: { netAmount: true, paidAmount: true, status: true } }),
      this.prisma.encounter.findMany({ select: { type: true, status: true, startTime: true, endTime: true } }),
      this.prisma.bed.findMany({ select: { status: true, type: true } }),
      this.prisma.labOrder.findMany({ select: { status: true } }),
    ]);

    // Financial calculations
    const totalBilled = bills.reduce((sum, b) => sum + b.netAmount, 0);
    const totalCollected = bills.reduce((sum, b) => sum + b.paidAmount, 0);
    const pendingBalance = totalBilled - totalCollected;

    // Department Workload Chart Data
    const departmentWorkload = departments.map((d) => ({
      name: d.name.split(' ')[0], // short name
      fullName: d.name,
      appointments: d._count.appointments,
      admissions: d._count.admissions,
      staff: d._count.doctors,
      beds: d._count.beds,
    }));

    // Bed Status Distribution
    const bedDistribution = [
      { name: 'Available', value: beds.filter((b) => b.status === 'AVAILABLE').length, color: '#10b981' },
      { name: 'Occupied', value: beds.filter((b) => b.status === 'OCCUPIED').length, color: '#0284c7' },
      { name: 'Cleaning', value: beds.filter((b) => b.status === 'CLEANING').length, color: '#f59e0b' },
      { name: 'Maintenance', value: beds.filter((b) => b.status === 'MAINTENANCE').length, color: '#ef4444' },
    ];

    // Weekly trend synthetic / timeline
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weeklyPatientVolume = days.map((day, idx) => ({
      day,
      opd: 28 + (idx * 5) % 18,
      ipd: 8 + (idx * 3) % 7,
      emergency: 5 + (idx * 2) % 6,
    }));

    return {
      kpis: {
        totalPatients,
        totalAppointments,
        totalAdmissions,
        totalBilled,
        totalCollected,
        pendingBalance,
        activeEncounters: encounters.filter((e) => e.status === 'IN_PROGRESS').length,
        labCompleted: labOrders.filter((l) => l.status === 'COMPLETED').length,
      },
      departmentWorkload,
      bedDistribution,
      weeklyPatientVolume,
    };
  }
}
