/**
 * Patient API Service
 * Handles all patient-related API calls
 */

import { patientApiClient } from './client';

export interface Patient {
  id: number;
  name: string;
  age: number;
  gender: string;
  contact: string;
  familyContact: string;
  emergency: boolean;
  aiAnalysis?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PatientCondition {
  id: number;
  patientId: number;
  condition: string;
  startDate: string;
  endDate?: string;
  createdAt: string;
}

export interface MedicalRecord {
  id: number;
  patientId: number;
  description: string;
  date: string;
  createdAt: string;
}

export interface Prescription {
  id: number;
  patientId: number;
  medication: string;
  dosage: string;
  startDate: string;
  endDate?: string;
  createdAt: string;
}

export interface Appointment {
  id: number;
  patientId: number;
  doctorId: number;
  hospitalId: number;
  appointmentDate: string;
  appointmentTime: string;
  department: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePatientRequest {
  name: string;
  age: number;
  gender: string;
  contact: string;
  familyContact?: string;
  emergency?: boolean;
  aiAnalysis?: string;
}

export interface UpdatePatientRequest {
  name?: string;
  age?: number;
  gender?: string;
  contact?: string;
  familyContact?: string;
  emergency?: boolean;
  aiAnalysis?: string;
}

export const patientService = {
  // Patient CRUD operations
  async getPatient(patientId: number): Promise<Patient> {
    return patientApiClient.get<Patient>(`/api/patients/${patientId}`);
  },

  async listPatients(params?: {
    skip?: number;
    limit?: number;
    emergency_only?: boolean;
  }): Promise<Patient[]> {
    return patientApiClient.get<Patient[]>('/api/patients', params);
  },

  async createPatient(data: CreatePatientRequest): Promise<Patient> {
    return patientApiClient.post<Patient>('/api/patients', data);
  },

  async updatePatient(
    patientId: number,
    data: UpdatePatientRequest
  ): Promise<Patient> {
    return patientApiClient.put<Patient>(`/api/patients/${patientId}`, data);
  },

  async deletePatient(patientId: number): Promise<{ success: boolean; message: string }> {
    return patientApiClient.delete(`/api/patients/${patientId}`);
  },

  // Patient Conditions
  async getConditions(patientId: number): Promise<PatientCondition[]> {
    return patientApiClient.get<PatientCondition[]>(
      `/api/patients/${patientId}/conditions`
    );
  },

  async addCondition(
    patientId: number,
    data: {
      condition: string;
      startDate: string;
      endDate?: string;
    }
  ): Promise<PatientCondition> {
    return patientApiClient.post<PatientCondition>(
      `/api/patients/${patientId}/conditions`,
      data
    );
  },

  // Medical Records
  async getRecords(patientId: number): Promise<MedicalRecord[]> {
    return patientApiClient.get<MedicalRecord[]>(
      `/api/patients/${patientId}/records`
    );
  },

  async createRecord(
    patientId: number,
    data: {
      description: string;
      date: string;
    }
  ): Promise<MedicalRecord> {
    return patientApiClient.post<MedicalRecord>(
      `/api/patients/${patientId}/records`,
      data
    );
  },

  // Prescriptions
  async getPrescriptions(patientId: number): Promise<Prescription[]> {
    return patientApiClient.get<Prescription[]>(
      `/api/patients/${patientId}/prescriptions`
    );
  },

  async createPrescription(
    patientId: number,
    data: {
      medication: string;
      dosage: string;
      startDate: string;
      endDate?: string;
    }
  ): Promise<Prescription> {
    return patientApiClient.post<Prescription>(
      `/api/patients/${patientId}/prescriptions`,
      data
    );
  },

  // Emergency Flag
  async setEmergencyFlag(
    patientId: number,
    emergency: boolean,
    aiAnalysis?: string
  ): Promise<Patient> {
    return patientApiClient.post<Patient>(
      `/api/patients/${patientId}/emergency`,
      { emergency, aiAnalysis }
    );
  },

  async clearEmergencyFlag(patientId: number): Promise<{ success: boolean; message: string }> {
    return patientApiClient.delete(`/api/patients/${patientId}/emergency`);
  },

  // Patient-Doctor Relationships
  async getDoctors(patientId: number): Promise<any[]> {
    return patientApiClient.get(`/api/patients/${patientId}/doctors`);
  },

  async assignDoctor(patientId: number, doctorId: number): Promise<{ success: boolean; message: string }> {
    return patientApiClient.post(`/api/patients/${patientId}/doctors/${doctorId}`);
  },

  // Appointments
  async getAppointments(patientId: number, status?: string): Promise<Appointment[]> {
    const params = status ? { status } : undefined;
    return patientApiClient.get<Appointment[]>(`/api/patients/${patientId}/appointments`, params);
  },

  async createAppointment(
    patientId: number,
    data: {
      doctorId: number;
      hospitalId: number;
      appointmentDate: string;
      appointmentTime: string;
      department: string;
      notes?: string;
    }
  ): Promise<Appointment> {
    return patientApiClient.post<Appointment>(`/api/patients/${patientId}/appointments`, data);
  },

  async updateAppointment(
    patientId: number,
    appointmentId: number,
    data: {
      status?: string;
      notes?: string;
      appointmentDate?: string;
      appointmentTime?: string;
    }
  ): Promise<Appointment> {
    return patientApiClient.put<Appointment>(
      `/api/patients/${patientId}/appointments/${appointmentId}`,
      data
    );
  },

  async cancelAppointment(patientId: number, appointmentId: number): Promise<{ success: boolean; message: string }> {
    return patientApiClient.delete(`/api/patients/${patientId}/appointments/${appointmentId}`);
  },
};
