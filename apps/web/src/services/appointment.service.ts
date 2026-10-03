import { api } from './api';
import { Appointment, AppointmentStatus } from '../types';

export const appointmentService = {
  async getAll(params?: {
    status?: AppointmentStatus;
    doctorId?: string;
    patientId?: string;
    departmentId?: string;
    date?: string;
  }): Promise<Appointment[]> {
    const res = await api.get('/appointments', { params });
    return res.data;
  },

  async getById(id: string): Promise<Appointment> {
    const res = await api.get(`/appointments/${id}`);
    return res.data;
  },

  async create(data: {
    patientId: string;
    doctorId: string;
    departmentId: string;
    appointmentDate: string;
    timeSlot: string;
    reason?: string;
  }): Promise<Appointment> {
    const res = await api.post('/appointments', data);
    return res.data;
  },

  async checkIn(id: string): Promise<{ appointment: Appointment; ticket: any }> {
    const res = await api.post(`/appointments/${id}/check-in`);
    return res.data;
  },

  async updateStatus(id: string, status: AppointmentStatus): Promise<Appointment> {
    const res = await api.patch(`/appointments/${id}/status`, { status });
    return res.data;
  },
};
