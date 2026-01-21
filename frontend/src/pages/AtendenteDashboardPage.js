import React, { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  useTheme,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButtonGroup,
  ToggleButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';
import dashboardService from '../services/dashboardService';
import GenericMetricCard from '../components/dashboard/GenericMetricCard';
import AttendantRankingCard from '../components/dashboard/AttendantRankingCard';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1919'];

const AtendenteDashboardPage = () => {
  const theme = useTheme();
  const [performanceData, setPerformanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [timeSeriesPeriod, setTimeSeriesPeriod] = useState('day');
  const [selectedAttendant, setSelectedAttendant] = useState('all');
  const [timeSeriesData, setTimeSeriesData] = useState({ chartData: [], attendantNames: [] });
  const [timeSeriesLoading, setTimeSeriesLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        const attendantsPerformance = await dashboardService.getAttendantsPerformance();
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

  useEffect(() => {
    const fetchTimeSeriesData = async () => {
      try {
        setTimeSeriesLoading(true);
        const params = { period: timeSeriesPeriod };
        if (selectedAttendant !== 'all') {
          params.atendenteId = selectedAttendant;
        }
        const data = await dashboardService.getAttendantResponsesTimeseries(params);
        setTimeSeriesData(data || { chartData: [], attendantNames: [] });
      } catch (err) {
        // Handle error for time series data
      } finally {
        setTimeSeriesLoading(false);
      }
    };
    fetchTimeSeriesData();
  }, [timeSeriesPeriod, selectedAttendant]);

  const {
    totalAttendants,
    totalResponses,
    attendantsWhoMetGoal,
    topPerformers,
    topResponders
  } = useMemo(() => {
    const totalAttendants = performanceData.length;
    const totalResponses = performanceData.reduce((sum, att) => sum + att.responses, 0);

    const attendantsWhoMetGoal = performanceData.filter(att => att.npsGoal && att.currentNPS >= att.npsGoal);
    
    const topPerformers = [...performanceData].sort((a, b) => b.currentNPS - a.currentNPS).slice(0, 3);
    const topResponders = [...performanceData].sort((a, b) => b.responses - a.responses).slice(0, 3);
    
    return {
      totalAttendants,
      totalResponses,
      attendantsWhoMetGoal,
      topPerformers,
      topResponders
    };
  }, [performanceData]);

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

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}><GenericMetricCard title="Atendentes Ativos" value={totalAttendants} /></Grid>
        <Grid item xs={12} sm={6} md={4}><GenericMetricCard title="Total de Respostas" value={totalResponses} /></Grid>
        <Grid item xs={12} sm={6} md={4}><GenericMetricCard title="Atingiram a Meta NPS" value={attendantsWhoMetGoal.length} /></Grid>
      </Grid>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
            <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">Ranking de Performance (NPS)</Typography>
             <Grid container spacing={3}>
                {topPerformers.map((attendant, index) => (
                  <Grid item xs={12} sm={6} md={4} key={`top-nps-${attendant.id}`}>
                    <AttendantRankingCard attendant={attendant} rank={index + 1} icon={EmojiEventsIcon} color={index === 0 ? theme.palette.warning.main : index === 1 ? theme.palette.grey[500] : theme.palette.warning.dark} metric={attendant.currentNPS} unit="NPS" />
                  </Grid>
                ))}
              </Grid>
        </Grid>
        <Grid item xs={12}>
            <Typography variant="h5" component="h2" gutterBottom fontWeight="bold" sx={{ mt: 4 }}>Ranking por Respostas</Typography>
             <Grid container spacing={3}>
                {topResponders.map((attendant, index) => (
                  <Grid item xs={12} sm={6} md={4} key={`top-resp-${attendant.id}`}>
                    <AttendantRankingCard attendant={attendant} rank={index + 1} icon={StarIcon} color={theme.palette.primary.main} metric={attendant.responses} unit="Respostas"/>
                  </Grid>
                ))}
              </Grid>
        </Grid>
      </Grid>
      
      <Grid container spacing={3} sx={{ mt: 4 }}>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" gutterBottom>Evolução de Respostas</Typography>
              <Box>
                <FormControl size="small" sx={{ mr: 2, minWidth: 150 }}>
                  <InputLabel>Atendente</InputLabel>
                  <Select
                    value={selectedAttendant}
                    label="Atendente"
                    onChange={(e) => setSelectedAttendant(e.target.value)}
                  >
                    <MenuItem value="all">Todos</MenuItem>
                    {performanceData.map(att => <MenuItem key={att.id} value={att.id}>{att.name}</MenuItem>)}
                  </Select>
                </FormControl>
                <ToggleButtonGroup
                  value={timeSeriesPeriod}
                  exclusive
                  onChange={(e, newPeriod) => newPeriod && setTimeSeriesPeriod(newPeriod)}
                  aria-label="período"
                  size="small"
                >
                  <ToggleButton value="day" aria-label="diário">Diário</ToggleButton>
                  <ToggleButton value="week" aria-label="semanal">Semanal</ToggleButton>
                  <ToggleButton value="month" aria-label="mensal">Mensal</ToggleButton>
                </ToggleButtonGroup>
              </Box>
            </Box>
            <ResponsiveContainer width="100%" height={400}>
                {timeSeriesLoading ? <CircularProgress /> : 
                    <LineChart data={timeSeriesData.chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="period" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        {timeSeriesData.attendantNames.map((attName, index) => (
                            <Line 
                              key={attName} 
                              type="monotone" 
                              dataKey={attName} 
                              stroke={COLORS[index % COLORS.length]} 
                              strokeWidth={2} 
                            />
                        ))}
                    </LineChart>
                }
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

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
                    <TableCell align="right">Meta de NPS</TableCell>
                    <TableCell align="right">Total de Respostas</TableCell>
                    <TableCell align="right">Meta de Respostas</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {performanceData.length > 0 ? (
                    performanceData.map((atendente) => (
                      <TableRow key={atendente.id} hover>
                        <TableCell>{atendente.name}</TableCell>
                        <TableCell align="right">{atendente.currentNPS.toFixed(0)}</TableCell>
                        <TableCell align="right">{atendente.npsGoal || 'N/A'}</TableCell>
                        <TableCell align="right">{atendente.responses}</TableCell>
                        <TableCell align="right">{atendente.responsesGoal || 'N/A'}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center">Nenhum atendente encontrado ou dados indisponíveis.</TableCell>
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
