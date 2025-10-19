'use client';

import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import PeopleIcon from '@mui/icons-material/People';
import EmergencyIcon from '@mui/icons-material/LocalHospital';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useHospitalStats, useWeeklyEmergencyData, usePatientDistribution, useEmergencyCases, useDepartments } from '@/hooks/useHospital';
import {
  MOCK_HOSPITAL_STATS,
  MOCK_WEEKLY_EMERGENCY_DATA,
  MOCK_PATIENT_DISTRIBUTION,
  MOCK_EMERGENCY_CASES,
  MOCK_DEPARTMENTS,
} from '@/constants/hospital';
import { ChatBot } from '@/components/chatbot/ChatBot';

export default function HospitalDashboard() {
  // Using mock data for now - will switch to real data when backend is ready
  const statsData = MOCK_HOSPITAL_STATS;
  const weeklyData = MOCK_WEEKLY_EMERGENCY_DATA;
  const patientDistribution = MOCK_PATIENT_DISTRIBUTION;
  const emergencyCases = MOCK_EMERGENCY_CASES.slice(0, 5); // Show top 5
  const departments = MOCK_DEPARTMENTS;

  const statCards = [
    {
      title: 'Admitted Patients',
      value: statsData.admittedPatients,
      icon: <LocalHospitalIcon sx={{ fontSize: 40 }} />,
      color: '#0ea5e9',
      bgColor: 'rgba(14, 165, 233, 0.1)',
    },
    {
      title: 'Available Doctors',
      value: statsData.availableDoctors,
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      color: '#06b6d4',
      bgColor: 'rgba(6, 182, 212, 0.1)',
    },
    {
      title: 'Emergency Cases',
      value: statsData.emergencyCases,
      icon: <EmergencyIcon sx={{ fontSize: 40 }} />,
      color: '#ef4444',
      bgColor: 'rgba(239, 68, 68, 0.1)',
    },
    {
      title: 'Avg Response Time',
      value: statsData.avgResponseTime,
      icon: <AccessTimeIcon sx={{ fontSize: 40 }} />,
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.1)',
    },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-treatment':
        return 'primary';
      case 'stable':
        return 'success';
      case 'waiting':
        return 'warning';
      case 'discharged':
        return 'default';
      default:
        return 'default';
    }
  };

  const getDepartmentStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'success';
      case 'low':
        return 'warning';
      case 'critical':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <>
      <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Hospital Dashboard
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Real-time hospital operations overview
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={3}>
        {statCards.map((stat, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
            <Card
              elevation={0}
              sx={{
                border: '1px solid #e0e0e0',
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                },
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {stat.value}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: 2,
                      backgroundColor: stat.bgColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: stat.color,
                    }}
                  >
                    {stat.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} mb={3}>
        {/* Emergency Cases Weekly Bar Chart */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0', height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                Emergency Cases (Weekly)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="cases" fill="#0ea5e9" name="Emergency Cases" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Patient Distribution Pie Chart */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0', height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                Patient Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={patientDistribution as any}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ department, percentage }) => `${department} ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {patientDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Emergency Cases & Department Overview */}
      <Grid container spacing={3}>
        {/* Recent Emergency Cases */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                Recent Emergency Cases
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Patient ID</TableCell>
                      <TableCell>Condition</TableCell>
                      <TableCell>Severity</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Doctor</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {emergencyCases.map((emergency) => (
                      <TableRow key={emergency.id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight="600">
                            {emergency.patientId}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {emergency.patientName}
                          </Typography>
                        </TableCell>
                        <TableCell>{emergency.condition}</TableCell>
                        <TableCell>
                          <Chip
                            label={emergency.severity.toUpperCase()}
                            color={getSeverityColor(emergency.severity)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={emergency.status}
                            color={getStatusColor(emergency.status)}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{emergency.assignedDoctor}</Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Department Overview */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                Department Overview
              </Typography>
              {departments.map((dept) => {
                const utilizationPercentage = (dept.occupiedBeds / dept.totalBeds) * 100;
                return (
                  <Box key={dept.id} mb={2}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                      <Typography variant="body2" fontWeight="600">
                        {dept.name}
                      </Typography>
                      <Box display="flex" gap={1} alignItems="center">
                        <Typography variant="caption" color="text.secondary">
                          {dept.occupiedBeds}/{dept.totalBeds} beds
                        </Typography>
                        <Chip
                          label={dept.status}
                          color={getDepartmentStatusColor(dept.status)}
                          size="small"
                        />
                      </Box>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={utilizationPercentage}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: 'rgba(0, 0, 0, 0.1)',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 4,
                          backgroundColor:
                            dept.status === 'critical'
                              ? '#ef4444'
                              : dept.status === 'low'
                              ? '#f59e0b'
                              : '#10b981',
                        },
                      }}
                    />
                    <Typography variant="caption" color="text.secondary" mt={0.5}>
                      Head: {dept.headDoctor}
                    </Typography>
                  </Box>
                );
              })}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
    <ChatBot />
    </>
  );
}
