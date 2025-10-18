'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Box, Container, Typography, Button, Paper } from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      router.push('/patient');
    }
  }, [router]);

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 4,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: 3,
            width: '100%',
          }}
        >
          <LocalHospitalIcon
            sx={{ fontSize: 80, color: 'primary.main', mb: 2 }}
          />
          
          <Typography variant="h3" gutterBottom fontWeight={600}>
            CloudCare
          </Typography>
          
          <Typography variant="h6" color="text.secondary" gutterBottom sx={{ mb: 4 }}>
            Healthcare Management System
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Your complete healthcare companion for managing appointments, 
            prescriptions, wearable data, and medical records.
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={() => router.push('/login')}
            >
              Patient Login
            </Button>
            
            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={() => router.push('/doctor-login')}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
                },
              }}
            >
              Doctor Login
            </Button>
            
            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={() => router.push('/hospital-login')}
              sx={{
                background: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #0284c7 0%, #0891b2 100%)',
                },
              }}
            >
              Hospital Login
            </Button>
            
            <Button
              variant="outlined"
              size="large"
              fullWidth
              onClick={() => router.push('/patient')}
            >
              Continue as Demo Patient
            </Button>
          </Box>

          <Typography variant="caption" color="text.secondary" sx={{ mt: 4, display: 'block' }}>
            v1.0.0 | CloudCare @ IIST Innocooks
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}
