/**
 * Hospital API Service
 * Handles all hospital-related API calls
 */

import { hospitalApiClient } from './client';

export interface Hospital {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface HospitalStats {
  hospitalName: string;
  totalBeds: number;
  availableBeds: number;
  occupiedBeds: number;
  occupancyRate: number;
  doctorCount: number;
  currentPatients: number;
  totalPatientsTreated: number;
  emergencyServices: boolean;
  specializations?: string[];
}

export interface Staff {
  id: number;
  name: string;
  role: string;
  department: string;
  contact: string;
  email: string;
  shift: string;
  status: 'active' | 'on-leave' | 'inactive';
}

export interface EmergencyCase {
  id: number;
  patientName: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  condition: string;
  admittedAt: string;
  status: 'active' | 'stable' | 'discharged';
}

export interface Department {
  id: number;
  name: string;
  headOfDepartment: string;
  staffCount: number;
  patientCount: number;
  specialization: string;
}

export interface Resource {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  reorderLevel: number;
  status: 'available' | 'low-stock' | 'out-of-stock';
}

export interface HospitalLoginRequest {
  email: string;
  password: string;
}

export interface AddStaffRequest {
  name: string;
  role: string;
  department: string;
  contact: string;
  email: string;
  shift: string;
}

export interface UpdateResourceRequest {
  quantity?: number;
  reorderLevel?: number;
  status?: 'available' | 'low-stock' | 'out-of-stock';
}

export const hospitalService = {
  // Hospital CRUD operations
  async getHospital(hospitalId: number): Promise<Hospital> {
    // Try to get by ID first, then fallback to name
    try {
      return hospitalApiClient.get<Hospital>(`/api/hospitals/${hospitalId}`);
    } catch (error) {
      // Fallback: list hospitals and find by ID
      const hospitals = await this.listHospitals();
      const hospital = hospitals.find((h) => h.id === hospitalId);
      if (!hospital) throw new Error('Hospital not found');
      return hospital;
    }
  },

  async listHospitals(params?: {
    skip?: number;
    limit?: number;
    emergency_only?: boolean;
    specialization?: string;
  }): Promise<Hospital[]> {
    return hospitalApiClient.get<Hospital[]>('/api/hospitals', params);
  },

  async createHospital(data: { hospital_name: string }): Promise<Hospital> {
    return hospitalApiClient.post<Hospital>('/api/hospitals', data);
  },

  async updateHospital(
    hospitalId: number,
    data: Partial<Hospital>
  ): Promise<Hospital> {
    return hospitalApiClient.put<Hospital>(`/api/hospitals/${hospitalId}`, data);
  },

  async deleteHospital(hospitalId: number): Promise<{ success: boolean; message: string }> {
    return hospitalApiClient.delete(`/api/hospitals/${hospitalId}`);
  },

  // Statistics
  async getStats(hospitalId: number): Promise<HospitalStats> {
    // Get hospital details first
    const hospitals = await this.listHospitals();
    const hospital = hospitals.find((h) => h.id === hospitalId);
    if (!hospital) throw new Error('Hospital not found');

    return hospitalApiClient.get<HospitalStats>(
      `/api/hospitals/${hospital.name}/statistics`
    );
  },

  // Doctors
  async getDoctors(hospitalId: number): Promise<any[]> {
    const hospitals = await this.listHospitals();
    const hospital = hospitals.find((h) => h.id === hospitalId);
    if (!hospital) throw new Error('Hospital not found');

    return hospitalApiClient.get(`/api/hospitals/${hospital.name}/doctors`);
  },

  // Patients
  async getPatients(
    hospitalId: number,
    currentOnly: boolean = true
  ): Promise<any[]> {
    const hospitals = await this.listHospitals();
    const hospital = hospitals.find((h) => h.id === hospitalId);
    if (!hospital) throw new Error('Hospital not found');

    return hospitalApiClient.get(`/api/hospitals/${hospital.name}/patients`, {
      current_only: currentOnly,
    });
  },

  async admitPatient(
    hospitalId: number,
    patientId: number,
    admissionData: {
      treatment_type?: string;
      department?: string;
      reason?: string;
    }
  ): Promise<{ success: boolean; message: string }> {
    const hospitals = await this.listHospitals();
    const hospital = hospitals.find((h) => h.id === hospitalId);
    if (!hospital) throw new Error('Hospital not found');

    return hospitalApiClient.post(
      `/api/hospitals/${hospital.name}/patients/${patientId}/admit`,
      admissionData
    );
  },

  async dischargePatient(
    hospitalId: number,
    patientId: number,
    dischargeSummary?: string
  ): Promise<{ success: boolean; message: string }> {
    const hospitals = await this.listHospitals();
    const hospital = hospitals.find((h) => h.id === hospitalId);
    if (!hospital) throw new Error('Hospital not found');

    return hospitalApiClient.post(
      `/api/hospitals/${hospital.name}/patients/${patientId}/discharge`,
      { discharge_summary: dischargeSummary }
    );
  },

  // Bed Management
  async updateBedAvailability(
    hospitalId: number,
    availableBeds: number
  ): Promise<{ success: boolean; message: string }> {
    const hospitals = await this.listHospitals();
    const hospital = hospitals.find((h) => h.id === hospitalId);
    if (!hospital) throw new Error('Hospital not found');

    return hospitalApiClient.patch(`/api/hospitals/${hospital.name}/beds`, {
      available_beds: availableBeds,
    });
  },

  // Mock services (to be implemented when endpoints are available)
  async getEmergencyCases(hospitalId: number): Promise<EmergencyCase[]> {
    // TODO: Implement when emergency integration is available
    return Promise.resolve([]);
  },

  async getWeeklyEmergencyData(hospitalId: number): Promise<any[]> {
    // TODO: Implement
    return Promise.resolve([]);
  },

  async getPatientDistribution(hospitalId: number): Promise<any[]> {
    // TODO: Implement
    return Promise.resolve([]);
  },

  async getDepartments(hospitalId: number): Promise<Department[]> {
    // TODO: Implement when department endpoint is available
    return Promise.resolve([]);
  },

  async getDepartmentAnalytics(hospitalId: number): Promise<any> {
    // TODO: Implement
    return Promise.resolve({});
  },
};

// Staff Management Service
export const staffService = {
  async getStaff(hospitalId: number): Promise<Staff[]> {
    // TODO: Implement when staff endpoint is available
    return Promise.resolve([]);
  },

  async addStaff(hospitalId: number, data: AddStaffRequest): Promise<Staff> {
    // TODO: Implement
    return Promise.resolve({} as Staff);
  },

  async updateStaff(staffId: number, data: Partial<Staff>): Promise<Staff> {
    // TODO: Implement
    return Promise.resolve({} as Staff);
  },

  async deleteStaff(staffId: number): Promise<{ success: boolean }> {
    // TODO: Implement
    return Promise.resolve({ success: true });
  },
};

// Resource Management Service
export const resourceService = {
  async getResources(hospitalId: number): Promise<Resource[]> {
    // TODO: Implement when resource endpoint is available
    return Promise.resolve([]);
  },

  async updateResource(
    resourceId: number,
    data: UpdateResourceRequest
  ): Promise<Resource> {
    // TODO: Implement
    return Promise.resolve({} as Resource);
  },

  async getResourceDistribution(hospitalId: number): Promise<any[]> {
    // TODO: Implement
    return Promise.resolve([]);
  },

  async getLowStockResources(hospitalId: number): Promise<Resource[]> {
    // TODO: Implement
    return Promise.resolve([]);
  },
};

// Hospital Authentication Service
export const hospitalAuthService = {
  async login(credentials: HospitalLoginRequest): Promise<{ token: string; hospital: Hospital }> {
    // TODO: Implement when authentication endpoint is available
    return Promise.resolve({
      token: 'mock-token',
      hospital: {} as Hospital,
    });
  },

  async logout(): Promise<void> {
    // TODO: Implement
    return Promise.resolve();
  },
};
