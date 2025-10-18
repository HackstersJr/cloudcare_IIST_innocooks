import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hospitalService, staffService, resourceService, hospitalAuthService } from '@/lib/api/hospital';
import type {
  Hospital,
  HospitalStats,
  Staff,
  EmergencyCase,
  Department,
  Resource,
  HospitalLoginRequest,
  AddStaffRequest,
  UpdateResourceRequest,
} from '@/types/hospital';

// Query keys
export const hospitalKeys = {
  all: ['hospital'] as const,
  details: (id: number) => [...hospitalKeys.all, 'details', id] as const,
  stats: (id: number) => [...hospitalKeys.all, 'stats', id] as const,
  emergencyCases: (id: number) => [...hospitalKeys.all, 'emergency-cases', id] as const,
  weeklyEmergency: (id: number) => [...hospitalKeys.all, 'weekly-emergency', id] as const,
  patientDistribution: (id: number) => [...hospitalKeys.all, 'patient-distribution', id] as const,
  departments: (id: number) => [...hospitalKeys.all, 'departments', id] as const,
  departmentAnalytics: (id: number) => [...hospitalKeys.all, 'department-analytics', id] as const,
  staff: (id: number) => [...hospitalKeys.all, 'staff', id] as const,
  resources: (id: number) => [...hospitalKeys.all, 'resources', id] as const,
  resourceDistribution: (id: number) => [...hospitalKeys.all, 'resource-distribution', id] as const,
  lowStockResources: (id: number) => [...hospitalKeys.all, 'low-stock', id] as const,
};

// Get hospital details
export function useHospital(hospitalId: number) {
  return useQuery({
    queryKey: hospitalKeys.details(hospitalId),
    queryFn: () => hospitalService.getHospital(hospitalId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get hospital stats
export function useHospitalStats(hospitalId: number) {
  return useQuery({
    queryKey: hospitalKeys.stats(hospitalId),
    queryFn: () => hospitalService.getStats(hospitalId),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

// Get emergency cases (with auto-refresh)
export function useEmergencyCases(hospitalId: number) {
  return useQuery({
    queryKey: hospitalKeys.emergencyCases(hospitalId),
    queryFn: () => hospitalService.getEmergencyCases(hospitalId),
    refetchInterval: 30 * 1000, // Auto-refresh every 30 seconds
    staleTime: 10 * 1000, // 10 seconds
  });
}

// Get weekly emergency data
export function useWeeklyEmergencyData(hospitalId: number) {
  return useQuery({
    queryKey: hospitalKeys.weeklyEmergency(hospitalId),
    queryFn: () => hospitalService.getWeeklyEmergencyData(hospitalId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get patient distribution
export function usePatientDistribution(hospitalId: number) {
  return useQuery({
    queryKey: hospitalKeys.patientDistribution(hospitalId),
    queryFn: () => hospitalService.getPatientDistribution(hospitalId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get departments
export function useDepartments(hospitalId: number) {
  return useQuery({
    queryKey: hospitalKeys.departments(hospitalId),
    queryFn: () => hospitalService.getDepartments(hospitalId),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Get department analytics
export function useDepartmentAnalytics(hospitalId: number) {
  return useQuery({
    queryKey: hospitalKeys.departmentAnalytics(hospitalId),
    queryFn: () => hospitalService.getDepartmentAnalytics(hospitalId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get staff
export function useStaff(hospitalId: number) {
  return useQuery({
    queryKey: hospitalKeys.staff(hospitalId),
    queryFn: () => staffService.getStaff(hospitalId),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Add staff
export function useAddStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ hospitalId, data }: { hospitalId: number; data: AddStaffRequest }) =>
      staffService.addStaff(hospitalId, data),
    onSuccess: (_, { hospitalId }) => {
      queryClient.invalidateQueries({ queryKey: hospitalKeys.staff(hospitalId) });
      queryClient.invalidateQueries({ queryKey: hospitalKeys.stats(hospitalId) });
    },
  });
}

// Update staff
export function useUpdateStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ staffId, data }: { staffId: number; data: Partial<Staff> }) =>
      staffService.updateStaff(staffId, data),
    onSuccess: (_, { staffId }) => {
      queryClient.invalidateQueries({ queryKey: hospitalKeys.staff(1) }); // Assume hospital ID 1
    },
  });
}

// Delete staff
export function useDeleteStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (staffId: number) => staffService.deleteStaff(staffId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hospitalKeys.staff(1) }); // Assume hospital ID 1
    },
  });
}

// Get resources
export function useResources(hospitalId: number) {
  return useQuery({
    queryKey: hospitalKeys.resources(hospitalId),
    queryFn: () => resourceService.getResources(hospitalId),
    refetchInterval: 60 * 1000, // Auto-refresh every minute
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Update resource
export function useUpdateResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ resourceId, data }: { resourceId: number; data: UpdateResourceRequest }) =>
      resourceService.updateResource(resourceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hospitalKeys.resources(1) }); // Assume hospital ID 1
      queryClient.invalidateQueries({ queryKey: hospitalKeys.resourceDistribution(1) });
    },
  });
}

// Get resource distribution
export function useResourceDistribution(hospitalId: number) {
  return useQuery({
    queryKey: hospitalKeys.resourceDistribution(hospitalId),
    queryFn: () => resourceService.getResourceDistribution(hospitalId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get low stock resources
export function useLowStockResources(hospitalId: number) {
  return useQuery({
    queryKey: hospitalKeys.lowStockResources(hospitalId),
    queryFn: () => resourceService.getLowStockResources(hospitalId),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

// Update hospital
export function useUpdateHospital() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ hospitalId, data }: { hospitalId: number; data: Partial<Hospital> }) =>
      hospitalService.updateHospital(hospitalId, data),
    onSuccess: (_, { hospitalId }) => {
      queryClient.invalidateQueries({ queryKey: hospitalKeys.details(hospitalId) });
    },
  });
}

// Hospital login
export function useHospitalLogin() {
  return useMutation({
    mutationFn: (credentials: HospitalLoginRequest) => hospitalAuthService.login(credentials),
  });
}

// Hospital logout
export function useHospitalLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => hospitalAuthService.logout(),
    onSuccess: () => {
      queryClient.clear();
    },
  });
}
