/**
 * API Services Entry Point
 * Export all API services and types
 */

// Export API clients
export { 
  API_ENDPOINTS,
  patientApiClient, 
  doctorApiClient, 
  hospitalApiClient, 
  emergencyApiClient, 
  wearablesApiClient 
} from './client';

// Export services
export { patientService } from './patient';
export { doctorService, doctorAuthService } from './doctor';
export { 
  hospitalService, 
  staffService, 
  resourceService, 
  hospitalAuthService 
} from './hospital';
export { emergencyService, subscribeToEmergencyAlerts, useEmergencyAlertStream } from './emergency';
export { wearablesService } from './wearables';

// Export types explicitly to avoid conflicts
export type {
  Patient,
  PatientCondition,
  MedicalRecord,
  Prescription,
  CreatePatientRequest,
  UpdatePatientRequest as PatientUpdateRequest,
} from './patient';

export type {
  Doctor,
  DoctorWithDetails,
  DoctorAppointment,
  AssignedPatient,
  EmergencyAlert as DoctorEmergencyAlert,
  DoctorStats,
  DoctorLoginRequest,
  UpdatePatientRequest as DoctorUpdatePatientRequest,
  CreateDoctorRequest,
} from './doctor';

export type {
  Hospital,
  HospitalStats,
  Staff,
  EmergencyCase,
  Department,
  Resource,
  HospitalLoginRequest,
  AddStaffRequest,
  UpdateResourceRequest,
} from './hospital';

export type {
  EmergencyAlert,
  CreateEmergencyAlertRequest,
  EmergencyStatistics,
} from './emergency';

export type {
  WearableData,
  LatestVitals,
  WearableHistory,
  ConsentStatus,
  WearableStatistics,
} from './wearables';
