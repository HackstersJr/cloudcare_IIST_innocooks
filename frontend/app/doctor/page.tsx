'use client';

import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Avatar,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from '@mui/material';
import {
  People,
  CalendarToday,
  Warning,
  Description,
  Search,
  PersonAdd,
  Favorite,
  WaterDrop,
  LocalHospital,
  Visibility,
  Close,
} from '@mui/icons-material';
import {
  MOCK_DOCTOR_STATS,
  MOCK_EMERGENCY_ALERTS,
  MOCK_ASSIGNED_PATIENTS,
} from '@/constants/doctor';
import type { AssignedPatient, EmergencyAlert } from '@/types/doctor';

export default function DoctorDashboardPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAlert, setSelectedAlert] = useState<EmergencyAlert | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<AssignedPatient | null>(null);
  const stats = MOCK_DOCTOR_STATS;
  const alerts = MOCK_EMERGENCY_ALERTS;
  const patients = MOCK_ASSIGNED_PATIENTS;

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.condition.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'stable':
        return 'success';
      case 'monitoring':
        return 'warning';
      case 'critical':
        return 'error';
      default:
        return 'default';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return '#d32f2f';
      case 'high':
        return '#f57c00';
      case 'medium':
        return '#fbc02d';
      case 'low':
        return '#388e3c';
      default:
        return '#757575';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'heart_rate':
        return <Favorite sx={{ fontSize: 20 }} />;
      case 'oxygen_level':
        return <WaterDrop sx={{ fontSize: 20 }} />;
      case 'blood_pressure':
      case 'emergency':
        return <Warning sx={{ fontSize: 20 }} />;
      default:
        return <LocalHospital sx={{ fontSize: 20 }} />;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} mins ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${Math.floor(diffHours / 24)} days ago`;
  };

  return (
    <Box>
      {/* Welcome Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Good Morning, Dr. Sarah 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          You have {stats.todaysAppointments} appointments today
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(4, 1fr)',
          },
          gap: 3,
          mb: 4,
        }}
      >
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Total Patients
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {stats.totalPatients}
                </Typography>
              </Box>
              <People sx={{ fontSize: 40, color: 'primary.main' }} />
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Today's Appointments
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {stats.todaysAppointments}
                </Typography>
              </Box>
              <CalendarToday sx={{ fontSize: 40, color: 'info.main' }} />
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Active Alerts
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {stats.activeAlerts}
                </Typography>
              </Box>
              <Warning sx={{ fontSize: 40, color: 'error.main' }} />
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Pending Reports
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {stats.pendingReports}
                </Typography>
              </Box>
              <Description sx={{ fontSize: 40, color: 'warning.main' }} />
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Real-time Alerts */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Warning sx={{ color: 'error.main', mr: 1 }} />
            <Typography variant="h6" fontWeight="bold">
              Real-time Alerts
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Emergency notifications from patients
          </Typography>

          {alerts.length > 0 ? (
            alerts.map((alert) => (
              <Alert
                key={alert.id}
                severity="error"
                sx={{
                  mb: 2,
                  borderLeft: 4,
                  borderColor: getSeverityColor(alert.severity),
                }}
                action={
                  <Button size="small" onClick={() => setSelectedAlert(alert)}>
                    View
                  </Button>
                }
                icon={getAlertIcon(alert.alertType)}
              >
                <Box>
                  <Typography variant="body1" fontWeight="600">
                    {alert.patientName}
                  </Typography>
                  <Typography variant="body2">{alert.message}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatTimeAgo(alert.timestamp)}
                  </Typography>
                </Box>
              </Alert>
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">
              No active alerts
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Assigned Patients */}
      <Card>
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 3,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <People sx={{ color: 'primary.main', mr: 1 }} />
              <Typography variant="h6" fontWeight="bold">
                Assigned Patients
              </Typography>
            </Box>
            <Button variant="contained" startIcon={<PersonAdd />}>
              Add Patient
            </Button>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Search and manage your patients
          </Typography>

          {/* Search */}
          <TextField
            fullWidth
            placeholder="Search by name or condition..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />

          {/* Patient Cards */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {filteredPatients.map((patient) => (
              <Card variant="outlined" key={patient.id}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar
                        sx={{
                          width: 50,
                          height: 50,
                          bgcolor: 'primary.main',
                          fontSize: '1.25rem',
                        }}
                      >
                        {patient.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </Avatar>

                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant="h6" fontWeight="600">
                            {patient.name}
                          </Typography>
                          <Chip
                            label={patient.status}
                            color={getStatusColor(patient.status)}
                            size="small"
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {patient.age} years • {patient.gender} • {patient.condition}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Next: {patient.nextAppointment || 'Not scheduled'}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => setSelectedPatient(patient)}
                        >
                          View Details
                        </Button>
                        <Button variant="contained" size="small">
                          Update
                        </Button>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Alert Details Dialog */}
      <Dialog
        open={Boolean(selectedAlert)}
        onClose={() => setSelectedAlert(null)}
        maxWidth="sm"
        fullWidth
      >
        {selectedAlert && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Alert Details
                <IconButton onClick={() => setSelectedAlert(null)}>
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Patient
                </Typography>
                <Typography variant="h6" fontWeight="600">
                  {selectedAlert.patientName}
                </Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Alert Type
                </Typography>
                <Chip
                  label={selectedAlert.alertType.replace('_', ' ').toUpperCase()}
                  color="error"
                  size="small"
                />
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Message
                </Typography>
                <Typography variant="body1">{selectedAlert.message}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Time
                </Typography>
                <Typography variant="body1">{formatTimeAgo(selectedAlert.timestamp)}</Typography>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedAlert(null)}>Close</Button>
              <Button variant="contained">View Patient</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Patient Details Dialog */}
      <Dialog
        open={Boolean(selectedPatient)}
        onClose={() => setSelectedPatient(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedPatient && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Patient Details
                <IconButton onClick={() => setSelectedPatient(null)}>
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
                  gap: 2,
                }}
              >
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Name
                  </Typography>
                  <Typography variant="body1" fontWeight="600">
                    {selectedPatient.name}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Age
                  </Typography>
                  <Typography variant="body1" fontWeight="600">
                    {selectedPatient.age} years
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Gender
                  </Typography>
                  <Typography variant="body1" fontWeight="600">
                    {selectedPatient.gender}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Status
                  </Typography>
                  <Chip label={selectedPatient.status} color={getStatusColor(selectedPatient.status)} size="small" />
                </Box>
                <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Condition
                  </Typography>
                  <Typography variant="body1" fontWeight="600">
                    {selectedPatient.condition}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Next Appointment
                  </Typography>
                  <Typography variant="body1" fontWeight="600">
                    {selectedPatient.nextAppointment || 'Not scheduled'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Last Visit
                  </Typography>
                  <Typography variant="body1" fontWeight="600">
                    {selectedPatient.lastVisit || 'No previous visits'}
                  </Typography>
                </Box>
                <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Contact
                  </Typography>
                  <Typography variant="body1" fontWeight="600">
                    {selectedPatient.contact}
                  </Typography>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedPatient(null)}>Close</Button>
              <Button variant="contained">Update Patient</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
