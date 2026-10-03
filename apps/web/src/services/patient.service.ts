import { api } from './api';
import { Patient, PatientStatus } from '../types';

export const patientService = {
  async getAll(params?: { search?: string; status?: PatientStatus; page?: number; limit?: number }) {
    const res = await api.get('/patients', { params });
    return res.data;
  },

  async getById(id: string): Promise<Patient> {
    const res = await api.get(`/patients/${id}`);
    return res.data;
  },

  async create(data: Partial<Patient>): Promise<Patient> {
    const res = await api.post('/patients', data);
    return res.data;
  },

  async updateStatus(id: string, status: PatientStatus): Promise<Patient> {
    const res = await api.patch(`/patients/${id}/status`, { status });
    return res.data;
  },
};
