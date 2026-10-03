import { api } from './api';
import { DigitalTwinState, Patient } from '../types';

export const digitalTwinService = {
  async getState(): Promise<DigitalTwinState> {
    const res = await api.get('/digital-twin/state');
    return res.data;
  },

  async sync(): Promise<DigitalTwinState> {
    const res = await api.post('/digital-twin/sync');
    return res.data;
  },

  async getPatientJourney(patientId: string): Promise<Patient> {
    const res = await api.get(`/digital-twin/patient/${patientId}/journey`);
    return res.data;
  },
};
