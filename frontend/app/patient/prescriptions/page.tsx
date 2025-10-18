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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Alert,
  Divider,
} from '@mui/material';
import {
  Medication as MedicationIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  LocalPharmacy as PharmacyIcon,
  CalendarMonth as CalendarIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { formatDate } from '@/lib/utils/formatters';
import type { Prescription } from '@/types/patient';

// Mock prescriptions data
const MOCK_PRESCRIPTIONS: Prescription[] = [
  {
    id: 1,
    patientId: 1,
    medication: 'Amlodipine',
    dosage: '5mg',
    startDate: '2025-10-01T00:00:00Z',
    endDate: '2025-11-01T00:00:00Z',
  },
  {
    id: 2,
    patientId: 1,
    medication: 'Metformin',
    dosage: '500mg',
    startDate: '2025-09-15T00:00:00Z',
    endDate: '2025-12-15T00:00:00Z',
  },
  {
    id: 3,
    patientId: 1,
    medication: 'Aspirin',
    dosage: '75mg',
    startDate: '2025-10-10T00:00:00Z',
    endDate: null,
  },
  {
    id: 4,
    patientId: 1,
    medication: 'Atorvastatin',
    dosage: '10mg',
    startDate: '2025-09-20T00:00:00Z',
    endDate: null,
  },
  {
    id: 5,
    patientId: 1,
    medication: 'Omeprazole',
    dosage: '20mg',
    startDate: '2025-08-01T00:00:00Z',
    endDate: '2025-09-01T00:00:00Z',
  },
  {
    id: 6,
    patientId: 1,
    medication: 'Losartan',
    dosage: '50mg',
    startDate: '2025-07-15T00:00:00Z',
    endDate: '2025-08-15T00:00:00Z',
  },
];

// Additional prescription details (mock)
const PRESCRIPTION_DETAILS: Record<number, {
  frequency: string;
  instructions: string;
  prescribedBy: string;
  refillsRemaining?: number;
}> = {
  1: {
    frequency: 'Once daily',
    instructions: 'Take in the morning with food',
    prescribedBy: 'Dr. Sarah Johnson',
    refillsRemaining: 2,
  },
  2: {
    frequency: 'Twice daily',
    instructions: 'Take with meals',
    prescribedBy: 'Dr. Sarah Johnson',
    refillsRemaining: 3,
  },
  3: {
    frequency: 'Once daily',
    instructions: 'Take after breakfast',
    prescribedBy: 'Dr. Sarah Johnson',
  },
  4: {
    frequency: 'Once daily at bedtime',
    instructions: 'Take before sleep',
    prescribedBy: 'Dr. Sarah Johnson',
  },
  5: {
    frequency: 'Once daily',
    instructions: 'Take 30 minutes before breakfast',
    prescribedBy: 'Dr. Amit Patel',
  },
  6: {
    frequency: 'Once daily',
    instructions: 'Take in the morning',
    prescribedBy: 'Dr. Amit Patel',
  },
};

export default function PrescriptionsPage() {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const isActivePrescription = (prescription: Prescription): boolean => {
    if (!prescription.endDate) return true;
    return new Date(prescription.endDate) > new Date();
  };

  const getActivePrescriptions = () => {
    return MOCK_PRESCRIPTIONS.filter(isActivePrescription);
  };

  const getPastPrescriptions = () => {
    return MOCK_PRESCRIPTIONS.filter((p) => !isActivePrescription(p));
  };

  const getDisplayedPrescriptions = () => {
    switch (activeTab) {
      case 0: // All
        return MOCK_PRESCRIPTIONS;
      case 1: // Active
        return getActivePrescriptions();
      case 2: // Past
        return getPastPrescriptions();
      default:
        return MOCK_PRESCRIPTIONS;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // In a real app, this would generate a PDF
    alert('Download functionality will generate a PDF of your prescriptions');
  };

  const displayedPrescriptions = getDisplayedPrescriptions();
  const activePrescriptions = getActivePrescriptions();

  return (
    <DashboardLayout>
      <Grid container spacing={3}>
        {/* Page Header */}
        <Grid size={{ xs: 12 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h4" fontWeight={600} gutterBottom>
                My Prescriptions
              </Typography>
              <Typography variant="body2" color="text.secondary">
                View and manage your medication prescriptions
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Print Prescriptions">
                <IconButton
                  onClick={handlePrint}
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': { bgcolor: 'primary.dark' },
                  }}
                >
                  <PrintIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Download PDF">
                <IconButton
                  onClick={handleDownload}
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': { bgcolor: 'primary.dark' },
                  }}
                >
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Grid>

        {/* Active Prescriptions Alert */}
        <Grid size={{ xs: 12 }}>
          <Alert severity="info" icon={<PharmacyIcon />} sx={{ borderRadius: 2 }}>
            You have <strong>{activePrescriptions.length}</strong> active prescription(s). 
            Remember to take your medications as prescribed by your doctor.
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
              <Tab label={`All (${MOCK_PRESCRIPTIONS.length})`} />
              <Tab label={`Active (${activePrescriptions.length})`} />
              <Tab label={`Past (${getPastPrescriptions().length})`} />
            </Tabs>

            <CardContent>
              {displayedPrescriptions.length === 0 ? (
                <Box sx={{ py: 8, textAlign: 'center' }}>
                  <MedicationIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No prescriptions found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {activeTab === 1 && "You don't have any active prescriptions"}
                    {activeTab === 2 && "No past prescriptions found"}
                  </Typography>
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          <Typography variant="subtitle2" fontWeight={600}>
                            Medication
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2" fontWeight={600}>
                            Dosage
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2" fontWeight={600}>
                            Frequency
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2" fontWeight={600}>
                            Instructions
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2" fontWeight={600}>
                            Start Date
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2" fontWeight={600}>
                            End Date
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2" fontWeight={600}>
                            Status
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {displayedPrescriptions.map((prescription) => {
                        const details = PRESCRIPTION_DETAILS[prescription.id];
                        const isActive = isActivePrescription(prescription);

                        return (
                          <TableRow
                            key={prescription.id}
                            sx={{
                              '&:hover': { bgcolor: 'action.hover' },
                              opacity: isActive ? 1 : 0.6,
                            }}
                          >
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <MedicationIcon color="primary" fontSize="small" />
                                <Typography variant="body2" fontWeight={600}>
                                  {prescription.medication}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={prescription.dosage}
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {details?.frequency || 'As directed'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {details?.instructions || 'Follow doctor\'s advice'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {formatDate(new Date(prescription.startDate))}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {prescription.endDate
                                  ? formatDate(new Date(prescription.endDate))
                                  : 'Ongoing'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={isActive ? 'Active' : 'Completed'}
                                color={isActive ? 'success' : 'default'}
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Prescription Cards for Mobile View */}
        <Grid size={{ xs: 12 }} sx={{ display: { xs: 'block', md: 'none' } }}>
          <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mt: 2 }}>
            Prescriptions (Mobile View)
          </Typography>
          <Grid container spacing={2}>
            {displayedPrescriptions.map((prescription) => {
              const details = PRESCRIPTION_DETAILS[prescription.id];
              const isActive = isActivePrescription(prescription);

              return (
                <Grid size={{ xs: 12 }} key={prescription.id}>
                  <Card
                    variant="outlined"
                    sx={{
                      borderRadius: 2,
                      opacity: isActive ? 1 : 0.6,
                      borderLeft: isActive ? 4 : 1,
                      borderLeftColor: isActive ? 'success.main' : 'divider',
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <MedicationIcon color="primary" />
                          <Typography variant="h6" fontWeight={600}>
                            {prescription.medication}
                          </Typography>
                        </Box>
                        <Chip
                          label={isActive ? 'Active' : 'Completed'}
                          color={isActive ? 'success' : 'default'}
                          size="small"
                        />
                      </Box>

                      <Divider sx={{ my: 1.5 }} />

                      <Grid container spacing={1.5}>
                        <Grid size={{ xs: 6 }}>
                          <Typography variant="caption" color="text.secondary">
                            Dosage
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {prescription.dosage}
                          </Typography>
                        </Grid>

                        <Grid size={{ xs: 6 }}>
                          <Typography variant="caption" color="text.secondary">
                            Frequency
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {details?.frequency || 'As directed'}
                          </Typography>
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                          <Typography variant="caption" color="text.secondary">
                            Instructions
                          </Typography>
                          <Typography variant="body2">
                            {details?.instructions || 'Follow doctor\'s advice'}
                          </Typography>
                        </Grid>

                        <Grid size={{ xs: 6 }}>
                          <Typography variant="caption" color="text.secondary">
                            Start Date
                          </Typography>
                          <Typography variant="body2">
                            {formatDate(new Date(prescription.startDate))}
                          </Typography>
                        </Grid>

                        <Grid size={{ xs: 6 }}>
                          <Typography variant="caption" color="text.secondary">
                            End Date
                          </Typography>
                          <Typography variant="body2">
                            {prescription.endDate
                              ? formatDate(new Date(prescription.endDate))
                              : 'Ongoing'}
                          </Typography>
                        </Grid>

                        {details?.prescribedBy && (
                          <Grid size={{ xs: 12 }}>
                            <Typography variant="caption" color="text.secondary">
                              Prescribed By
                            </Typography>
                            <Typography variant="body2" fontWeight={600}>
                              {details.prescribedBy}
                            </Typography>
                          </Grid>
                        )}

                        {details?.refillsRemaining !== undefined && isActive && (
                          <Grid size={{ xs: 12 }}>
                            <Alert severity="info" icon={<InfoIcon />} sx={{ mt: 1 }}>
                              <Typography variant="caption">
                                {details.refillsRemaining} refill(s) remaining
                              </Typography>
                            </Alert>
                          </Grid>
                        )}
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Grid>

        {/* Important Notes */}
        <Grid size={{ xs: 12 }}>
          <Card sx={{ borderRadius: 3, bgcolor: 'info.lighter' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'start', gap: 2 }}>
                <InfoIcon color="info" />
                <Box>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Important Medication Guidelines
                  </Typography>
                  <Typography variant="body2" color="text.secondary" component="div">
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                      <li>Take medications exactly as prescribed by your doctor</li>
                      <li>Do not stop taking medications without consulting your doctor</li>
                      <li>Store medications in a cool, dry place away from sunlight</li>
                      <li>Check expiration dates regularly</li>
                      <li>Inform your doctor about any side effects</li>
                      <li>Keep a list of all medications when visiting new doctors</li>
                    </ul>
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </DashboardLayout>
  );
}
