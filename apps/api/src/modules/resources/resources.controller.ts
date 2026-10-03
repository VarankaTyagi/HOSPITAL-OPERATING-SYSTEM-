import { Controller, Get, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ResourcesService } from './resources.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ResourceStatus, ResourceType } from '../../generated/client/enums';

@ApiTags('resources')
@Controller('resources')
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @Get()
  @ApiOperation({ summary: 'List medical equipment and devices' })
  async findAll(
    @Query('departmentId') departmentId?: string,
    @Query('type') type?: ResourceType,
    @Query('status') status?: ResourceStatus,
  ) {
    return this.resourcesService.findAll({ departmentId, type, status });
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update resource operational status (e.g. AVAILABLE, IN_USE, MAINTENANCE)' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: ResourceStatus,
    @Body('notes') notes?: string,
  ) {
    return this.resourcesService.updateStatus(id, status, notes);
  }
}
