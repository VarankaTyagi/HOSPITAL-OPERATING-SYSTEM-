import { Module } from '@nestjs/common';
import { AdmissionsService } from './admissions.service';
import { AdmissionsController } from './admissions.controller';
import { EventsGateway } from '../../gateways/events.gateway';

@Module({
  controllers: [AdmissionsController],
  providers: [AdmissionsService, EventsGateway],
  exports: [AdmissionsService],
})
export class AdmissionsModule {}
