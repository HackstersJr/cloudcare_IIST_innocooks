/**
 * Doctor API Service
 * Handles all doctor-related API calls
 */

import { doctorApiClient } from './client';

export interface Doctor {
  id: number;
  name: string;
  age: number;
  gender: string;
  contact: string;
  specializations: string;
  experience: number;
  createdAt: string;
  updatedAt: string;
}

export interface DoctorWithDetails extends Doctor {
  patients?: any[];
  hospitals?: any[];
}

export interface CreateDoctorRequest {
  name: string;
  age: number;
  gender: string;
  contact: string;
  specializations: string[];
  experience?: number;
}

export interface DoctorAppointment {
  id: number;
  doctorId: number;
  patientId: number;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

export interface AssignedPatient {
  id: number;
  name: string;
  age: number;
  gender: string;
  contact: string;
  emergency: boolean;
  lastVisit?: string;
  nextAppointment?: string;
}

export interface EmergencyAlert {
  id: number;
  patientId: number;
  patientName: string;
  alertType: string;
  severity: string;
  description: string;
  timestamp: string;
  status: string;
}

export interface DoctorStats {
  totalPatients: number;
  todayAppointments: number;
  emergencyAlerts: number;
  completedAppointments: number;
}

export interface DoctorLoginRequest {
  email: string;
  password: string;
}

export interface UpdatePatientRequest {
  notes?: string;
  diagnosis?: string;
  treatment?: string;
}

export const doctorService = {
  // Doctor CRUD operations
  async getDoctor(doctorId: number): Promise<Doctor> {
    return doctorApiClient.get<Doctor>(`/api/doctors/${doctorId}`);
  },

  async getDoctorWithDetails(doctorId: number): Promise<DoctorWithDetails> {
    return doctorApiClient.get<DoctorWithDetails>(`/api/doctors/${doctorId}`);
  },

  async listDoctors(params?: {
    skip?: number;
    limit?: number;
    specialization?: string;
    available_only?: boolean;
  }): Promise<Doctor[]> {
    return doctorApiClient.get<Doctor[]>('/api/doctors', params);
  },

  async createDoctor(data: CreateDoctorRequest): Promise<Doctor> {
    return doctorApiClient.post<Doctor>('/api/doctors', data);
  },

  async updateDoctor(
    doctorId: number,
    data: Partial<Doctor>
  ): Promise<Doctor> {
    return doctorApiClient.put<Doctor>(`/api/doctors/${doctorId}`, data);
  },

  async updateAvailability(
    doctorId: number,
    isAvailable: boolean
  ): Promise<{ success: boolean; message: string }> {
    return doctorApiClient.patch(`/api/doctors/${doctorId}/availability`, {
      is_available: isAvailable,
    });
  },

  async deleteDoctor(doctorId: number): Promise<{ success: boolean; message: string }> {
    return doctorApiClient.delete(`/api/doctors/${doctorId}`);
  },

  // Doctor-Patient Relationships
  async getAssignedPatients(
    doctorId: number,
    currentOnly: boolean = true
  ): Promise<AssignedPatient[]> {
    return doctorApiClient.get(`/api/doctors/${doctorId}/patients`, {
      current_only: currentOnly,
    });
  },

  async assignPatient(
    doctorId: number,
    patientId: number,
    relationshipType: string = 'current'
  ): Promise<{ success: boolean; message: string }> {
    return doctorApiClient.post(`/api/doctors/${doctorId}/patients/${patientId}`, {
      relationship_type: relationshipType,
    });
  },

  async removePatient(
    doctorId: number,
    patientId: number
  ): Promise<{ success: boolean; message: string }> {
    return doctorApiClient.delete(`/api/doctors/${doctorId}/patients/${patientId}`);
  },

  // Doctor-Hospital Relationships
  async getHospitals(doctorId: number): Promise<any[]> {
    return doctorApiClient.get(`/api/doctors/${doctorId}/hospitals`);
  },

  async assignToHospital(
    doctorId: number,
    hospitalName: string,
    department: string,
    position?: string
  ): Promise<{ success: boolean; message: string }> {
    return doctorApiClient.post(`/api/doctors/${doctorId}/hospitals/${hospitalName}`, {
      department,
      position,
    });
  },

  // Appointments (mock - to be implemented)
  async getAppointments(doctorId: number): Promise<DoctorAppointment[]> {
    // TODO: Implement when appointment endpoint is available
    return Promise.resolve([]);
  },

  async createAppointment(
    doctorId: number,
    appointment: Partial<DoctorAppointment>
  ): Promise<DoctorAppointment> {
    // TODO: Implement when appointment endpoint is available
    return Promise.resolve({} as DoctorAppointment);
  },

  async updateAppointmentStatus(
    appointmentId: number,
    status: 'scheduled' | 'completed' | 'cancelled'
  ): Promise<DoctorAppointment> {
    // TODO: Implement when appointment endpoint is available
    return Promise.resolve({} as DoctorAppointment);
  },

  // Statistics (mock - to be implemented)
  async getStats(doctorId: number): Promise<DoctorStats> {
    // TODO: Implement when stats endpoint is available
    const patients = await this.getAssignedPatients(doctorId);
    return {
      totalPatients: patients.length,
      todayAppointments: 0,
      emergencyAlerts: 0,
      completedAppointments: 0,
    };
  },

  // Emergency Alerts (mock - to be implemented)
  async getEmergencyAlerts(doctorId: number): Promise<EmergencyAlert[]> {
    // TODO: Implement when emergency endpoint integration is available
    return Promise.resolve([]);
  },

  async markAlertRead(alertId: number): Promise<{ success: boolean }> {
    // TODO: Implement when alert endpoint is available
    return Promise.resolve({ success: true });
  },

  // Patient Data Updates
  async updatePatientData(
    doctorId: number,
    patientId: number,
    data: UpdatePatientRequest
  ): Promise<{ success: boolean; message: string }> {
    // TODO: Implement when patient update endpoint is available
    return Promise.resolve({ success: true, message: 'Updated successfully' });
  },

  // Patient Search
  async searchPatients(doctorId: number, query: string): Promise<AssignedPatient[]> {
    const patients = await this.getAssignedPatients(doctorId);
    return patients.filter((p) =>
      p.name.toLowerCase().includes(query.toLowerCase())
    );
  },
};

// Doctor Authentication Service
export const doctorAuthService = {
  async login(credentials: DoctorLoginRequest): Promise<{ token: string; doctor: Doctor }> {
    // TODO: Implement when authentication endpoint is available
    return Promise.resolve({
      token: 'mock-token',
      doctor: {} as Doctor,
    });
  },

  async logout(): Promise<void> {
    // TODO: Implement logout
    return Promise.resolve();
  },

  async changePassword(
    doctorId: number,
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> {
    // TODO: Implement when password change endpoint is available
    return Promise.resolve({ success: true, message: 'Password changed' });
  },
};
