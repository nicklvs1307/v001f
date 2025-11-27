import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  useTheme,
  Box,
  Icon,
} from '@mui/material';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'; // Trophy icon
import WarningIcon from '@mui/icons-material/Warning'; // Warning/demotion icon
import dashboardService from '../services/dashboardService';

const MetricCard = ({ title, value, unit = '' }) => (
  <Paper elevation={3} sx={{ p: 2, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
    <Typography variant="subtitle1" color="text.secondary">{title}</Typography>
    <Typography variant="h4" fontWeight="bold">
      {value}
      {unit && <Typography component="span" variant="h6" color="text.secondary" sx={{ ml: 0.5 }}>{unit}</Typography>}
    </Typography>
  </Paper>
);

const RankingCard = ({ attendant, rank, icon, color }) => (
  <Paper elevation={3} sx={{ p: 2, textAlign: 'center', height: '100%', borderBottom: `4px solid ${color}` }}>
    <Icon component={icon} sx={{ fontSize: 40, color: color }} />
    <Typography variant="h6" fontWeight="bold">{rank}° Lugar</Typography>
    <Typography variant="body1">{attendant.name}</Typography>
    <Typography variant="h5" color="text.primary" fontWeight="medium">{attendant.currentNPS.toFixed(0)} <Typography component="span" variant="caption">NPS</Typography></Typography>
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
        // This service will now return sorted data from the backend
        const attendantsPerformance = await dashboardService.getAttendantsPerformance();
        // Sort by NPS descending to make sure we have the correct order for ranking
        const sortedPerformance = attendantsPerformance.sort((a, b) => b.currentNPS - a.currentNPS);
        setPerformanceData(sortedPerformance || []);
      } catch (err) {
        setError(err.message || 'Falha ao carregar o painel de atendentes.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Summary Metrics Calculation
  const totalAttendants = performanceData.length;
  const totalResponses = performanceData.reduce((sum, att) => sum + att.responses, 0);
  const averageNps = totalAttendants > 0 ? (performanceData.reduce((sum, att) => sum + att.currentNPS, 0) / totalAttendants) : 0;
  const averageCsat = totalAttendants > 0 ? (performanceData.reduce((sum, att) => sum + att.currentCSAT, 0) / totalAttendants) : 0;

  // Chart Data Preparation
  const barChartData = performanceData.map(att => ({
    name: att.name.split(' ')[0], // Shorten name
    Respostas: att.responses,
    NPS: att.currentNPS,
  }));

  const pieChartData = performanceData
    .filter(att => att.responses > 0)
    .map(att => ({
      name: att.name,
      value: att.responses,
    }));
  const PIE_COLORS = [theme.palette.primary.main, theme.palette.secondary.main, theme.palette.success.light, theme.palette.warning.light, theme.palette.info.light];

  // Ranking Data
  const topPerformers = performanceData.slice(0, 3);
  const bottomPerformers = performanceData.slice(-3).reverse();

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
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        Painel de Atendentes
      </Typography>

      {/* 1. Summary Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}><MetricCard title="Atendentes Ativos" value={totalAttendants} /></Grid>
        <Grid item xs={12} sm={6} md={3}><MetricCard title="Total de Respostas" value={totalResponses} /></Grid>
        <Grid item xs={12} sm={6} md={3}><MetricCard title="Média Geral NPS" value={averageNps.toFixed(0)} /></Grid>
        <Grid item xs={12} sm={6} md={3}><MetricCard title="Média Geral CSAT" value={averageCsat.toFixed(1)} unit="/ 5" /></Grid>
      </Grid>
      
      {/* 2. Ranking Section */}
      <Typography variant="h5" component="h2" gutterBottom fontWeight="bold" sx={{ mt: 4 }}>Ranking de Performance (NPS)</Typography>
      <Grid container spacing={3}>
        {/* Top 3 Performers */}
        {topPerformers.map((attendant, index) => (
          <Grid item xs={12} md={4} key={`top-${attendant.id}`}>
            <RankingCard attendant={attendant} rank={index + 1} icon={EmojiEventsIcon} color={index === 0 ? theme.palette.warning.main : index === 1 ? theme.palette.grey[500] : theme.palette.warning.dark} />
          </Grid>
        ))}
      </Grid>
      
      {/* 3. Charts Section */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* Bar Chart */}
        <Grid item xs={12} lg={8}>
          <Paper elevation={3} sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>Performance por Atendente</Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" interval={0} angle={-35} textAnchor="end" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Respostas" fill={theme.palette.secondary.light} />
                <Bar dataKey="NPS" fill={theme.palette.primary.main} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        {/* Pie Chart */}
        <Grid item xs={12} lg={4}>
          <Paper elevation={3} sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>Distribuição de Respostas</Typography>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie data={pieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
      
      {/* 4. Detailed Table */}
      <Grid container spacing={3} sx={{ mt: 4 }}>
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
                        <TableCell align="right">{atendente.currentRegistrations || 0}</TableCell>
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
