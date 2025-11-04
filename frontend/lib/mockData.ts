import type {
  AppointmentWithDetails,
  Doctor,
  FamilyContact,
  Hospital,
  MedicalRecord,
  Patient,
  PatientCondition,
  Prescription,
} from '@/types/patient';

export type PatientSnapshot = Patient & {
  address: string;
  occupation: string;
  bloodType: string;
  insuranceProvider: string;
  insuranceId: string;
  conditions: PatientCondition[];
  records: MedicalRecord[];
};

export const FALLBACK_PATIENT_ID = 35;

export const MOCK_HOSPITALS: Hospital[] = [
  { id: 1, name: 'City General Hospital' },
  { id: 2, name: 'Metro Medical Center' },
  { id: 3, name: 'Sunrise Clinic' },
];

export const MOCK_DOCTORS: Doctor[] = [
  {
    id: 1,
    name: 'Dr. Sarah Johnson',
    age: 45,
    gender: 'Female',
    contact: '+91-9876543210',
    specializations: 'Cardiology, Internal Medicine',
  },
  {
    id: 2,
    name: 'Dr. Amit Patel',
    age: 38,
    gender: 'Male',
    contact: '+91-9876543211',
    specializations: 'General Medicine',
  },
  {
    id: 3,
    name: 'Dr. Priya Sharma',
    age: 42,
    gender: 'Female',
    contact: '+91-9876543212',
    specializations: 'Orthopedics',
  },
  {
    id: 4,
    name: 'Dr. Rajesh Kumar',
    age: 50,
    gender: 'Male',
    contact: '+91-9876543213',
    specializations: 'Neurology',
  },
];

export const PATIENT_SNAPSHOTS: Record<number, PatientSnapshot> = {
  1: {
    id: 1,
    name: 'Rajesh Kumar',
    age: 58,
    gender: 'Male',
    contact: '+91-9876543210',
    familyContact: '+91-9876543211',
    emergency: true,
    aiAnalysis:
      'AI detected elevated cardiovascular risk driven by hypertension history and recent heart-rate variability trends. Recommend recording BP twice daily, staying hydrated, and scheduling a cardiology follow-up this week.',
    address: '34 Lakeview Society, Sector 42, New Delhi',
    occupation: 'Retired Electrical Engineer',
    bloodType: 'B+',
    insuranceProvider: 'HealthShield Advantage',
    insuranceId: 'HS-IND-2398842',
    conditions: [
      {
        id: 1,
        patientId: 1,
        condition: 'Hypertension (Stage 1)',
        startDate: '2022-03-12T00:00:00Z',
        endDate: null,
      },
      {
        id: 2,
        patientId: 1,
        condition: 'Type 2 Diabetes Mellitus',
        startDate: '2021-07-01T00:00:00Z',
        endDate: null,
      },
      {
        id: 3,
        patientId: 1,
        condition: 'Generalized Anxiety Disorder',
        startDate: '2024-01-15T00:00:00Z',
        endDate: '2024-09-01T00:00:00Z',
      },
    ],
    records: [
      {
        id: 101,
        patientId: 1,
        recordType: 'Consultation',
        description: 'Cardiology review • systolic BP averaged 145 mmHg',
        diagnosis: 'Hypertension not fully controlled',
        treatment: 'Continue Amlodipine 5mg daily, add evening walk regimen',
        doctorId: 1,
        hospitalId: 1,
        date: '2025-10-15T10:00:00Z',
      },
      {
        id: 102,
        patientId: 1,
        recordType: 'Lab Test',
        description: 'Complete lipid profile and HbA1c screening',
        diagnosis: 'LDL 145 mg/dL • HbA1c 7.2%',
        treatment: 'Maintain Metformin, start Atorvastatin 10mg nightly',
        doctorId: 2,
        hospitalId: 1,
        date: '2025-10-10T08:30:00Z',
      },
      {
        id: 103,
        patientId: 1,
        recordType: 'Emergency',
        description: 'Emergency visit for chest discomfort and dizziness',
        diagnosis: 'Ruled out myocardial infarction; observed anxiety episode',
        treatment: 'Observation for 4 hours, prescribed short-term anxiolytic',
        doctorId: 3,
        hospitalId: 2,
        date: '2025-09-05T22:30:00Z',
      },
    ],
  },
};

export const MOCK_PRESCRIPTIONS: Prescription[] = [
  {
    id: 1,
    patientId: 1,
    medication: 'Amlodipine',
    dosage: '5mg',
    startDate: '2025-10-01T00:00:00Z',
    endDate: '2025-11-01T00:00:00Z',
  },
  {
    id: 2,
    patientId: 1,
    medication: 'Metformin',
    dosage: '500mg',
    startDate: '2025-09-15T00:00:00Z',
    endDate: '2025-12-15T00:00:00Z',
  },
  {
    id: 3,
    patientId: 1,
    medication: 'Aspirin',
    dosage: '75mg',
    startDate: '2025-10-10T00:00:00Z',
    endDate: null,
  },
  {
    id: 4,
    patientId: 1,
    medication: 'Atorvastatin',
    dosage: '10mg',
    startDate: '2025-09-20T00:00:00Z',
    endDate: null,
  },
  {
    id: 5,
    patientId: 1,
    medication: 'Omeprazole',
    dosage: '20mg',
    startDate: '2025-08-01T00:00:00Z',
    endDate: '2025-09-01T00:00:00Z',
  },
  {
    id: 6,
    patientId: 1,
    medication: 'Losartan',
    dosage: '50mg',
    startDate: '2025-07-15T00:00:00Z',
    endDate: '2025-08-15T00:00:00Z',
  },
];

