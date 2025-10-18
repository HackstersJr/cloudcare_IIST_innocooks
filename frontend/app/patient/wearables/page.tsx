'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Alert,
  AlertTitle,
  Chip,
  Button,
  Skeleton,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Favorite as HeartIcon,
  Air as OxygenIcon,
  MonitorHeart as MonitorIcon,
  Sync as SyncIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  WatchLater as WatchIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useLatestWearables, usePatientWearables } from '@/lib/hooks/useWearables';
import { formatDate } from '@/lib/utils/formatters';

const COLORS = {
  heartRate: '#dc004e',
  oxygen: '#2e7d32',
  temperature: '#f57c00',
  steps: '#1976d2',
};

const PIE_COLORS = ['#1976d2', '#2e7d32', '#f57c00', '#dc004e'];

export default function WearablesPage() {
  const patientId = parseInt(process.env.NEXT_PUBLIC_DEMO_PATIENT_ID || '1');
  const { data: latestDataArray, isLoading: loadingLatest, refetch } = useLatestWearables(patientId);
  const { data: historicalData, isLoading: loadingHistory } = usePatientWearables(patientId);

  const [syncing, setSyncing] = useState(false);

  // Extract first element from array
  const latestData = latestDataArray && latestDataArray.length > 0 ? latestDataArray[0] : null;

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000);

    return () => clearInterval(interval);
  }, [refetch]);

  const handleSync = async () => {
    setSyncing(true);
    await refetch();
    setTimeout(() => setSyncing(false), 1000);
  };

  // Get health status
  const getHeartRateStatus = (hr: number) => {
    if (hr < 60) return { status: 'Low', color: 'warning', severity: 'warning' as const };
    if (hr > 100) return { status: 'High', color: 'error', severity: 'error' as const };
    return { status: 'Normal', color: 'success', severity: 'success' as const };
  };

  const getOxygenStatus = (o2: number) => {
    if (o2 < 95) return { status: 'Low', color: 'error', severity: 'error' as const };
    if (o2 >= 95 && o2 <= 100) return { status: 'Normal', color: 'success', severity: 'success' as const };
    return { status: 'Unknown', color: 'default', severity: 'info' as const };
  };

  // Prepare chart data
  const prepareChartData = () => {
    if (!historicalData || historicalData.length === 0) return [];
    
    return historicalData.slice(-20).map((reading) => ({
      time: new Date(reading.timestamp).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      heartRate: reading.heartRate,
      oxygen: reading.oxygenLevel,
      timestamp: reading.timestamp,
    }));
  };

  const preparePieData = () => {
    if (!latestData) return [];
    
    return [
      { name: 'Heart Rate', value: latestData.heartRate || 0 },
      { name: 'Oxygen Level', value: latestData.oxygenLevel || 0 },
      { name: 'Temperature', value: latestData.temperature ? latestData.temperature * 10 : 0 },
      { name: 'Steps (100s)', value: latestData.steps ? Math.floor(latestData.steps / 100) : 0 },
    ];
  };

  const chartData = prepareChartData();
  const pieData = preparePieData();

  // Calculate trends
  const calculateTrend = (data: typeof chartData, key: 'heartRate' | 'oxygen') => {
    if (data.length < 2) return null;
    const recent = data.slice(-5);
    const avg = recent.reduce((sum, d) => sum + (d[key] || 0), 0) / recent.length;
    const prev = data.slice(-10, -5);
    if (prev.length === 0) return null;
    const prevAvg = prev.reduce((sum, d) => sum + (d[key] || 0), 0) / prev.length;
    return avg > prevAvg ? 'up' : avg < prevAvg ? 'down' : 'stable';
  };

  const hrTrend = calculateTrend(chartData, 'heartRate');
  const o2Trend = calculateTrend(chartData, 'oxygen');

  return (
    <DashboardLayout>
      <Grid container spacing={3}>
        {/* Page Header */}
        <Grid size={{ xs: 12 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" fontWeight={600} gutterBottom>
                Wearables & Sensors
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Real-time health monitoring from connected devices
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={syncing ? <SyncIcon className="animate-spin" /> : <SyncIcon />}
              onClick={handleSync}
              disabled={syncing}
            >
              Sync Data
            </Button>
          </Box>
        </Grid>

        {/* Health Alerts */}
        {latestData && (
          <>
            {(latestData.heartRate && (latestData.heartRate < 60 || latestData.heartRate > 100)) && (
              <Grid size={{ xs: 12 }}>
                <Alert 
                  severity={getHeartRateStatus(latestData.heartRate).severity}
                  icon={<WarningIcon />}
                >
                  <AlertTitle>Heart Rate Alert</AlertTitle>
                  Your heart rate is {getHeartRateStatus(latestData.heartRate).status.toLowerCase()} at {latestData.heartRate} BPM. 
                  {latestData.heartRate < 60 && ' Consider consulting your doctor if this persists.'}
                  {latestData.heartRate > 100 && ' Consider resting and staying hydrated.'}
                </Alert>
              </Grid>
            )}
            {(latestData.oxygenLevel && latestData.oxygenLevel < 95) && (
              <Grid size={{ xs: 12 }}>
                <Alert severity="error" icon={<WarningIcon />}>
                  <AlertTitle>Low Oxygen Level</AlertTitle>
                  Your oxygen saturation is at {latestData.oxygenLevel}%. Normal range is 95-100%. 
                  Please seek medical attention if this persists or you feel short of breath.
                </Alert>
              </Grid>
            )}
          </>
        )}

        {/* Metric Cards */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent>
              {loadingLatest ? (
                <>
                  <Skeleton variant="circular" width={48} height={48} sx={{ mb: 2 }} />
                  <Skeleton variant="text" height={40} />
                  <Skeleton variant="text" height={24} />
                </>
              ) : (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <HeartIcon sx={{ fontSize: 48, color: COLORS.heartRate, mr: 2 }} />
                    <Box>
                      <Typography variant="h4" fontWeight={600}>
                        {latestData?.heartRate || '--'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        BPM
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" fontWeight={500} gutterBottom>
                    Heart Rate
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={latestData?.heartRate ? getHeartRateStatus(latestData.heartRate).status : 'N/A'}
                      color={latestData?.heartRate ? getHeartRateStatus(latestData.heartRate).color : 'default'}
                      size="small"
                    />
                    {hrTrend === 'up' && <TrendingUpIcon fontSize="small" color="error" />}
                    {hrTrend === 'down' && <TrendingDownIcon fontSize="small" color="success" />}
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent>
              {loadingLatest ? (
                <>
                  <Skeleton variant="circular" width={48} height={48} sx={{ mb: 2 }} />
                  <Skeleton variant="text" height={40} />
                  <Skeleton variant="text" height={24} />
                </>
              ) : (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <OxygenIcon sx={{ fontSize: 48, color: COLORS.oxygen, mr: 2 }} />
                    <Box>
                      <Typography variant="h4" fontWeight={600}>
                        {latestData?.oxygenLevel || '--'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        %
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" fontWeight={500} gutterBottom>
                    Oxygen Level
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={latestData?.oxygenLevel ? getOxygenStatus(latestData.oxygenLevel).status : 'N/A'}
                      color={latestData?.oxygenLevel ? getOxygenStatus(latestData.oxygenLevel).color : 'default'}
                      size="small"
                    />
                    {o2Trend === 'up' && <TrendingUpIcon fontSize="small" color="success" />}
                    {o2Trend === 'down' && <TrendingDownIcon fontSize="small" color="error" />}
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent>
              {loadingLatest ? (
                <>
                  <Skeleton variant="circular" width={48} height={48} sx={{ mb: 2 }} />
                  <Skeleton variant="text" height={40} />
                  <Skeleton variant="text" height={24} />
                </>
              ) : (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <MonitorIcon sx={{ fontSize: 48, color: COLORS.temperature, mr: 2 }} />
                    <Box>
                      <Typography variant="h4" fontWeight={600}>
                        {latestData?.temperature ? latestData.temperature.toFixed(1) : '--'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        °F
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" fontWeight={500} gutterBottom>
                    Temperature
                  </Typography>
                  <Chip
                    label={latestData?.temperature && latestData.temperature >= 97 && latestData.temperature <= 99 ? 'Normal' : 'N/A'}
                    color={latestData?.temperature && latestData.temperature >= 97 && latestData.temperature <= 99 ? 'success' : 'default'}
                    size="small"
                  />
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent>
              {loadingLatest ? (
                <>
                  <Skeleton variant="circular" width={48} height={48} sx={{ mb: 2 }} />
                  <Skeleton variant="text" height={40} />
                  <Skeleton variant="text" height={24} />
                </>
              ) : (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <WatchIcon sx={{ fontSize: 48, color: COLORS.steps, mr: 2 }} />
                    <Box>
                      <Typography variant="h4" fontWeight={600}>
                        {latestData?.steps ? latestData.steps.toLocaleString() : '--'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        steps
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" fontWeight={500} gutterBottom>
                    Daily Steps
                  </Typography>
                  <Chip
                    label={latestData?.steps && latestData.steps >= 5000 ? 'Active' : 'Low Activity'}
                    color={latestData?.steps && latestData.steps >= 5000 ? 'success' : 'warning'}
                    size="small"
                  />
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Heart Rate Trend Chart */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Heart Rate Trend
              </Typography>
              {loadingHistory ? (
                <Skeleton variant="rectangular" height={300} />
              ) : chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis domain={[50, 120]} />
                    <RechartsTooltip />
                    <Line
                      type="monotone"
                      dataKey="heartRate"
                      stroke={COLORS.heartRate}
                      strokeWidth={2}
                      dot={{ fill: COLORS.heartRate }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">No historical data available</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Health Metrics Distribution */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Metrics Overview
              </Typography>
              {loadingLatest ? (
                <Skeleton variant="circular" width={250} height={250} sx={{ mx: 'auto' }} />
              ) : pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">No data available</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Oxygen Level Trend Chart */}
        <Grid size={{ xs: 12 }}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Oxygen Saturation Trend
              </Typography>
              {loadingHistory ? (
                <Skeleton variant="rectangular" height={300} />
              ) : chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis domain={[90, 100]} />
                    <RechartsTooltip />
                    <Line
                      type="monotone"
                      dataKey="oxygen"
                      stroke={COLORS.oxygen}
                      strokeWidth={2}
                      dot={{ fill: COLORS.oxygen }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">No historical data available</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Connected Devices */}
        <Grid size={{ xs: 12 }}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
                Connected Devices
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <Paper
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="body1" fontWeight={600}>
                          Smartwatch Pro
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Model: HCG-W200
                        </Typography>
                      </Box>
                      <CheckIcon color="success" />
                    </Box>
                    <Box sx={{ mt: 2 }}>
                      <Chip label="Connected" color="success" size="small" sx={{ mr: 1 }} />
                      <Typography variant="caption" color="text.secondary">
                        Last sync: {latestData?.timestamp ? formatDate(new Date(latestData.timestamp)) : 'Never'}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <Paper
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="body1" fontWeight={600}>
                          Blood Pressure Monitor
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Model: HCG-BP100
                        </Typography>
                      </Box>
                      <CheckIcon color="success" />
                    </Box>
                    <Box sx={{ mt: 2 }}>
                      <Chip label="Connected" color="success" size="small" sx={{ mr: 1 }} />
                      <Typography variant="caption" color="text.secondary">
                        Battery: 85%
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <Paper
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      opacity: 0.6,
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="body1" fontWeight={600}>
                          Fitness Band
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Model: HCG-FB50
                        </Typography>
                      </Box>
                      <WarningIcon color="disabled" />
                    </Box>
                    <Box sx={{ mt: 2 }}>
                      <Chip label="Offline" color="default" size="small" sx={{ mr: 1 }} />
                      <Typography variant="caption" color="text.secondary">
                        Last seen: 2 days ago
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </DashboardLayout>
  );
}
