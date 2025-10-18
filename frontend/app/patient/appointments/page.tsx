'use client';

import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  Tab,
  Tabs,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Divider,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  AccessTime as TimeIcon,
  LocalHospital as HospitalIcon,
  Person as DoctorIcon,
  Add as AddIcon,
  Cancel as CancelIcon,
  CheckCircle as CompleteIcon,
  Schedule as ScheduleIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { formatDate } from '@/lib/utils/formatters';
import type { AppointmentWithDetails } from '@/types/patient';

// Mock data - Replace with actual API calls when backend is ready
const MOCK_APPOINTMENTS: AppointmentWithDetails[] = [
  {
    id: 1,
    patientId: 1,
    doctorId: 1,
    hospitalId: 1,
    appointmentDate: '2025-10-25',
    appointmentTime: '10:00',
    department: 'Cardiology',
    status: 'scheduled',
    notes: 'Regular checkup for blood pressure',
    doctor: {
      id: 1,
      name: 'Dr. Sarah Johnson',
      age: 45,
      gender: 'Female',
      contact: '+91-9876543210',
      specializations: 'Cardiology, Internal Medicine',
    },
    hospital: {
      id: 1,
      name: 'City General Hospital',
    },
  },
  {
    id: 2,
    patientId: 1,
    doctorId: 2,
    hospitalId: 1,
    appointmentDate: '2025-10-28',
    appointmentTime: '14:30',
    department: 'General Medicine',
    status: 'scheduled',
    notes: 'Follow-up consultation',
    doctor: {
      id: 2,
      name: 'Dr. Amit Patel',
      age: 38,
      gender: 'Male',
      contact: '+91-9876543211',
      specializations: 'General Medicine',
    },
    hospital: {
      id: 1,
      name: 'City General Hospital',
    },
  },
  {
    id: 3,
    patientId: 1,
    doctorId: 1,
    hospitalId: 1,
    appointmentDate: '2025-10-15',
    appointmentTime: '11:00',
    department: 'Cardiology',
    status: 'completed',
    notes: 'ECG test completed',
    doctor: {
      id: 1,
      name: 'Dr. Sarah Johnson',
      age: 45,
      gender: 'Female',
      contact: '+91-9876543210',
      specializations: 'Cardiology, Internal Medicine',
    },
    hospital: {
      id: 1,
      name: 'City General Hospital',
    },
  },
  {
    id: 4,
    patientId: 1,
    doctorId: 3,
    hospitalId: 2,
    appointmentDate: '2025-10-12',
    appointmentTime: '09:30',
    department: 'Orthopedics',
    status: 'cancelled',
    notes: 'Patient rescheduled',
    doctor: {
      id: 3,
      name: 'Dr. Priya Sharma',
      age: 42,
      gender: 'Female',
      contact: '+91-9876543212',
      specializations: 'Orthopedics',
    },
    hospital: {
      id: 2,
      name: 'Metro Medical Center',
    },
  },
];

const MOCK_DOCTORS = [
  { id: 1, name: 'Dr. Sarah Johnson', specialization: 'Cardiology' },
  { id: 2, name: 'Dr. Amit Patel', specialization: 'General Medicine' },
  { id: 3, name: 'Dr. Priya Sharma', specialization: 'Orthopedics' },
  { id: 4, name: 'Dr. Rajesh Kumar', specialization: 'Neurology' },
];

const MOCK_HOSPITALS = [
  { id: 1, name: 'City General Hospital' },
  { id: 2, name: 'Metro Medical Center' },
  { id: 3, name: 'Sunrise Clinic' },
];

const DEPARTMENTS = [
  'Cardiology',
  'General Medicine',
  'Orthopedics',
  'Neurology',
  'Dermatology',
  'Pediatrics',
  'Gynecology',
  'ENT',
];

