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
  IconButton
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import atendenteService from '../services/atendenteService';
import atendenteMetaService from '../services/atendenteMetaService';

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
        setMeta(fetchedMeta || { // Inicializa com valores padrão se não houver meta
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
        // Se a meta não for encontrada (404), não é um erro fatal
        if (err.response && err.response.status === 404) {
          // A meta será inicializada com valores padrão
        } else {
          setError(err.message || 'Falha ao carregar dados do atendente.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [atendenteId]);

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

  if (error && !atendente) { // Só mostra erro fatal se não conseguir carregar o atendente
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
            <Tab label="Acompanhamento" disabled />
            <Tab label="Histórico de Prêmios" disabled />
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

            <Typography variant="h6" gutterBottom>Meta de Respostas</Typography>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Meta de Total de Respostas"
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
      </Paper>
    </Container>
  );
};

export default AttendantGoalDetailsPage;
