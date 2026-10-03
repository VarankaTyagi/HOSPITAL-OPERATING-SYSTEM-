import { Module } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { PatientsController } from './patients.controller';
import { EventsGateway } from '../../gateways/events.gateway';

@Module({
  controllers: [PatientsController],
  providers: [PatientsService, EventsGateway],
  exports: [PatientsService],
})
export class PatientsModule {}
