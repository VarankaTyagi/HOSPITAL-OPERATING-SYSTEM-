import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { EventsGateway } from '../../gateways/events.gateway';
import { LabOrderStatus, LabReportStatus, PriorityLevel, LabTestCategory, PatientStatus } from '../../generated/client/enums';

@Injectable()
export class LaboratoryService {
  constructor(
    private prisma: PrismaService,
    private eventsGateway: EventsGateway,
  ) {}

  async findAllOrders(query?: { status?: LabOrderStatus; patientId?: string }) {
    const where: any = {};
    if (query?.status) where.status = query.status;
    if (query?.patientId) where.patientId = query.patientId;

    return this.prisma.labOrder.findMany({
      where,
      include: {
        patient: true,
        doctor: true,
        samples: { include: { report: true } },
        reports: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOrder(id: string) {
    const order = await this.prisma.labOrder.findUnique({
      where: { id },
      include: {
        patient: true,
        doctor: true,
        samples: { include: { report: true } },
        reports: true,
      },
    });
    if (!order) throw new NotFoundException(`Lab Order ${id} not found`);
    return order;
  }

  async createOrder(data: {
    patientId: string;
    doctorId: string;
    encounterId?: string;
    priority?: PriorityLevel;
    notes?: string;
    tests: Array<{ name: string; code: string; category?: LabTestCategory; specimenType?: string }>;
  }) {
    const count = await this.prisma.labOrder.count();
    const orderNumber = `LAB-2026-${String(count + 101).padStart(5, '0')}`;

    const order = await this.prisma.labOrder.create({
      data: {
        orderNumber,
        patientId: data.patientId,
        doctorId: data.doctorId,
        encounterId: data.encounterId,
        priority: data.priority || PriorityLevel.NORMAL,
        notes: data.notes,
        status: LabOrderStatus.ORDERED,
        samples: {
          create: data.tests.map((t, idx) => ({
            testName: t.name,
            testCode: t.code,
            category: t.category || LabTestCategory.BIOCHEMISTRY,
            specimenType: t.specimenType || 'Blood',
            barcode: `SMP-2026-${Math.floor(10000 + Math.random() * 90000)}-${idx + 1}`,
            status: LabOrderStatus.ORDERED,
          })),
        },
      },
      include: { patient: true, doctor: true, samples: true },
    });

    await this.prisma.patient.update({
      where: { id: data.patientId },
      data: { currentStatus: PatientStatus.LABORATORY },
    });

    this.eventsGateway.broadcastLabUpdate({
      action: 'ORDER_CREATED',
      order,
      patientId: data.patientId,
    });

    await this.prisma.hospitalEvent.create({
      data: {
        eventType: 'LAB_ORDER_PLACED',
        entityType: 'LAB',
        entityId: order.id,
        payload: {
          orderNumber,
          patientName: `${order.patient.firstName} ${order.patient.lastName}`,
          testsCount: data.tests.length,
        },
      },
    });

    return order;
  }

  async collectSample(sampleId: string, collectedBy: string) {
    const sample = await this.prisma.labSample.update({
      where: { id: sampleId },
      data: {
        status: LabOrderStatus.SAMPLE_COLLECTED,
        collectedAt: new Date(),
        collectedBy,
      },
      include: { labOrder: { include: { patient: true } } },
    });

    // Update parent order status
    await this.prisma.labOrder.update({
      where: { id: sample.labOrderId },
      data: { status: LabOrderStatus.SAMPLE_COLLECTED },
    });

    this.eventsGateway.broadcastLabUpdate({
      action: 'SAMPLE_COLLECTED',
      sample,
      patientId: sample.labOrder.patientId,
    });

    return sample;
  }

  async processSample(sampleId: string, processedBy: string) {
    const sample = await this.prisma.labSample.update({
      where: { id: sampleId },
      data: {
        status: LabOrderStatus.PROCESSING,
        processedAt: new Date(),
        processedBy,
      },
      include: { labOrder: { include: { patient: true } } },
    });

    await this.prisma.labOrder.update({
      where: { id: sample.labOrderId },
      data: { status: LabOrderStatus.PROCESSING },
    });

    this.eventsGateway.broadcastLabUpdate({
      action: 'SAMPLE_PROCESSING',
      sample,
      patientId: sample.labOrder.patientId,
    });

    return sample;
  }

  async publishReport(
    labOrderId: string,
    data: {
      labSampleId?: string;
      summary: string;
      results: any[];
      conclusion?: string;
      verifiedBy: string;
    },
  ) {
    const count = await this.prisma.labReport.count();
    const reportNumber = `REP-2026-${String(count + 101).padStart(5, '0')}`;

    const report = await this.prisma.labReport.create({
      data: {
        labOrderId,
        labSampleId: data.labSampleId,
        reportNumber,
        summary: data.summary,
        results: data.results,
        conclusion: data.conclusion,
        verifiedBy: data.verifiedBy,
        status: LabReportStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    });

    // Update order status to COMPLETED
    const order = await this.prisma.labOrder.update({
      where: { id: labOrderId },
      data: { status: LabOrderStatus.COMPLETED },
      include: { patient: true },
    });

    // Create Notification for Patient and Doctor
    await this.prisma.notification.create({
      data: {
        recipientRole: 'PATIENT',
        title: 'Diagnostic Lab Report Published',
        message: `Your test report (${report.reportNumber}) has been verified and is available to view.`,
        type: 'LAB',
      },
    });

    this.eventsGateway.broadcastLabUpdate({
      action: 'REPORT_PUBLISHED',
      report,
      order,
      patientId: order.patientId,
    });

    await this.prisma.hospitalEvent.create({
      data: {
        eventType: 'LAB_REPORT_PUBLISHED',
        entityType: 'LAB',
        entityId: report.id,
        payload: {
          reportNumber: report.reportNumber,
          orderNumber: order.orderNumber,
          patientName: `${order.patient.firstName} ${order.patient.lastName}`,
        },
      },
    });

    return report;
  }
}
