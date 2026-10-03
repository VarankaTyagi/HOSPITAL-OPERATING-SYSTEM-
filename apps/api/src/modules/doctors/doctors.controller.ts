import { Controller, Get, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DoctorsService } from './doctors.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { StaffStatus } from '../../generated/client/enums';

@ApiTags('doctors')
@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Get()
  @ApiOperation({ summary: 'List doctors and availability status' })
  async findAll(@Query('departmentId') departmentId?: string) {
    return this.doctorsService.findAll(departmentId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get doctor clinical profile' })
  async findOne(@Param('id') id: string) {
    return this.doctorsService.findOne(id);
  }

  @Patch(':id/availability')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update doctor availability and on-duty status' })
  async updateAvailability(
    @Param('id') id: string,
    @Body('isAvailable') isAvailable: boolean,
    @Body('status') status: StaffStatus,
  ) {
    return this.doctorsService.updateAvailability(id, isAvailable, status);
  }
}
