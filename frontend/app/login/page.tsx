'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  InputAdornment,
  IconButton,
} from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Login form validation schema
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'rahul.sharma@yahoo.in', // Pre-filled for demo - Rahul Sharma (First Patient)
      password: 'Demo@123',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setError(null);

    try {
      // TODO: Replace with actual API call to UserLogin endpoint
      // For now, simulate login with demo credentials
      
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Map of actual seeded credentials from database
      const patientCredentials: Record<string, { password: string; patientId: number; name: string }> = {
        'rahul.sharma@yahoo.in': { password: 'Demo@123', patientId: 8, name: 'Rahul Sharma' },
        'priya.gupta@gmail.com': { password: 'Demo@123', patientId: 9, name: 'Priya Gupta' },
        'patient3@cloudcare.local': { password: 'Demo@123', patientId: 10, name: 'Amit Kumar' },
        'patient4@cloudcare.local': { password: 'Demo@123', patientId: 11, name: 'Sneha Mehta' },
        'patient5@cloudcare.local': { password: 'Demo@123', patientId: 12, name: 'Rajesh Kumar (EMERGENCY)' },
        'patient6@cloudcare.local': { password: 'Demo@123', patientId: 13, name: 'John Doe' },
        'patient7@cloudcare.local': { password: 'test123', patientId: 14, name: 'Mobile Test User' },
      };

      const user = patientCredentials[data.email];
      
      if (!user || user.password !== data.password) {
        throw new Error('Invalid email or password');
      }

      // Store auth info
      const demoToken = 'demo_token_' + Date.now();
      localStorage.setItem('authToken', demoToken);
      localStorage.setItem('patientId', user.patientId.toString());
      localStorage.setItem('userEmail', data.email);
      localStorage.setItem('userName', user.name);

      // Redirect to patient dashboard
      router.push('/patient');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: { xs: 3, sm: 5 },
            borderRadius: 3,
          }}
        >
          {/* Logo & Title */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <LocalHospitalIcon
              sx={{ fontSize: 60, color: 'primary.main', mb: 2 }}
            />
            <Typography variant="h4" gutterBottom fontWeight={600}>
              Welcome Back
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in to access your healthcare dashboard
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Demo Info */}
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2" fontWeight={600} gutterBottom>
              🧪 Test Credentials (from seeded database):
            </Typography>
            <Box sx={{ fontSize: '0.75rem', fontFamily: 'monospace' }}>
              <Typography variant="caption" display="block">
                <strong>First Patient:</strong> rahul.sharma@yahoo.in | Demo@123 (Pre-filled - Rahul Sharma)
              </Typography>
              <Typography variant="caption" display="block">
                <strong>Emergency Patient:</strong> patient5@cloudcare.local | Demo@123 (Rajesh Kumar)
              </Typography>
              <Typography variant="caption" display="block">
                <strong>Mobile Test:</strong> patient7@cloudcare.local | test123
              </Typography>
            </Box>
          </Alert>

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
              disabled={loading}
            />

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              {...register('password')}
              error={!!errors.password}
              helperText={errors.password?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
              disabled={loading}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={loading}
              sx={{ mb: 2, py: 1.5 }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>

            <Button
              variant="text"
              fullWidth
              onClick={() => router.push('/')}
              disabled={loading}
            >
              Back to Home
            </Button>
          </form>

          {/* Footer */}
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', textAlign: 'center', mt: 3 }}
          >
            CloudCare v1.0.0 | Healthcare Management System
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}
