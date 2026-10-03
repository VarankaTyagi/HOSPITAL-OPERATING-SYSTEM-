import { api } from './api';
import { User } from '../types';

export const authService = {
  async login(email: string, password: string): Promise<{ accessToken: string; user: User }> {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.accessToken) {
      localStorage.setItem('hospitalos_token', res.data.accessToken);
      localStorage.setItem('hospitalos_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: string;
    phone?: string;
  }): Promise<{ accessToken: string; user: User }> {
    const res = await api.post('/auth/register', data);
    if (res.data.accessToken) {
      localStorage.setItem('hospitalos_token', res.data.accessToken);
      localStorage.setItem('hospitalos_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  async getProfile(): Promise<User> {
    const res = await api.get('/auth/profile');
    return res.data;
  },

  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('hospitalos_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('hospitalos_token');
      localStorage.removeItem('hospitalos_user');
      window.location.href = '/login';
    }
  },
};
