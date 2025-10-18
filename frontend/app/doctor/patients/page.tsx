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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
} from '@mui/material';
import {
  Search,
  PersonAdd,
  Visibility,
  Edit,
  Close,
  Add,
  Remove,
  LocalHospital,
  Phone,
  Email,
  CalendarToday,
} from '@mui/icons-material';
import { MOCK_ASSIGNED_PATIENTS } from '@/constants/doctor';
import type { AssignedPatient } from '@/types/doctor';

interface UpdatePatientData {
  prescriptions: {
    medication: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }[];
  thresholds: {
    heartRateMin: number;
    heartRateMax: number;
    oxygenLevelMin: number;
    bloodPressureMax: string;
  };
  notes: string;
}

export default function DoctorPatientsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedPatient, setSelectedPatient] = useState<AssignedPatient | null>(null);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [patientToUpdate, setPatientToUpdate] = useState<AssignedPatient | null>(null);
  
  const [updateData, setUpdateData] = useState<UpdatePatientData>({
    prescriptions: [],
    thresholds: {
      heartRateMin: 60,
      heartRateMax: 100,
      oxygenLevelMin: 95,
      bloodPressureMax: '140/90',
    },
    notes: '',
  });

  const patients = MOCK_ASSIGNED_PATIENTS;

  // Filter patients by status
  const filterPatientsByTab = () => {
    switch (selectedTab) {
      case 1:
        return patients.filter((p) => p.status === 'stable');
      case 2:
        return patients.filter((p) => p.status === 'monitoring');
      case 3:
        return patients.filter((p) => p.status === 'critical');
      default:
        return patients;
    }
  };

  // Filter by search query
  const filteredPatients = filterPatientsByTab().filter(
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

  const handleViewDetails = (patient: AssignedPatient) => {
    setSelectedPatient(patient);
  };

  const handleUpdatePatient = (patient: AssignedPatient) => {
    setPatientToUpdate(patient);
    setUpdateData({
      prescriptions: [],
      thresholds: {
        heartRateMin: 60,
        heartRateMax: 100,
        oxygenLevelMin: 95,
        bloodPressureMax: '140/90',
      },
      notes: '',
    });
    setUpdateDialogOpen(true);
  };

  const addPrescription = () => {
    setUpdateData({
      ...updateData,
      prescriptions: [
        ...updateData.prescriptions,
        {
          medication: '',
          dosage: '',
          frequency: '',
          duration: '',
          instructions: '',
        },
      ],
    });
  };

  const removePrescription = (index: number) => {
    setUpdateData({
      ...updateData,
      prescriptions: updateData.prescriptions.filter((_, i) => i !== index),
    });
  };

  const updatePrescription = (index: number, field: string, value: string) => {
    const newPrescriptions = [...updateData.prescriptions];
    newPrescriptions[index] = { ...newPrescriptions[index], [field]: value };
    setUpdateData({ ...updateData, prescriptions: newPrescriptions });
  };

  const handleSubmitUpdate = () => {
    // In real app, this would call the API
    console.log('Updating patient:', patientToUpdate?.id, updateData);
    alert('Patient data updated successfully!');
    setUpdateDialogOpen(false);
    setPatientToUpdate(null);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Assigned Patients
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Search and manage your patients
        </Typography>
      </Box>

      {/* Tabs */}
      <Box sx={{ mb: 3 }}>
        <Tabs
          value={selectedTab}
          onChange={(_, newValue) => setSelectedTab(newValue)}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            mb: 3,
          }}
        >
          <Tab label={`All (${patients.length})`} />
          <Tab
            label={`Stable (${patients.filter((p) => p.status === 'stable').length})`}
          />
          <Tab
            label={`Monitoring (${patients.filter((p) => p.status === 'monitoring').length})`}
          />
          <Tab
            label={`Critical (${patients.filter((p) => p.status === 'critical').length})`}
          />
        </Tabs>
      </Box>

      {/* Search & Actions */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search by name or condition..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
        <Button variant="contained" startIcon={<PersonAdd />} sx={{ minWidth: 180 }}>
          Add Patient
        </Button>
      </Box>

      {/* Patient Cards */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {filteredPatients.length > 0 ? (
          filteredPatients.map((patient) => (
            <Card key={patient.id} variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  {/* Avatar */}
                  <Avatar
                    sx={{
                      width: 60,
                      height: 60,
                      bgcolor: patient.emergency ? 'error.main' : 'primary.main',
                      fontSize: '1.5rem',
                      fontWeight: 600,
                    }}
                  >
                    {patient.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </Avatar>

                  {/* Patient Info */}
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
                      {patient.emergency && (
                        <Chip
                          label="EMERGENCY"
                          color="error"
                          size="small"
                          icon={<LocalHospital />}
                        />
                      )}
                    </Box>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        👤 {patient.age} years • {patient.gender}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        📋 {patient.condition}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        📅 Next: {patient.nextAppointment || 'Not scheduled'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        🕐 Last: {patient.lastVisit || 'No previous visits'}
                      </Typography>
                    </Box>

                    {patient.aiAnalysis && (
                      <Box
                        sx={{
                          mt: 1,
                          p: 1,
                          bgcolor: 'error.light',
                          borderRadius: 1,
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <Typography variant="caption" color="error.dark" fontWeight="600">
                          ⚠️ AI Alert: {patient.aiAnalysis}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {/* Actions */}
                  <Box sx={{ display: 'flex', gap: 1, flexDirection: { xs: 'column', sm: 'row' } }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Visibility />}
                      onClick={() => handleViewDetails(patient)}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<Edit />}
                      onClick={() => handleUpdatePatient(patient)}
                    >
                      Update
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent>
              <Typography variant="body1" color="text.secondary" textAlign="center" py={4}>
                No patients found matching your search
              </Typography>
            </CardContent>
          </Card>
        )}
      </Box>

      {/* View Details Dialog */}
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar
                    sx={{
                      width: 50,
                      height: 50,
                      bgcolor: selectedPatient.emergency ? 'error.main' : 'primary.main',
                    }}
                  >
                    {selectedPatient.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="600">
                      {selectedPatient.name}
                    </Typography>
                    <Chip
                      label={selectedPatient.status}
                      color={getStatusColor(selectedPatient.status)}
                      size="small"
                    />
                  </Box>
                </Box>
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
                  gap: 3,
                  mt: 2,
                }}
              >
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Patient ID
                  </Typography>
                  <Typography variant="body1" fontWeight="600">
                    #{selectedPatient.id}
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
                  <Chip
                    label={selectedPatient.status}
                    color={getStatusColor(selectedPatient.status)}
                    size="small"
                  />
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
                    Contact
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Phone sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body1" fontWeight="600">
                      {selectedPatient.contact}
                    </Typography>
                  </Box>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Family Contact
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Phone sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body1" fontWeight="600">
                      {selectedPatient.familyContact}
                    </Typography>
                  </Box>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Next Appointment
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body1" fontWeight="600">
                      {selectedPatient.nextAppointment || 'Not scheduled'}
                    </Typography>
                  </Box>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Last Visit
                  </Typography>
                  <Typography variant="body1" fontWeight="600">
                    {selectedPatient.lastVisit || 'No previous visits'}
                  </Typography>
                </Box>
                {selectedPatient.emergency && (
                  <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Emergency Status
                    </Typography>
                    <Chip label="EMERGENCY PATIENT" color="error" icon={<LocalHospital />} />
                  </Box>
                )}
                {selectedPatient.aiAnalysis && (
                  <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      AI Analysis
                    </Typography>
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: 'error.light',
                        borderRadius: 1,
                        borderLeft: 4,
                        borderColor: 'error.main',
                      }}
                    >
                      <Typography variant="body1" color="error.dark" fontWeight="600">
                        {selectedPatient.aiAnalysis}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedPatient(null)}>Close</Button>
              <Button
                variant="contained"
                onClick={() => {
                  setSelectedPatient(null);
                  handleUpdatePatient(selectedPatient);
                }}
              >
                Update Patient
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Update Patient Dialog */}
      <Dialog
        open={updateDialogOpen}
        onClose={() => setUpdateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {patientToUpdate && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Update Patient Data
                <IconButton onClick={() => setUpdateDialogOpen(false)}>
                  <Close />
                </IconButton>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {patientToUpdate.name} (ID: #{patientToUpdate.id})
              </Typography>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mt: 2 }}>
                {/* Prescriptions */}
                <Box sx={{ mb: 4 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" fontWeight="600">
                      Add Prescriptions
                    </Typography>
                    <Button startIcon={<Add />} size="small" onClick={addPrescription}>
                      Add Prescription
                    </Button>
                  </Box>

                  {updateData.prescriptions.map((prescription, index) => (
                    <Card key={index} variant="outlined" sx={{ mb: 2, p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="subtitle2" fontWeight="600">
                          Prescription {index + 1}
                        </Typography>
                        <IconButton size="small" onClick={() => removePrescription(index)}>
                          <Remove />
                        </IconButton>
                      </Box>
                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                          gap: 2,
                        }}
                      >
                        <TextField
                          fullWidth
                          label="Medication"
                          value={prescription.medication}
                          onChange={(e) => updatePrescription(index, 'medication', e.target.value)}
                        />
                        <TextField
                          fullWidth
                          label="Dosage"
                          value={prescription.dosage}
                          onChange={(e) => updatePrescription(index, 'dosage', e.target.value)}
                          placeholder="e.g., 5mg"
                        />
                        <TextField
                          fullWidth
                          label="Frequency"
                          value={prescription.frequency}
                          onChange={(e) => updatePrescription(index, 'frequency', e.target.value)}
                          placeholder="e.g., Once daily"
                        />
                        <TextField
                          fullWidth
                          label="Duration"
                          value={prescription.duration}
                          onChange={(e) => updatePrescription(index, 'duration', e.target.value)}
                          placeholder="e.g., 30 days"
                        />
                        <TextField
                          fullWidth
                          label="Instructions"
                          value={prescription.instructions}
                          onChange={(e) => updatePrescription(index, 'instructions', e.target.value)}
                          placeholder="e.g., Take with food"
                          sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}
                        />
                      </Box>
                    </Card>
                  ))}

                  {updateData.prescriptions.length === 0 && (
                    <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                      No prescriptions added yet
                    </Typography>
                  )}
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* Alert Thresholds */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" fontWeight="600" gutterBottom>
                    Set Alert Thresholds
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
                    Configure threshold values for automated alerts
                  </Typography>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                      gap: 2,
                    }}
                  >
                    <TextField
                      fullWidth
                      label="Min Heart Rate (bpm)"
                      type="number"
                      value={updateData.thresholds.heartRateMin}
                      onChange={(e) =>
                        setUpdateData({
                          ...updateData,
                          thresholds: {
                            ...updateData.thresholds,
                            heartRateMin: Number(e.target.value),
                          },
                        })
                      }
                    />
                    <TextField
                      fullWidth
                      label="Max Heart Rate (bpm)"
                      type="number"
                      value={updateData.thresholds.heartRateMax}
                      onChange={(e) =>
                        setUpdateData({
                          ...updateData,
                          thresholds: {
                            ...updateData.thresholds,
                            heartRateMax: Number(e.target.value),
                          },
                        })
                      }
                    />
                    <TextField
                      fullWidth
                      label="Min Oxygen Level (%)"
                      type="number"
                      value={updateData.thresholds.oxygenLevelMin}
                      onChange={(e) =>
                        setUpdateData({
                          ...updateData,
                          thresholds: {
                            ...updateData.thresholds,
                            oxygenLevelMin: Number(e.target.value),
                          },
                        })
                      }
                    />
                    <TextField
                      fullWidth
                      label="Max Blood Pressure"
                      value={updateData.thresholds.bloodPressureMax}
                      onChange={(e) =>
                        setUpdateData({
                          ...updateData,
                          thresholds: {
                            ...updateData.thresholds,
                            bloodPressureMax: e.target.value,
                          },
                        })
                      }
                      placeholder="e.g., 140/90"
                    />
                  </Box>
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* Notes */}
                <Box>
                  <Typography variant="h6" fontWeight="600" gutterBottom>
                    Additional Notes
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    value={updateData.notes}
                    onChange={(e) => setUpdateData({ ...updateData, notes: e.target.value })}
                    placeholder="Add any additional notes or instructions for the patient..."
                  />
                </Box>
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button onClick={() => setUpdateDialogOpen(false)}>Cancel</Button>
              <Button variant="contained" onClick={handleSubmitUpdate}>
                Update Patient
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
