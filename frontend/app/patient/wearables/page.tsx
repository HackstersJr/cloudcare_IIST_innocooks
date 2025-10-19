'use client';

import { useEffect, useMemo, useState } from 'react';
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
  AlertColor,
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
import { formatDate } from '@/lib/utils/formatters';

const COLORS = {
  heartRate: '#dc004e',
  oxygen: '#2e7d32',
  temperature: '#f57c00',
  steps: '#1976d2',
};

const PIE_COLORS = ['#1976d2', '#2e7d32', '#f57c00', '#dc004e'];

type WearableSnapshot = {
  timestamp: string;
  heartRate: number;
  oxygenLevel: number;
  temperature: number;
  steps: number;
};

type WearableHistoryPoint = WearableSnapshot;

type HeartRateStatus = {
  status: string;
  color: 'warning' | 'error' | 'success';
  severity: AlertColor;
};

type OxygenStatus = {
  status: string;
  color: 'error' | 'success' | 'default';
  severity: AlertColor;
};

const MOCK_LATEST_METRICS: WearableSnapshot = {
  timestamp: '2025-10-19T10:30:00Z',
  heartRate: 88,
  oxygenLevel: 96,
  temperature: 98.6,
  steps: 6485,
};

const MOCK_HISTORY: WearableHistoryPoint[] = [
  { timestamp: '2025-10-19T06:00:00Z', heartRate: 74, oxygenLevel: 98, temperature: 98.1, steps: 1450 },
  { timestamp: '2025-10-19T07:00:00Z', heartRate: 78, oxygenLevel: 97, temperature: 98.2, steps: 2100 },
  { timestamp: '2025-10-19T08:00:00Z', heartRate: 82, oxygenLevel: 97, temperature: 98.3, steps: 2740 },
  { timestamp: '2025-10-19T09:00:00Z', heartRate: 86, oxygenLevel: 96, temperature: 98.5, steps: 4100 },
  { timestamp: '2025-10-19T09:30:00Z', heartRate: 90, oxygenLevel: 96, temperature: 98.4, steps: 5120 },
  { timestamp: '2025-10-19T10:00:00Z', heartRate: 92, oxygenLevel: 95, temperature: 98.7, steps: 5980 },
  { timestamp: '2025-10-19T10:15:00Z', heartRate: 89, oxygenLevel: 96, temperature: 98.6, steps: 6205 },
  { timestamp: '2025-10-19T10:30:00Z', heartRate: 88, oxygenLevel: 96, temperature: 98.6, steps: 6485 },
  { timestamp: '2025-10-19T10:45:00Z', heartRate: 87, oxygenLevel: 95, temperature: 98.5, steps: 6710 },
  { timestamp: '2025-10-19T11:00:00Z', heartRate: 85, oxygenLevel: 96, temperature: 98.4, steps: 6890 },
  { timestamp: '2025-10-19T11:15:00Z', heartRate: 83, oxygenLevel: 97, temperature: 98.3, steps: 7025 },
  { timestamp: '2025-10-19T11:30:00Z', heartRate: 84, oxygenLevel: 97, temperature: 98.3, steps: 7240 },
];

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const jitter = (value: number, delta: number) => {
  const offset = (Math.random() * 2 - 1) * delta;
  return value + offset;
};

