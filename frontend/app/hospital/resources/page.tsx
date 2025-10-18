'use client';

import { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import EditIcon from '@mui/icons-material/Edit';
import HotelIcon from '@mui/icons-material/Hotel';
import AirIcon from '@mui/icons-material/Air';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import InventoryIcon from '@mui/icons-material/Inventory';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useResources, useResourceDistribution, useLowStockResources, useUpdateResource } from '@/hooks/useHospital';
import { MOCK_RESOURCES, MOCK_RESOURCE_DISTRIBUTION } from '@/constants/hospital';
import type { Resource } from '@/types/hospital';

export default function ResourceManagementPage() {
  // Using mock data for now
  const resources = MOCK_RESOURCES;
  const resourceDistribution = MOCK_RESOURCE_DISTRIBUTION;
  const lowStockResources = resources.filter((r) => r.status === 'critical' || r.status === 'low');

  // Dialog state
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [formData, setFormData] = useState({
    available: '',
    inUse: '',
  });

  const updateResourceMutation = useUpdateResource();

  const handleOpenEditDialog = (resource: Resource) => {
    setSelectedResource(resource);
    setFormData({
      available: resource.available.toString(),
      inUse: resource.inUse.toString(),
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedResource(null);
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (selectedResource) {
      try {
        await updateResourceMutation.mutateAsync({
          resourceId: selectedResource.id,
          data: {
            resourceId: selectedResource.id,
            available: parseInt(formData.available),
            inUse: parseInt(formData.inUse),
          },
        });
        handleCloseDialog();
      } catch (error) {
        console.error('Error updating resource:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
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

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'beds':
        return <HotelIcon sx={{ fontSize: 40 }} />;
      case 'oxygen':
        return <AirIcon sx={{ fontSize: 40 }} />;
      case 'equipment':
        return <MedicalServicesIcon sx={{ fontSize: 40 }} />;
      case 'supplies':
        return <InventoryIcon sx={{ fontSize: 40 }} />;
      default:
        return <InventoryIcon sx={{ fontSize: 40 }} />;
    }
  };

  const getResourceColor = (type: string) => {
    switch (type) {
      case 'beds':
        return { color: '#0ea5e9', bgColor: 'rgba(14, 165, 233, 0.1)' };
      case 'oxygen':
        return { color: '#06b6d4', bgColor: 'rgba(6, 182, 212, 0.1)' };
      case 'equipment':
        return { color: '#8b5cf6', bgColor: 'rgba(139, 92, 246, 0.1)' };
      case 'supplies':
        return { color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.1)' };
      default:
        return { color: '#6b7280', bgColor: 'rgba(107, 114, 128, 0.1)' };
    }
  };

  // Group resources by type
  const bedsResources = resources.filter((r) => r.type === 'beds');
  const oxygenResources = resources.filter((r) => r.type === 'oxygen');
  const otherResources = resources.filter((r) => r.type === 'equipment' || r.type === 'supplies');

  const calculateUtilization = (resource: Resource) => {
    return (resource.inUse / resource.total) * 100;
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Resource Management
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Monitor and manage hospital resources and equipment
      </Typography>

      {/* Low Stock Alerts */}
      {lowStockResources.length > 0 && (
        <Alert
          severity="warning"
          icon={<WarningIcon />}
          sx={{ mb: 3 }}
        >
          <Typography variant="subtitle2" fontWeight="600">
            {lowStockResources.length} Resource(s) Need Attention
          </Typography>
          <Typography variant="body2">
            {lowStockResources.map((r) => r.name).join(', ')} - Please restock soon
          </Typography>
        </Alert>
      )}

      {/* Resource Category Cards */}
      <Grid container spacing={3} mb={3}>
        {/* Beds */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            elevation={0}
            sx={{
              border: '1px solid #e0e0e0',
              height: '100%',
              transition: 'all 0.3s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              },
            }}
          >
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight="600">
                  Beds
                </Typography>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 2,
                    ...getResourceColor('beds'),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {getResourceIcon('beds')}
                </Box>
              </Box>
              {bedsResources.map((resource) => (
                <Box key={resource.id} mb={2}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body2" fontWeight="600">
                      {resource.name}
                    </Typography>
                    <Box display="flex" gap={1} alignItems="center">
                      <Chip
                        label={resource.status}
                        size="small"
                        color={getStatusColor(resource.status)}
                      />
                      <IconButton size="small" onClick={() => handleOpenEditDialog(resource)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={0.5}>
                    <Typography variant="caption" color="text.secondary">
                      Available: {resource.available}/{resource.total}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {calculateUtilization(resource).toFixed(1)}% utilized
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={calculateUtilization(resource)}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'rgba(0, 0, 0, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        backgroundColor:
                          resource.status === 'critical'
                            ? '#ef4444'
                            : resource.status === 'low'
                            ? '#f59e0b'
                            : '#10b981',
                      },
                    }}
                  />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Oxygen Tanks */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            elevation={0}
            sx={{
              border: '1px solid #e0e0e0',
              height: '100%',
              transition: 'all 0.3s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              },
            }}
          >
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight="600">
                  Oxygen Tanks
                </Typography>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 2,
                    ...getResourceColor('oxygen'),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {getResourceIcon('oxygen')}
                </Box>
              </Box>
              {oxygenResources.map((resource) => (
                <Box key={resource.id} mb={2}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body2" fontWeight="600">
                      {resource.name}
                    </Typography>
                    <Box display="flex" gap={1} alignItems="center">
                      <Chip
                        label={resource.status}
                        size="small"
                        color={getStatusColor(resource.status)}
                      />
                      <IconButton size="small" onClick={() => handleOpenEditDialog(resource)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={0.5}>
                    <Typography variant="caption" color="text.secondary">
                      Available: {resource.available}/{resource.total}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {calculateUtilization(resource).toFixed(1)}% utilized
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={calculateUtilization(resource)}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'rgba(0, 0, 0, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        backgroundColor:
                          resource.status === 'critical'
                            ? '#ef4444'
                            : resource.status === 'low'
                            ? '#f59e0b'
                            : '#10b981',
                      },
                    }}
                  />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Other Resources */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            elevation={0}
            sx={{
              border: '1px solid #e0e0e0',
              height: '100%',
              transition: 'all 0.3s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              },
            }}
          >
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight="600">
                  Other Resources
                </Typography>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 2,
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    color: '#8b5cf6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <InventoryIcon sx={{ fontSize: 40 }} />
                </Box>
              </Box>
              {otherResources.slice(0, 4).map((resource) => (
                <Box key={resource.id} mb={2}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body2" fontWeight="600" noWrap>
                      {resource.name}
                    </Typography>
                    <Box display="flex" gap={1} alignItems="center">
                      <Chip
                        label={resource.status}
                        size="small"
                        color={getStatusColor(resource.status)}
                      />
                      <IconButton size="small" onClick={() => handleOpenEditDialog(resource)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={0.5}>
                    <Typography variant="caption" color="text.secondary">
                      Available: {resource.available}/{resource.total}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {calculateUtilization(resource).toFixed(1)}% utilized
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={calculateUtilization(resource)}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'rgba(0, 0, 0, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        backgroundColor:
                          resource.status === 'critical'
                            ? '#ef4444'
                            : resource.status === 'low'
                            ? '#f59e0b'
                            : '#10b981',
                      },
                    }}
                  />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Resource Distribution Chart */}
      <Card elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
        <CardContent>
          <Typography variant="h6" fontWeight="600" gutterBottom>
            Resource Distribution by Category
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Overall distribution of resources across different categories
          </Typography>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={resourceDistribution as any}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ category, percentage }) => `${category}: ${percentage}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {resourceDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Edit Resource Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h6" fontWeight="600">
            Update Resource: {selectedResource?.name}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <Alert severity="info">
              Total: {selectedResource?.total} units
            </Alert>
            <TextField
              label="Available"
              type="number"
              value={formData.available}
              onChange={(e) => handleFormChange('available', e.target.value)}
              required
              fullWidth
              inputProps={{ min: 0, max: selectedResource?.total }}
            />
            <TextField
              label="In Use"
              type="number"
              value={formData.inUse}
              onChange={(e) => handleFormChange('inUse', e.target.value)}
              required
              fullWidth
              inputProps={{ min: 0, max: selectedResource?.total }}
            />
            <Typography variant="caption" color="text.secondary">
              Note: Available + In Use should equal Total ({selectedResource?.total})
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={
              !formData.available ||
              !formData.inUse ||
              parseInt(formData.available) + parseInt(formData.inUse) !== selectedResource?.total
            }
            sx={{
              background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #0284c7, #0891b2)',
              },
            }}
          >
            Update Resource
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
