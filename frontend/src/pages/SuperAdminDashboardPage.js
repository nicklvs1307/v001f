import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  useTheme,
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { People, Store, Assessment } from '@mui/icons-material';
import StatCard from '../components/StatCard';
import reportService from '../services/reportService';

const SuperAdminDashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const theme = useTheme();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await reportService.getSuperAdminDashboard();
        setDashboardData(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard data.');
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
        <Typography>Loading dashboard...</Typography>
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
        <Typography>No dashboard data found.</Typography>
      </Container>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3, backgroundColor: theme.palette.background.default }}>
      <Container maxWidth="xl">
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
          Super Admin Dashboard
        </Typography>

        <Grid container spacing={4} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title="Total de Tenants"
              value={dashboardData.totalTenants}
              icon={<Store sx={{ fontSize: 40, color: theme.palette.primary.main }} />}
              color={theme.palette.primary.main}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title="Total de Usuários"
              value={dashboardData.totalUsers}
              icon={<People sx={{ fontSize: 40, color: theme.palette.secondary.main }} />}
              color={theme.palette.secondary.main}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title="Total de Pesquisas"
              value={dashboardData.totalSurveys}
              icon={<Assessment sx={{ fontSize: 40, color: theme.palette.success.main }} />}
              color={theme.palette.success.main}
            />
          </Grid>
        </Grid>

        <Grid container spacing={4}>
          <Grid item xs={12} lg={6}>
            <Paper elevation={3} sx={{ p: 3, height: 400, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Crescimento de Usuários
              </Typography>
              <ResponsiveContainer width="100%" height="90%">
                <LineChart data={dashboardData.userGrowth} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="value" stroke={theme.palette.primary.main} strokeWidth={2} activeDot={{ r: 8 }} name="Novos Usuários" />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          <Grid item xs={12} lg={6}>
            <Paper elevation={3} sx={{ p: 3, height: 400, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Tenants por Plano
              </Typography>
              <ResponsiveContainer width="100%" height="90%">
                <BarChart data={dashboardData.tenantsByPlan}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill={theme.palette.secondary.main} name="Número de Tenants" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default SuperAdminDashboardPage;
