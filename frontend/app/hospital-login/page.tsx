'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Container,
  Alert,
} from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';

export default function HospitalLoginPage() {
  const router = useRouter();
  const [hospitalId, setHospitalId] = useState('HOSP001');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!hospitalId || !password) {
      setError('Please enter both Hospital ID and password');
      return;
    }

    try {
      // Map of actual seeded hospitals from database (no user logins, using hospital code + password)
      const hospitalCredentials: Record<string, { password: string; hospitalId: number; name: string }> = {
        'apollo': { password: 'Hospital@123', hospitalId: 8, name: 'Apollo Hospital, Bangalore' },
        'fortis': { password: 'Hospital@123', hospitalId: 9, name: 'Fortis Hospital, Mumbai' },
        'aiims': { password: 'Hospital@123', hospitalId: 10, name: 'AIIMS, Delhi' },
        'manipal': { password: 'Hospital@123', hospitalId: 11, name: 'Manipal Hospital, Pune' },
        'max': { password: 'Hospital@123', hospitalId: 12, name: 'Max Super Specialty Hospital, Gurugram' },
      };

      const hospital = hospitalCredentials[hospitalId.toLowerCase()];
      
      if (!hospital || hospital.password !== password) {
        setError('Invalid credentials. Please use the demo credentials shown below.');
        return;
      }

      setIsLoading(true);
      // Store hospital session
      localStorage.setItem('hospitalId', hospital.hospitalId.toString());
      localStorage.setItem('hospitalName', hospital.name);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Redirect to hospital dashboard
      router.push('/hospital');
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
      }}
    >
      <Container maxWidth="sm">
        <Card
          elevation={8}
          sx={{
            borderRadius: 3,
            backdropFilter: 'blur(10px)',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
          }}
        >
          <CardContent sx={{ p: 4 }}>
            {/* Logo & Title */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  boxShadow: '0 4px 20px rgba(14, 165, 233, 0.3)',
                }}
              >
                <LocalHospitalIcon sx={{ fontSize: 40, color: 'white' }} />
              </Box>
              <Typography
                variant="h4"
                fontWeight="bold"
                sx={{
                  background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Hospital Portal
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Manage your hospital operations
              </Typography>
            </Box>

            {/* Error Alert */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Hospital ID"
                type="text"
                value={hospitalId}
                onChange={(e) => setHospitalId(e.target.value)}
                sx={{ mb: 3 }}
                required
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{ mb: 3 }}
                required
              />

              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                disabled={isLoading}
                sx={{
                  py: 1.5,
                  background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #0284c7, #0891b2)',
                  },
                }}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>

            {/* Demo Credentials */}
            <Box
              sx={{
                mt: 3,
                p: 2,
                backgroundColor: 'rgba(14, 165, 233, 0.1)',
                borderRadius: 2,
                border: '1px solid rgba(14, 165, 233, 0.2)',
              }}
            >
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom fontWeight={600}>
                🧪 Test Credentials (from seeded database):
              </Typography>
              <Typography variant="body2" fontFamily="monospace" fontSize="0.75rem">
                <strong>Apollo:</strong> apollo | Hospital@123
              </Typography>
              <Typography variant="body2" fontFamily="monospace" fontSize="0.75rem">
                <strong>Fortis:</strong> fortis | Hospital@123
              </Typography>
              <Typography variant="body2" fontFamily="monospace" fontSize="0.75rem">
                <strong>AIIMS:</strong> aiims | Hospital@123
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                (Also: manipal, max)
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
