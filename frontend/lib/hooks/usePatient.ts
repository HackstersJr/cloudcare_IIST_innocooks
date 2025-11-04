/**
 * Patient Hooks
 * React Query hooks for patient data management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientService } from '@/lib/api';
import type {
  Patient,
  PatientCondition,
  MedicalRecord,
  Prescription,
  CreatePatientRequest,
  PatientUpdateRequest,
} from '@/lib/api';

// Query keys
export const patientKeys = {
  all: ['patients'] as const,
  lists: () => [...patientKeys.all, 'list'] as const,
  list: (filters?: any) => [...patientKeys.lists(), filters] as const,
  details: () => [...patientKeys.all, 'detail'] as const,
  detail: (id: number) => [...patientKeys.details(), id] as const,
  conditions: (id: number) => [...patientKeys.detail(id), 'conditions'] as const,
  records: (id: number) => [...patientKeys.detail(id), 'records'] as const,
  prescriptions: (id: number) => [...patientKeys.detail(id), 'prescriptions'] as const,
  doctors: (id: number) => [...patientKeys.detail(id), 'doctors'] as const,
};

// Get single patient
export function usePatient(patientId: number, enabled: boolean = true) {
  return useQuery({
    queryKey: patientKeys.detail(patientId),
    queryFn: () => patientService.getPatient(patientId),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get all patients
export function usePatients(params?: {
  skip?: number;
  limit?: number;
  emergency_only?: boolean;
}) {
  return useQuery({
    queryKey: patientKeys.list(params),
    queryFn: () => patientService.listPatients(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Get patient conditions
export function usePatientConditions(patientId: number, enabled: boolean = true) {
  return useQuery({
    queryKey: patientKeys.conditions(patientId),
    queryFn: () => patientService.getConditions(patientId),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

// Get patient medical records
export function usePatientRecords(patientId: number, enabled: boolean = true) {
  return useQuery({
    queryKey: patientKeys.records(patientId),
    queryFn: () => patientService.getRecords(patientId),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

// Get patient prescriptions
export function usePatientPrescriptions(patientId: number, enabled: boolean = true) {
  return useQuery({
    queryKey: patientKeys.prescriptions(patientId),
    queryFn: () => patientService.getPrescriptions(patientId),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

// Get patient doctors
export function usePatientDoctors(patientId: number, enabled: boolean = true) {
  return useQuery({
    queryKey: patientKeys.doctors(patientId),
    queryFn: () => patientService.getDoctors(patientId),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

// Create patient
export function useCreatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePatientRequest) => patientService.createPatient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
    },
  });
}

// Update patient
export function useUpdatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ patientId, data }: { patientId: number; data: PatientUpdateRequest }) =>
      patientService.updatePatient(patientId, data),
    onSuccess: (_, { patientId }) => {
      queryClient.invalidateQueries({ queryKey: patientKeys.detail(patientId) });
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
    },
  });
}

// Delete patient
export function useDeletePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (patientId: number) => patientService.deletePatient(patientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
    },
  });
}

// Add condition
export function useAddCondition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      patientId,
      data,
    }: {
      patientId: number;
      data: { condition: string; startDate: string; endDate?: string };
    }) => patientService.addCondition(patientId, data),
    onSuccess: (_, { patientId }) => {
      queryClient.invalidateQueries({ queryKey: patientKeys.conditions(patientId) });
      queryClient.invalidateQueries({ queryKey: patientKeys.detail(patientId) });
    },
  });
}

// Create medical record
export function useCreateRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      patientId,
      data,
    }: {
      patientId: number;
      data: { description: string; date: string };
    }) => patientService.createRecord(patientId, data),
    onSuccess: (_, { patientId }) => {
      queryClient.invalidateQueries({ queryKey: patientKeys.records(patientId) });
    },
  });
}

// Create prescription
export function useCreatePrescription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      patientId,
      data,
    }: {
      patientId: number;
      data: {
        medication: string;
        dosage: string;
        startDate: string;
        endDate?: string;
      };
    }) => patientService.createPrescription(patientId, data),
    onSuccess: (_, { patientId }) => {
      queryClient.invalidateQueries({ queryKey: patientKeys.prescriptions(patientId) });
    },
  });
}

// Set emergency flag
export function useSetEmergencyFlag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      patientId,
      emergency,
      aiAnalysis,
    }: {
      patientId: number;
      emergency: boolean;
      aiAnalysis?: string;
    }) => patientService.setEmergencyFlag(patientId, emergency, aiAnalysis),
    onSuccess: (_, { patientId }) => {
      queryClient.invalidateQueries({ queryKey: patientKeys.detail(patientId) });
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
    },
  });
}

// Clear emergency flag
export function useClearEmergencyFlag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (patientId: number) => patientService.clearEmergencyFlag(patientId),
    onSuccess: (_, patientId) => {
      queryClient.invalidateQueries({ queryKey: patientKeys.detail(patientId) });
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
    },
  });
}

// Assign doctor to patient
export function useAssignDoctor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ patientId, doctorId }: { patientId: number; doctorId: number }) =>
      patientService.assignDoctor(patientId, doctorId),
    onSuccess: (_, { patientId }) => {
      queryClient.invalidateQueries({ queryKey: patientKeys.doctors(patientId) });
    },
  });
}
