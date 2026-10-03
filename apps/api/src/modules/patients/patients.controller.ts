import { Controller, Get, Post, Body, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PatientsService } from './patients.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PatientStatus, Gender, BloodGroup } from '../../generated/client/enums';

@ApiTags('patients')
@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get()
  @ApiOperation({ summary: 'List and search patients with pagination and status filters' })
  async findAll(
    @Query('search') search?: string,
    @Query('status') status?: PatientStatus,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.patientsService.findAll({ search, status, page, limit });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get full clinical details and journey of a patient' })
  async findOne(@Param('id') id: string) {
    return this.patientsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register a new patient and allocate MRN' })
  async create(
    @Body()
    body: {
      firstName: string;
      lastName: string;
      dateOfBirth: string;
      gender: Gender;
      bloodGroup?: BloodGroup;
      phone: string;
      email?: string;
      address?: string;
      emergencyContact?: string;
      allergies?: string;
    },
  ) {
    return this.patientsService.create(body);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update patient operational status along journey' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: PatientStatus,
  ) {
    return this.patientsService.updateStatus(id, status);
  }
}
