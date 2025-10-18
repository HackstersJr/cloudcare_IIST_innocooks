import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { doctorService, doctorAuthService } from '@/lib/api/doctor';
import type {
  Doctor,
  DoctorWithDetails,
  DoctorAppointment,
  AssignedPatient,
  EmergencyAlert,
  DoctorStats,
  DoctorLoginRequest,
  UpdatePatientRequest,
} from '@/types/doctor';

// Query keys
export const doctorKeys = {
  all: ['doctor'] as const,
  details: (id: number) => [...doctorKeys.all, 'details', id] as const,
  patients: (id: number) => [...doctorKeys.all, 'patients', id] as const,
  appointments: (id: number) => [...doctorKeys.all, 'appointments', id] as const,
  stats: (id: number) => [...doctorKeys.all, 'stats', id] as const,
  alerts: (id: number) => [...doctorKeys.all, 'alerts', id] as const,
};

// Get doctor details
export function useDoctorDetails(doctorId: number) {
  return useQuery({
    queryKey: doctorKeys.details(doctorId),
    queryFn: () => doctorService.getDoctorWithDetails(doctorId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get assigned patients
export function useAssignedPatients(doctorId: number) {
  return useQuery({
    queryKey: doctorKeys.patients(doctorId),
    queryFn: () => doctorService.getAssignedPatients(doctorId),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Get doctor appointments
export function useDoctorAppointments(doctorId: number) {
  return useQuery({
    queryKey: doctorKeys.appointments(doctorId),
    queryFn: () => doctorService.getAppointments(doctorId),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

// Get doctor stats
export function useDoctorStats(doctorId: number) {
  return useQuery({
    queryKey: doctorKeys.stats(doctorId),
    queryFn: () => doctorService.getStats(doctorId),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

// Get emergency alerts (with auto-refresh)
export function useEmergencyAlerts(doctorId: number) {
  return useQuery({
    queryKey: doctorKeys.alerts(doctorId),
    queryFn: () => doctorService.getEmergencyAlerts(doctorId),
    refetchInterval: 30 * 1000, // Auto-refresh every 30 seconds
    staleTime: 10 * 1000, // 10 seconds
  });
}

// Update doctor profile
export function useUpdateDoctor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ doctorId, data }: { doctorId: number; data: Partial<Doctor> }) =>
      doctorService.updateDoctor(doctorId, data),
    onSuccess: (_, { doctorId }) => {
      queryClient.invalidateQueries({ queryKey: doctorKeys.details(doctorId) });
    },
  });
}

// Update patient data
export function useUpdatePatientData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      doctorId,
      patientId,
      data,
    }: {
      doctorId: number;
      patientId: number;
      data: UpdatePatientRequest;
    }) => doctorService.updatePatientData(doctorId, patientId, data),
    onSuccess: (_, { doctorId }) => {
      queryClient.invalidateQueries({ queryKey: doctorKeys.patients(doctorId) });
    },
  });
}

// Mark alert as read
export function useMarkAlertRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ alertId, doctorId }: { alertId: number; doctorId: number }) =>
      doctorService.markAlertRead(alertId),
    onSuccess: (_, { doctorId }) => {
      queryClient.invalidateQueries({ queryKey: doctorKeys.alerts(doctorId) });
      queryClient.invalidateQueries({ queryKey: doctorKeys.stats(doctorId) });
    },
  });
}

// Create appointment
export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      doctorId,
      appointment,
    }: {
      doctorId: number;
      appointment: Partial<DoctorAppointment>;
    }) => doctorService.createAppointment(doctorId, appointment),
    onSuccess: (_, { doctorId }) => {
      queryClient.invalidateQueries({ queryKey: doctorKeys.appointments(doctorId) });
      queryClient.invalidateQueries({ queryKey: doctorKeys.stats(doctorId) });
    },
  });
}

// Update appointment status
export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      appointmentId,
      status,
      doctorId,
    }: {
      appointmentId: number;
      status: 'scheduled' | 'completed' | 'cancelled';
      doctorId: number;
    }) => doctorService.updateAppointmentStatus(appointmentId, status),
    onSuccess: (_, { doctorId }) => {
      queryClient.invalidateQueries({ queryKey: doctorKeys.appointments(doctorId) });
      queryClient.invalidateQueries({ queryKey: doctorKeys.stats(doctorId) });
    },
  });
}

// Search patients
export function useSearchPatients(doctorId: number, query: string) {
  return useQuery({
    queryKey: [...doctorKeys.patients(doctorId), 'search', query],
    queryFn: () => doctorService.searchPatients(doctorId, query),
    enabled: query.length > 0,
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Doctor login
export function useDoctorLogin() {
  return useMutation({
    mutationFn: (credentials: DoctorLoginRequest) => doctorAuthService.login(credentials),
  });
}

// Doctor logout
export function useDoctorLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => doctorAuthService.logout(),
    onSuccess: () => {
      queryClient.clear();
    },
  });
}

// Change password
export function useChangePassword() {
  return useMutation({
    mutationFn: ({
      doctorId,
      currentPassword,
      newPassword,
    }: {
      doctorId: number;
      currentPassword: string;
      newPassword: string;
    }) => doctorAuthService.changePassword(doctorId, currentPassword, newPassword),
  });
}
