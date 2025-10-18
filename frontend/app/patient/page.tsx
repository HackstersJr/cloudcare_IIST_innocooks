'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { usePatient, usePatientRecords, usePatientConditions } from '@/lib/hooks/usePatient';
import { formatDate, formatRelativeTime } from '@/lib/utils/formatters';

export default function PatientDashboardPage() {
  const router = useRouter();
  const [patientId, setPatientId] = useState<number | null>(null);

  useEffect(() => {
    // Check auth and get patient ID
    const authToken = localStorage.getItem('authToken');
    const storedPatientId = localStorage.getItem('patientId');

    if (!authToken) {
      router.push('/login');
      return;
    }

    if (storedPatientId) {
      setPatientId(parseInt(storedPatientId));
    }
  }, [router]);

  const { data: patient, isLoading: loadingPatient, error: patientError } = usePatient(patientId || 0);
  const { data: records, isLoading: loadingRecords } = usePatientRecords(patientId || 0);
  const { data: conditions, isLoading: loadingConditions } = usePatientConditions(patientId || 0);

  if (!patientId) {
    return (
      <DashboardLayout>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography>Loading...</Typography>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Grid container spacing={3}>
        {/* Emergency Alert Banner */}
        {patient?.emergency && (
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
              {loadingPatient ? (
                <>
                  <Skeleton variant="circular" width={80} height={80} sx={{ mx: 'auto', mb: 2 }} />
                  <Skeleton variant="text" height={40} />
                  <Skeleton variant="text" height={30} />
                </>
              ) : patientError ? (
                <Alert severity="error">Failed to load patient data</Alert>
              ) : (
                <Box sx={{ textAlign: 'center' }}>
                  <Avatar
                    sx={{
                      width: 100,
                      height: 100,
                      mx: 'auto',
                      mb: 2,
                      bgcolor: patient?.emergency ? 'error.main' : 'primary.main',
                      fontSize: '2.5rem',
                    }}
                  >
                    {patient?.name?.[0]?.toUpperCase() || 'P'}
                  </Avatar>

                  <Typography variant="h5" fontWeight={600} gutterBottom>
                    {patient?.name || 'Unknown Patient'}
                  </Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2 }}>
                    <Chip
                      label={`${patient?.age || 0} years`}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                    <Chip
                      label={patient?.gender || 'Unknown'}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Box>

                  {patient?.emergency && (
                    <Chip
                      icon={<WarningIcon />}
                      label="EMERGENCY"
                      color="error"
                      sx={{ mb: 2, fontWeight: 600 }}
                    />
                  )}

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ textAlign: 'left' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                      <PhoneIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                      <Typography variant="body2" color="text.secondary">
                        {patient?.contact || 'No contact'}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PersonIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                      <Typography variant="body2" color="text.secondary">
                        Family: {patient?.familyContact || 'No contact'}
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

              {loadingPatient ? (
                <>
                  <Skeleton variant="text" height={30} />
                  <Skeleton variant="text" height={30} />
                  <Skeleton variant="rectangular" height={100} sx={{ mt: 2 }} />
                </>
              ) : patient?.aiAnalysis ? (
                <Paper
                  sx={{
                    p: 3,
                    backgroundColor: 'warning.light',
                    color: 'warning.dark',
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="body1" sx={{ fontWeight: 500, lineHeight: 1.7 }}>
                    {patient.aiAnalysis}
                  </Typography>
                </Paper>
              ) : (
                <Alert severity="info">
                  No AI analysis available for this patient yet.
                </Alert>
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

              {loadingConditions ? (
                <>
                  <Skeleton variant="rectangular" height={60} sx={{ mb: 1 }} />
                  <Skeleton variant="rectangular" height={60} />
                </>
              ) : conditions && conditions.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {conditions.filter(c => !c.endDate).slice(0, 5).map((condition) => (
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
                        Since: {formatDate(condition.startDate, 'PP')}
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

              {loadingRecords ? (
                <>
                  <Skeleton variant="rectangular" height={80} sx={{ mb: 1 }} />
                  <Skeleton variant="rectangular" height={80} />
                </>
              ) : records && records.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {records.slice(0, 3).map((record) => (
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
                      <Typography variant="body2">
                        {record.description}
                      </Typography>
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
  );
}
