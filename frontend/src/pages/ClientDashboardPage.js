import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  useTheme,
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import clientService from '../services/clientService';

const MetricCard = ({ title, value }) => (
    <Paper elevation={3} sx={{ p: 2, textAlign: 'center', height: '100%' }}>
        <Typography variant="h6" color="text.secondary">{title}</Typography>
        <Typography variant="h4" fontWeight="bold">{value}</Typography>
    </Paper>
);

const ClientDashboardPage = () => {
  const theme = useTheme();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError('');
        // Esta função ainda não existe, será criada no backend e no service
        const data = await clientService.getClientDashboardData(); 
        setDashboardData(data);
      } catch (err) {
        setError(err.message || 'Falha ao carregar o painel de clientes.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const COLORS = [theme.palette.primary.main, theme.palette.secondary.main, theme.palette.error.main, theme.palette.warning.main, theme.palette.info.main];

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography>Carregando painel de clientes...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

    if (!dashboardData) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <Typography>Nenhum dado para exibir.</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Painel de Clientes
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
            <MetricCard title="Total de Clientes" value={dashboardData.totalClients} />
        </Grid>
        <Grid item xs={12} sm={4}>
            <MetricCard title="Aniversariantes do Mês" value={dashboardData.birthdayCount} />
        </Grid>
        <Grid item xs={12} sm={4}>
            <MetricCard title="Média de Idade" value={`${dashboardData.averageAge} anos`} />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 2, height: 400 }}>
                <Typography variant="h6" gutterBottom>Distribuição por Faixa Etária</Typography>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dashboardData.ageDistribution} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend verticalAlign="top" />
                        <Bar dataKey="count" fill={theme.palette.primary.main} name="Clientes" />
                    </BarChart>
                </ResponsiveContainer>
            </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
             <Paper elevation={3} sx={{ p: 2, height: 400 }}>
                <Typography variant="h6" gutterBottom>Distribuição por Gênero</Typography>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={dashboardData.genderDistribution}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                            {dashboardData.genderDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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

export default ClientDashboardPage;
