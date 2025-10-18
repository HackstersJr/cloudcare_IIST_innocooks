'use client';

import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Description as RecordIcon,
  CalendarMonth as CalendarIcon,
  LocalHospital as HospitalIcon,
  Person as DoctorIcon,
  Visibility as ViewIcon,
  Close as CloseIcon,
  Download as DownloadIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { formatDate } from '@/lib/utils/formatters';
import type { MedicalRecord } from '@/types/patient';

// Mock medical records
const MOCK_RECORDS: MedicalRecord[] = [
  {
    id: 1,
    patientId: 1,
    recordType: 'Consultation',
    description: 'Regular cardiac checkup - Blood pressure elevated at 145/95',
    diagnosis: 'Stage 1 Hypertension',
    treatment: 'Prescribed Amlodipine 5mg once daily',
    doctorId: 1,
    hospitalId: 1,
    date: '2025-10-15T10:00:00Z',
  },
  {
    id: 2,
    patientId: 1,
    recordType: 'Lab Test',
    description: 'Complete Blood Count and Lipid Profile',
    diagnosis: 'Slightly elevated cholesterol levels (LDL: 145 mg/dL)',
    treatment: 'Recommended dietary changes and statin therapy',
    doctorId: 1,
    hospitalId: 1,
    date: '2025-10-10T14:30:00Z',
  },
  {
    id: 3,
    patientId: 1,
    recordType: 'ECG',
    description: 'Electrocardiogram test to check heart rhythm',
    diagnosis: 'Normal sinus rhythm, no abnormalities detected',
    treatment: 'Continue current medications',
    doctorId: 1,
    hospitalId: 1,
    date: '2025-10-08T11:00:00Z',
  },
  {
    id: 4,
    patientId: 1,
    recordType: 'X-Ray',
    description: 'Chest X-ray for routine examination',
    diagnosis: 'Clear lung fields, normal cardiac silhouette',
    treatment: 'No immediate action required',
    doctorId: 2,
    hospitalId: 1,
    date: '2025-09-28T09:00:00Z',
  },
  {
    id: 5,
    patientId: 1,
    recordType: 'Consultation',
    description: 'Follow-up visit for diabetes management',
    diagnosis: 'Type 2 Diabetes Mellitus - HbA1c: 7.2%',
    treatment: 'Adjusted Metformin dosage to 500mg twice daily',
    doctorId: 2,
    hospitalId: 1,
    date: '2025-09-20T15:00:00Z',
  },
  {
    id: 6,
    patientId: 1,
    recordType: 'Emergency',
    description: 'Emergency visit for chest discomfort and shortness of breath',
    diagnosis: 'Acute anxiety attack, ruled out myocardial infarction',
    treatment: 'Observation for 4 hours, prescribed anxiolytic medication',
    doctorId: 3,
    hospitalId: 2,
    date: '2025-09-05T22:30:00Z',
  },
];

// Mock doctor/hospital data
const DOCTORS: Record<number, string> = {
  1: 'Dr. Sarah Johnson',
  2: 'Dr. Amit Patel',
  3: 'Dr. Priya Sharma',
};

const HOSPITALS: Record<number, string> = {
  1: 'City General Hospital',
  2: 'Metro Medical Center',
};

