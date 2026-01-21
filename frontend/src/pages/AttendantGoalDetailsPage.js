import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Box,
  Grid,
  TextField,
  Button,
  Tabs,
  Tab,
  Tooltip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import atendenteService from '../services/atendenteService';
import atendenteMetaService from '../services/atendenteMetaService';
import { format } from 'date-fns';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const PerformanceMetric = ({ title, currentValue, goalValue }) => {
  const goal = parseFloat(goalValue) || 0;
  const current = parseFloat(currentValue) || 0;
  const progress = goal > 0 ? (current / goal) * 100 : 0;
  const isGoalReached = current >= goal;

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="body1" fontWeight="medium">{title}</Typography>
        <Typography variant="body1" color={isGoalReached ? 'success.main' : 'text.secondary'}>
          {current.toFixed(0)} / {goal.toFixed(0)}
        </Typography>
      </Box>
      <LinearProgress 
        variant="determinate" 
        value={progress > 100 ? 100 : progress}
        color={isGoalReached ? 'success' : 'primary'}
        sx={{ height: 10, borderRadius: 5 }}
      />
    </Box>
  );
};

const AttendantGoalDetailsPage = () => {
  const { atendenteId } = useParams();
  const navigate = useNavigate();
  
  const [atendente, setAtendente] = useState(null);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  const [historico, setHistorico] = useState([]);
  const [historicoLoading, setHistoricoLoading] = useState(false);
  const [historicoError, setHistoricoError] = useState('');
  
  const [performance, setPerformance] = useState(null);
  const [performanceLoading, setPerformanceLoading] = useState(false);
  const [performanceError, setPerformanceError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        const [fetchedAtendente, fetchedMeta] = await Promise.all([
          atendenteService.getAtendenteById(atendenteId),
          atendenteMetaService.getMetaByAtendenteId(atendenteId)
        ]);
        setAtendente(fetchedAtendente);
        setMeta(fetchedMeta || {
            npsGoal: '',
            responsesGoal: '',
            registrationsGoal: '',
            period: 'MENSAL',
            dias_trabalhados: 22,
            nps_premio_valor: '',
            respostas_premio_valor: '',
            cadastros_premio_valor: '',
        });
      } catch (err) {
        if (err.response && err.response.status === 404) {
        } else {
          setError(err.message || 'Falha ao carregar dados do atendente.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [atendenteId]);

  useEffect(() => {
    const fetchTabData = async () => {
      if (tabValue === 1) { // Aba de Acompanhamento
        try {
          setPerformanceLoading(true);
          setPerformanceError('');
          const data = await atendenteService.getAtendentePerformance(atendenteId);
          setPerformance(data);
        } catch (err) {
          setPerformanceError(err.message || 'Falha ao carregar performance.');
        } finally {
          setPerformanceLoading(false);
        }
      } else if (tabValue === 2) { // Aba de Histórico de Prêmios
        try {
          setHistoricoLoading(true);
          setHistoricoError('');
          const data = await atendenteService.getAtendentePremiacoes(atendenteId);
          setHistorico(data);
        } catch (err) {
          setHistoricoError(err.message || 'Falha ao carregar histórico.');
        } finally {
          setHistoricoLoading(false);
        }
      }
    };
    fetchTabData();
  }, [tabValue, atendenteId]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleMetaChange = (e) => {
    const { name, value } = e.target;
    setMeta((prevMeta) => ({
      ...prevMeta,
      [name]: value === '' ? null : value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    setError('');
    try {
      await atendenteMetaService.createOrUpdateMeta(atendenteId, meta);
      setSaveSuccess(true);
    } catch (err) {
      setError(err.message || 'Falha ao salvar as metas.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Container sx={{ textAlign: 'center', mt: 4 }}><CircularProgress /></Container>;
  }

  if (error && !atendente) {
    return <Container sx={{ mt: 4 }}><Alert severity="error">{error}</Alert></Container>;
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Tooltip title="Voltar">
          <IconButton onClick={() => navigate('/dashboard/metas-atendentes')}>
            <ArrowBackIcon />
          </IconButton>
        </Tooltip>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Metas e Prêmios: {atendente?.name}
        </Typography>
      </Box>

      <Paper elevation={3}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="abas de detalhes do atendente">
            <Tab label="Configuração de Metas" />
            <Tab label="Acompanhamento" />
            <Tab label="Histórico de Prêmios" />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <Box component="form" noValidate autoComplete="off">
            <Typography variant="h6" gutterBottom>Configurações Gerais</Typography>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Dias Trabalhados no Mês (Padrão)"
                  name="dias_trabalhados"
                  value={meta.dias_trabalhados || 22}
                  onChange={handleMetaChange}
                  helperText="Usado para cálculo de metas proporcionais."
                />
              </Grid>
            </Grid>

            <Typography variant="h6" gutterBottom>Meta de NPS</Typography>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Meta de NPS (Ex: 90)"
                  name="npsGoal"
                  value={meta.npsGoal || ''}
                  onChange={handleMetaChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Valor do Prêmio (R$)"
                  name="nps_premio_valor"
                  value={meta.nps_premio_valor || ''}
                  onChange={handleMetaChange}
                />
              </Grid>
            </Grid>

            <Typography variant="h6" gutterBottom>Meta de Pesquisas</Typography>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Meta de Pesquisas Respondidas"
                  name="responsesGoal"
                  value={meta.responsesGoal || ''}
                  onChange={handleMetaChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Valor do Prêmio (R$)"
                  name="respostas_premio_valor"
                  value={meta.respostas_premio_valor || ''}
                  onChange={handleMetaChange}
                />
              </Grid>
            </Grid>

            <Typography variant="h6" gutterBottom>Meta de Cadastros</Typography>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Meta de Cadastros Realizados"
                  name="registrationsGoal"
                  value={meta.registrationsGoal || ''}
                  onChange={handleMetaChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Valor do Prêmio (R$)"
                  name="cadastros_premio_valor"
                  value={meta.cadastros_premio_valor || ''}
                  onChange={handleMetaChange}
                />
              </Grid>
            </Grid>
            
            {saveSuccess && <Alert severity="success" sx={{ mb: 2 }}>Metas salvas com sucesso!</Alert>}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button 
                variant="contained" 
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? <CircularProgress size={24} /> : 'Salvar Metas'}
              </Button>
            </Box>
          </Box>
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          {performanceLoading && <CircularProgress />}
          {performanceError && <Alert severity="error">{performanceError}</Alert>}
          {performance && (
            <Box>
              <Typography variant="h6" gutterBottom>Performance do Mês Atual</Typography>
              <Divider sx={{ mb: 2 }} />
              <PerformanceMetric 
                title="NPS"
                currentValue={performance.currentNPS}
                goalValue={meta.npsGoal}
              />
              <PerformanceMetric 
                title="Pesquisas Respondidas"
                currentValue={performance.surveysResponded}
                goalValue={meta.responsesGoal}
              />
              <PerformanceMetric 
                title="Cadastros Realizados"
                currentValue={performance.registrations}
                goalValue={meta.registrationsGoal}
              />
            </Box>
          )}
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          {historicoLoading && <CircularProgress />}
          {historicoError && <Alert severity="error">{historicoError}</Alert>}
          {!historicoLoading && !historicoError && (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Data</TableCell>
                    <TableCell>Descrição do Prêmio</TableCell>
                    <TableCell align="right">Valor (R$)</TableCell>
                    <TableCell align="right">Métrica Atingida</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {historico.length > 0 ? historico.map((premio) => (
                    <TableRow key={premio.id}>
                      <TableCell>{format(new Date(premio.dateAwarded), 'dd/MM/yyyy')}</TableCell>
                      <TableCell>{premio.descricao_premio}</TableCell>
                      <TableCell align="right">{parseFloat(premio.valor_premio).toFixed(2)}</TableCell>
                      <TableCell align="right">{parseFloat(premio.metricValueAchieved).toFixed(0)}</TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center">Nenhum prêmio encontrado no histórico.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default AttendantGoalDetailsPage;
