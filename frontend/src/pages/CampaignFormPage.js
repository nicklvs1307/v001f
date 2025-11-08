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
  FormLabel,
  Tabs,
  Tab,
  IconButton,
  Input
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import campanhaService from '../services/campanhaService';
import recompensaService from '../services/recompensaService';
import roletaService from '../services/roletaService';
import ClientSegmentSelector from '../components/campaigns/ClientSegmentSelector';

const initialState = {
  campaign: {
    nome: '',
    mensagens: [''],
    criterioSelecao: { type: 'todos' },
    recompensaId: null,
    roletaId: null,
    minMessageDelaySeconds: 0,
    maxMessageDelaySeconds: 0,
    rewardType: 'none',
    startDate: null,
    endDate: null,
    media: null, // Para o arquivo da imagem
  },
  mediaPreview: null, // Para a pré-visualização da imagem
  recompensas: [],
  roletas: [],
  loading: true,
  error: '',
  activeTab: 0,
};

function campaignFormReducer(state, action) {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: '' };
    case 'FETCH_SUCCESS':
      const campaignData = action.payload.campaign || {};
      return {
        ...state,
        loading: false,
        recompensas: action.payload.recompensas,
        roletas: action.payload.roletas,
        campaign: { ...state.campaign, ...campaignData },
        mediaPreview: campaignData.mediaUrl ? `${process.env.REACT_APP_API_URL}${campaignData.mediaUrl}` : null,
      };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'FIELD_CHANGE':
      return {
        ...state,
        campaign: { ...state.campaign, [action.payload.field]: action.payload.value },
      };
    case 'FILE_CHANGE':
      return {
        ...state,
        campaign: { ...state.campaign, media: action.payload.file },
        mediaPreview: action.payload.preview,
      };
    case 'DATE_CHANGE':
      return {
        ...state,
        campaign: { ...state.campaign, [action.payload.field]: action.payload.value },
      };
    case 'MESSAGE_CHANGE':
      const newMessages = [...state.campaign.mensagens];
      newMessages[action.payload.index] = action.payload.value;
      return {
        ...state,
        campaign: { ...state.campaign, mensagens: newMessages },
      };
    case 'ADD_MESSAGE':
      return {
        ...state,
        campaign: { ...state.campaign, mensagens: [...state.campaign.mensagens, ''] },
      };
    case 'REMOVE_MESSAGE':
      const filteredMessages = state.campaign.mensagens.filter((_, i) => i !== action.payload);
      return {
        ...state,
        campaign: { ...state.campaign, mensagens: filteredMessages.length > 0 ? filteredMessages : [''] },
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
    case 'TAB_CHANGE':
      return { ...state, activeTab: action.payload };
    default:
      return state;
  }
}

const CampaignFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(campaignFormReducer, initialState);
  const { campaign, recompensas, roletas, loading, error, activeTab, mediaPreview } = state;

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
          if (typeof campaignData.mensagens === 'string') {
            campaignData.mensagens = [campaignData.mensagens];
          } else if (!Array.isArray(campaignData.mensagens) || campaignData.mensagens.length === 0) {
            campaignData.mensagens = [''];
          }

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

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        dispatch({ type: 'FILE_CHANGE', payload: { file, preview: reader.result } });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDateChange = (field, value) => {
    dispatch({ type: 'DATE_CHANGE', payload: { field, value } });
  };

  const handleMessageChange = (index) => (event) => {
    dispatch({ type: 'MESSAGE_CHANGE', payload: { index, value: event.target.value } });
  };

  const handleAddMessage = () => {
    dispatch({ type: 'ADD_MESSAGE' });
  };

  const handleRemoveMessage = (index) => () => {
    dispatch({ type: 'REMOVE_MESSAGE', payload: index });
  };

  const handleSegmentChange = (value) => {
    dispatch({ type: 'FIELD_CHANGE', payload: { field: 'criterioSelecao', value: { type: value } } });
  };

  const handleRewardTypeChange = (event) => {
    dispatch({ type: 'REWARD_TYPE_CHANGE', payload: event.target.value });
  };

  const handleTabChange = (event, newValue) => {
    dispatch({ type: 'TAB_CHANGE', payload: newValue });
  };

  const isFormValid = useCallback(() => {
    return campaign.nome && campaign.mensagens.every(msg => msg.trim() !== '') && (campaign.rewardType === 'none' || (campaign.rewardType === 'recompensa' && campaign.recompensaId) || (campaign.rewardType === 'roleta' && campaign.roletaId));
  }, [campaign]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) {
      dispatch({ type: 'FETCH_ERROR', payload: 'Preencha todos os campos obrigatórios e forneça pelo menos uma variação de mensagem.' });
      return;
    }

    const formData = new FormData();
    Object.keys(campaign).forEach(key => {
      if (key === 'media' && campaign.media) {
        formData.append('media', campaign.media);
      } else if (campaign[key] !== null && campaign[key] !== undefined) {
        if (typeof campaign[key] === 'object' && key !== 'media') {
          formData.append(key, JSON.stringify(campaign[key]));
        } else {
          formData.append(key, campaign[key]);
        }
      }
    });

    try {
      if (id) {
        await campanhaService.update(id, formData);
      } else {
        await campanhaService.create(formData);
      }
      navigate('/dashboard/cupons/campanhas');
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
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={activeTab} onChange={handleTabChange} aria-label="abas do formulário de campanha">
              <Tab label="Conteúdo" />
              <Tab label="Público e Recompensa" />
              <Tab label="Agendamento" />
            </Tabs>
          </Box>

          {activeTab === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Nome da Campanha"
                  value={campaign.nome}
                  onChange={handleFieldChange('nome')}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Imagem da Campanha (Opcional)</Typography>
                <Input
                  type="file"
                  onChange={handleFileChange}
                  inputProps={{ accept: 'image/*' }}
                  sx={{ mb: 2 }}
                />
                {mediaPreview && (
                  <Box sx={{ mt: 2, mb: 2 }}>
                    <Typography variant="subtitle1">Pré-visualização:</Typography>
                    <img src={mediaPreview} alt="Preview" style={{ maxHeight: '200px', maxWidth: '100%', borderRadius: '8px' }} />
                  </Box>
                )}
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Variações de Mensagem</Typography>
                {campaign.mensagens.map((msg, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TextField
                      fullWidth
                      label={`Mensagem ${index + 1}`}
                      value={msg}
                      onChange={handleMessageChange(index)}
                      multiline
                      rows={4}
                      helperText="Variáveis: {{nome_cliente}}, {{codigo_premio}}, {{data_validade}}, {{nome_recompensa}}, {{nome_campanha}}"
                      required
                    />
                    {campaign.mensagens.length > 1 && (
                      <IconButton onClick={handleRemoveMessage(index)} color="error" sx={{ ml: 1 }}>
                        <RemoveIcon />
                      </IconButton>
                    )}
                  </Box>
                ))}
                <Button
                  startIcon={<AddIcon />}
                  onClick={handleAddMessage}
                  variant="outlined"
                  sx={{ mt: 1 }}
                >
                  Adicionar Variação de Mensagem
                </Button>
              </Grid>
            </Grid>
          )}

          {activeTab === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <ClientSegmentSelector
                  selectedValue={campaign.criterioSelecao?.type}
                  onChange={handleSegmentChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
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
              </Grid>
            </Grid>
          )}

          {activeTab === 2 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <DateTimePicker
                  label="Data de Início (Opcional)"
                  value={campaign.startDate ? new Date(campaign.startDate) : null}
                  onChange={(newValue) => handleDateChange('startDate', newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth margin="normal" helperText="Deixe em branco para enviar imediatamente após salvar." />}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                 <DateTimePicker
                  label="Data de Fim (Opcional)"
                  value={campaign.endDate ? new Date(campaign.endDate) : null}
                  onChange={(newValue) => handleDateChange('endDate', newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth margin="normal" helperText="Data de validade para cupons e roletas." />}
                />
              </Grid>
               <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Atraso Mínimo entre Mensagens (segundos)"
                  type="number"
                  value={campaign.minMessageDelaySeconds}
                  onChange={handleFieldChange('minMessageDelaySeconds')}
                  inputProps={{ min: 0 }}
                  helperText="Atraso mínimo em segundos entre o envio de cada mensagem."
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Atraso Máximo entre Mensagens (segundos)"
                  type="number"
                  value={campaign.maxMessageDelaySeconds}
                  onChange={handleFieldChange('maxMessageDelaySeconds')}
                  inputProps={{ min: 0 }}
                  helperText="Atraso máximo em segundos entre o envio de cada mensagem."
                />
              </Grid>
            </Grid>
          )}
        </Paper>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={() => navigate('/dashboard/cupons/campanhas')} sx={{ mr: 2 }}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={!isFormValid()}>
            {id ? 'Atualizar Campanha' : 'Salvar Campanha'}
          </Button>
        </Box>
      </form>
    </Container>
  );
};

export default CampaignFormPage;