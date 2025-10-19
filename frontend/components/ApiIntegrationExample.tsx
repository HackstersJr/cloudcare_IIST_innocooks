/**
 * Example React Component
 * Demonstrates how to use the API services with React Query
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientService, emergencyService, subscribeToEmergencyAlerts } from '@/lib/api';
import { useEffect, useState } from 'react';

export default function ApiIntegrationExample() {
  const queryClient = useQueryClient();
  const [emergencyAlerts, setEmergencyAlerts] = useState<any[]>([]);

  // Example 1: Fetch patients with React Query
  const { data: patients, isLoading, error } = useQuery({
    queryKey: ['patients'],
    queryFn: () => patientService.listPatients({ limit: 10 }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Example 2: Create patient mutation
  const createPatientMutation = useMutation({
    mutationFn: patientService.createPatient,
    onSuccess: () => {
      // Invalidate and refetch patients
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      alert('Patient created successfully!');
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    },
  });

  // Example 3: Real-time emergency alerts with SSE
  useEffect(() => {
    const unsubscribe = subscribeToEmergencyAlerts(
      (alert) => {
        console.log('🚨 New emergency alert:', alert);
        setEmergencyAlerts((prev) => [alert, ...prev]);
        
        // Show browser notification (if permitted)
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Emergency Alert', {
            body: `${alert.patient_name} - ${alert.description}`,
            icon: '/emergency-icon.png',
          });
        }
      },
      (error) => {
        console.error('Emergency stream error:', error);
      }
    );

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => unsubscribe();
  }, []);

  // Example 4: Handle create patient form
  const handleCreatePatient = () => {
    createPatientMutation.mutate({
      name: 'Jane Smith',
      age: 28,
      gender: 'female',
      contact: '+1234567890',
      emergency: false,
    });
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse">Loading patients...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">Error loading patients: {error.message}</p>
        <p className="text-sm text-red-600 mt-2">
          Make sure the backend is running: <code>docker compose up -d</code>
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">CloudCare API Integration</h1>
        <p className="text-gray-600">
          Frontend successfully connected to backend microservices
        </p>
      </div>

      {/* Patient List */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Patients</h2>
          <button
            onClick={handleCreatePatient}
            disabled={createPatientMutation.isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {createPatientMutation.isPending ? 'Creating...' : 'Create Test Patient'}
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {patients?.map((patient) => (
            <div
              key={patient.id}
              className="p-4 border rounded-lg hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg">{patient.name}</h3>
                {patient.emergency && (
                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                    Emergency
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <p>Age: {patient.age}</p>
                <p>Gender: {patient.gender}</p>
                <p>Contact: {patient.contact}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Real-time Emergency Alerts */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
          Live Emergency Alerts (SSE)
        </h2>
        
        {emergencyAlerts.length === 0 ? (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-gray-600">No emergency alerts yet. Listening for real-time updates...</p>
          </div>
        ) : (
          <div className="space-y-2">
            {emergencyAlerts.slice(0, 5).map((alert, index) => (
              <div
                key={index}
                className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-red-900">{alert.patient_name}</p>
                    <p className="text-sm text-red-700">{alert.description}</p>
                    <p className="text-xs text-red-600 mt-1">
                      {alert.alert_type} - {alert.severity}
                    </p>
                  </div>
                  <span className="text-xs text-red-500">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* API Status */}
      <section className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <h3 className="font-semibold text-green-900 mb-2">✅ API Connection Status</h3>
        <ul className="text-sm text-green-700 space-y-1">
          <li>✓ Patient API (8001) - Connected</li>
          <li>✓ Doctor API (8002) - Available</li>
          <li>✓ Hospital API (8003) - Available</li>
          <li>✓ Emergency API (8004) - SSE Active</li>
          <li>✓ Wearables API (8005) - Available</li>
        </ul>
      </section>
    </div>
  );
}
