import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DigitalTwinService } from './digital-twin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('digital-twin')
@Controller('digital-twin')
export class DigitalTwinController {
  constructor(private readonly digitalTwinService: DigitalTwinService) {}

  @Get('state')
  @ApiOperation({ summary: 'Get current real-time operational state of the hospital' })
  @ApiResponse({ status: 200, description: 'Live Digital Twin state returned' })
  async getHospitalState() {
    return this.digitalTwinService.getHospitalState();
  }

  @Post('sync')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Trigger operational state recalculation and WebSocket broadcast' })
  async syncAndBroadcast() {
    return this.digitalTwinService.syncAndBroadcast();
  }

  @Get('patient/:id/journey')
  @ApiOperation({ summary: 'Get full operational journey and timeline for a patient' })
  async getPatientJourney(@Param('id') patientId: string) {
    return this.digitalTwinService.getPatientJourney(patientId);
  }
}