export default function MedicalRecordsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [filterType, setFilterType] = useState<string>('all');

  const recordTypes = ['all', 'Consultation', 'Lab Test', 'ECG', 'X-Ray', 'Emergency'];

  const getRecordTypeColor = (type: string) => {
    switch (type) {
      case 'Emergency':
        return 'error';
      case 'Consultation':
        return 'primary';
      case 'Lab Test':
        return 'info';
      case 'ECG':
        return 'warning';
      case 'X-Ray':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const filteredRecords = MOCK_RECORDS.filter((record) => {
    const matchesSearch =
      record.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (record.diagnosis && record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (record.recordType && record.recordType.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFilter = filterType === 'all' || record.recordType === filterType;

    return matchesSearch && matchesFilter;
  });

  const sortedRecords = [...filteredRecords].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const handleViewRecord = (record: MedicalRecord) => {
    setSelectedRecord(record);
  };

  const handleCloseDialog = () => {
    setSelectedRecord(null);
  };

  const handleDownload = () => {
    alert('Download functionality will generate a PDF of this medical record');
  };

  return (
    <DashboardLayout>
      <Grid container spacing={3}>
        {/* Page Header */}
        <Grid size={{ xs: 12 }}>
          <Typography variant="h4" fontWeight={600} gutterBottom>
            Medical Records
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View and manage your complete medical history
          </Typography>
        </Grid>

        {/* Search and Filter */}
        <Grid size={{ xs: 12 }}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 12, md: 8 }}>
                  <TextField
                    fullWidth
                    placeholder="Search by description, diagnosis, or record type..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                    <FilterIcon color="action" />
                    <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                      Filter:
                    </Typography>
                    {recordTypes.map((type) => (
                      <Chip
                        key={type}
                        label={type === 'all' ? 'All' : type}
                        onClick={() => setFilterType(type)}
                        color={filterType === type ? 'primary' : 'default'}
                        variant={filterType === type ? 'filled' : 'outlined'}
                        size="small"
                      />
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Records Count */}
        <Grid size={{ xs: 12 }}>
          <Typography variant="body2" color="text.secondary">
            Showing {sortedRecords.length} of {MOCK_RECORDS.length} records
          </Typography>
        </Grid>

        {/* Records List */}
        <Grid size={{ xs: 12 }}>
          {sortedRecords.length === 0 ? (
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Box sx={{ py: 8, textAlign: 'center' }}>
                  <RecordIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No records found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Try adjusting your search or filter criteria
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ) : (
            <Grid container spacing={2}>
              {sortedRecords.map((record) => (
                <Grid size={{ xs: 12 }} key={record.id}>
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
                      <Grid container spacing={2} alignItems="center">
                        {/* Record Type & Date */}
                        <Grid size={{ xs: 12, sm: 3 }}>
                          <Chip
                            label={record.recordType || 'Unknown'}
                            color={getRecordTypeColor(record.recordType || '')}
                            icon={<RecordIcon />}
                            sx={{ mb: 1 }}
                          />
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <CalendarIcon fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                              {formatDate(new Date(record.date))}
                            </Typography>
                          </Box>
                        </Grid>

                        {/* Description & Diagnosis */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Typography variant="body1" fontWeight={600} gutterBottom>
                            {record.description}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            <strong>Diagnosis:</strong> {record.diagnosis}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                            <DoctorIcon fontSize="small" color="action" />
                            <Typography variant="caption" color="text.secondary">
                              {record.doctorId ? DOCTORS[record.doctorId] : 'Unknown Doctor'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              •
                            </Typography>
                            <HospitalIcon fontSize="small" color="action" />
                            <Typography variant="caption" color="text.secondary">
                              {record.hospitalId ? HOSPITALS[record.hospitalId] : 'Unknown Hospital'}
                            </Typography>
                          </Box>
                        </Grid>

                        {/* Actions */}
                        <Grid size={{ xs: 12, sm: 3 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                            <Tooltip title="View Details">
                              <IconButton
                                color="primary"
                                onClick={() => handleViewRecord(record)}
                              >
                                <ViewIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>
      </Grid>

      {/* Record Details Dialog */}
      <Dialog
        open={selectedRecord !== null}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        {selectedRecord && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <RecordIcon color="primary" />
                  <Typography variant="h6" fontWeight={600}>
                    Medical Record Details
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Download PDF">
                    <IconButton onClick={handleDownload}>
                      <DownloadIcon />
                    </IconButton>
                  </Tooltip>
                  <IconButton onClick={handleCloseDialog} size="small">
                    <CloseIcon />
                  </IconButton>
                </Box>
              </Box>
            </DialogTitle>
            <Divider />
            <DialogContent>
              <Grid container spacing={3} sx={{ mt: 1 }}>
                {/* Record Type & Date */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    Record Type
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      label={selectedRecord.recordType || 'Unknown'}
                      color={getRecordTypeColor(selectedRecord.recordType || '')}
                      icon={<RecordIcon />}
                    />
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    Date & Time
                  </Typography>
                  <Typography variant="body1" fontWeight={600} sx={{ mt: 0.5 }}>
                    {new Date(selectedRecord.date).toLocaleString('en-US', {
                      dateStyle: 'long',
                      timeStyle: 'short',
                    })}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Divider />
                </Grid>

                {/* Description */}
                <Grid size={{ xs: 12 }}>
                  <Typography variant="caption" color="text.secondary">
                    Description
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 0.5 }}>
                    {selectedRecord.description}
                  </Typography>
                </Grid>

                {/* Diagnosis */}
                <Grid size={{ xs: 12 }}>
                  <Typography variant="caption" color="text.secondary">
                    Diagnosis
                  </Typography>
                  <Card variant="outlined" sx={{ mt: 0.5, bgcolor: 'info.lighter' }}>
                    <CardContent>
                      <Typography variant="body1">{selectedRecord.diagnosis}</Typography>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Treatment */}
                <Grid size={{ xs: 12 }}>
                  <Typography variant="caption" color="text.secondary">
                    Treatment / Recommendations
                  </Typography>
                  <Card variant="outlined" sx={{ mt: 0.5, bgcolor: 'success.lighter' }}>
                    <CardContent>
                      <Typography variant="body1">{selectedRecord.treatment}</Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Divider />
                </Grid>

                {/* Doctor & Hospital */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    Doctor
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    <DoctorIcon color="primary" />
                    <Typography variant="body1" fontWeight={600}>
                      {selectedRecord.doctorId ? DOCTORS[selectedRecord.doctorId] : 'Unknown Doctor'}
                    </Typography>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    Hospital
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    <HospitalIcon color="primary" />
                    <Typography variant="body1" fontWeight={600}>
                      {selectedRecord.hospitalId ? HOSPITALS[selectedRecord.hospitalId] : 'Unknown Hospital'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            <Divider />
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={handleCloseDialog} variant="outlined">
                Close
              </Button>
              <Button onClick={handleDownload} variant="contained" startIcon={<DownloadIcon />}>
                Download PDF
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </DashboardLayout>
  );
}
