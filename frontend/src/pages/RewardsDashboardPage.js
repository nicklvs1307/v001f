import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Paper,
  Grid,
  useTheme,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import recompensaService from '../services/recompensaService';

const MetricCard = ({ title, value, color }) => (
  <Paper elevation={2} sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%', borderLeft: `4px solid ${color}` }}>
    <Typography variant="subtitle2" color="text.secondary" textTransform="uppercase">{title}</Typography>
    <Typography variant="h5" component="div" fontWeight="bold" sx={{ mt: 1 }}>{value}</Typography>
  </Paper>
);

const RewardsDashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const theme = useTheme();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const data = await recompensaService.getRewardsDashboard();
        setDashboardData(data);
      } catch (err) {
        setError(err.message || 'Erro ao carregar dados do painel de recompensas.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography>Carregando painel de recompensas...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!dashboardData) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <Typography>Nenhum dado de recompensa encontrado.</Typography>
      </Container>
    );
  }

  const totalCupons = dashboardData.couponStatus.reduce((acc, curr) => acc + parseInt(curr.count, 10), 0);
  const activeCupons = dashboardData.couponStatus.find(item => item.status === 'active')?.count || 0;
  const usedCupons = dashboardData.couponStatus.find(item => item.status === 'used')?.count || 0;
  const expiredCupons = dashboardData.couponStatus.find(item => item.status === 'expired')?.count || 0;

  const pieChartData = dashboardData.couponStatus.map(item => ({
    name: item.status,
    value: parseInt(item.count, 10),
  }));

  const PIE_COLORS = [theme.palette.success.main, theme.palette.warning.main, theme.palette.error.main, theme.palette.info.main];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Painel de Recompensas
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6} lg={3}>
          <MetricCard title="Total de Cupons Gerados" value={totalCupons} color={theme.palette.primary.main} />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <MetricCard title="Cupons Ativos" value={activeCupons} color={theme.palette.success.main} />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <MetricCard title="Cupons Utilizados" value={usedCupons} color={theme.palette.warning.main} />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <MetricCard title="Cupons Expirados" value={expiredCupons} color={theme.palette.error.main} />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" color="text.secondary" sx={{ borderBottom: '1px solid #e0e0e0', pb: 1, mb: 1 }}>
              Cupons Gerados por Recompensa
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={dashboardData.rewardsUsage}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-15} textAnchor="end" height={50} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill={theme.palette.primary.light} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" color="text.secondary" sx={{ borderBottom: '1px solid #e0e0e0', pb: 1, mb: 1 }}>
              Distribuição de Status dos Cupons
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default RewardsDashboardPage;
