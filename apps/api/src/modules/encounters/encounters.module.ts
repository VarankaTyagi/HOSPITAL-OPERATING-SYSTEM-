import { Module } from '@nestjs/common';
import { EncountersService } from './encounters.service';
import { EncountersController } from './encounters.controller';
import { EventsGateway } from '../../gateways/events.gateway';

@Module({
  controllers: [EncountersController],
  providers: [EncountersService, EventsGateway],
  exports: [EncountersService],
})
export class EncountersModule {}
