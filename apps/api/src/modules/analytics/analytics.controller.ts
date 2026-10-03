import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('operational')
  @ApiOperation({ summary: 'Get descriptive operational metrics, KPIs, and chart series' })
  async getOperationalMetrics() {
    return this.analyticsService.getOperationalMetrics();
  }
}
