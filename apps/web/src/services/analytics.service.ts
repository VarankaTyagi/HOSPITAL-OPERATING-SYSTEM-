import { api } from './api';

export const analyticsService = {
  async getOperationalMetrics(): Promise<any> {
    const res = await api.get('/analytics/operational');
    return res.data;
  },
};
