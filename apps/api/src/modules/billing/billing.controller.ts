import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BillingService } from './billing.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { BillStatus, BillCategory, PaymentMethod } from '../../generated/client/enums';

@ApiTags('billing')
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('bills')
  @ApiOperation({ summary: 'List patient invoices and billing statements' })
  async findAllBills(
    @Query('patientId') patientId?: string,
    @Query('status') status?: BillStatus,
  ) {
    return this.billingService.findAllBills({ patientId, status });
  }

  @Get('bills/:id')
  @ApiOperation({ summary: 'Get invoice details, breakdown items, and payment receipts' })
  async findBill(@Param('id') id: string) {
    return this.billingService.findBill(id);
  }

  @Post('bills')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate a new invoice with itemized clinical services' })
  async createBill(
    @Body()
    body: {
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
    },
  ) {
    return this.billingService.createBill(body);
  }

  @Post('payments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Record payment against an invoice and generate receipt' })
  async recordPayment(
    @Body()
    body: {
      billId: string;
      amount: number;
      method?: PaymentMethod;
      transactionRef?: string;
      receivedBy?: string;
    },
  ) {
    return this.billingService.recordPayment(body);
  }
}
