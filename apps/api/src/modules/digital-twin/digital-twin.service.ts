import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { EventsGateway } from '../../gateways/events.gateway';
import { BedStatus, LabOrderStatus, InventoryStatus, TicketStatus, StaffStatus } from '../../generated/client/enums';

@Injectable()
export class DigitalTwinService {
  private readonly logger = new Logger(DigitalTwinService.name);

  constructor(
    private prisma: PrismaService,
    private eventsGateway: EventsGateway,
  ) {}

  /**
   * Captures the full real-time operational state of the entire hospital.
   * Completely backed by PostgreSQL with live metrics and rule-based bottleneck analysis.
   */
  async getHospitalState() {
    const [
      departments,
      totalPatients,
      activeEncounters,
      beds,
      queues,
      labOrders,
      pharmacyInventory,
      doctors,
      resources,
      recentEvents,
    ] = await Promise.all([
      // Departments with bed and doctor counts
      this.prisma.department.findMany({
        include: {
          _count: {
            select: {
              doctors: true,
              nurses: true,
              beds: true,
              appointments: true,
            },
          },
        },
      }),

      // Total patient count
      this.prisma.patient.count(),

      // Active consultations right now
      this.prisma.encounter.findMany({
        where: { status: 'IN_PROGRESS' },
        include: {
          patient: true,
          doctor: { include: { department: true } },
        },
      }),

      // Beds breakdown
      this.prisma.bed.findMany({
        include: {
          department: true,
          room: true,
        },
      }),

      // Active Queues with waiting tickets
      this.prisma.queue.findMany({
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
      }),

      // Laboratory orders active
      this.prisma.labOrder.findMany({
        where: {
          status: { in: [LabOrderStatus.ORDERED, LabOrderStatus.SAMPLE_COLLECTED, LabOrderStatus.PROCESSING] },
        },
        include: {
          patient: true,
          doctor: true,
          samples: true,
        },
        orderBy: { createdAt: 'desc' },
      }),

      // Pharmacy inventory low stock items
      this.prisma.inventory.findMany({
        include: { medicine: true },
      }),

      // Doctors on duty and their operational availability
      this.prisma.doctor.findMany({
        include: { department: true },
      }),

      // Hospital critical equipment & resources
      this.prisma.resource.findMany({
        include: { department: true },
      }),

      // Recent operational events for audit & stream
      this.prisma.hospitalEvent.findMany({
        take: 20,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    // Bed calculation
    const totalBeds = beds.length;
    const occupiedBeds = beds.filter((b) => b.status === BedStatus.OCCUPIED).length;
    const availableBeds = beds.filter((b) => b.status === BedStatus.AVAILABLE).length;
    const cleaningBeds = beds.filter((b) => b.status === BedStatus.CLEANING).length;
    const maintenanceBeds = beds.filter((b) => b.status === BedStatus.MAINTENANCE).length;
    const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

    // Queue statistics
    let totalWaitingPatients = 0;
    let totalInService = 0;
    const queueBottlenecks: any[] = [];

    queues.forEach((q) => {
      const waiting = q.tickets.filter((t) => t.status === TicketStatus.WAITING).length;
      const inService = q.tickets.filter((t) => t.status === TicketStatus.IN_SERVICE).length;
      totalWaitingPatients += waiting;
      totalInService += inService;

      // RULE-BASED BOTTLENECK 1: IF waitingPatients > 3 THEN queueStatus = BOTTLENECK
      if (waiting >= 3) {
        queueBottlenecks.push({
          type: 'QUEUE_CONGESTION',
          severity: 'HIGH',
          queueId: q.id,
          queueName: q.name,
          department: q.department.name,
          waitingCount: waiting,
          message: `Department queue ${q.name} has ${waiting} patients waiting (threshold: 3). Doctor assistance required.`,
        });
      }
    });

    // RULE-BASED BOTTLENECK 2: IF availableBeds <= 2 THEN bedStatus = LOW_AVAILABILITY
    const bedBottlenecks: any[] = [];
    if (availableBeds <= 2) {
      bedBottlenecks.push({
        type: 'BED_CAPACITY_CRITICAL',
        severity: availableBeds === 0 ? 'CRITICAL' : 'HIGH',
        availableBeds,
        totalBeds,
        occupancyRate,
        message: `Hospital bed capacity is near exhaustion. Only ${availableBeds} beds available (${occupancyRate}% occupied).`,
      });
    }

    // RULE-BASED BOTTLENECK 3: Low medicine inventory
    const pharmacyBottlenecks: any[] = [];
    pharmacyInventory.forEach((inv) => {
      if (inv.currentStock <= inv.minStockLevel) {
        pharmacyBottlenecks.push({
          type: 'LOW_MEDICINE_STOCK',
          severity: inv.currentStock === 0 ? 'CRITICAL' : 'MEDIUM',
          medicineCode: inv.medicine.code,
          medicineName: inv.medicine.name,
          currentStock: inv.currentStock,
          minStockLevel: inv.minStockLevel,
          message: `Critical low stock for ${inv.medicine.name}: ${inv.currentStock} units remaining (minimum: ${inv.minStockLevel}).`,
        });
      }
    });

    // RULE-BASED BOTTLENECK 4: Lab Processing Delays (> 60 minutes in processing)
    const labBottlenecks: any[] = [];
    const oneHourAgo = new Date(Date.now() - 3600000);
    labOrders.forEach((order) => {
      if (order.status === LabOrderStatus.PROCESSING && order.createdAt < oneHourAgo) {
        labBottlenecks.push({
          type: 'LAB_TURNAROUND_DELAYED',
          severity: 'MEDIUM',
          orderNumber: order.orderNumber,
          patientName: `${order.patient.firstName} ${order.patient.lastName}`,
          createdAt: order.createdAt,
          message: `Lab Order ${order.orderNumber} has exceeded normal 60min processing window.`,
        });
      }
    });

    const bottlenecks = [
      ...queueBottlenecks,
      ...bedBottlenecks,
      ...pharmacyBottlenecks,
      ...labBottlenecks,
    ];

    const state = {
      timestamp: new Date().toISOString(),
      summary: {
        totalPatients,
        activeConsultations: activeEncounters.length,
        totalWaitingPatients,
        totalInService,
        totalBeds,
        occupiedBeds,
        availableBeds,
        cleaningBeds,
        maintenanceBeds,
        occupancyRate,
        activeLabOrders: labOrders.length,
        doctorsOnDuty: doctors.filter((d) => d.status !== StaffStatus.OFF_DUTY).length,
        bottlenecksCount: bottlenecks.length,
      },
      bottlenecks,
      departments: departments.map((d) => ({
        id: d.id,
        name: d.name,
        code: d.code,
        floor: d.floor,
        building: d.building,
        staffCount: d._count.doctors + d._count.nurses,
        bedCount: d._count.beds,
        appointmentCount: d._count.appointments,
      })),
      queues: queues.map((q) => ({
        id: q.id,
        code: q.code,
        name: q.name,
        department: q.department.name,
        doctor: q.doctor ? `${q.doctor.firstName} ${q.doctor.lastName}` : null,
        currentToken: q.currentToken,
        waitingCount: q.tickets.filter((t) => t.status === TicketStatus.WAITING).length,
        tickets: q.tickets,
      })),
      beds: {
        total: totalBeds,
        occupied: occupiedBeds,
        available: availableBeds,
        cleaning: cleaningBeds,
        maintenance: maintenanceBeds,
        list: beds,
      },
      laboratory: {
        activeOrders: labOrders,
        pendingCount: labOrders.length,
      },
      pharmacy: {
        inventory: pharmacyInventory,
        lowStockItems: pharmacyBottlenecks,
      },
      resources: resources,
      recentEvents: recentEvents,
    };

    return state;
  }

  /**
   * Broadcasts the latest state via WebSockets to all connected clients
   */
  async syncAndBroadcast() {
    const state = await this.getHospitalState();
    this.eventsGateway.broadcastDigitalTwinState(state);
    return state;
  }

  /**
   * Fetches real-time timeline of a single patient's operational journey
   */
  async getPatientJourney(patientId: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        appointments: {
          include: { doctor: true, department: true },
          orderBy: { appointmentDate: 'desc' },
        },
        queueTickets: {
          include: { queue: { include: { department: true } } },
          orderBy: { issuedAt: 'desc' },
        },
        encounters: {
          include: { doctor: true },
          orderBy: { startTime: 'desc' },
        },
        labOrders: {
          include: { samples: true, reports: true },
          orderBy: { createdAt: 'desc' },
        },
        prescriptions: {
          include: { items: true },
          orderBy: { createdAt: 'desc' },
        },
        admissions: {
          include: { bed: { include: { room: true } }, department: true, discharge: true },
          orderBy: { admissionDate: 'desc' },
        },
        bills: {
          include: { items: true, payments: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return patient;
  }
}
