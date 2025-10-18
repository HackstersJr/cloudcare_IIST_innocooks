// Hospital Dashboard TypeScript types

import { Patient, Doctor } from './patient';

export interface Hospital {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  totalBeds: number;
  availableBeds: number;
  totalDoctors: number;
  totalStaff: number;
  emergencyCapacity: number;
  createdAt: string;
  updatedAt: string;
}

export interface HospitalStats {
  admittedPatients: number;
  availableDoctors: number;
  emergencyCases: number;
  avgResponseTime: string; // e.g. "8 min"
}

export interface Staff {
  id: number;
  name: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
  specialization: string;
  department: string;
  patientCount: number;
  status: 'active' | 'on-leave' | 'unavailable';
  joinedDate: string;
}

export interface EmergencyCase {
  id: number;
  patientId: string;
  patientName: string;
  condition: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  admittedTime: string;
  status: 'waiting' | 'in-treatment' | 'stable' | 'discharged';
  assignedDoctor?: string;
}

export interface Department {
  id: number;
  name: string;
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  headDoctor: string;
  status: 'normal' | 'low' | 'critical';
}

export interface Resource {
  id: number;
  name: string;
  type: 'beds' | 'oxygen' | 'equipment' | 'supplies';
  total: number;
  available: number;
  inUse: number;
  status: 'normal' | 'low' | 'critical';
}

export interface EmergencyCaseWeekly {
  day: string;
  cases: number;
}

export interface PatientDistribution {
  department: string;
  count: number;
  percentage: number;
  color: string;
}

export interface ResourceDistribution {
  category: string;
  value: number;
  percentage: number;
  color: string;
}

// API Request/Response types
export interface HospitalLoginRequest {
  hospitalId: string;
  password: string;
}

export interface HospitalLoginResponse {
  hospital: Hospital;
  token: string;
}

export interface AddStaffRequest {
  name: string;
  age: number;
  gender: string;
  contact: string;
  email: string;
  specialization: string;
  department: string;
}

export interface UpdateResourceRequest {
  resourceId: number;
  available: number;
  inUse: number;
}

export interface DepartmentAnalytics {
  department: string;
  totalPatients: number;
  emergencyCases: number;
  bedUtilization: number;
  avgStayDuration: number; // in days
}
