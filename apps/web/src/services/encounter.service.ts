import { api } from './api';
import { Encounter } from '../types';

export const encounterService = {
  async getAll(params?: { doctorId?: string; patientId?: string; status?: string }): Promise<Encounter[]> {
    const res = await api.get('/encounters', { params });
    return res.data;
  },

  async getById(id: string): Promise<Encounter> {
    const res = await api.get(`/encounters/${id}`);
    return res.data;
  },

  async start(data: {
    patientId: string;
    doctorId: string;
    appointmentId?: string;
    chiefComplaint: string;
    vitals?: any;
  }): Promise<Encounter> {
    const res = await api.post('/encounters/start', data);
    return res.data;
  },

  async complete(
    id: string,
    data: {
      diagnosis?: string;
      icdCode?: string;
      examinationNotes?: string;
      followUpDate?: string;
    },
  ): Promise<Encounter> {
    const res = await api.patch(`/encounters/${id}/complete`, data);
    return res.data;
  },
};
