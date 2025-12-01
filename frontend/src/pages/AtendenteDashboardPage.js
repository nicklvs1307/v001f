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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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

  const {
    totalAttendants,
    totalResponses,
    averageNps,
    averageCsat,
    attendantsWhoMetGoal,
    attendantsWhoDidNotMeetGoal,
    goalMetData,
  } = useMemo(() => {
    const totalAttendants = performanceData.length;
    const totalResponses = performanceData.reduce((sum, att) => sum + att.responses, 0);
    const averageNps = totalAttendants > 0 ? (performanceData.reduce((sum, att) => sum + att.currentNPS, 0) / totalAttendants) : 0;
    const averageCsat = totalAttendants > 0 ? (performanceData.reduce((sum, att) => sum + att.currentCSAT, 0) / totalAttendants) : 0;

    const attendantsWhoMetGoal = performanceData.filter(
      att => att.npsGoal && att.currentNPS >= att.npsGoal
    );
    const attendantsWhoDidNotMeetGoal = performanceData.filter(
      att => !att.npsGoal || att.currentNPS < att.npsGoal
    );

    const goalMetData = [
      { name: 'Atingiram a Meta', value: attendantsWhoMetGoal.length },
      { name: 'Não Atingiram', value: attendantsWhoDidNotMeetGoal.length },
    ];
    
    return {
      totalAttendants,
      totalResponses,
      averageNps,
      averageCsat,
      attendantsWhoMetGoal,
      attendantsWhoDidNotMeetGoal,
      goalMetData,
    };
  }, [performanceData]);

  // Chart Data Preparation
  const barChartData = performanceData.map(att => ({
    name: att.name.split(' ')[0], // Shorten name
    Respostas: att.responses,
    NPS: att.currentNPS,
    MetaNPS: att.npsGoal || null,
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
        <Grid item xs={12} sm={6} md={3}><MetricCard title="Atingiram a Meta NPS" value={attendantsWhoMetGoal.length} /></Grid>
        <Grid item xs={12} sm={6} md={3}><MetricCard title="Não Atingiram a Meta NPS" value={attendantsWhoDidNotMeetGoal.length} /></Grid>
      </Grid>
      
      {/* 2. Ranking & Goals Section */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
            <Typography variant="h5" component="h2" gutterBottom fontWeight="bold">Ranking de Performance (NPS)</Typography>
             <Grid container spacing={3}>
                {topPerformers.map((attendant, index) => (
                  <Grid item xs={12} md={4} key={`top-${attendant.id}`}>
                    <RankingCard attendant={attendant} rank={index + 1} icon={EmojiEventsIcon} color={index === 0 ? theme.palette.warning.main : index === 1 ? theme.palette.grey[500] : theme.palette.warning.dark} />
                  </Grid>
                ))}
              </Grid>
        </Grid>
        <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>Proporção de Metas Atingidas</Typography>
                <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                        <Pie data={goalMetData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                            <Cell key="cell-0" fill={theme.palette.success.main} />
                            <Cell key="cell-1" fill={theme.palette.error.main} />
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </Paper>
        </Grid>
      </Grid>
      
      {/* 3. Charts Section */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* Bar Chart */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>Performance por Atendente (NPS)</Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" interval={0} angle={-35} textAnchor="end" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="NPS" fill={theme.palette.primary.main} name="NPS Atual" />
                <Bar dataKey="MetaNPS" fill={theme.palette.secondary.light} name="Meta de NPS" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
      
      {/* 4. Goal Lists Section */}
      <Grid container spacing={3} sx={{ mt: 4 }}>
        <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{p: 2}}>
                <Typography variant="h6" gutterBottom color="success.main">Atingiram a Meta de NPS</Typography>
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Atendente</TableCell>
                                <TableCell align="right">NPS Atual</TableCell>
                                <TableCell align="right">Meta NPS</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {attendantsWhoMetGoal.map(att => (
                                <TableRow key={att.id}>
                                    <TableCell>{att.name}</TableCell>
                                    <TableCell align="right">{att.currentNPS}</TableCell>
                                    <TableCell align="right">{att.npsGoal}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{p: 2}}>
                <Typography variant="h6" gutterBottom color="error.main">Não Atingiram a Meta de NPS</Typography>
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Atendente</TableCell>
                                <TableCell align="right">NPS Atual</TableCell>
                                <TableCell align="right">Meta NPS</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {attendantsWhoDidNotMeetGoal.map(att => (
                                <TableRow key={att.id}>
                                    <TableCell>{att.name}</TableCell>
                                    <TableCell align="right">{att.currentNPS}</TableCell>
                                    <TableCell align="right">{att.npsGoal || 'N/A'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Grid>
      </Grid>

      {/* 5. Detailed Table */}
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
                        <TableCell align="right">{atendente.currentNPS}</TableCell>
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
