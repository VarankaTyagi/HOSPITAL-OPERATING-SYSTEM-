import { Controller, Get, Post, Body, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { QueuesService } from './queues.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TicketStatus, PriorityLevel } from '../../generated/client/enums';

@ApiTags('queues')
@Controller('queues')
export class QueuesController {
  constructor(private readonly queuesService: QueuesService) {}

  @Get()
  @ApiOperation({ summary: 'List all operational department queues' })
  async findAll() {
    return this.queuesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get queue details and active tickets' })
  async findOne(@Param('id') id: string) {
    return this.queuesService.findOne(id);
  }

  @Post(':id/generate-token')
  @ApiOperation({ summary: 'Generate a new queue token for a patient' })
  async generateToken(
    @Param('id') queueId: string,
    @Body('patientId') patientId: string,
    @Body('priority') priority?: PriorityLevel,
    @Body('appointmentId') appointmentId?: string,
  ) {
    return this.queuesService.generateToken(queueId, patientId, priority, appointmentId);
  }

  @Post(':id/call-next')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Call next waiting patient in the queue' })
  async callNextTicket(
    @Param('id') queueId: string,
    @Body('doctorId') doctorId?: string,
  ) {
    return this.queuesService.callNextTicket(queueId, doctorId);
  }

  @Patch('tickets/:ticketId/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update ticket status (e.g. IN_SERVICE, COMPLETED, SKIPPED)' })
  async updateTicketStatus(
    @Param('ticketId') ticketId: string,
    @Body('status') status: TicketStatus,
  ) {
    return this.queuesService.updateTicketStatus(ticketId, status);
  }
}
