'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Chip,
  Skeleton,
  Alert,
  AlertTitle,
  Paper,
  Divider,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import WarningIcon from '@mui/icons-material/Warning';
import PsychologyIcon from '@mui/icons-material/Psychology';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { FALLBACK_PATIENT_ID, getPatientById, type PatientSnapshot } from '@/lib/mockData';
import { usePatient, usePatientRecords, usePatientConditions } from '@/lib/hooks/usePatient';
import { formatDate, formatRelativeTime } from '@/lib/utils/formatters';

export default function PatientDashboardPage() {
  const [patientId, setPatientId] = useState<number>(FALLBACK_PATIENT_ID);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedPatientId = window.localStorage.getItem('patientId');
      const parsedId = storedPatientId ? Number.parseInt(storedPatientId, 10) : NaN;

      if (!Number.isNaN(parsedId) && getPatientById(parsedId)) {
        setPatientId(parsedId);
      } else {
        window.localStorage.setItem('patientId', String(FALLBACK_PATIENT_ID));
      }
    } catch (error) {
      // Access to localStorage can fail in private mode; fall back silently.
      console.warn('Unable to read patientId from storage. Falling back to demo data.', error);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 350);
    return () => window.clearTimeout(timer);
  }, []);

  // Use React Query hooks to load patient data
  const { data: patient, isLoading: loadingPatient, error: patientError } = usePatient(patientId || 0, !!patientId);
  const { data: records, isLoading: loadingRecords } = usePatientRecords(patientId || 0, !!patientId);
  const { data: conditions, isLoading: loadingConditions } = usePatientConditions(patientId || 0, !!patientId);

  // The API 'patient' type is slimmer; coerce/merge with our local PatientSnapshot shape
  const patientData: PatientSnapshot | undefined = (patient as unknown as PatientSnapshot) ?? getPatientById(patientId) ?? getPatientById(FALLBACK_PATIENT_ID);

  const activeConditions = useMemo(() => {
    return (conditions ?? patientData?.conditions ?? []).filter((condition) => !condition.endDate);
  }, [conditions, patientData]);

  const latestRecords = useMemo(() => {
    return (records ?? patientData?.records ?? [])
      .slice()
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [records, patientData]);

  if (!patientData) {
    return (
      <DashboardLayout>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Alert severity="error">Unable to load patient overview.</Alert>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <>
      <DashboardLayout>
        <Grid container spacing={3}>
        {/* Emergency Alert Banner */}
        {patientData.emergency && (
          <Grid size={{ xs: 12 }}>
            <Alert
              severity="error"
              icon={<WarningIcon />}
              sx={{
                borderRadius: 2,
                fontWeight: 500,
              }}
            >
              <AlertTitle sx={{ fontWeight: 700 }}>EMERGENCY STATUS ACTIVE</AlertTitle>
              This patient has an active emergency flag. Immediate attention may be required.
            </Alert>
          </Grid>
        )}

        {/* Patient Profile Card */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: '100%', borderRadius: 3 }}>
            <CardContent>
              {loading ? (
                <>
                  <Skeleton variant="circular" width={80} height={80} sx={{ mx: 'auto', mb: 2 }} />
                  <Skeleton variant="text" height={40} />
                  <Skeleton variant="text" height={30} />
                </>
              ) : (
                <Box sx={{ textAlign: 'center' }}>
                  <Avatar
                    sx={{
                      width: 100,
                      height: 100,
                      mx: 'auto',
                      mb: 2,
                      bgcolor: patientData?.emergency ? 'error.main' : 'primary.main',
                      fontSize: '2.5rem',
                    }}
                  >
                    {patientData.name?.[0]?.toUpperCase() || 'P'}
                  </Avatar>

                  <Typography variant="h5" fontWeight={600} gutterBottom>
                    {patientData.name || 'Unknown Patient'}
                  </Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    <Chip label={`${patientData.age} years`} size="small" color="primary" variant="outlined" />
                    <Chip label={patientData.gender} size="small" color="primary" variant="outlined" />
                    <Chip label={`Blood ${patientData.bloodType}`} size="small" color="primary" variant="outlined" />
                    <Chip label={patientData.occupation} size="small" color="primary" variant="outlined" />
                  </Box>

                  {patientData.emergency && (
                    <Chip
                      icon={<WarningIcon />}
                      label="EMERGENCY"
                      color="error"
                      sx={{ mb: 2, fontWeight: 600 }}
                    />
                  )}

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PersonIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                      <Typography variant="body2" color="text.secondary">
                        {patientData.address}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PhoneIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                      <Typography variant="body2" color="text.secondary">
                        {patientData.contact}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PersonIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                      <Typography variant="body2" color="text.secondary">
                        Family: {patientData.familyContact}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.25 }}>
                        Insurance
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {patientData.insuranceProvider} • {patientData.insuranceId}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* AI Analytics Section */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ height: '100%', borderRadius: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PsychologyIcon sx={{ color: 'primary.main', mr: 1 }} />
                <Typography variant="h6" fontWeight={600}>
                  AI Health Analysis
                </Typography>
              </Box>

              {loading ? (
                <>
                  <Skeleton variant="text" height={30} />
                  <Skeleton variant="text" height={30} />
                  <Skeleton variant="rectangular" height={100} sx={{ mt: 2 }} />
                </>
              ) : patientData.aiAnalysis ? (
                <Paper
                  sx={{
                    p: 3,
                    backgroundColor: 'warning.light',
                    color: 'warning.dark',
                    borderRadius: 2,
                  }}
                >
                    <Typography variant="body1" sx={{ fontWeight: 500, lineHeight: 1.7 }}>
                    {patientData.aiAnalysis}
                  </Typography>
                </Paper>
              ) : (
                <Alert severity="info">No AI analysis available for this patient yet.</Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Patient Conditions */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Current Conditions
              </Typography>

              {loading ? (
                <>
                  <Skeleton variant="rectangular" height={60} sx={{ mb: 1 }} />
                  <Skeleton variant="rectangular" height={60} />
                </>
              ) : activeConditions.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {activeConditions.slice(0, 5).map((condition) => (
                    <Paper
                      key={condition.id}
                      sx={{
                        p: 2,
                        backgroundColor: 'background.default',
                        borderLeft: 3,
                        borderColor: 'error.main',
                      }}
                    >
                      <Typography variant="body1" fontWeight={600}>
                        {condition.condition}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Since: {formatDate(condition.startDate, 'short')}
                      </Typography>
                    </Paper>
                  ))}
                </Box>
              ) : (
                <Alert severity="success">No active medical conditions recorded.</Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Medical Records */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Recent Medical Records
              </Typography>

              {loading ? (
                <>
                  <Skeleton variant="rectangular" height={80} sx={{ mb: 1 }} />
                  <Skeleton variant="rectangular" height={80} />
                </>
              ) : latestRecords.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {latestRecords.slice(0, 3).map((record) => (
                    <Paper
                      key={record.id}
                      sx={{
                        p: 2,
                        backgroundColor: 'background.default',
                        borderLeft: 3,
                        borderColor: 'primary.main',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <LocalHospitalIcon sx={{ fontSize: 18, mr: 1, color: 'primary.main' }} />
                        <Typography variant="caption" color="text.secondary">
                          {formatRelativeTime(record.date)}
                        </Typography>
                      </Box>
                      <Typography variant="body2">{record.description}</Typography>
                    </Paper>
                  ))}
                </Box>
              ) : (
                <Alert severity="info">No medical records available.</Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      </DashboardLayout>
    </>
  );
}
