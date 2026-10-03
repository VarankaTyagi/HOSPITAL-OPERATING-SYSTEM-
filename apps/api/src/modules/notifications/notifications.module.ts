import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { EventsGateway } from '../../gateways/events.gateway';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService, EventsGateway],
  exports: [NotificationsService],
})
export class NotificationsModule {}
