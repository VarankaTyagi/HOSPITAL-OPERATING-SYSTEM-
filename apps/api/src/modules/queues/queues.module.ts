import { Module } from '@nestjs/common';
import { QueuesService } from './queues.service';
import { QueuesController } from './queues.controller';
import { EventsGateway } from '../../gateways/events.gateway';

@Module({
  controllers: [QueuesController],
  providers: [QueuesService, EventsGateway],
  exports: [QueuesService],
})
export class QueuesModule {}
