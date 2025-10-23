import React, { useEffect, useReducer, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  Paper,
  CircularProgress,
  Alert,
  Grid,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  MenuItem,
  FormLabel
} from '@mui/material';
import campanhaService from '../services/campanhaService';
import recompensaService from '../services/recompensaService';
import roletaService from '../services/roletaService';
import ClientSegmentSelector from '../components/campaigns/ClientSegmentSelector';

const initialState = {
  campaign: {
    nome: '',
    mensagem: '',
    criterioSelecao: { type: 'todos' },
    recompensaId: null,
    roletaId: null,
    messageDelaySeconds: 0,
    rewardType: 'none',
  },
  recompensas: [],
  roletas: [],
  loading: true,
  error: '',
};

function campaignFormReducer(state, action) {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: '' };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        loading: false,
        recompensas: action.payload.recompensas,
        roletas: action.payload.roletas,
        campaign: { ...state.campaign, ...action.payload.campaign },
      };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'FIELD_CHANGE':
      return {
        ...state,
        campaign: { ...state.campaign, [action.payload.field]: action.payload.value },
      };
    case 'REWARD_TYPE_CHANGE':
      const newType = action.payload;
      const newCampaignState = { ...state.campaign, rewardType: newType };
      if (newType === 'none') {
        newCampaignState.recompensaId = null;
        newCampaignState.roletaId = null;
      } else if (newType === 'recompensa') {
        newCampaignState.roletaId = null;
      } else if (newType === 'roleta') {
        newCampaignState.recompensaId = null;
      }
      return { ...state, campaign: newCampaignState };
    default:
      return state;
  }
}

const CampaignFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(campaignFormReducer, initialState);
  const { campaign, recompensas, roletas, loading, error } = state;

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      dispatch({ type: 'FETCH_START' });
      try {
        const [recompensasData, roletasData] = await Promise.all([
          recompensaService.getAll(true),
          roletaService.getAll(),
        ]);

        let campaignData = {};
        if (id) {
          const response = await campanhaService.getById(id);
          campaignData = response.data;
          if (campaignData.recompensaId) {
            campaignData.rewardType = 'recompensa';
          } else if (campaignData.roletaId) {
            campaignData.rewardType = 'roleta';
          } else {
            campaignData.rewardType = 'none';
          }
        }

        if (isMounted) {
          dispatch({
            type: 'FETCH_SUCCESS',
            payload: {
              recompensas: recompensasData.data || [],
              roletas: roletasData.data || [],
              campaign: campaignData,
            }
          });
        }
      } catch (err) {
        if (isMounted) {
          dispatch({ type: 'FETCH_ERROR', payload: 'Falha ao carregar dados. Tente novamente.' });
        }
      }
    };
    fetchData();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleFieldChange = (field) => (event) => {
    dispatch({ type: 'FIELD_CHANGE', payload: { field, value: event.target.value } });
  };

  const handleSegmentChange = (value) => {
    dispatch({ type: 'FIELD_CHANGE', payload: { field: 'criterioSelecao', value: { type: value } } });
  };

  const handleRewardTypeChange = (event) => {
    dispatch({ type: 'REWARD_TYPE_CHANGE', payload: event.target.value });
  };

  const isFormValid = useCallback(() => {
    return campaign.nome && campaign.mensagem && (campaign.rewardType === 'none' || (campaign.rewardType === 'recompensa' && campaign.recompensaId) || (campaign.rewardType === 'roleta' && campaign.roletaId));
  }, [campaign]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) {
        dispatch({ type: 'FETCH_ERROR', payload: 'Preencha todos os campos obrigatórios.' });
        return;
    }
    try {
      if (id) {
        await campanhaService.update(id, campaign);
      } else {
        await campanhaService.create(campaign);
      }
      navigate('/cupons/campanhas');
    } catch (err) {
      dispatch({ type: 'FETCH_ERROR', payload: err.response?.data?.message || 'Erro ao salvar campanha.' });
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 4, mb: 4 }}>
        {id ? 'Editar Campanha' : 'Nova Campanha'}
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={7}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>Dados da Campanha</Typography>
              <TextField
                fullWidth
                margin="normal"
                label="Nome da Campanha"
                value={campaign.nome}
                onChange={handleFieldChange('nome')}
                required
              />
              <TextField
                fullWidth
                margin="normal"
                label="Atraso entre Mensagens (segundos)"
                type="number"
                value={campaign.messageDelaySeconds}
                onChange={handleFieldChange('messageDelaySeconds')}
                inputProps={{ min: 0 }}
                helperText="Defina um atraso em segundos entre o envio de cada mensagem de WhatsApp para evitar bloqueios."
              />
              <TextField
                fullWidth
                margin="normal"
                label="Corpo da Mensagem"
                value={campaign.mensagem}
                onChange={handleFieldChange('mensagem')}
                multiline
                rows={4}
                helperText="Variáveis disponíveis: {{nome_cliente}}, {{codigo_premio}}"
                required
              />
            </Paper>
          </Grid>

          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>Recompensa</Typography>
              <FormControl component="fieldset" fullWidth margin="normal">
                <FormLabel component="legend">Tipo de Prêmio</FormLabel>
                <RadioGroup row name="rewardType" value={campaign.rewardType} onChange={handleRewardTypeChange}>
                  <FormControlLabel value="none" control={<Radio />} label="Nenhum" />
                  <FormControlLabel value="recompensa" control={<Radio />} label="Recompensa" />
                  <FormControlLabel value="roleta" control={<Radio />} label="Roleta" />
                </RadioGroup>
              </FormControl>

              {campaign.rewardType === 'recompensa' && (
                <TextField
                  select
                  fullWidth
                  margin="normal"
                  label="Selecione a Recompensa"
                  name="recompensaId"
                  value={campaign.recompensaId || ''}
                  onChange={handleFieldChange('recompensaId')}
                  required
                >
                  {recompensas.map(r => <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>)}
                </TextField>
              )}

              {campaign.rewardType === 'roleta' && (
                <TextField
                  select
                  fullWidth
                  margin="normal"
                  label="Selecione a Roleta"
                  name="roletaId"
                  value={campaign.roletaId || ''}
                  onChange={handleFieldChange('roletaId')}
                  required
                >
                  {roletas.map(r => <MenuItem key={r.id} value={r.id}>{r.nome}</MenuItem>)}
                </TextField>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <ClientSegmentSelector
              selectedValue={campaign.criterioSelecao?.type}
              onChange={handleSegmentChange}
            />
          </Grid>

          <Grid item xs={12}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={() => navigate('/cupons/campanhas')} sx={{ mr: 2 }}>
                Cancelar
              </Button>
              <Button type="submit" variant="contained" disabled={!isFormValid()}>
                Salvar Campanha
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Container>
  );
};

export default CampaignFormPage;