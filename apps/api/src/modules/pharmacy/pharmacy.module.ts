import { Module } from '@nestjs/common';
import { PharmacyService } from './pharmacy.service';
import { PharmacyController } from './pharmacy.controller';
import { EventsGateway } from '../../gateways/events.gateway';

@Module({
  controllers: [PharmacyController],
  providers: [PharmacyService, EventsGateway],
  exports: [PharmacyService],
})
export class PharmacyModule {}
