import { Module } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { EventsGateway } from '../../gateways/events.gateway';

@Module({
  controllers: [AppointmentsController],
  providers: [AppointmentsService, EventsGateway],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}
