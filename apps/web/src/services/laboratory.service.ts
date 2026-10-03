import { api } from './api';
import { LabOrder, LabReport } from '../types';

export const laboratoryService = {
  async getOrders(params?: { status?: string; patientId?: string }): Promise<LabOrder[]> {
    const res = await api.get('/laboratory/orders', { params });
    return res.data;
  },

  async getOrderById(id: string): Promise<LabOrder> {
    const res = await api.get(`/laboratory/orders/${id}`);
    return res.data;
  },

  async createOrder(data: any): Promise<LabOrder> {
    const res = await api.post('/laboratory/orders', data);
    return res.data;
  },

  async collectSample(sampleId: string, collectedBy: string): Promise<any> {
    const res = await api.patch(`/laboratory/samples/${sampleId}/collect`, { collectedBy });
    return res.data;
  },

  async processSample(sampleId: string, processedBy: string): Promise<any> {
    const res = await api.patch(`/laboratory/samples/${sampleId}/process`, { processedBy });
    return res.data;
  },

  async publishReport(orderId: string, data: any): Promise<LabReport> {
    const res = await api.post(`/laboratory/orders/${orderId}/report`, data);
    return res.data;
  },
};
