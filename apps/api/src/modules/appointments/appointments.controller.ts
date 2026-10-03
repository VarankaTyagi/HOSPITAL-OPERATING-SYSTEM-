import { Controller, Get, Post, Body, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AppointmentStatus, AppointmentType } from '../../generated/client/enums';

@ApiTags('appointments')
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get()
  @ApiOperation({ summary: 'List appointments with filter options' })
  async findAll(
    @Query('status') status?: AppointmentStatus,
    @Query('doctorId') doctorId?: string,
    @Query('patientId') patientId?: string,
    @Query('departmentId') departmentId?: string,
    @Query('date') date?: string,
  ) {
    return this.appointmentsService.findAll({ status, doctorId, patientId, departmentId, date });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get appointment details' })
  async findOne(@Param('id') id: string) {
    return this.appointmentsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Schedule a new appointment' })
  async create(
    @Body()
    body: {
      patientId: string;
      doctorId: string;
      departmentId: string;
      appointmentDate: string;
      timeSlot: string;
      type?: AppointmentType;
      reason?: string;
    },
  ) {
    return this.appointmentsService.create(body);
  }

  @Post(':id/check-in')
  @ApiOperation({ summary: 'Check in a patient upon arrival, generating queue token' })
  async checkIn(@Param('id') id: string) {
    return this.appointmentsService.checkIn(id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update appointment status' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: AppointmentStatus,
  ) {
    return this.appointmentsService.updateStatus(id, status);
  }
}
