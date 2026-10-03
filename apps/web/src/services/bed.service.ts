import { api } from './api';
import { Bed, BedStatus } from '../types';

export const bedService = {
  async getAll(params?: { departmentId?: string; status?: BedStatus }): Promise<Bed[]> {
    const res = await api.get('/beds', { params });
    return res.data;
  },

  async updateStatus(id: string, status: BedStatus, notes?: string): Promise<Bed> {
    const res = await api.patch(`/beds/${id}/status`, { status, notes });
    return res.data;
  },
};
