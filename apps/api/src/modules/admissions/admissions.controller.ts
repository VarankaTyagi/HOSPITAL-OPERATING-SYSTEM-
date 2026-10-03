import { Controller, Get, Post, Body, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdmissionsService } from './admissions.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdmissionStatus, AdmissionType, DischargeType } from '../../generated/client/enums';

@ApiTags('admissions')
@Controller('admissions')
export class AdmissionsController {
  constructor(private readonly admissionsService: AdmissionsService) {}

  @Get()
  @ApiOperation({ summary: 'List inpatient admissions' })
  async findAll(
    @Query('status') status?: AdmissionStatus,
    @Query('departmentId') departmentId?: string,
    @Query('patientId') patientId?: string,
  ) {
    return this.admissionsService.findAll({ status, departmentId, patientId });
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admit a patient to a ward or ICU bed' })
  async admitPatient(
    @Body()
    body: {
      patientId: string;
      bedId: string;
      departmentId: string;
      doctorId: string;
      initialDiagnosis: string;
      type?: AdmissionType;
    },
  ) {
    return this.admissionsService.admitPatient(body);
  }

  @Patch(':id/discharge')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Discharge patient, release bed for cleaning, and finalize journey' })
  async dischargePatient(
    @Param('id') admissionId: string,
    @Body()
    body: {
      dischargeSummary: string;
      followUpInstructions?: string;
      conditionAtDischarge?: string;
      approvedBy: string;
      type?: DischargeType;
    },
  ) {
    return this.admissionsService.dischargePatient(admissionId, body);
  }
}
