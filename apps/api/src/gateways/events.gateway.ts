import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(EventsGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join:room')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() room: string,
  ) {
    client.join(room);
    this.logger.log(`Client ${client.id} joined room: ${room}`);
    return { event: 'joined', room };
  }

  @SubscribeMessage('leave:room')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() room: string,
  ) {
    client.leave(room);
    this.logger.log(`Client ${client.id} left room: ${room}`);
    return { event: 'left', room };
  }

  // Broadcasters for Hospital Event Driven Architecture
  broadcastQueueUpdate(data: any) {
    this.server.emit('queue:update', data);
    this.server.to('room:queue').emit('queue:update', data);
  }

  broadcastTicketCalled(data: any) {
    this.server.emit('queue:ticket-called', data);
    this.server.to('room:queue').emit('queue:ticket-called', data);
    if (data.patientId) {
      this.server.to(`room:patient:${data.patientId}`).emit('queue:ticket-called', data);
    }
  }

  broadcastPatientJourney(patientId: string, data: any) {
    this.server.emit('patient:journey-update', { patientId, ...data });
    this.server.to(`room:patient:${patientId}`).emit('patient:journey-update', data);
    this.server.to('room:command-center').emit('patient:journey-update', { patientId, ...data });
  }

  broadcastBedStatus(data: any) {
    this.server.emit('bed:status-change', data);
    this.server.to('room:beds').emit('bed:status-change', data);
    this.server.to('room:command-center').emit('bed:status-change', data);
  }

  broadcastLabUpdate(data: any) {
    this.server.emit('lab:update', data);
    this.server.to('room:laboratory').emit('lab:update', data);
    this.server.to('room:command-center').emit('lab:update', data);
    if (data.patientId) {
      this.server.to(`room:patient:${data.patientId}`).emit('lab:update', data);
    }
  }

  broadcastPharmacyUpdate(data: any) {
    this.server.emit('pharmacy:update', data);
    this.server.to('room:pharmacy').emit('pharmacy:update', data);
    this.server.to('room:command-center').emit('pharmacy:update', data);
  }

  broadcastDigitalTwinState(state: any) {
    this.server.emit('digital-twin:state', state);
    this.server.to('room:command-center').emit('digital-twin:state', state);
  }

  broadcastNotification(userId: string | null, role: string | null, notification: any) {
    if (userId) {
      this.server.to(`room:user:${userId}`).emit('notification:new', notification);
    }
    if (role) {
      this.server.to(`room:role:${role}`).emit('notification:new', notification);
    }
    this.server.emit('notification:broadcast', notification);
  }
}
