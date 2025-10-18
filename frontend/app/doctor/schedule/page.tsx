'use client';

import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Avatar,
  Divider,
  IconButton,
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Today,
  AccessTime,
  Person,
  LocalHospital,
} from '@mui/icons-material';
import { MOCK_DOCTOR_APPOINTMENTS, MOCK_ASSIGNED_PATIENTS } from '@/constants/doctor';
import type { DoctorAppointment } from '@/types/doctor';

export default function DoctorSchedulePage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const appointments = MOCK_DOCTOR_APPOINTMENTS;

  // Get current month appointments
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Calendar helper functions
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getAppointmentsForDate = (day: number): DoctorAppointment[] => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return appointments.filter((apt) => apt.date === dateStr);
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

  const getPatientName = (patientId: number): string => {
    const patient = MOCK_ASSIGNED_PATIENTS.find((p) => p.id === patientId);
    return patient?.name || 'Unknown Patient';
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Generate calendar days
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDayOfMonth = getFirstDayOfMonth(currentDate);
  const calendarDays: (number | null)[] = [];

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const isToday = (day: number | null) => {
    if (!day) return false;
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    );
  };

  // Get all scheduled appointments sorted by date and time
  const scheduledAppointments = appointments
    .filter((apt) => apt.status === 'scheduled')
    .sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.time.localeCompare(b.time);
    });

  // Get appointment history (completed and cancelled)
  const appointmentHistory = appointments
    .filter((apt) => apt.status !== 'scheduled')
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Schedule
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View and manage your appointments
        </Typography>
      </Box>

      {/* Calendar */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          {/* Calendar Header */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 3,
            }}
          >
            <Typography variant="h5" fontWeight="600">
              {monthNames[currentMonth]} {currentYear}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button variant="outlined" size="small" startIcon={<Today />} onClick={goToToday}>
                Today
              </Button>
              <IconButton onClick={previousMonth}>
                <ChevronLeft />
              </IconButton>
              <IconButton onClick={nextMonth}>
                <ChevronRight />
              </IconButton>
            </Box>
          </Box>

          {/* Day Names */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: 1,
              mb: 1,
            }}
          >
            {dayNames.map((day) => (
              <Box
                key={day}
                sx={{
                  textAlign: 'center',
                  py: 1,
                  fontWeight: 600,
                  color: 'text.secondary',
                  fontSize: '0.875rem',
                }}
              >
                {day}
              </Box>
            ))}
          </Box>

          {/* Calendar Grid */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: 1,
            }}
          >
            {calendarDays.map((day, index) => {
              const dayAppointments = day ? getAppointmentsForDate(day) : [];
              const hasAppointments = dayAppointments.length > 0;

              return (
                <Box
                  key={index}
                  sx={{
                    minHeight: 100,
                    border: 1,
                    borderColor: isToday(day) ? 'primary.main' : 'divider',
                    borderRadius: 1,
                    p: 1,
                    backgroundColor: day ? 'background.paper' : 'action.hover',
                    position: 'relative',
                    '&:hover': {
                      backgroundColor: day ? 'action.hover' : undefined,
                    },
                  }}
                >
                  {day && (
                    <>
                      <Typography
                        variant="body2"
                        fontWeight={isToday(day) ? 700 : 500}
                        sx={{
                          color: isToday(day) ? 'primary.main' : 'text.primary',
                        }}
                      >
                        {day}
                      </Typography>
                      {hasAppointments && (
                        <Box sx={{ mt: 0.5 }}>
                          {dayAppointments.slice(0, 2).map((apt) => (
                            <Box
                              key={apt.id}
                              sx={{
                                fontSize: '0.65rem',
                                p: 0.5,
                                mb: 0.5,
                                borderRadius: 0.5,
                                bgcolor: `${getStatusColor(apt.status)}.light`,
                                color: `${getStatusColor(apt.status)}.dark`,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {formatTime(apt.time)}
                            </Box>
                          ))}
                          {dayAppointments.length > 2 && (
                            <Typography
                              variant="caption"
                              sx={{
                                fontSize: '0.65rem',
                                color: 'text.secondary',
                              }}
                            >
                              +{dayAppointments.length - 2} more
                            </Typography>
                          )}
                        </Box>
                      )}
                    </>
                  )}
                </Box>
              );
            })}
          </Box>
        </CardContent>
      </Card>

      {/* Upcoming Appointments */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="600" gutterBottom>
            Upcoming Appointments ({scheduledAppointments.length})
          </Typography>
          <Divider sx={{ my: 2 }} />

          {scheduledAppointments.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {scheduledAppointments.map((appointment) => (
                <Card key={appointment.id} variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <Avatar
                        sx={{
                          width: 50,
                          height: 50,
                          bgcolor: 'primary.main',
                        }}
                      >
                        {getPatientName(appointment.patientId)
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </Avatar>

                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant="h6" fontWeight="600">
                            {getPatientName(appointment.patientId)}
                          </Typography>
                          <Chip
                            label={appointment.status}
                            color={getStatusColor(appointment.status)}
                            size="small"
                          />
                        </Box>

                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Today sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {appointment.date}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <AccessTime sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {formatTime(appointment.time)}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <LocalHospital sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {appointment.department}
                            </Typography>
                          </Box>
                        </Box>

                        {appointment.reason && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Reason: {appointment.reason}
                          </Typography>
                        )}
                        {appointment.notes && (
                          <Typography
                            variant="body2"
                            sx={{ mt: 0.5, fontStyle: 'italic', color: 'text.secondary' }}
                          >
                            Notes: {appointment.notes}
                          </Typography>
                        )}
                      </Box>

                      <Button variant="outlined" size="small">
                        View
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          ) : (
            <Typography variant="body1" color="text.secondary" textAlign="center" py={4}>
              No upcoming appointments
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Appointment History */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight="600" gutterBottom>
            Appointment History
          </Typography>
          <Divider sx={{ my: 2 }} />

          {appointmentHistory.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {appointmentHistory.map((appointment) => (
                <Card key={appointment.id} variant="outlined" sx={{ opacity: 0.8 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <Avatar
                        sx={{
                          width: 50,
                          height: 50,
                          bgcolor: 'grey.400',
                        }}
                      >
                        {getPatientName(appointment.patientId)
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </Avatar>

                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant="h6" fontWeight="600">
                            {getPatientName(appointment.patientId)}
                          </Typography>
                          <Chip
                            label={appointment.status}
                            color={getStatusColor(appointment.status)}
                            size="small"
                          />
                        </Box>

                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Today sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {appointment.date}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <AccessTime sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {formatTime(appointment.time)}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <LocalHospital sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {appointment.department}
                            </Typography>
                          </Box>
                        </Box>

                        {appointment.notes && (
                          <Typography
                            variant="body2"
                            sx={{ mt: 1, fontStyle: 'italic', color: 'text.secondary' }}
                          >
                            Notes: {appointment.notes}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          ) : (
            <Typography variant="body1" color="text.secondary" textAlign="center" py={4}>
              No appointment history
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
