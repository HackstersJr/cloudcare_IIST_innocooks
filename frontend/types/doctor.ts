// Doctor Dashboard TypeScript types

import { Patient, Prescription, Hospital } from './patient';

export interface Doctor {
  id: number;
  name: string;
  age: number;
  gender: string;
  contact: string;
  specializations: string;
  hospitalId?: number | null;
  userLoginId?: number | null;
  email?: string;
}

export interface DoctorWithDetails extends Doctor {
  hospital?: Hospital;
  patients?: Patient[];
  appointments?: DoctorAppointment[];
}

export interface DoctorAppointment {
  id: number;
  patientId: number;
  doctorId: number;
  hospitalId: number;
  department: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  reason?: string;
  notes?: string;
  patient?: Patient;
  hospital?: Hospital;
}

export interface AssignedPatient extends Patient {
  status: 'stable' | 'monitoring' | 'critical';
  condition: string;
  nextAppointment?: string;
  lastVisit?: string;
}

export interface EmergencyAlert {
  id: number;
  patientId: number;
  patientName: string;
  alertType: 'heart_rate' | 'oxygen_level' | 'blood_pressure' | 'emergency';
  message: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  isRead: boolean;
}

export interface DoctorStats {
  totalPatients: number;
  todaysAppointments: number;
  activeAlerts: number;
  pendingReports: number;
}

export interface PatientUpdate {
  patientId: number;
  prescriptions?: Prescription[];
  thresholds?: {
    heartRateMin?: number;
    heartRateMax?: number;
    oxygenLevelMin?: number;
    bloodPressureMax?: string;
  };
  notes?: string;
  nextAppointment?: string;
}

// API Request/Response types
export interface DoctorLoginRequest {
  email: string;
  password: string;
}

export interface DoctorLoginResponse {
  doctor: DoctorWithDetails;
  token: string;
}

export interface UpdatePatientRequest {
  prescriptions?: {
    medication: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
  }[];
  thresholds?: {
    heartRateMin?: number;
    heartRateMax?: number;
    oxygenLevelMin?: number;
    bloodPressureMax?: string;
  };
  notes?: string;
  diagnosis?: string;
}
