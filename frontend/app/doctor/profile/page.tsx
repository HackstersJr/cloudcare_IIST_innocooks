'use client';

import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  TextField,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Edit,
  Settings,
  Notifications,
  Lock,
  Email,
  Phone,
  LocalHospital,
  Badge,
  Close,
} from '@mui/icons-material';
import { MOCK_DOCTOR } from '@/constants/doctor';

export default function DoctorProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [notificationsDialogOpen, setNotificationsDialogOpen] = useState(false);
  
  const [profileData, setProfileData] = useState({
    name: MOCK_DOCTOR.name,
    age: MOCK_DOCTOR.age,
    gender: MOCK_DOCTOR.gender,
    contact: MOCK_DOCTOR.contact,
    email: MOCK_DOCTOR.email || '',
    specializations: MOCK_DOCTOR.specializations,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [notifications, setNotifications] = useState({
    emergencyAlerts: true,
    appointmentReminders: true,
    patientUpdates: true,
    emailNotifications: false,
    smsNotifications: true,
  });

  const handleSaveProfile = () => {
    // In real app, this would call the API
    console.log('Saving profile:', profileData);
    alert('Profile updated successfully!');
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    // Reset to original data
    setProfileData({
      name: MOCK_DOCTOR.name,
      age: MOCK_DOCTOR.age,
      gender: MOCK_DOCTOR.gender,
      contact: MOCK_DOCTOR.contact,
      email: MOCK_DOCTOR.email || '',
      specializations: MOCK_DOCTOR.specializations,
    });
    setIsEditing(false);
  };

  const handleChangePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      alert('Password must be at least 6 characters long!');
      return;
    }
    // In real app, this would call the API
    console.log('Changing password');
    alert('Password changed successfully!');
    setPasswordDialogOpen(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  const handleSaveNotifications = () => {
    // In real app, this would call the API
    console.log('Saving notifications:', notifications);
    alert('Notification preferences updated!');
    setNotificationsDialogOpen(false);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Profile
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your profile and account settings
        </Typography>
      </Box>

      {/* Personal Information */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" fontWeight="600">
              Personal Information
            </Typography>
            {!isEditing ? (
              <Button startIcon={<Edit />} onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant="outlined" onClick={handleCancelEdit}>
                  Cancel
                </Button>
                <Button variant="contained" onClick={handleSaveProfile}>
                  Save Changes
                </Button>
              </Box>
            )}
          </Box>

          <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
            Update your profile details
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
            <Avatar
              sx={{
                width: 120,
                height: 120,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                fontSize: '3rem',
                fontWeight: 600,
              }}
            >
              {profileData.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight="600">
                {profileData.name}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {profileData.specializations}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Doctor ID: #{MOCK_DOCTOR.id}
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
              gap: 3,
            }}
          >
            <TextField
              fullWidth
              label="Full Name"
              value={profileData.name}
              onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
              disabled={!isEditing}
              InputProps={{
                startAdornment: <Badge sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
            <TextField
              fullWidth
              label="Age"
              type="number"
              value={profileData.age}
              onChange={(e) => setProfileData({ ...profileData, age: Number(e.target.value) })}
              disabled={!isEditing}
            />
            <TextField
              fullWidth
              label="Gender"
              value={profileData.gender}
              onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}
              disabled={!isEditing}
            />
            <TextField
              fullWidth
              label="Specialization"
              value={profileData.specializations}
              onChange={(e) => setProfileData({ ...profileData, specializations: e.target.value })}
              disabled={!isEditing}
              InputProps={{
                startAdornment: <LocalHospital sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={profileData.email}
              disabled
              InputProps={{
                startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
              helperText="Email cannot be changed"
            />
            <TextField
              fullWidth
              label="Phone"
              value={profileData.contact}
              onChange={(e) => setProfileData({ ...profileData, contact: e.target.value })}
              disabled={!isEditing}
              InputProps={{
                startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Box>

          {isEditing && (
            <Alert severity="info" sx={{ mt: 3 }}>
              Changes will be saved to your profile
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Account Security */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Lock sx={{ color: 'primary.main' }} />
            <Typography variant="h6" fontWeight="600">
              Account Security
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
            Manage your password and security settings
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="body1" fontWeight="600" gutterBottom>
                Password
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Last changed 3 months ago
              </Typography>
            </Box>
            <Button variant="outlined" onClick={() => setPasswordDialogOpen(true)}>
              Change Password
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Notifications sx={{ color: 'primary.main' }} />
            <Typography variant="h6" fontWeight="600">
              Notifications
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
            Configure your notification preferences
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="body1" fontWeight="600" gutterBottom>
                Notification Settings
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Emergency alerts: {notifications.emergencyAlerts ? 'Enabled' : 'Disabled'}
                <br />
                Appointment reminders: {notifications.appointmentReminders ? 'Enabled' : 'Disabled'}
              </Typography>
            </Box>
            <Button variant="outlined" onClick={() => setNotificationsDialogOpen(true)}>
              Manage Notifications
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Change Password Dialog */}
      <Dialog
        open={passwordDialogOpen}
        onClose={() => setPasswordDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Change Password
            <IconButton onClick={() => setPasswordDialogOpen(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
            <TextField
              fullWidth
              label="Current Password"
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) =>
                setPasswordData({ ...passwordData, currentPassword: e.target.value })
              }
            />
            <TextField
              fullWidth
              label="New Password"
              type="password"
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData({ ...passwordData, newPassword: e.target.value })
              }
              helperText="Password must be at least 6 characters long"
            />
            <TextField
              fullWidth
              label="Confirm New Password"
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) =>
                setPasswordData({ ...passwordData, confirmPassword: e.target.value })
              }
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setPasswordDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleChangePassword}>
            Change Password
          </Button>
        </DialogActions>
      </Dialog>

      {/* Manage Notifications Dialog */}
      <Dialog
        open={notificationsDialogOpen}
        onClose={() => setNotificationsDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Manage Notifications
            <IconButton onClick={() => setNotificationsDialogOpen(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Box>
              <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                Alert Types
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={notifications.emergencyAlerts}
                    onChange={(e) =>
                      setNotifications({ ...notifications, emergencyAlerts: e.target.checked })
                    }
                  />
                }
                label="Emergency Alerts (Critical)"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={notifications.appointmentReminders}
                    onChange={(e) =>
                      setNotifications({
                        ...notifications,
                        appointmentReminders: e.target.checked,
                      })
                    }
                  />
                }
                label="Appointment Reminders"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={notifications.patientUpdates}
                    onChange={(e) =>
                      setNotifications({ ...notifications, patientUpdates: e.target.checked })
                    }
                  />
                }
                label="Patient Updates"
              />
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                Notification Channels
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={notifications.emailNotifications}
                    onChange={(e) =>
                      setNotifications({ ...notifications, emailNotifications: e.target.checked })
                    }
                  />
                }
                label="Email Notifications"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={notifications.smsNotifications}
                    onChange={(e) =>
                      setNotifications({ ...notifications, smsNotifications: e.target.checked })
                    }
                  />
                }
                label="SMS Notifications"
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setNotificationsDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveNotifications}>
            Save Preferences
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
