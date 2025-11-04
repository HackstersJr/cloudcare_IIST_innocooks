/**
 * Wearables API Service
 * Handles wearable data sync and retrieval
 */

import { wearablesApiClient } from './client';

export interface WearableData {
  id: number;
  patientId: number;
  timestamp: string;
  heartRate?: number;
  steps?: number;
  sleepHours?: number;
  oxygenLevel?: number;
  description?: string;
}

export interface LatestVitals {
  patientId: number;
  timestamp: string;
  heartRate?: number;
  steps?: number;
  sleepHours?: number;
  oxygenLevel?: number;
}

export interface WearableHistory {
  patientId: number;
  count: number;
  data: WearableData[];
}

export interface ConsentStatus {
  patientId: number;
  hasConsent: boolean;
  consentDate?: string;
  expiryDate?: string;
}

export interface WearableStatistics {
  totalSyncs: number;
  activeSyncs: number;
  lastSyncTime?: string;
  deviceTypes: string[];
}

export const wearablesService = {
  // Get patient wearable data
  async getLatestVitals(patientId: number): Promise<LatestVitals> {
    return wearablesApiClient.get<LatestVitals>(
      `/api/patients/${patientId}/wearables/latest`
    );
  },

  async getHistory(patientId: number, limit: number = 50): Promise<WearableHistory> {
    return wearablesApiClient.get<WearableHistory>(
      `/api/patients/${patientId}/wearables/history`,
      { limit }
    );
  },

  // Consent Management
  async getConsentStatus(patientId: number): Promise<ConsentStatus> {
    return wearablesApiClient.get<ConsentStatus>(
      `/api/wearables/consent/${patientId}`
    );
  },

  async createOrUpdateConsent(
    patientId: number,
    hasConsent: boolean,
    expiryDate?: string
  ): Promise<ConsentStatus> {
    return wearablesApiClient.post<ConsentStatus>('/api/wearables/consent', {
      patientId,
      hasConsent,
      expiryDate,
    });
  },

  // Statistics
  async getStatistics(): Promise<WearableStatistics> {
    return wearablesApiClient.get<WearableStatistics>('/api/wearables/statistics');
  },

  // HCGateway Integration (for mobile app)
  async login(username: string, password: string, fcmToken?: string): Promise<{
    token: string;
    refresh: string;
    expiry: string;
  }> {
    return wearablesApiClient.post('/api/v2/login', {
      username,
      password,
      fcmToken,
    });
  },

  async refreshToken(refresh: string): Promise<{
    token: string;
    refresh: string;
    expiry: string;
  }> {
    return wearablesApiClient.post('/api/v2/refresh', { refresh });
  },

  async syncWearableData(
    method: string,
    data: any[],
    token: string
  ): Promise<{ success: boolean; synced: number; errors: number }> {
    // Note: Authorization header should be passed via custom client instance
    // This is a simplified version - in production, use authenticated client
    return wearablesApiClient.post(`/api/v2/sync/${method}`, { data });
  },

  async fetchWearableData(
    method: string,
    token: string,
    queries?: any
  ): Promise<any[]> {
    // Note: Authorization header should be passed via custom client instance
    // This is a simplified version - in production, use authenticated client
    return wearablesApiClient.post(`/api/v2/fetch/${method}`, { queries: queries || {} });
  },
};
