import { Controller, Get, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BedsService } from './beds.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { BedStatus } from '../../generated/client/enums';

@ApiTags('beds')
@Controller('beds')
export class BedsController {
  constructor(private readonly bedsService: BedsService) {}

  @Get()
  @ApiOperation({ summary: 'List all hospital beds across wards and ICUs' })
  async findAll(
    @Query('departmentId') departmentId?: string,
    @Query('status') status?: BedStatus,
  ) {
    return this.bedsService.findAll({ departmentId, status });
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update bed operational status (e.g. AVAILABLE, OCCUPIED, CLEANING, MAINTENANCE)' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: BedStatus,
    @Body('notes') notes?: string,
  ) {
    return this.bedsService.updateStatus(id, status, notes);
  }
}
