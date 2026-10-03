import { Module } from '@nestjs/common';
import { BedsService } from './beds.service';
import { BedsController } from './beds.controller';
import { EventsGateway } from '../../gateways/events.gateway';

@Module({
  controllers: [BedsController],
  providers: [BedsService, EventsGateway],
  exports: [BedsService],
})
export class BedsModule {}
