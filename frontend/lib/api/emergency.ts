/**
 * Emergency API Service
 * Handles emergency alerts and real-time SSE notifications
 */

import { emergencyApiClient, API_ENDPOINTS } from './client';

export interface EmergencyAlert {
  id: number;
  alertId: string;
  patientId: number;
  hospitalId?: number;
  alertType: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  triggeredBy: string;
  triggerData?: any;
  location?: string;
  status: 'active' | 'acknowledged' | 'responding' | 'resolved' | 'false_alarm';
  responders?: string[];
  responseTime?: string;
  resolvedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmergencyAlertRequest {
  alert_id: string;
  patient_id: string;
  hospital_id?: string;
  alert_type: 'cardiac' | 'respiratory' | 'fall' | 'critical_vitals' | 'other';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  triggered_by: 'wearable' | 'manual' | 'ai' | 'sensor';
  trigger_data?: any;
  location?: string;
}

export interface EmergencyStatistics {
  total_alerts: number;
  active_alerts: number;
  responding_alerts: number;
  resolved_alerts: number;
  false_alarms: number;
  critical_active: number;
  timestamp: string;
}

export const emergencyService = {
  // Emergency Alert CRUD
  async createAlert(data: CreateEmergencyAlertRequest): Promise<EmergencyAlert> {
    return emergencyApiClient.post<EmergencyAlert>('/api/emergency/alerts', data);
  },

  async getAlert(alertId: string): Promise<EmergencyAlert> {
    return emergencyApiClient.get<EmergencyAlert>(`/api/emergency/alerts/${alertId}`);
  },

  async listAlerts(params?: {
    skip?: number;
    limit?: number;
    active_only?: boolean;
    severity?: string;
  }): Promise<EmergencyAlert[]> {
    return emergencyApiClient.get<EmergencyAlert[]>('/api/emergency/alerts', params);
  },

  async getPatientAlerts(
    patientId: string,
    activeOnly: boolean = true
  ): Promise<EmergencyAlert[]> {
    return emergencyApiClient.get<EmergencyAlert[]>(
      `/api/emergency/patients/${patientId}/alerts`,
      { active_only: activeOnly }
    );
  },

  // Alert Status Updates
  async acknowledgeAlert(
    alertId: string,
    responderId?: string
  ): Promise<{ success: boolean; message: string }> {
    return emergencyApiClient.patch(`/api/emergency/alerts/${alertId}/acknowledge`, {
      responder_id: responderId,
    });
  },

  async respondToAlert(
    alertId: string,
    responderId: string,
    notes?: string
  ): Promise<{ success: boolean; message: string }> {
    return emergencyApiClient.patch(`/api/emergency/alerts/${alertId}/respond`, {
      responder_id: responderId,
      notes,
    });
  },

  async resolveAlert(
    alertId: string,
    resolutionNotes?: string
  ): Promise<{ success: boolean; message: string }> {
    return emergencyApiClient.patch(`/api/emergency/alerts/${alertId}/resolve`, {
      resolution_notes: resolutionNotes,
    });
  },

  async markFalseAlarm(
    alertId: string,
    notes?: string
  ): Promise<{ success: boolean; message: string }> {
    return emergencyApiClient.patch(`/api/emergency/alerts/${alertId}/false-alarm`, {
      notes,
    });
  },

  // Statistics
  async getStatistics(): Promise<EmergencyStatistics> {
    return emergencyApiClient.get<EmergencyStatistics>('/api/emergency/statistics');
  },
};

/**
 * Server-Sent Events (SSE) Connection for Real-time Emergency Alerts
 * 
 * Usage:
 * ```typescript
 * const unsubscribe = subscribeToEmergencyAlerts((alert) => {
 *   console.log('New emergency:', alert);
 *   // Handle the alert in your UI
 * });
 * 
 * // Later, when component unmounts:
 * unsubscribe();
 * ```
 */
export function subscribeToEmergencyAlerts(
  onAlert: (alert: any) => void,
  onError?: (error: Error) => void
): () => void {
  const eventSource = new EventSource(`${API_ENDPOINTS.EMERGENCY}/api/emergency/stream`);

  eventSource.addEventListener('emergency_alert', (event) => {
    try {
      const alert = JSON.parse(event.data);
      onAlert(alert);
    } catch (error) {
      console.error('Error parsing emergency alert:', error);
      onError?.(error as Error);
    }
  });

  eventSource.addEventListener('ping', (event) => {
    // Keepalive ping - you can log or ignore
    console.debug('Emergency stream keepalive');
  });

  eventSource.onerror = (error) => {
    console.error('Emergency SSE error:', error);
    onError?.(new Error('SSE connection error'));
  };

  // Return cleanup function
  return () => {
    eventSource.close();
  };
}

/**
 * Hook-friendly SSE subscription for React components
 */
export function useEmergencyAlertStream(
  onAlert: (alert: any) => void,
  enabled: boolean = true
) {
  if (typeof window === 'undefined') return; // SSR safety

  let unsubscribe: (() => void) | null = null;

  if (enabled) {
    unsubscribe = subscribeToEmergencyAlerts(onAlert, (error) => {
      console.error('Emergency stream error:', error);
    });
  }

  return () => {
    if (unsubscribe) {
      unsubscribe();
    }
  };
}
