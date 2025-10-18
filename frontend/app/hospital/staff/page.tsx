'use client';

import { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useStaff, useAddStaff, useUpdateStaff, useDeleteStaff } from '@/hooks/useHospital';
import { MOCK_STAFF } from '@/constants/hospital';
import type { Staff } from '@/types/hospital';

type Order = 'asc' | 'desc';

export default function StaffManagementPage() {
  // Using mock data for now
  const staffData = MOCK_STAFF;

  // Table state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState<keyof Staff>('name');
  const [order, setOrder] = useState<Order>('asc');
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog state
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<Staff | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    phone: '',
    email: '',
    specialization: '',
    department: '',
  });

  // Mutations
  const addStaffMutation = useAddStaff();
  const updateStaffMutation = useUpdateStaff();
  const deleteStaffMutation = useDeleteStaff();

  // Filtering and sorting
  const filteredStaff = useMemo(() => {
    return staffData.filter((staff) =>
      staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.department.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [staffData, searchQuery]);

  const sortedStaff = useMemo(() => {
    const comparator = (a: Staff, b: Staff) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];
      
      if (bValue < aValue) {
        return order === 'asc' ? 1 : -1;
      }
      if (bValue > aValue) {
        return order === 'asc' ? -1 : 1;
      }
      return 0;
    };

    return [...filteredStaff].sort(comparator);
  }, [filteredStaff, order, orderBy]);

  const paginatedStaff = useMemo(() => {
    return sortedStaff.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [sortedStaff, page, rowsPerPage]);

  const handleRequestSort = (property: keyof Staff) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenAddDialog = () => {
    setDialogMode('add');
    setFormData({
      name: '',
      age: '',
      gender: '',
      phone: '',
      email: '',
      specialization: '',
      department: '',
    });
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (staff: Staff) => {
    setDialogMode('edit');
    setSelectedStaff(staff);
    setFormData({
      name: staff.name,
      age: staff.age.toString(),
      gender: staff.gender,
      phone: staff.phone,
      email: staff.email,
      specialization: staff.specialization,
      department: staff.department,
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedStaff(null);
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (dialogMode === 'add') {
        await addStaffMutation.mutateAsync({
          hospitalId: 1,
          data: {
            name: formData.name,
            age: parseInt(formData.age),
            gender: formData.gender,
            contact: formData.phone,
            email: formData.email,
            specialization: formData.specialization,
            department: formData.department,
          },
        });
      } else if (selectedStaff) {
        await updateStaffMutation.mutateAsync({
          staffId: selectedStaff.id,
          data: {
            name: formData.name,
            age: parseInt(formData.age),
            gender: formData.gender,
            phone: formData.phone,
            email: formData.email,
            specialization: formData.specialization,
            department: formData.department,
          },
        });
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving staff:', error);
    }
  };

  const handleOpenDeleteConfirm = (staff: Staff) => {
    setStaffToDelete(staff);
    setDeleteConfirmOpen(true);
  };

  const handleCloseDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
    setStaffToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (staffToDelete) {
      try {
        await deleteStaffMutation.mutateAsync(staffToDelete.id);
        handleCloseDeleteConfirm();
      } catch (error) {
        console.error('Error deleting staff:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'on-leave':
        return 'warning';
      case 'unavailable':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Staff Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage hospital staff and their information
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={handleOpenAddDialog}
          sx={{
            background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)',
            '&:hover': {
              background: 'linear-gradient(135deg, #0284c7, #0891b2)',
            },
          }}
        >
          Add Staff
        </Button>
      </Box>

      {/* Search and Stats */}
      <Card elevation={0} sx={{ border: '1px solid #e0e0e0', mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <TextField
              placeholder="Search by name, specialization, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 300, flexGrow: 1 }}
            />
            <Box display="flex" gap={3}>
              <Box textAlign="center">
                <Typography variant="h5" fontWeight="bold" color="primary">
                  {staffData.length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total Staff
                </Typography>
              </Box>
              <Divider orientation="vertical" flexItem />
              <Box textAlign="center">
                <Typography variant="h5" fontWeight="bold" color="success.main">
                  {staffData.filter((s) => s.status === 'active').length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Active
                </Typography>
              </Box>
              <Divider orientation="vertical" flexItem />
              <Box textAlign="center">
                <Typography variant="h5" fontWeight="bold" color="warning.main">
                  {staffData.filter((s) => s.status === 'on-leave').length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  On Leave
                </Typography>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Staff Table */}
      <Card elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'id'}
                    direction={orderBy === 'id' ? order : 'asc'}
                    onClick={() => handleRequestSort('id')}
                  >
                    <Typography variant="subtitle2" fontWeight="600">
                      Dr ID
                    </Typography>
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'name'}
                    direction={orderBy === 'name' ? order : 'asc'}
                    onClick={() => handleRequestSort('name')}
                  >
                    <Typography variant="subtitle2" fontWeight="600">
                      Name
                    </Typography>
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'age'}
                    direction={orderBy === 'age' ? order : 'asc'}
                    onClick={() => handleRequestSort('age')}
                  >
                    <Typography variant="subtitle2" fontWeight="600">
                      Age
                    </Typography>
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'gender'}
                    direction={orderBy === 'gender' ? order : 'asc'}
                    onClick={() => handleRequestSort('gender')}
                  >
                    <Typography variant="subtitle2" fontWeight="600">
                      Gender
                    </Typography>
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="600">
                    Contact
                  </Typography>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'specialization'}
                    direction={orderBy === 'specialization' ? order : 'asc'}
                    onClick={() => handleRequestSort('specialization')}
                  >
                    <Typography variant="subtitle2" fontWeight="600">
                      Specialization
                    </Typography>
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'department'}
                    direction={orderBy === 'department' ? order : 'asc'}
                    onClick={() => handleRequestSort('department')}
                  >
                    <Typography variant="subtitle2" fontWeight="600">
                      Department
                    </Typography>
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'patientCount'}
                    direction={orderBy === 'patientCount' ? order : 'asc'}
                    onClick={() => handleRequestSort('patientCount')}
                  >
                    <Typography variant="subtitle2" fontWeight="600">
                      Patients
                    </Typography>
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight="600">
                    Status
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="subtitle2" fontWeight="600">
                    Actions
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedStaff.map((staff) => (
                <TableRow key={staff.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="600">
                      #{staff.id.toString().padStart(3, '0')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="600">
                      {staff.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {staff.email}
                    </Typography>
                  </TableCell>
                  <TableCell>{staff.age}</TableCell>
                  <TableCell>{staff.gender}</TableCell>
                  <TableCell>
                    <Typography variant="body2">{staff.phone}</Typography>
                  </TableCell>
                  <TableCell>{staff.specialization}</TableCell>
                  <TableCell>
                    <Chip label={staff.department} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={staff.patientCount}
                      size="small"
                      color="primary"
                      sx={{ minWidth: 40 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={staff.status}
                      size="small"
                      color={getStatusColor(staff.status)}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenEditDialog(staff)}
                      sx={{ color: '#0ea5e9' }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDeleteConfirm(staff)}
                      sx={{ color: '#ef4444' }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredStaff.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>

      {/* Add/Edit Staff Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h6" fontWeight="600">
            {dialogMode === 'add' ? 'Add New Staff' : 'Edit Staff'}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Full Name"
              value={formData.name}
              onChange={(e) => handleFormChange('name', e.target.value)}
              required
              fullWidth
            />
            <Box display="flex" gap={2}>
              <TextField
                label="Age"
                type="number"
                value={formData.age}
                onChange={(e) => handleFormChange('age', e.target.value)}
                required
                sx={{ flex: 1 }}
              />
              <TextField
                label="Gender"
                select
                value={formData.gender}
                onChange={(e) => handleFormChange('gender', e.target.value)}
                required
                sx={{ flex: 1 }}
              >
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
            </Box>
            <TextField
              label="Phone"
              value={formData.phone}
              onChange={(e) => handleFormChange('phone', e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => handleFormChange('email', e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Specialization"
              value={formData.specialization}
              onChange={(e) => handleFormChange('specialization', e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Department"
              select
              value={formData.department}
              onChange={(e) => handleFormChange('department', e.target.value)}
              required
              fullWidth
            >
              <MenuItem value="Emergency">Emergency</MenuItem>
              <MenuItem value="Cardiology">Cardiology</MenuItem>
              <MenuItem value="Neurology">Neurology</MenuItem>
              <MenuItem value="Orthopedics">Orthopedics</MenuItem>
              <MenuItem value="Pediatrics">Pediatrics</MenuItem>
              <MenuItem value="Surgery">Surgery</MenuItem>
              <MenuItem value="Radiology">Radiology</MenuItem>
              <MenuItem value="Oncology">Oncology</MenuItem>
              <MenuItem value="Gastroenterology">Gastroenterology</MenuItem>
              <MenuItem value="Dermatology">Dermatology</MenuItem>
              <MenuItem value="Psychiatry">Psychiatry</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={
              !formData.name ||
              !formData.age ||
              !formData.gender ||
              !formData.phone ||
              !formData.email ||
              !formData.specialization ||
              !formData.department
            }
            sx={{
              background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #0284c7, #0891b2)',
              },
            }}
          >
            {dialogMode === 'add' ? 'Add Staff' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={handleCloseDeleteConfirm}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {staffToDelete?.name}? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteConfirm}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
            disabled={deleteStaffMutation.isPending}
          >
            {deleteStaffMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
