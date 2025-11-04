/**
 * API Client Configuration
 * Base configuration for all API calls
 */

// API Base URLs (from docker-compose configuration)
export const API_ENDPOINTS = {
  PATIENT: process.env.NEXT_PUBLIC_PATIENT_API_URL || 'http://localhost:8001',
  DOCTOR: process.env.NEXT_PUBLIC_DOCTOR_API_URL || 'http://localhost:8002',
  HOSPITAL: process.env.NEXT_PUBLIC_HOSPITAL_API_URL || 'http://localhost:8003',
  EMERGENCY: process.env.NEXT_PUBLIC_EMERGENCY_API_URL || 'http://localhost:8004',
  WEARABLES: process.env.NEXT_PUBLIC_WEARABLES_API_URL || 'http://localhost:8005',
} as const;

interface ApiClientOptions {
  headers?: Record<string, string>;
  timeout?: number;
}

class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private timeout: number;

  constructor(baseURL: string, options: ApiClientOptions = {}) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    this.timeout = options.timeout || 30000; // 30 seconds default
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.defaultHeaders,
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json().catch(() => ({
          detail: `HTTP ${response.status}: ${response.statusText}`,
        }));
        throw new Error(error.detail || error.message || 'Request failed');
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return response.json();
      }

      return response.text() as T;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout');
        }
        throw error;
      }
      throw new Error('Unknown error occurred');
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const queryString = params
      ? '?' + new URLSearchParams(params).toString()
      : '';
    return this.request<T>(`${endpoint}${queryString}`, {
      method: 'GET',
    });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }
}

// Create API client instances for each service
export const patientApiClient = new ApiClient(API_ENDPOINTS.PATIENT);
export const doctorApiClient = new ApiClient(API_ENDPOINTS.DOCTOR);
export const hospitalApiClient = new ApiClient(API_ENDPOINTS.HOSPITAL);
export const emergencyApiClient = new ApiClient(API_ENDPOINTS.EMERGENCY);
export const wearablesApiClient = new ApiClient(API_ENDPOINTS.WEARABLES);

export default ApiClient;
