import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  CircularProgress,
  Alert
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { People, Store, Assessment } from '@mui/icons-material';
import StatCard from '../../components/SuperAdmin/StatCard';
import reportService from '../../services/reportService'; // Supondo que você tenha um serviço para buscar os dados

const SuperAdminDashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // TODO: Descomente quando o endpoint do backend estiver pronto
        // const data = await reportService.getSuperAdminDashboard();
        // setDashboardData(data);

        // Dados de exemplo por enquanto
        const mockData = {
          totalTenants: 15,
          totalUsers: 250,
          totalSurveys: 80,
          tenantsByPlan: [
            { name: 'Básico', value: 8 },
            { name: 'Pro', value: 5 },
            { name: 'Enterprise', value: 2 },
          ],
          userGrowth: [
            { name: 'Jan', value: 20 },
            { name: 'Fev', value: 45 },
            { name: 'Mar', value: 60 },
            { name: 'Abr', value: 80 },
            { name: 'Mai', value: 110 },
            { name: 'Jun', value: 150 },
          ],
        };
        setDashboardData(mockData);

      } catch (err) {
        setError(err.message || 'Falha ao carregar os dados do dashboard.');
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
        <Typography>Carregando dashboard...</Typography>
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
        <Typography>Nenhum dado de dashboard encontrado.</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
        Dashboard Super Admin
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total de Tenants"
            value={dashboardData.totalTenants}
            icon={<Store fontSize="large" color="primary" />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total de Usuários"
            value={dashboardData.totalUsers}
            icon={<People fontSize="large" color="secondary" />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total de Pesquisas"
            value={dashboardData.totalSurveys}
            icon={<Assessment fontSize="large" color="success" />}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Crescimento de Usuários
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardData.userGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" name="Novos Usuários" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Tenants por Plano
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardData.tenantsByPlan}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#82ca9d" name="Número de Tenants" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default SuperAdminDashboardPage;
