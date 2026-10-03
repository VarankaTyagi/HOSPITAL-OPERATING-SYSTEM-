import { api } from './api';
import { Admission, Discharge } from '../types';

export const admissionService = {
  async getAll(params?: { status?: string; departmentId?: string; patientId?: string }): Promise<Admission[]> {
    const res = await api.get('/admissions', { params });
    return res.data;
  },

  async admit(data: {
    patientId: string;
    bedId: string;
    departmentId: string;
    doctorId: string;
    initialDiagnosis: string;
    type?: string;
  }): Promise<Admission> {
    const res = await api.post('/admissions', data);
    return res.data;
  },

  async discharge(
    admissionId: string,
    data: {
      dischargeSummary: string;
      followUpInstructions?: string;
      conditionAtDischarge?: string;
      approvedBy: string;
    },
  ): Promise<Discharge> {
    const res = await api.patch(`/admissions/${admissionId}/discharge`, data);
    return res.data;
  },
};