export default function AppointmentsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [openNewDialog, setOpenNewDialog] = useState(false);
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>(MOCK_APPOINTMENTS);
  
  // New appointment form state
  const [newAppointment, setNewAppointment] = useState({
    doctorId: '',
    hospitalId: '',
    department: '',
    date: new Date(),
    time: new Date(),
    notes: '',
  });

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'primary';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <ScheduleIcon fontSize="small" />;
      case 'completed':
        return <CompleteIcon fontSize="small" />;
      case 'cancelled':
        return <CancelIcon fontSize="small" />;
      default:
        return null;
    }
  };

  const filterAppointments = (status?: string) => {
    if (!status) return appointments;
    return appointments.filter((apt) => apt.status === status);
  };

  const getFilteredAppointments = () => {
    switch (activeTab) {
      case 0: // All
        return appointments;
      case 1: // Upcoming
        return filterAppointments('scheduled');
      case 2: // Completed
        return filterAppointments('completed');
      case 3: // Cancelled
        return filterAppointments('cancelled');
      default:
        return appointments;
    }
  };

  const handleCancelAppointment = (id: number) => {
    setAppointments(
      appointments.map((apt) =>
        apt.id === id ? { ...apt, status: 'cancelled' as const } : apt
      )
    );
  };

  const handleCreateAppointment = () => {
    const doctor = MOCK_DOCTORS.find((d) => d.id.toString() === newAppointment.doctorId);
    const hospital = MOCK_HOSPITALS.find((h) => h.id.toString() === newAppointment.hospitalId);

    if (!doctor || !hospital) {
      alert('Please select a doctor and hospital');
      return;
    }

    const newApt: AppointmentWithDetails = {
      id: appointments.length + 1,
      patientId: 1,
      doctorId: parseInt(newAppointment.doctorId),
      hospitalId: parseInt(newAppointment.hospitalId),
      appointmentDate: newAppointment.date.toISOString().split('T')[0],
      appointmentTime: newAppointment.time.toTimeString().slice(0, 5),
      department: newAppointment.department,
      status: 'scheduled',
      notes: newAppointment.notes,
      doctor: {
        id: doctor.id,
        name: doctor.name,
        age: 40,
        gender: 'Unknown',
        contact: '+91-9876543210',
        specializations: doctor.specialization,
      },
      hospital: {
        id: hospital.id,
        name: hospital.name,
      },
    };

    setAppointments([newApt, ...appointments]);
    setOpenNewDialog(false);
    
    // Reset form
    setNewAppointment({
      doctorId: '',
      hospitalId: '',
      department: '',
      date: new Date(),
      time: new Date(),
      notes: '',
    });
  };

  const filteredAppointments = getFilteredAppointments();
  const sortedAppointments = [...filteredAppointments].sort(
    (a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime()
  );

  return (
    <DashboardLayout>
      <Grid container spacing={3}>
        {/* Page Header */}
        <Grid size={{ xs: 12 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h4" fontWeight={600} gutterBottom>
                My Appointments
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage your medical appointments and consultations
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenNewDialog(true)}
              sx={{ borderRadius: 2 }}
            >
              New Appointment
            </Button>
          </Box>
        </Grid>

        {/* Info Alert */}
        <Grid size={{ xs: 12 }}>
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            You have <strong>{filterAppointments('scheduled').length}</strong> upcoming appointment(s).
            Make sure to arrive 15 minutes early for check-in.
          </Alert>
        </Grid>

        {/* Tabs */}
        <Grid size={{ xs: 12 }}>
          <Card sx={{ borderRadius: 3 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label={`All (${appointments.length})`} />
              <Tab label={`Upcoming (${filterAppointments('scheduled').length})`} />
              <Tab label={`Completed (${filterAppointments('completed').length})`} />
              <Tab label={`Cancelled (${filterAppointments('cancelled').length})`} />
            </Tabs>

            <CardContent>
              {sortedAppointments.length === 0 ? (
                <Box
                  sx={{
                    py: 8,
                    textAlign: 'center',
                  }}
                >
                  <CalendarIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No appointments found
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    {activeTab === 1 && "You don't have any upcoming appointments"}
                    {activeTab === 2 && "No completed appointments yet"}
                    {activeTab === 3 && "No cancelled appointments"}
                    {activeTab === 0 && "Get started by scheduling a new appointment"}
                  </Typography>
                  {activeTab === 0 && (
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => setOpenNewDialog(true)}
                    >
                      Schedule Appointment
                    </Button>
                  )}
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {sortedAppointments.map((appointment) => (
                    <Grid size={{ xs: 12 }} key={appointment.id}>
                      <Card
                        variant="outlined"
                        sx={{
                          borderRadius: 2,
                          transition: 'all 0.2s',
                          '&:hover': {
                            boxShadow: 2,
                            borderColor: 'primary.main',
                          },
                        }}
                      >
                        <CardContent>
                          <Grid container spacing={2}>
                            {/* Date & Time */}
                            <Grid size={{ xs: 12, sm: 3 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <CalendarIcon sx={{ fontSize: 20, color: 'primary.main', mr: 1 }} />
                                <Typography variant="body1" fontWeight={600}>
                                  {formatDate(new Date(appointment.appointmentDate))}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <TimeIcon sx={{ fontSize: 20, color: 'text.secondary', mr: 1 }} />
                                <Typography variant="body2" color="text.secondary">
                                  {appointment.appointmentTime}
                                </Typography>
                              </Box>
                            </Grid>

                            {/* Doctor & Hospital */}
                            <Grid size={{ xs: 12, sm: 5 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <DoctorIcon sx={{ fontSize: 20, color: 'primary.main', mr: 1 }} />
                                <Typography variant="body1" fontWeight={600}>
                                  {appointment.doctor?.name}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <HospitalIcon sx={{ fontSize: 20, color: 'text.secondary', mr: 1 }} />
                                <Typography variant="body2" color="text.secondary">
                                  {appointment.hospital?.name}
                                </Typography>
                              </Box>
                              <Chip
                                label={appointment.department}
                                size="small"
                                sx={{ mt: 0.5 }}
                              />
                            </Grid>

                            {/* Status & Actions */}
                            <Grid size={{ xs: 12, sm: 4 }}>
                              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                                <Chip
                                  label={appointment.status.toUpperCase()}
                                  color={getStatusColor(appointment.status)}
                                  icon={getStatusIcon(appointment.status) || undefined}
                                  size="small"
                                />
                                
                                {appointment.notes && (
                                  <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'right', mt: 1 }}>
                                    Note: {appointment.notes}
                                  </Typography>
                                )}

                                {appointment.status === 'scheduled' && (
                                  <Button
                                    variant="outlined"
                                    color="error"
                                    size="small"
                                    startIcon={<CancelIcon />}
                                    onClick={() => handleCancelAppointment(appointment.id)}
                                    sx={{ mt: 1 }}
                                  >
                                    Cancel
                                  </Button>
                                )}
                              </Box>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* New Appointment Dialog */}
      <Dialog
        open={openNewDialog}
        onClose={() => setOpenNewDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight={600}>
              Schedule New Appointment
            </Typography>
            <IconButton onClick={() => setOpenNewDialog(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  select
                  fullWidth
                  label="Select Doctor"
                  value={newAppointment.doctorId}
                  onChange={(e) =>
                    setNewAppointment({ ...newAppointment, doctorId: e.target.value })
                  }
                >
                  {MOCK_DOCTORS.map((doctor) => (
                    <MenuItem key={doctor.id} value={doctor.id}>
                      {doctor.name} - {doctor.specialization}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  select
                  fullWidth
                  label="Select Hospital"
                  value={newAppointment.hospitalId}
                  onChange={(e) =>
                    setNewAppointment({ ...newAppointment, hospitalId: e.target.value })
                  }
                >
                  {MOCK_HOSPITALS.map((hospital) => (
                    <MenuItem key={hospital.id} value={hospital.id}>
                      {hospital.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  select
                  fullWidth
                  label="Department"
                  value={newAppointment.department}
                  onChange={(e) =>
                    setNewAppointment({ ...newAppointment, department: e.target.value })
                  }
                >
                  {DEPARTMENTS.map((dept) => (
                    <MenuItem key={dept} value={dept}>
                      {dept}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <DatePicker
                  label="Appointment Date"
                  value={newAppointment.date}
                  onChange={(date: Date | null) =>
                    setNewAppointment({ ...newAppointment, date: date || new Date() })
                  }
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TimePicker
                  label="Appointment Time"
                  value={newAppointment.time}
                  onChange={(time: Date | null) =>
                    setNewAppointment({ ...newAppointment, time: time || new Date() })
                  }
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Notes (Optional)"
                  value={newAppointment.notes}
                  onChange={(e) =>
                    setNewAppointment({ ...newAppointment, notes: e.target.value })
                  }
                  placeholder="Any specific concerns or requirements..."
                />
              </Grid>
            </Grid>
          </LocalizationProvider>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenNewDialog(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleCreateAppointment}
            variant="contained"
            disabled={
              !newAppointment.doctorId ||
              !newAppointment.hospitalId ||
              !newAppointment.department
            }
          >
            Schedule Appointment
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}
