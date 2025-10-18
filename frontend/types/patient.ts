// TypeScript types matching backend Prisma schema

export interface Patient {
  id: number;
  name: string;
  age: number;
  gender: string;
  contact: string;
  familyContact: string;
  emergency: boolean;
  aiAnalysis: string | null;
  userLoginId?: number | null;
}

export interface Doctor {
  id: number;
  name: string;
  age: number;
  gender: string;
  contact: string;
  specializations: string;
  hospitalId?: number | null;
  userLoginId?: number | null;
}

export interface Hospital {
  id: number;
  name: string;
}

export interface MedicalRecord {
  id: number;
  patientId: number;
  description: string;
  date: string;
  recordType?: string;
  diagnosis?: string;
  treatment?: string;
  doctorId?: number;
  hospitalId?: number;
}

export interface Prescription {
  id: number;
  patientId: number;
  medication: string;
  dosage: string;
  startDate: string;
  endDate: string | null;
}

export interface PatientCondition {
  id: number;
  patientId: number;
  condition: string;
  startDate: string;
  endDate: string | null;
}

export interface WearableData {
  id: number;
  patientId: number;
  timestamp: string;
  heartRate: number | null;
  steps: number | null;
  sleepHours: number | null;
  oxygenLevel: number | null;
  description: string | null;
  recordId?: number | null;
}

export interface UserLogin {
  id: number;
  email: string;
  password?: string; // Won't be returned from API
}

// Extended types with relationships
export interface PatientWithDetails extends Patient {
  doctors?: Doctor[];
  hospitals?: Hospital[];
  records?: MedicalRecord[];
  prescriptions?: Prescription[];
  conditions?: PatientCondition[];
  wearablesData?: WearableData[];
}

// Wearables API types (HCGateway v2 compatible)
export interface WearableLoginRequest {
  username: string;
  password: string;
  fcmToken?: string;
}

export interface WearableLoginResponse {
  token: string;
  refresh: string;
  expiry: string;
}

export interface WearableSyncData {
  metadata: {
    id: string;
    dataOrigin: string;
  };
  time?: string;
  startTime?: string;
  endTime?: string;
  heartRate?: number;
  steps?: number;
  sleepHours?: number;
  oxygenLevel?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  temperature?: number;
  weight?: number;
  glucose?: number;
}

// Appointment types
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
}

export interface AppointmentWithDetails extends Appointment {
  doctor?: Doctor;
  hospital?: Hospital;
  patient?: Patient;
}

// Emergency Alert types
export interface EmergencyAlert {
  id: number;
  patientId: number;
  alertType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  triggeredBy: string;
  timestamp: string;
  status: 'active' | 'acknowledged' | 'resolved';
}

// Family Contact types
export interface FamilyContact {
  id: number;
  patientId: number;
  name: string;
  relationship: string;
  contact: string;
  isPrimary: boolean;
  isEmergencyContact: boolean;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Auth types
export interface AuthUser {
  id: number;
  email: string;
  role: 'patient' | 'doctor' | 'hospital';
  patientId?: number;
  doctorId?: number;
  hospitalId?: number;
}
