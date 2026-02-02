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
  LinearProgress,
  Avatar,
  Card,
  CardContent,
  Tooltip as MuiTooltip
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import FeedbackIcon from '@mui/icons-material/Feedback';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import dashboardService from '../services/dashboardService';
import GenericMetricCard from '../components/Dashboard/GenericMetricCard';
import AttendantRankingCard from '../components/Dashboard/AttendantRankingCard';

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
        setPerformanceData(attendantsPerformance || []);
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
    topResponders,
    topRecruiters,
    totalBonusProjected
  } = useMemo(() => {
    const totalAttendants = performanceData.length;
    const totalResponses = performanceData.reduce((sum, att) => sum + (att.responses || 0), 0);
    const totalBonusProjected = performanceData.reduce((sum, att) => sum + (att.bonus?.totalEarned || 0), 0);

    const attendantsWhoMetGoal = performanceData.filter(att => att.progress?.isNpsMet);
    
    const topPerformers = [...performanceData].sort((a, b) => b.currentNPS - a.currentNPS).slice(0, 3);
    const topResponders = [...performanceData].sort((a, b) => b.responses - a.responses).slice(0, 3);
    const topRecruiters = [...performanceData].sort((a, b) => b.registrations - a.registrations).slice(0, 1);
    
    return {
      totalAttendants,
      totalResponses,
      attendantsWhoMetGoal,
      topPerformers,
      topResponders,
      topRecruiters,
      totalBonusProjected
    };
  }, [performanceData]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
        <CircularProgress size={60} />
        <Typography sx={{ mt: 2 }}>Carregando visão estratégica dos atendentes...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  const ProgressBarWithLabel = ({ value, label, goal, color = 'primary' }) => (
    <Box sx={{ mb: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="caption" fontWeight="bold">{label}</Typography>
        <Typography variant="caption" color="textSecondary">{value} / {goal}</Typography>
      </Box>
      <LinearProgress 
        variant="determinate" 
        value={Math.min((value / (goal || 1)) * 100, 100)} 
        color={color}
        sx={{ height: 8, borderRadius: 5 }}
      />
    </Box>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="800" color="primary">
          Gestão de Atendentes & Metas
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Acompanhe a performance individual e o progresso dos incentivos da sua equipe.
        </Typography>
      </Box>

      {/* Cards de Resumo Estratégico */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <GenericMetricCard title="Atendentes Ativos" value={totalAttendants} icon={<PeopleIcon color="primary" />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <GenericMetricCard title="Total de Respostas" value={totalResponses} icon={<FeedbackIcon color="success" />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <GenericMetricCard title="Bonificações Acumuladas" value={`R$ ${totalBonusProjected.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} icon={<AttachMoneyIcon color="warning" />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <GenericMetricCard title="Meta NPS Batida" value={attendantsWhoMetGoal.length} subValue={`de ${totalAttendants} atendentes`} />
        </Grid>
      </Grid>

      {/* Seção de Destaques (Insights Mastigados) */}
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <TrendingUpIcon color="primary" /> Insights do Mês
      </Typography>
      <Grid container spacing={3} sx={{ mb: 5 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', borderLeft: `6px solid ${theme.palette.warning.main}` }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: theme.palette.warning.light, width: 56, height: 56 }}>
                <EmojiEventsIcon sx={{ color: theme.palette.warning.dark }} />
              </Avatar>
              <Box>
                <Typography variant="caption" color="textSecondary" fontWeight="bold">MELHOR NPS (O ENCANTADOR)</Typography>
                <Typography variant="h6">{topPerformers[0]?.name || '---'}</Typography>
                <Typography variant="body2" color="success.main" fontWeight="bold">NPS {topPerformers[0]?.currentNPS.toFixed(0)}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', borderLeft: `6px solid ${theme.palette.primary.main}` }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: theme.palette.primary.light, width: 56, height: 56 }}>
                <PersonAddIcon sx={{ color: theme.palette.primary.dark }} />
              </Avatar>
              <Box>
                <Typography variant="caption" color="textSecondary" fontWeight="bold">MAIOR CONVERSÃO (O CAPTADOR)</Typography>
                <Typography variant="h6">{topRecruiters[0]?.name || '---'}</Typography>
                <Typography variant="body2" color="primary.main" fontWeight="bold">{topRecruiters[0]?.registrations || 0} cadastros realizados</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', borderLeft: `6px solid ${theme.palette.success.main}` }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: theme.palette.success.light, width: 56, height: 56 }}>
                <StarIcon sx={{ color: theme.palette.success.dark }} />
              </Avatar>
              <Box>
                <Typography variant="caption" color="textSecondary" fontWeight="bold">MAIS ENGAJADO</Typography>
                <Typography variant="h6">{topResponders[0]?.name || '---'}</Typography>
                <Typography variant="body2" color="success.main" fontWeight="bold">{topResponders[0]?.responses || 0} participações</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Gráficos de Evolução (Mantidos) */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: '15px' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight="bold">Evolução Diária de Atendimento</Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Filtrar Atendente</InputLabel>
                  <Select
                    value={selectedAttendant}
                    label="Filtrar Atendente"
                    onChange={(e) => setSelectedAttendant(e.target.value)}
                  >
                    <MenuItem value="all">Todos os Atendentes</MenuItem>
                    {performanceData.map(att => <MenuItem key={att.id} value={att.id}>{att.name}</MenuItem>)}
                  </Select>
                </FormControl>
                <ToggleButtonGroup
                  value={timeSeriesPeriod}
                  exclusive
                  onChange={(e, newPeriod) => newPeriod && setTimeSeriesPeriod(newPeriod)}
                  size="small"
                  color="primary"
                >
                  <ToggleButton value="day">Dia</ToggleButton>
                  <ToggleButton value="week">Semana</ToggleButton>
                  <ToggleButton value="month">Mês</ToggleButton>
                </ToggleButtonGroup>
              </Box>
            </Box>
            <ResponsiveContainer width="100%" height={350}>
                {timeSeriesLoading ? <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><CircularProgress /></Box> : 
                    <LineChart data={timeSeriesData.chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="period" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                        <Legend iconType="circle" />
                        {timeSeriesData.attendantNames.map((attName, index) => (
                            <Line 
                              key={attName} 
                              type="monotone" 
                              dataKey={attName} 
                              stroke={COLORS[index % COLORS.length]} 
                              strokeWidth={3} 
                              dot={{ r: 4 }}
                              activeDot={{ r: 6 }}
                            />
                        ))}
                    </LineChart>
                }
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Métricas Detalhadas com Barra de Progresso e Bônus */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: '15px' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>Progresso de Metas Individuais</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Atendente</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Qualidade (NPS)</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Volume (Respostas)</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Conversão (Cadastros)</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Prêmio Acumulado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {performanceData.length > 0 ? (
                    performanceData.map((atendente) => (
                      <TableRow key={atendente.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ bgcolor: theme.palette.primary.main, fontSize: '0.9rem' }}>
                              {atendente.name.substring(0, 2).toUpperCase()}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight="bold">{atendente.name}</Typography>
                              <Typography variant="caption" color="textSecondary">Cod: {atendente.code}</Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell width="200">
                          <ProgressBarWithLabel 
                            value={atendente.currentNPS.toFixed(0)} 
                            goal={atendente.goals?.nps} 
                            label={`NPS (Alvo: ${atendente.goals?.nps})`}
                            color={atendente.progress?.isNpsMet ? "success" : "primary"}
                          />
                        </TableCell>
                        <TableCell width="200">
                          <ProgressBarWithLabel 
                            value={atendente.responses} 
                            goal={atendente.goals?.responses} 
                            label="Respostas"
                            color={atendente.progress?.isResponsesMet ? "success" : "primary"}
                          />
                        </TableCell>
                        <TableCell width="200">
                          <ProgressBarWithLabel 
                            value={atendente.registrations} 
                            goal={atendente.goals?.registrations} 
                            label="Cadastros"
                            color={atendente.progress?.isRegistrationsMet ? "success" : "primary"}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <MuiTooltip title={atendente.bonus?.details?.map(d => `${d.type}: R$ ${d.value}`).join(' + ') || 'Nenhuma meta batida ainda'}>
                            <Box sx={{ textAlign: 'right' }}>
                              <Typography variant="h6" color={atendente.bonus?.totalEarned > 0 ? "success.main" : "textSecondary"} fontWeight="bold">
                                R$ {atendente.bonus?.totalEarned.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                Potencial: R$ {atendente.bonus?.totalPotential.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </Typography>
                            </Box>
                          </MuiTooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                        Nenhum dado de performance encontrado para este período.
                      </TableCell>
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
