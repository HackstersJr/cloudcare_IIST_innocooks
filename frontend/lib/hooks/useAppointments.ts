/**
 * Appointment Hooks
 * React Query hooks for appointment management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientService } from '@/lib/api';

// Query keys
export const appointmentKeys = {
  all: ['appointments'] as const,
  lists: () => [...appointmentKeys.all, 'list'] as const,
  list: (patientId: number, status?: string) => [...appointmentKeys.lists(), patientId, status] as const,
  detail: (patientId: number, appointmentId: number) => [...appointmentKeys.all, 'detail', patientId, appointmentId] as const,
};

// Get patient appointments
export function useAppointments(patientId: number, status?: string, enabled: boolean = true) {
  return useQuery({
    queryKey: appointmentKeys.list(patientId, status),
    queryFn: () => patientService.getAppointments(patientId, status),
    enabled: enabled && !!patientId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Create appointment
export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      patientId,
      data,
    }: {
      patientId: number;
      data: {
        doctorId: number;
        hospitalId: number;
        appointmentDate: string;
        appointmentTime: string;
        department: string;
        notes?: string;
      };
    }) => patientService.createAppointment(patientId, data),
    onSuccess: (_, { patientId }) => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
    },
  });
}

// Update appointment
export function useUpdateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      patientId,
      appointmentId,
      data,
    }: {
      patientId: number;
      appointmentId: number;
      data: {
        status?: string;
        notes?: string;
        appointmentDate?: string;
        appointmentTime?: string;
      };
    }) => patientService.updateAppointment(patientId, appointmentId, data),
    onSuccess: (_, { patientId }) => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
    },
  });
}

// Cancel appointment
export function useCancelAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ patientId, appointmentId }: { patientId: number; appointmentId: number }) =>
      patientService.cancelAppointment(patientId, appointmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() });
    },
  });
}
