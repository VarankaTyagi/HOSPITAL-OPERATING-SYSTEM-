import { api } from './api';
import { Medicine, Inventory, Prescription } from '../types';

export const pharmacyService = {
  async getMedicines(params?: { search?: string; category?: string }): Promise<Medicine[]> {
    const res = await api.get('/pharmacy/medicines', { params });
    return res.data;
  },

  async getInventory(status?: string): Promise<Inventory[]> {
    const res = await api.get('/pharmacy/inventory', { params: { status } });
    return res.data;
  },

  async getPrescriptions(params?: { status?: string; patientId?: string }): Promise<Prescription[]> {
    const res = await api.get('/pharmacy/prescriptions', { params });
    return res.data;
  },

  async createPrescription(data: any): Promise<Prescription> {
    const res = await api.post('/pharmacy/prescriptions', data);
    return res.data;
  },

  async dispense(prescriptionId: string, dispensedBy: string): Promise<Prescription> {
    const res = await api.patch(`/pharmacy/prescriptions/${prescriptionId}/dispense`, {
      dispensedBy,
    });
    return res.data;
  },
};
