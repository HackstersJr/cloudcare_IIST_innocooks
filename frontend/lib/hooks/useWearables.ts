/**
 * Wearables Hooks
 * React Query hooks for wearable data management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { wearablesService } from '@/lib/api';
import type {
  WearableData,
  LatestVitals,
  WearableHistory,
  ConsentStatus,
} from '@/lib/api';

// Query keys
export const wearablesKeys = {
  all: ['wearables'] as const,
  latestVitals: (patientId: number) => [...wearablesKeys.all, 'latest', patientId] as const,
  history: (patientId: number, limit?: number) => [...wearablesKeys.all, 'history', patientId, limit] as const,
  consent: (patientId: number) => [...wearablesKeys.all, 'consent', patientId] as const,
  statistics: () => [...wearablesKeys.all, 'statistics'] as const,
};

// Get latest vitals for a patient
export function useLatestVitals(patientId: number, enabled: boolean = true) {
  return useQuery({
    queryKey: wearablesKeys.latestVitals(patientId),
    queryFn: async () => {
      const data = await wearablesService.getLatestVitals(patientId);
      // Wrap in array for compatibility with existing components
      return [data];
    },
    enabled,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Auto-refresh every 30 seconds
  });
}

// Get wearable data history
export function useWearableHistory(
  patientId: number,
  limit: number = 50,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: wearablesKeys.history(patientId, limit),
    queryFn: async () => {
      const response = await wearablesService.getHistory(patientId, limit);
      // Return the data array from the response
      return response.data || [];
    },
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Get consent status
export function useConsentStatus(patientId: number, enabled: boolean = true) {
  return useQuery({
    queryKey: wearablesKeys.consent(patientId),
    queryFn: () => wearablesService.getConsentStatus(patientId),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get wearable statistics
export function useWearableStatistics() {
  return useQuery({
    queryKey: wearablesKeys.statistics(),
    queryFn: () => wearablesService.getStatistics(),
    staleTime: 5 * 60 * 1000,
  });
}

// Update consent
export function useUpdateConsent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      patientId,
      hasConsent,
      expiryDate,
    }: {
      patientId: number;
      hasConsent: boolean;
      expiryDate?: string;
    }) => wearablesService.createOrUpdateConsent(patientId, hasConsent, expiryDate),
    onSuccess: (_, { patientId }) => {
      queryClient.invalidateQueries({ queryKey: wearablesKeys.consent(patientId) });
    },
  });
}

// Login to HCGateway (for mobile app integration)
export function useWearableLogin() {
  return useMutation({
    mutationFn: ({
      username,
      password,
      fcmToken,
    }: {
      username: string;
      password: string;
      fcmToken?: string;
    }) => wearablesService.login(username, password, fcmToken),
  });
}

// Refresh token
export function useRefreshWearableToken() {
  return useMutation({
    mutationFn: (refresh: string) => wearablesService.refreshToken(refresh),
  });
}

// Aliases for compatibility with existing pages
export const useLatestWearables = useLatestVitals;
export const usePatientWearables = useWearableHistory;
