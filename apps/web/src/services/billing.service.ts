import { api } from './api';
import { Bill } from '../types';

export const billingService = {
  async getAll(params?: { patientId?: string; status?: string }): Promise<Bill[]> {
    const res = await api.get('/billing/bills', { params });
    return res.data;
  },

  async getById(id: string): Promise<Bill> {
    const res = await api.get(`/billing/bills/${id}`);
    return res.data;
  },

  async createBill(data: any): Promise<Bill> {
    const res = await api.post('/billing/bills', data);
    return res.data;
  },

  async recordPayment(data: {
    billId: string;
    amount: number;
    method?: string;
    transactionRef?: string;
    receivedBy?: string;
  }): Promise<any> {
    const res = await api.post('/billing/payments', data);
    return res.data;
  },
};
