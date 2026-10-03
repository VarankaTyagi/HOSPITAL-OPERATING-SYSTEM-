import { Controller, Get, Post, Body, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EncountersService } from './encounters.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { EncounterStatus, AppointmentType } from '../../generated/client/enums';

@ApiTags('encounters')
@Controller('encounters')
export class EncountersController {
  constructor(private readonly encountersService: EncountersService) {}

  @Get()
  @ApiOperation({ summary: 'List consultations/encounters' })
  async findAll(
    @Query('doctorId') doctorId?: string,
    @Query('patientId') patientId?: string,
    @Query('status') status?: EncounterStatus,
  ) {
    return this.encountersService.findAll({ doctorId, patientId, status });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get encounter details' })
  async findOne(@Param('id') id: string) {
    return this.encountersService.findOne(id);
  }

  @Post('start')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Initiate a patient consultation' })
  async startEncounter(
    @Body()
    body: {
      patientId: string;
      doctorId: string;
      appointmentId?: string;
      chiefComplaint: string;
      vitals?: any;
      type?: AppointmentType;
    },
  ) {
    return this.encountersService.startEncounter(body);
  }

  @Patch(':id/complete')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Complete consultation with diagnosis and notes' })
  async completeEncounter(
    @Param('id') id: string,
    @Body()
    body: {
      diagnosis?: string;
      icdCode?: string;
      examinationNotes?: string;
      followUpDate?: string;
    },
  ) {
    return this.encountersService.completeEncounter(id, body);
  }
}
