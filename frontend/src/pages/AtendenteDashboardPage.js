import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  useTheme,
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import dashboardService from '../services/dashboardService';

const MetricCard = ({ title, value }) => (
    <Paper elevation={3} sx={{ p: 2, textAlign: 'center', height: '100%' }}>
        <Typography variant="h6" color="text.secondary">{title}</Typography>
        <Typography variant="h4" fontWeight="bold">{value}</Typography>
    </Paper>
);

const AtendenteDashboardPage = () => {
  const theme = useTheme();
  const [performanceData, setPerformanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        const attendantsPerformance = await dashboardService.getAttendantsPerformance();
        setPerformanceData(attendantsPerformance || []);
      } catch (err) {
        setError(err.message || 'Falha ao carregar o painel de atendentes.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalAttendants = performanceData.length;
  const totalResponses = performanceData.reduce((sum, att) => sum + att.responses, 0);
  const averageNps = totalAttendants > 0
    ? (performanceData.reduce((sum, att) => sum + att.currentNPS, 0) / totalAttendants).toFixed(1)
    : 0;
  const averageCsat = totalAttendants > 0
    ? (performanceData.reduce((sum, att) => sum + att.currentCSAT, 0) / totalAttendants).toFixed(2)
    : 0;

  const chartData = performanceData.map(att => ({
      name: att.name.split(' ')[0], // Shorten name for chart
      Respostas: att.responses,
      NPS: att.currentNPS,
      CSAT: att.currentCSAT,
  }));

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography>Carregando painel de atendentes...</Typography>
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

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Painel de Atendentes
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={3}>
            <MetricCard title="Atendentes Ativos" value={totalAttendants} />
        </Grid>
        <Grid item xs={12} sm={3}>
            <MetricCard title="Média Geral de NPS" value={averageNps} />
        </Grid>
        <Grid item xs={12} sm={3}>
            <MetricCard title="Média Geral de CSAT" value={averageCsat} />
        </Grid>
        <Grid item xs={12} sm={3}>
            <MetricCard title="Total de Respostas" value={totalResponses} />
        </Grid>
      </Grid>

      {/* Chart */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 2, height: 400 }}>
                <Typography variant="h6" gutterBottom>Performance por Atendente</Typography>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} />
                        <YAxis />
                        <Tooltip />
                        <Legend verticalAlign="top" />
                        <Bar dataKey="Respostas" fill={theme.palette.grey[500]} />
                        <Bar dataKey="NPS" fill={theme.palette.primary.main} />
                        <Bar dataKey="CSAT" fill={theme.palette.secondary.main} />
                    </BarChart>
                </ResponsiveContainer>
            </Paper>
        </Grid>
      </Grid>

      {/* Detailed Table */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Métricas Detalhadas por Atendente</Typography>
            <TableContainer>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Nome do Atendente</TableCell>
                    <TableCell align="right">NPS</TableCell>
                    <TableCell align="right">Média CSAT</TableCell>
                    <TableCell align="right">Meta de NPS</TableCell>
                    <TableCell align="right">Meta de CSAT</TableCell>
                    <TableCell align="right">Total de Respostas</TableCell>
                    <TableCell align="right">Meta de Respostas</TableCell>
                    <TableCell align="right">Cadastros</TableCell>
                    <TableCell align="right">Meta de Cadastros</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {performanceData.length > 0 ? (
                    performanceData.map((atendente) => (
                      <TableRow key={atendente.id} hover>
                        <TableCell>{atendente.name}</TableCell>
                        <TableCell align="right">{atendente.currentNPS}</TableCell>
                        <TableCell align="right">{atendente.currentCSAT}</TableCell>
                        <TableCell align="right">{atendente.npsGoal || 'N/A'}</TableCell>
                        <TableCell align="right">{atendente.csatGoal || 'N/A'}</TableCell>
                        <TableCell align="right">{atendente.responses}</TableCell>
                        <TableCell align="right">{atendente.responsesGoal || 'N/A'}</TableCell>
                        <TableCell align="right">{atendente.currentRegistrations}</TableCell>
                        <TableCell align="right">{atendente.registrationsGoal || 'N/A'}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} align="center">Nenhum atendente encontrado ou dados indisponíveis.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AtendenteDashboardPage;
