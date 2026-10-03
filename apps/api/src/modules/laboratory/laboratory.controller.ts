import { Controller, Get, Post, Body, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LaboratoryService } from './laboratory.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { LabOrderStatus, PriorityLevel, LabTestCategory } from '../../generated/client/enums';

@ApiTags('laboratory')
@Controller('laboratory')
export class LaboratoryController {
  constructor(private readonly labService: LaboratoryService) {}

  @Get('orders')
  @ApiOperation({ summary: 'List laboratory orders' })
  async findAllOrders(
    @Query('status') status?: LabOrderStatus,
    @Query('patientId') patientId?: string,
  ) {
    return this.labService.findAllOrders({ status, patientId });
  }

  @Get('orders/:id')
  @ApiOperation({ summary: 'Get lab order details, samples, and reports' })
  async findOrder(@Param('id') id: string) {
    return this.labService.findOrder(id);
  }

  @Post('orders')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new laboratory investigation order' })
  async createOrder(
    @Body()
    body: {
      patientId: string;
      doctorId: string;
      encounterId?: string;
      priority?: PriorityLevel;
      notes?: string;
      tests: Array<{ name: string; code: string; category?: LabTestCategory; specimenType?: string }>;
    },
  ) {
    return this.labService.createOrder(body);
  }

  @Patch('samples/:id/collect')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Record specimen/sample collection with barcode' })
  async collectSample(
    @Param('id') sampleId: string,
    @Body('collectedBy') collectedBy: string,
  ) {
    return this.labService.collectSample(sampleId, collectedBy);
  }

  @Patch('samples/:id/process')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Record specimen processing in laboratory analyzer' })
  async processSample(
    @Param('id') sampleId: string,
    @Body('processedBy') processedBy: string,
  ) {
    return this.labService.processSample(sampleId, processedBy);
  }

  @Post('orders/:id/report')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Publish and verify official lab diagnostic report' })
  async publishReport(
    @Param('id') labOrderId: string,
    @Body()
    body: {
      labSampleId?: string;
      summary: string;
      results: any[];
      conclusion?: string;
      verifiedBy: string;
    },
  ) {
    return this.labService.publishReport(labOrderId, body);
  }
}
