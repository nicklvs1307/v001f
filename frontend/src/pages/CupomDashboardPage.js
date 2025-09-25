import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import cupomService from '../services/cupomService';

const MetricCard = ({ title, value, bgColor, borderColor }) => (
  <Paper elevation={2} sx={{
    p: 2,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%',
    borderLeft: `4px solid ${borderColor || '#1976d2'}`,
    backgroundColor: bgColor || 'white',
  }}>
    <Typography variant="subtitle2" color="text.secondary" textTransform="uppercase">
      {title}
    </Typography>
    <Typography variant="h5" component="div" fontWeight="bold" sx={{ mt: 1 }}>
      {value}
    </Typography>
  </Paper>
);

const CupomDashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const data = await cupomService.getCuponsSummary();
        setSummary(data);
      } catch (err) {
        setError(err.message || 'Erro ao carregar o resumo de cupons.');
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography>Carregando painel de cupons...</Typography>
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

  if (!summary) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <Typography>Nenhum dado de cupom encontrado.</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Painel de Cupons
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6} lg={3}>
          <MetricCard title="Total de Cupons" value={summary.totalCupons} borderColor="#1976d2" />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <MetricCard title="Cupons Ativos" value={summary.activeCupons} borderColor="#388e3c" />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <MetricCard title="Cupons Utilizados" value={summary.usedCupons} borderColor="#fbc02d" />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <MetricCard title="Cupons Vencidos" value={summary.expiredCupons} borderColor="#d32f2f" />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <MetricCard title="Vencendo em 7 Dias" value={summary.expiringSoonCupons} borderColor="#ffa000" />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" color="text.secondary" sx={{ borderBottom: '1px solid #e0e0e0', pb: 1, mb: 1 }}>
              Cupons por Tipo de Recompensa
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={summary.cuponsByType}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CupomDashboardPage;
