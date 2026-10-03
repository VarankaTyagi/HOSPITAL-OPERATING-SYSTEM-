import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { EventsGateway } from '../../gateways/events.gateway';
import { PrescriptionStatus, InventoryStatus, PatientStatus } from '../../generated/client/enums';

@Injectable()
export class PharmacyService {
  constructor(
    private prisma: PrismaService,
    private eventsGateway: EventsGateway,
  ) {}

  async findAllMedicines(query?: { search?: string; category?: string }) {
    const where: any = {};
    if (query?.category) where.category = query.category;
    if (query?.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { genericName: { contains: query.search, mode: 'insensitive' } },
        { code: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.medicine.findMany({
      where,
      include: { inventory: true },
      orderBy: { name: 'asc' },
    });
  }

  async getInventory(status?: InventoryStatus) {
    const where: any = status ? { status } : {};
    return this.prisma.inventory.findMany({
      where,
      include: { medicine: true },
      orderBy: { currentStock: 'asc' },
    });
  }

  async getPrescriptions(query?: { status?: PrescriptionStatus; patientId?: string }) {
    const where: any = {};
    if (query?.status) where.status = query.status;
    if (query?.patientId) where.patientId = query.patientId;

    return this.prisma.prescription.findMany({
      where,
      include: {
        patient: true,
        doctor: true,
        items: { include: { medicine: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createPrescription(data: {
    patientId: string;
    doctorId: string;
    encounterId?: string;
    notes?: string;
    items: Array<{
      medicineId: string;
      medicineName: string;
      dosage: string;
      frequency: string;
      durationDays: number;
      quantity: number;
      instructions?: string;
    }>;
  }) {
    const count = await this.prisma.prescription.count();
    const prescriptionNumber = `RX-2026-${String(count + 101).padStart(5, '0')}`;

    const prescription = await this.prisma.prescription.create({
      data: {
        prescriptionNumber,
        patientId: data.patientId,
        doctorId: data.doctorId,
        encounterId: data.encounterId,
        notes: data.notes,
        status: PrescriptionStatus.ISSUED,
        items: {
          create: data.items.map((item) => ({
            medicineId: item.medicineId,
            medicineName: item.medicineName,
            dosage: item.dosage,
            frequency: item.frequency,
            durationDays: item.durationDays,
            quantity: item.quantity,
            instructions: item.instructions,
          })),
        },
      },
      include: { patient: true, doctor: true, items: true },
    });

    await this.prisma.patient.update({
      where: { id: data.patientId },
      data: { currentStatus: PatientStatus.PHARMACY },
    });

    this.eventsGateway.broadcastPharmacyUpdate({
      action: 'PRESCRIPTION_CREATED',
      prescription,
      patientId: data.patientId,
    });

    await this.prisma.hospitalEvent.create({
      data: {
        eventType: 'PRESCRIPTION_CREATED',
        entityType: 'PHARMACY',
        entityId: prescription.id,
        payload: {
          prescriptionNumber,
          patientName: `${prescription.patient.firstName} ${prescription.patient.lastName}`,
          itemsCount: data.items.length,
        },
      },
    });

    return prescription;
  }

  async dispensePrescription(prescriptionId: string, dispensedBy: string) {
    const rx = await this.prisma.prescription.findUnique({
      where: { id: prescriptionId },
      include: { items: true, patient: true },
    });
    if (!rx) throw new NotFoundException(`Prescription ${prescriptionId} not found`);

    if (rx.status === PrescriptionStatus.DISPENSED) {
      throw new BadRequestException('Prescription has already been dispensed');
    }

    // Process stock deduction for each item
    for (const item of rx.items) {
      const inventory = await this.prisma.inventory.findFirst({
        where: {
          medicineId: item.medicineId,
          currentStock: { gte: item.quantity },
        },
        orderBy: { expiryDate: 'asc' }, // FIFO
      });

      if (!inventory) {
        throw new BadRequestException(
          `Insufficient stock available to dispense ${item.medicineName}`,
        );
      }

      const newStock = inventory.currentStock - item.quantity;
      const newStatus =
        newStock <= 0
          ? InventoryStatus.OUT_OF_STOCK
          : newStock <= inventory.minStockLevel
            ? InventoryStatus.LOW_STOCK
            : InventoryStatus.IN_STOCK;

      await this.prisma.inventory.update({
        where: { id: inventory.id },
        data: {
          currentStock: newStock,
          status: newStatus,
        },
      });

      await this.prisma.prescriptionItem.update({
        where: { id: item.id },
        data: { dispensedQty: item.quantity },
      });
    }

    const updatedRx = await this.prisma.prescription.update({
      where: { id: prescriptionId },
      data: {
        status: PrescriptionStatus.DISPENSED,
        dispensedAt: new Date(),
        dispensedBy,
      },
      include: { items: true, patient: true },
    });

    // Progress patient to BILLING
    await this.prisma.patient.update({
      where: { id: rx.patientId },
      data: { currentStatus: PatientStatus.BILLING },
    });

    this.eventsGateway.broadcastPharmacyUpdate({
      action: 'PRESCRIPTION_DISPENSED',
      prescription: updatedRx,
      patientId: rx.patientId,
    });

    await this.prisma.hospitalEvent.create({
      data: {
        eventType: 'MEDICINE_DISPENSED',
        entityType: 'PHARMACY',
        entityId: updatedRx.id,
        payload: {
          prescriptionNumber: updatedRx.prescriptionNumber,
          patientName: `${updatedRx.patient.firstName} ${updatedRx.patient.lastName}`,
          dispensedBy,
        },
      },
    });

    return updatedRx;
  }
}
