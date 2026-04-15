import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Paper, Grid, CircularProgress, Alert, useTheme, Chip
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { People, Store, Assessment, Storefront as StorefrontIcon, TrendingUp, TrendingDown, Email, WhatsApp, Person as PeopleIcon } from '@mui/icons-material';
import StatCard from '../components/StatCard';
import reportService from '../services/reportService';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

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
        setError(err.response?.data?.message || 'Erro ao carregar dados do dashboard.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatCurrency = (value) => {
    if (!value) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Carregando dashboard...</Typography>
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
        <Typography>Nenhum dado encontrado.</Typography>
      </Container>
    );
  }

  const statsCards = [
    {
      title: 'MRR Estimado',
      value: formatCurrency(dashboardData.totalMRR || 0),
      icon: <Store sx={{ fontSize: 40 }} />,
      color: theme.palette.success.dark,
      trend: '+12%',
      trendUp: true
    },
    {
      title: 'Total de Tenants',
      value: dashboardData.totalTenants || 0,
      icon: <StorefrontIcon sx={{ fontSize: 40 }} />,
      color: theme.palette.primary.main,
      trend: '+5',
      trendUp: true
    },
    {
      title: 'Total de Franqueadores',
      value: dashboardData.totalFranchisors || 0,
      icon: <Assessment sx={{ fontSize: 40 }} />,
      color: theme.palette.info.main,
      trend: '+2',
      trendUp: true
    },
    {
      title: 'Total de Usuários',
      value: dashboardData.totalUsers || 0,
      icon: <People sx={{ fontSize: 40 }} />,
      color: theme.palette.secondary.main,
      trend: '+18',
      trendUp: true
    }
  ];

  const tenantStatusData = [
    { name: 'Ativos', value: dashboardData.activeTenants || 0 },
    { name: 'Inativos', value: dashboardData.inactiveTenants || 0 },
    { name: 'Trial', value: dashboardData.trialTenants || 0 }
  ];

  return (
    <Box sx={{ flexGrow: 1, p: 3, backgroundColor: theme.palette.background.default }}>
      <Container maxWidth="xl">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
            Dashboard Super Admin
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Visão geral do sistema e métricas principais
          </Typography>
        </Box>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statsCards.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <StatCard
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                color={stat.color}
                trend={stat.trend}
                trendUp={stat.trendUp}
              />
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Crescimento de Usuários
                </Typography>
                <Chip label="Últimos 30 dias" size="small" color="primary" variant="outlined" />
              </Box>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dashboardData.userGrowth || []} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 8
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke={theme.palette.primary.main} 
                    strokeWidth={2} 
                    activeDot={{ r: 8 }} 
                    name="Novos Usuários"
                    dot={{ fill: theme.palette.primary.main }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Tenants por Status
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={tenantStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {tenantStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} lg={6}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Tenants por Plano
                </Typography>
                <Chip label="Distribuição" size="small" color="secondary" variant="outlined" />
              </Box>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dashboardData.tenantsByPlan || []} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 8
                    }}
                  />
                  <Legend />
                  <Bar dataKey="value" fill={theme.palette.secondary.main} name="Número de Tenants" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} lg={6}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                Atividade Recente
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {[
                  { icon: <StorefrontIcon />, text: 'Novo tenant cadastrado', time: 'Há 2 horas', color: 'primary' },
                  { icon: <PeopleIcon />, text: 'Novo usuário no sistema', time: 'Há 4 horas', color: 'success' },
                  { icon: <Email />, text: 'Campanha de email enviada', time: 'Há 6 horas', color: 'info' },
                  { icon: <WhatsApp />, text: 'Mensagem WhatsApp enviada', time: 'Há 1 dia', color: 'secondary' },
                ].map((activity, index) => (
                  <Box key={index} sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    p: 2, 
                    bgcolor: 'background.default',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider'
                  }}>
                    <Box sx={{ 
                      p: 1, 
                      borderRadius: 2, 
                      bgcolor: `${activity.color}.light`,
                      mr: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {activity.icon}
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {activity.text}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {activity.time}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default SuperAdminDashboardPage;