export default function WearablesPage() {
  const [latestData, setLatestData] = useState<WearableSnapshot | null>(null);
  const [historicalData, setHistoricalData] = useState<WearableHistoryPoint[]>([]);
  const [loadingLatest, setLoadingLatest] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setLatestData(MOCK_LATEST_METRICS);
      setHistoricalData(MOCK_HISTORY);
      setLoadingLatest(false);
      setLoadingHistory(false);
    }, 350);

    return () => window.clearTimeout(timer);
  }, []);

  const handleSync = () => {
    setSyncing(true);
    window.setTimeout(() => {
      setLatestData((prev) => {
        const baseline = prev ?? MOCK_LATEST_METRICS;
        const updated: WearableSnapshot = {
          timestamp: new Date().toISOString(),
          heartRate: Math.round(clamp(jitter(baseline.heartRate, 6), 58, 120)),
          oxygenLevel: Math.round(clamp(jitter(baseline.oxygenLevel, 1.5), 92, 100)),
          temperature: parseFloat(clamp(jitter(baseline.temperature, 0.3), 97.2, 100.2).toFixed(1)),
          steps: Math.round(clamp(baseline.steps + Math.random() * 450 + 120, 0, 15000)),
        };
        return updated;
      });

      setHistoricalData((prev) => {
        const reference = prev.length > 0 ? prev[prev.length - 1] : MOCK_LATEST_METRICS;
        const nextPoint: WearableHistoryPoint = {
          timestamp: new Date().toISOString(),
          heartRate: Math.round(clamp(jitter(reference.heartRate, 5), 58, 120)),
          oxygenLevel: Math.round(clamp(jitter(reference.oxygenLevel, 1.2), 92, 100)),
          temperature: parseFloat(clamp(jitter(reference.temperature, 0.25), 97.0, 100.2).toFixed(1)),
          steps: Math.round(clamp(reference.steps + Math.random() * 320 + 75, 0, 15000)),
        };

        return [...prev.slice(-23), nextPoint];
      });

      setLoadingLatest(false);
      setLoadingHistory(false);
      setSyncing(false);
    }, 700);
  };

  // Get health status
  const getHeartRateStatus = (hr: number): HeartRateStatus => {
    if (hr < 60) return { status: 'Low', color: 'warning', severity: 'warning' };
    if (hr > 100) return { status: 'High', color: 'error', severity: 'error' };
    return { status: 'Normal', color: 'success', severity: 'success' };
  };

  const getOxygenStatus = (o2: number): OxygenStatus => {
    if (o2 < 95) return { status: 'Low', color: 'error', severity: 'error' };
    if (o2 >= 95 && o2 <= 100) return { status: 'Normal', color: 'success', severity: 'success' };
    return { status: 'Unknown', color: 'default', severity: 'info' };
  };

  const chartData = useMemo(() => {
    return historicalData.slice(-20).map((reading) => ({
      time: new Date(reading.timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      heartRate: reading.heartRate,
      oxygen: reading.oxygenLevel,
      timestamp: reading.timestamp,
    }));
  }, [historicalData]);

  const pieData = useMemo(
    () =>
      latestData
        ? [
            { name: 'Heart Rate', value: latestData.heartRate },
            { name: 'Oxygen Level', value: latestData.oxygenLevel },
            { name: 'Temperature', value: Math.round(latestData.temperature * 10) },
            { name: 'Steps (100s)', value: Math.round(latestData.steps / 100) },
          ]
        : [],
    [latestData]
  );

  const calculateTrend = (
    data: Array<{ heartRate?: number | null; oxygen?: number | null }>,
    key: 'heartRate' | 'oxygen'
  ) => {
    if (data.length < 2) return null;
    const recent = data.slice(-5);
    const prev = data.slice(-10, -5);
    if (recent.length === 0 || prev.length === 0) return null;

    const avg = recent.reduce((sum, entry) => sum + (entry[key] ?? 0), 0) / recent.length;
    const prevAvg = prev.reduce((sum, entry) => sum + (entry[key] ?? 0), 0) / prev.length;

    if (avg > prevAvg + 0.5) return 'up' as const;
    if (avg < prevAvg - 0.5) return 'down' as const;
    return 'stable' as const;
  };

  const hrTrend = useMemo(() => calculateTrend(chartData, 'heartRate'), [chartData]);
  const o2Trend = useMemo(() => calculateTrend(chartData, 'oxygen'), [chartData]);

  const heartStatus = latestData?.heartRate ? getHeartRateStatus(latestData.heartRate) : null;
  const oxygenStatus = latestData?.oxygenLevel ? getOxygenStatus(latestData.oxygenLevel) : null;
  const heartStatusLabel = heartStatus?.status ?? 'Normal';

  return (
    <>
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
                  severity={heartStatus?.severity ?? 'warning'}
                  icon={<WarningIcon />}
                >
                  <AlertTitle>Heart Rate Alert</AlertTitle>
                  Your heart rate is {heartStatusLabel.toLowerCase()} at {latestData.heartRate} BPM. 
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
                      label={heartStatus?.status ?? 'N/A'}
                      color={heartStatus?.color ?? 'default'}
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
                      label={oxygenStatus?.status ?? 'N/A'}
                      color={oxygenStatus?.color ?? 'default'}
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
                      label={(props) => {
                        const { name, percent } = props as { name?: string; percent?: number };
                        return `${name ?? 'Metric'}: ${(((percent ?? 0) * 100)).toFixed(0)}%`;
                      }}
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
    </>
  );
}
