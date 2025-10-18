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
      // Demo login - accept demo credentials for now
      if (hospitalId === 'HOSP001' && password === 'admin123') {
        setIsLoading(true);
        // Store hospital session
        localStorage.setItem('hospitalId', '1');
        localStorage.setItem('hospitalName', 'City General Hospital');
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Redirect to hospital dashboard
        router.push('/hospital');
      } else {
        setError('Invalid credentials. Please use the demo credentials shown below.');
      }
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
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                Demo Credentials:
              </Typography>
              <Typography variant="body2" fontFamily="monospace">
                Hospital ID: HOSP001
              </Typography>
              <Typography variant="body2" fontFamily="monospace">
                Password: admin123
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
