import { Module } from '@nestjs/common';
import { LaboratoryService } from './laboratory.service';
import { LaboratoryController } from './laboratory.controller';
import { EventsGateway } from '../../gateways/events.gateway';

@Module({
  controllers: [LaboratoryController],
  providers: [LaboratoryService, EventsGateway],
  exports: [LaboratoryService],
})
export class LaboratoryModule {}
