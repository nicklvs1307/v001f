import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  Tooltip as MuiTooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
  Rating,
  Button,
  DialogActions,
  TextField,
  Snackbar
} from '@mui/material';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line 
} from 'recharts';
import CloseIcon from '@mui/icons-material/Close';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import FeedbackIcon from '@mui/icons-material/Feedback';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dashboardService from '../services/dashboardService';
import atendenteService from '../services/atendenteService';
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

  // Estados para o Modal de Auditoria
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [auditData, setAuditModalData] = useState(null);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditDateRange, setAuditDateRange] = useState({ startDate: null, endDate: null });
  const [currentAttendantId, setCurrentAttendantId] = useState(null);

  // Estados para Premiação (Fechamento)
  const [awardDialogOpen, setAwardDialogOpen] = useState(false);
  const [awardDescription, setAwardDescription] = useState('');
  const [awarding, setAwarding] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchData = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fetchAttendantAudit = async (id, dates = auditDateRange) => {
    setAuditLoading(true);
    try {
      const params = {};
      if (dates.startDate) params.startDate = dates.startDate.toISOString();
      if (dates.endDate) params.endDate = dates.endDate.toISOString();
      
      const data = await dashboardService.getAttendantDetails(id, params);
      setAuditModalData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setAuditLoading(false);
    }
  };

  const handleOpenAudit = (atendente) => {
    setCurrentAttendantId(atendente.id);
    setAuditModalOpen(true);
    fetchAttendantAudit(atendente.id);
  };

  const handleAuditDateChange = (name, value) => {
    const newDates = { ...auditDateRange, [name]: value };
    setAuditDateRange(newDates);
    if (currentAttendantId) {
      fetchAttendantAudit(currentAttendantId, newDates);
    }
  };

  const handleAwardBonus = async () => {
    if (!currentAttendantId || !auditData) return;
    
    const currentAttendantPerf = performanceData.find(a => a.id === currentAttendantId);
    if (!currentAttendantPerf) return;

    setAwarding(true);
    try {
      await atendenteService.awardBonus(currentAttendantId, {
        valor_premio: currentAttendantPerf.bonus.totalEarned,
        descricao_premio: awardDescription || `Fechamento de Meta - ${new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`,
        metricValueAchieved: auditData.stats.nps,
        atendenteMetaId: auditData.attendant.meta?.id
      });
      
      setSnackbar({ open: true, message: 'Prêmio registrado com sucesso!', severity: 'success' });
      setAwardDialogOpen(false);
      setAwardDescription('');
      fetchData(); // Recarregar dados para atualizar dashboard
    } catch (err) {
      setSnackbar({ open: true, message: 'Erro ao registrar prêmio.', severity: 'error' });
    } finally {
      setAwarding(false);
    }
  };

  // ... (useMemo e outros useEffects permanecem iguais)
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
            <Typography variant="h6" fontWeight="bold" gutterBottom>Progresso de Metas Individuais (Clique para Auditar)</Typography>
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
                      <TableRow 
                        key={atendente.id} 
                        hover 
                        onClick={() => handleOpenAudit(atendente)}
                        sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' } }}
                      >
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

      {/* MODAL DE AUDITORIA INDIVIDUAL */}
      <Dialog 
        open={auditModalOpen} 
        onClose={() => setAuditModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: '20px' } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ width: 50, height: 50, bgcolor: 'primary.main' }}>
              {auditData?.attendant?.name?.substring(0, 2).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight="bold">Auditoria: {auditData?.attendant?.name}</Typography>
              <Typography variant="caption" color="textSecondary">Código de Identificação: {auditData?.attendant?.code}</Typography>
            </Box>
          </Box>
          <IconButton onClick={() => setAuditModalOpen(false)}><CloseIcon /></IconButton>
        </DialogTitle>
        
        <DialogContent dividers sx={{ p: 3, bgcolor: '#fbfbfb' }}>
          {/* Filtros de Data dentro do Modal */}
          <Box sx={{ mb: 4, display: 'flex', gap: 2, alignItems: 'center', bgcolor: 'white', p: 2, borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <CalendarMonthIcon color="action" />
            <Typography variant="body2" fontWeight="bold">Filtrar Período:</Typography>
            <DatePicker
              label="Início"
              value={auditDateRange.startDate}
              onChange={(val) => handleAuditDateChange('startDate', val)}
              slotProps={{ textField: { size: 'small' } }}
            />
            <DatePicker
              label="Fim"
              value={auditDateRange.endDate}
              onChange={(val) => handleAuditDateChange('endDate', val)}
              slotProps={{ textField: { size: 'small' } }}
            />
          </Box>

          {auditLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}><CircularProgress /></Box>
          ) : auditData ? (
            <Grid container spacing={3}>
              {/* KPIs Rápidos do Atendente */}
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, textAlign: 'center', borderRadius: '12px' }}>
                  <Typography variant="caption" color="textSecondary">NPS NO PERÍODO</Typography>
                  <Typography variant="h4" fontWeight="bold" color="primary">{auditData.stats.nps.toFixed(0)}</Typography>
                  <Typography variant="caption" sx={{ display: 'block' }}>{auditData.stats.totalResponses} avaliações</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, textAlign: 'center', borderRadius: '12px' }}>
                  <Typography variant="caption" color="textSecondary">CADASTROS GERADOS</Typography>
                  <Typography variant="h4" fontWeight="bold" color="success.main">{auditData.stats.totalRegistrations}</Typography>
                  <Typography variant="caption" sx={{ display: 'block' }}>Conversão de {( (auditData.stats.totalRegistrations / (auditData.stats.totalResponses || 1)) * 100).toFixed(1)}%</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, textAlign: 'center', borderRadius: '12px', border: '2px solid transparent', borderColor: theme.palette.warning.light }}>
                  <Typography variant="caption" color="textSecondary">BÔNUS CALCULADO</Typography>
                  <Typography variant="h4" fontWeight="bold" color="warning.main">R$ { (performanceData.find(a => a.id === currentAttendantId)?.bonus?.totalEarned || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }</Typography>
                  <Button 
                    size="small" 
                    variant="contained" 
                    color="warning" 
                    sx={{ mt: 1, textTransform: 'none', fontWeight: 'bold' }}
                    onClick={() => setAwardDialogOpen(true)}
                    disabled={(performanceData.find(a => a.id === currentAttendantId)?.bonus?.totalEarned || 0) <= 0}
                  >
                    Confirmar Pagamento
                  </Button>
                </Paper>
              </Grid>

              {/* Raio-X por Critérios */}
              <Grid item xs={12}>
                <Paper sx={{ p: 3, borderRadius: '12px' }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>Performance por Critério (Raio-X)</Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>Como os clientes avaliam especificamente este atendente em cada ponto:</Typography>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={auditData.stats.criteria} layout="vertical" margin={{ left: 50 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" domain={[0, 10]} hide />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} />
                      <Tooltip cursor={{ fill: 'transparent' }} />
                      <Bar dataKey="average" fill={theme.palette.primary.main} radius={[0, 5, 5, 0]} barSize={20}>
                        <Legend />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>

              {/* Feedbacks Recentes */}
              <Grid item xs={12}>
                <Typography variant="h6" fontWeight="bold" sx={{ mt: 2, mb: 1 }}>Feedbacks Recentes para este Atendente</Typography>
                <List>
                  {auditData.feedbacks.length > 0 ? auditData.feedbacks.map((fb, i) => (
                    <Paper key={i} variant="outlined" sx={{ mb: 2, p: 2, borderRadius: '12px' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle2" fontWeight="bold">{fb.client}</Typography>
                        <Typography variant="caption" color="textSecondary">{fb.date}</Typography>
                      </Box>
                      <Rating value={fb.rating} readOnly size="small" max={10} sx={{ mb: 1 }} />
                      <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                        "{fb.comment}"
                      </Typography>
                    </Paper>
                  )) : (
                    <Alert severity="info">Nenhum feedback em texto registrado para este período.</Alert>
                  )}
                </List>
              </Grid>
            </Grid>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* DIÁLOGO DE CONFIRMAÇÃO DE PREMIAÇÃO */}
      <Dialog open={awardDialogOpen} onClose={() => setAwardDialogOpen(false)}>
        <DialogTitle>Confirmar Pagamento de Bônus</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Você está registrando o pagamento de <strong>R$ { (performanceData.find(a => a.id === currentAttendantId)?.bonus?.totalEarned || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }</strong> para o atendente <strong>{auditData?.attendant?.name}</strong>.
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            Este valor será registrado permanentemente no histórico de premiações do funcionário.
          </Typography>
          <TextField
            fullWidth
            label="Descrição do Prêmio (Opcional)"
            placeholder="Ex: Bônus metas batidas - Fevereiro/2026"
            value={awardDescription}
            onChange={(e) => setAwardDescription(e.target.value)}
            variant="outlined"
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setAwardDialogOpen(false)} color="inherit">Cancelar</Button>
          <Button 
            onClick={handleAwardBonus} 
            variant="contained" 
            color="success" 
            disabled={awarding}
            startIcon={awarding ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
          >
            Confirmar e Registrar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
      
    </Container>
  );
};

export default AtendenteDashboardPage;
