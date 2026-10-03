import { Module } from '@nestjs/common';
import { DigitalTwinService } from './digital-twin.service';
import { DigitalTwinController } from './digital-twin.controller';
import { EventsGateway } from '../../gateways/events.gateway';

@Module({
  controllers: [DigitalTwinController],
  providers: [DigitalTwinService, EventsGateway],
  exports: [DigitalTwinService],
})
export class DigitalTwinModule {}
