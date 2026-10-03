import { api } from './api';

export const notificationService = {
  async getMyNotifications(): Promise<any[]> {
    const res = await api.get('/notifications');
    return res.data;
  },

  async markAsRead(id: string): Promise<any> {
    const res = await api.patch(`/notifications/${id}/read`);
    return res.data;
  },
};
