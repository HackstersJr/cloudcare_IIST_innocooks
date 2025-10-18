import type {
  Doctor,
  DoctorAppointment,
  AssignedPatient,
  EmergencyAlert,
  DoctorStats,
} from '@/types/doctor';

// Mock Doctor Data
export const MOCK_DOCTOR: Doctor = {
  id: 1,
  name: 'Dr. Sarah Johnson',
  age: 42,
  gender: 'Female',
  contact: '+1 (555) 123-4567',
  specializations: 'Cardiology',
  hospitalId: 1,
  email: 'sarah.johnson@cloudcare.com',
};

// Mock Doctor Stats
export const MOCK_DOCTOR_STATS: DoctorStats = {
  totalPatients: 127,
  todaysAppointments: 12,
  activeAlerts: 8,
  pendingReports: 5,
};

// Mock Emergency Alerts
export const MOCK_EMERGENCY_ALERTS: EmergencyAlert[] = [
  {
    id: 1,
    patientId: 1,
    patientName: 'Michael Brown',
    alertType: 'heart_rate',
    message: 'Abnormal heart rate detected',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 mins ago
    severity: 'critical',
    isRead: false,
  },
  {
    id: 2,
    patientId: 3,
    patientName: 'David Wilson',
    alertType: 'oxygen_level',
    message: 'Low oxygen saturation - 89%',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 mins ago
    severity: 'high',
    isRead: false,
  },
  {
    id: 3,
    patientId: 5,
    patientName: 'Jennifer Martinez',
    alertType: 'blood_pressure',
    message: 'Blood pressure spike detected - 165/95',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 mins ago
    severity: 'medium',
    isRead: false,
  },
];

// Mock Assigned Patients
export const MOCK_ASSIGNED_PATIENTS: AssignedPatient[] = [
  {
    id: 1,
    name: 'John Smith',
    age: 45,
    gender: 'Male',
    contact: '+1 (555) 234-5678',
    familyContact: '+1 (555) 234-5679',
    emergency: false,
    aiAnalysis: null,
    status: 'stable',
    condition: 'Hypertension',
    nextAppointment: '2025-10-22',
    lastVisit: '2025-10-15',
  },
  {
    id: 2,
    name: 'Emily Davis',
    age: 32,
    gender: 'Female',
    contact: '+1 (555) 345-6789',
    familyContact: '+1 (555) 345-6790',
    emergency: false,
    aiAnalysis: null,
    status: 'monitoring',
    condition: 'Diabetes Type 2',
    nextAppointment: '2025-10-26',
    lastVisit: '2025-10-18',
  },
  {
    id: 3,
    name: 'Michael Brown',
    age: 58,
    gender: 'Male',
    contact: '+1 (555) 456-7890',
    familyContact: '+1 (555) 456-7891',
    emergency: true,
    aiAnalysis: 'Cardiac risk detected - immediate attention required',
    status: 'critical',
    condition: 'Cardiac Arrhythmia',
    nextAppointment: '2025-10-20',
    lastVisit: '2025-10-19',
  },
  {
    id: 4,
    name: 'Sarah Johnson',
    age: 67,
    gender: 'Female',
    contact: '+1 (555) 567-8901',
    familyContact: '+1 (555) 567-8902',
    emergency: false,
    aiAnalysis: null,
    status: 'stable',
    condition: 'Hypertension, High Cholesterol',
    nextAppointment: '2025-10-28',
    lastVisit: '2025-10-10',
  },
  {
    id: 5,
    name: 'David Wilson',
    age: 55,
    gender: 'Male',
    contact: '+1 (555) 678-9012',
    familyContact: '+1 (555) 678-9013',
    emergency: false,
    aiAnalysis: null,
    status: 'monitoring',
    condition: 'COPD',
    nextAppointment: '2025-10-25',
    lastVisit: '2025-10-17',
  },
];

// Mock Doctor Appointments
export const MOCK_DOCTOR_APPOINTMENTS: DoctorAppointment[] = [
  {
    id: 1,
    patientId: 1,
    doctorId: 1,
    hospitalId: 1,
    department: 'Cardiology',
    date: '2025-10-22',
    time: '09:00',
    status: 'scheduled',
    reason: 'Routine checkup',
    notes: 'Blood pressure monitoring',
  },
  {
    id: 2,
    patientId: 3,
    doctorId: 1,
    hospitalId: 1,
    department: 'Cardiology',
    date: '2025-10-20',
    time: '10:30',
    status: 'scheduled',
    reason: 'Emergency consultation',
    notes: 'Abnormal heart rate detected',
  },
  {
    id: 3,
    patientId: 5,
    doctorId: 1,
    hospitalId: 1,
    department: 'Cardiology',
    date: '2025-10-25',
    time: '14:00',
    status: 'scheduled',
    reason: 'Follow-up',
    notes: 'Review oxygen levels',
  },
  {
    id: 4,
    patientId: 2,
    doctorId: 1,
    hospitalId: 1,
    department: 'Cardiology',
    date: '2025-10-26',
    time: '11:00',
    status: 'scheduled',
    reason: 'Consultation',
    notes: 'Diabetes management',
  },
  {
    id: 5,
    patientId: 4,
    doctorId: 1,
    hospitalId: 1,
    department: 'Cardiology',
    date: '2025-10-15',
    time: '09:30',
    status: 'completed',
    reason: 'Regular checkup',
    notes: 'All vitals normal',
  },
  {
    id: 6,
    patientId: 1,
    doctorId: 1,
    hospitalId: 1,
    department: 'Cardiology',
    date: '2025-10-10',
    time: '15:00',
    status: 'completed',
    reason: 'Medication review',
    notes: 'Adjusted dosage',
  },
];

// Helper functions
export const getAppointmentsByStatus = (
  status: 'scheduled' | 'completed' | 'cancelled'
): DoctorAppointment[] => {
  return MOCK_DOCTOR_APPOINTMENTS.filter((apt) => apt.status === status);
};

export const getTodaysAppointments = (): DoctorAppointment[] => {
  const today = new Date().toISOString().split('T')[0];
  return MOCK_DOCTOR_APPOINTMENTS.filter((apt) => apt.date === today);
};

export const getUpcomingAppointments = (): DoctorAppointment[] => {
  const today = new Date().toISOString().split('T')[0];
  return MOCK_DOCTOR_APPOINTMENTS.filter(
    (apt) => apt.date >= today && apt.status === 'scheduled'
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

export const getPatientsByStatus = (
  status: 'stable' | 'monitoring' | 'critical'
): AssignedPatient[] => {
  return MOCK_ASSIGNED_PATIENTS.filter((patient) => patient.status === status);
};

export const getUnreadAlerts = (): EmergencyAlert[] => {
  return MOCK_EMERGENCY_ALERTS.filter((alert) => !alert.isRead);
};

export const getAlertsBySeverity = (
  severity: 'low' | 'medium' | 'high' | 'critical'
): EmergencyAlert[] => {
  return MOCK_EMERGENCY_ALERTS.filter((alert) => alert.severity === severity);
};

// Department options
export const DEPARTMENTS = [
  'Cardiology',
  'Neurology',
  'Orthopedics',
  'Pediatrics',
  'General Medicine',
  'Emergency',
  'Dermatology',
  'Psychiatry',
];

// Specializations
export const SPECIALIZATIONS = [
  'Cardiology',
  'Neurology',
  'Orthopedics',
  'Pediatrics',
  'General Medicine',
  'Emergency Medicine',
  'Dermatology',
  'Psychiatry',
  'Oncology',
  'Radiology',
];
