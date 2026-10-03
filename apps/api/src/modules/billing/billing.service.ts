import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { EventsGateway } from '../../gateways/events.gateway';
import { BillStatus, BillCategory, PaymentMethod, PaymentStatus } from '../../generated/client/enums';

@Injectable()
export class BillingService {
  constructor(
    private prisma: PrismaService,
    private eventsGateway: EventsGateway,
  ) {}

  async findAllBills(query?: { patientId?: string; status?: BillStatus }) {
    const where: any = {};
    if (query?.patientId) where.patientId = query.patientId;
    if (query?.status) where.status = query.status;

    return this.prisma.bill.findMany({
      where,
      include: {
        patient: true,
        items: true,
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findBill(id: string) {
    const bill = await this.prisma.bill.findUnique({
      where: { id },
      include: {
        patient: true,
        items: true,
        payments: true,
        encounter: { include: { doctor: true } },
        admission: { include: { bed: true } },
      },
    });
    if (!bill) throw new NotFoundException(`Invoice ${id} not found`);
    return bill;
  }

  async createBill(data: {
    patientId: string;
    admissionId?: string;
    encounterId?: string;
    dueDate?: string;
    items: Array<{
      description: string;
      category?: BillCategory;
      quantity: number;
      unitPrice: number;
    }>;
  }) {
    const count = await this.prisma.bill.count();
    const invoiceNumber = `INV-2026-${String(count + 101).padStart(5, '0')}`;

    const totalAmount = data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const taxAmount = Math.round(totalAmount * 0.05 * 100) / 100; // 5% tax
    const netAmount = totalAmount + taxAmount;

    const bill = await this.prisma.bill.create({
      data: {
        invoiceNumber,
        patientId: data.patientId,
        admissionId: data.admissionId,
        encounterId: data.encounterId,
        totalAmount,
        taxAmount,
        netAmount,
        paidAmount: 0.0,
        balanceAmount: netAmount,
        status: BillStatus.PENDING,
        dueDate: data.dueDate ? new Date(data.dueDate) : new Date(Date.now() + 86400000 * 3),
        items: {
          create: data.items.map((it) => ({
            description: it.description,
            category: it.category || BillCategory.MISCELLANEOUS,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
            amount: it.quantity * it.unitPrice,
          })),
        },
      },
      include: { patient: true, items: true },
    });

    await this.prisma.hospitalEvent.create({
      data: {
        eventType: 'BILL_GENERATED',
        entityType: 'BILLING',
        entityId: bill.id,
        payload: {
          invoiceNumber,
          patientName: `${bill.patient.firstName} ${bill.patient.lastName}`,
          netAmount,
        },
      },
    });

    return bill;
  }

  async recordPayment(data: {
    billId: string;
    amount: number;
    method?: PaymentMethod;
    transactionRef?: string;
    receivedBy?: string;
  }) {
    const bill = await this.prisma.bill.findUnique({
      where: { id: data.billId },
      include: { patient: true },
    });
    if (!bill) throw new NotFoundException('Bill not found');

    if (data.amount <= 0) {
      throw new BadRequestException('Payment amount must be greater than zero');
    }

    const count = await this.prisma.payment.count();
    const receiptNumber = `REC-2026-${String(count + 101).padStart(5, '0')}`;

    const payment = await this.prisma.payment.create({
      data: {
        receiptNumber,
        billId: data.billId,
        amount: data.amount,
        method: data.method || PaymentMethod.CASH,
        transactionRef: data.transactionRef,
        receivedBy: data.receivedBy || 'Hospital Cashier',
        status: PaymentStatus.SUCCESS,
        paidAt: new Date(),
      },
    });

    const newPaidAmount = bill.paidAmount + data.amount;
    const newBalance = Math.max(0, bill.netAmount - newPaidAmount);
    const newStatus = newBalance === 0 ? BillStatus.PAID : BillStatus.PARTIALLY_PAID;

    const updatedBill = await this.prisma.bill.update({
      where: { id: data.billId },
      data: {
        paidAmount: newPaidAmount,
        balanceAmount: newBalance,
        status: newStatus,
      },
      include: { items: true, payments: true, patient: true },
    });

    await this.prisma.hospitalEvent.create({
      data: {
        eventType: 'PAYMENT_COMPLETED',
        entityType: 'BILLING',
        entityId: payment.id,
        payload: {
          receiptNumber,
          invoiceNumber: bill.invoiceNumber,
          amount: data.amount,
          balance: newBalance,
          patientName: `${bill.patient.firstName} ${bill.patient.lastName}`,
        },
      },
    });

    return { bill: updatedBill, payment };
  }
}
