import { api } from './api';
import { Queue, QueueTicket, TicketStatus, PriorityLevel } from '../types';

export const queueService = {
  async getAll(): Promise<Queue[]> {
    const res = await api.get('/queues');
    return res.data;
  },

  async getById(id: string): Promise<Queue> {
    const res = await api.get(`/queues/${id}`);
    return res.data;
  },

  async generateToken(
    queueId: string,
    patientId: string,
    priority?: PriorityLevel,
    appointmentId?: string,
  ): Promise<QueueTicket> {
    const res = await api.post(`/queues/${queueId}/generate-token`, {
      patientId,
      priority,
      appointmentId,
    });
    return res.data;
  },

  async callNext(queueId: string, doctorId?: string): Promise<QueueTicket> {
    const res = await api.post(`/queues/${queueId}/call-next`, { doctorId });
    return res.data;
  },

  async updateTicketStatus(ticketId: string, status: TicketStatus): Promise<QueueTicket> {
    const res = await api.patch(`/queues/tickets/${ticketId}/status`, { status });
    return res.data;
  },
};