export const MOCK_PRESCRIPTION_DETAILS: Record<
  number,
  {
    frequency: string;
    instructions: string;
    prescribedBy: string;
    refillsRemaining?: number;
  }
> = {
  1: {
    frequency: 'Once daily',
    instructions: 'Take in the morning with food',
    prescribedBy: 'Dr. Sarah Johnson',
    refillsRemaining: 2,
  },
  2: {
    frequency: 'Twice daily',
    instructions: 'Take with meals',
    prescribedBy: 'Dr. Sarah Johnson',
    refillsRemaining: 3,
  },
  3: {
    frequency: 'Once daily',
    instructions: 'Take after breakfast',
    prescribedBy: 'Dr. Sarah Johnson',
  },
  4: {
    frequency: 'Once daily at bedtime',
    instructions: 'Take before sleep',
    prescribedBy: 'Dr. Sarah Johnson',
  },
  5: {
    frequency: 'Once daily',
    instructions: 'Take 30 minutes before breakfast',
    prescribedBy: 'Dr. Amit Patel',
  },
  6: {
    frequency: 'Once daily',
    instructions: 'Take in the morning',
    prescribedBy: 'Dr. Amit Patel',
  },
};

export const MOCK_FAMILY_CONTACTS: FamilyContact[] = [
  {
    id: 1,
    patientId: 1,
    name: 'Priya Kumar',
    relationship: 'Spouse',
    contact: '+91-9876543211',
    isPrimary: true,
    isEmergencyContact: true,
  },
  {
    id: 2,
    patientId: 1,
    name: 'Amit Kumar',
    relationship: 'Son',
    contact: '+91-9876543212',
    isPrimary: false,
    isEmergencyContact: true,
  },
  {
    id: 3,
    patientId: 1,
    name: 'Neha Kumar',
    relationship: 'Daughter',
    contact: '+91-9876543213',
    isPrimary: false,
    isEmergencyContact: false,
  },
];

export const MOCK_APPOINTMENTS: AppointmentWithDetails[] = [
  {
    id: 1,
    patientId: 1,
    doctorId: 1,
    hospitalId: 1,
    appointmentDate: '2025-10-25',
    appointmentTime: '10:00',
    department: 'Cardiology',
    status: 'scheduled',
    notes: 'Regular checkup for blood pressure',
    doctor: getDoctorById(1),
    hospital: getHospitalById(1),
  },
  {
    id: 2,
    patientId: 1,
    doctorId: 2,
    hospitalId: 1,
    appointmentDate: '2025-10-28',
    appointmentTime: '14:30',
    department: 'General Medicine',
    status: 'scheduled',
    notes: 'Follow-up consultation',
    doctor: getDoctorById(2),
    hospital: getHospitalById(1),
  },
  {
    id: 3,
    patientId: 1,
    doctorId: 1,
    hospitalId: 1,
    appointmentDate: '2025-10-15',
    appointmentTime: '11:00',
    department: 'Cardiology',
    status: 'completed',
    notes: 'ECG test completed',
    doctor: getDoctorById(1),
    hospital: getHospitalById(1),
  },
  {
    id: 4,
    patientId: 1,
    doctorId: 3,
    hospitalId: 2,
    appointmentDate: '2025-10-12',
    appointmentTime: '09:30',
    department: 'Orthopedics',
    status: 'cancelled',
    notes: 'Patient rescheduled',
    doctor: getDoctorById(3),
    hospital: getHospitalById(2),
  },
];

export function getPatientById(id: number): PatientSnapshot | undefined {
  return PATIENT_SNAPSHOTS[id];
}

export function getDoctorById(id: number): Doctor | undefined {
  return MOCK_DOCTORS.find((doctor) => doctor.id === id);
}

export function getHospitalById(id: number): Hospital | undefined {
  return MOCK_HOSPITALS.find((hospital) => hospital.id === id);
}

export function getPatientConditions(patientId: number): PatientCondition[] {
  return getPatientById(patientId)?.conditions ?? [];
}

export function getPatientRecords(patientId: number): MedicalRecord[] {
  return getPatientById(patientId)?.records ?? [];
}

export function getPatientPrescriptions(patientId: number): Prescription[] {
  return MOCK_PRESCRIPTIONS.filter((prescription) => prescription.patientId === patientId);
}

export function getPatientFamilyContacts(patientId: number): FamilyContact[] {
  return MOCK_FAMILY_CONTACTS.filter((contact) => contact.patientId === patientId);
}

export function getAppointmentsForPatient(patientId: number): AppointmentWithDetails[] {
  return MOCK_APPOINTMENTS.filter((appointment) => appointment.patientId === patientId);
}
