import { Module } from '@nestjs/common';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';
import { EventsGateway } from '../../gateways/events.gateway';

@Module({
  controllers: [BillingController],
  providers: [BillingService, EventsGateway],
  exports: [BillingService],
})
export class BillingModule {}
