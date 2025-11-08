import React, { useEffect, useReducer, useCallback, useState, useRef } from 'react';
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
  styled,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatStrikethroughIcon from '@mui/icons-material/FormatStrikethrough';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import campanhaService from '../services/campanhaService';
import recompensaService from '../services/recompensaService';
import roletaService from '../services/roletaService';
import ClientSegmentSelector from '../components/campaigns/ClientSegmentSelector';
import WhatsappPreview from '../components/WhatsappPreview';

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
    dataValidade: null,
    media: null,
  },
  mediaPreview: null,
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
      const fetchedCampaign = action.payload.campaign || {};
      // Garante que mensagens seja sempre um array com pelo menos um item
      if (!Array.isArray(fetchedCampaign.mensagens) || fetchedCampaign.mensagens.length === 0) {
        fetchedCampaign.mensagens = [''];
      }
      return {
        ...state,
        loading: false,
        recompensas: action.payload.recompensas,
        roletas: action.payload.roletas,
        campaign: { ...initialState.campaign, ...fetchedCampaign },
        mediaPreview: fetchedCampaign.mediaUrl ? `${process.env.REACT_APP_API_URL}${fetchedCampaign.mediaUrl}` : null,
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

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const CampaignFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(campaignFormReducer, initialState);
  const { campaign, recompensas, roletas, loading, error, activeTab, mediaPreview } = state;
  const [activeMessageTab, setActiveMessageTab] = useState(0);
  const textInputRef = useRef(null);

  const handleFormat = (formatChar) => {
    const input = textInputRef.current;
    if (!input) return;

    const start = input.selectionStart;
    const end = input.selectionEnd;
    const currentText = campaign.mensagens[activeMessageTab];
    
    if (start === end) return; // Não faz nada se nenhum texto for selecionado

    const newText = 
      currentText.substring(0, start) +
      formatChar + currentText.substring(start, end) + formatChar +
      currentText.substring(end);

    dispatch({ type: 'MESSAGE_CHANGE', payload: { index: activeMessageTab, value: newText } });
  };

  const handleInsertVariable = (variable) => {
    const input = textInputRef.current;
    if (!input) return;

    const start = input.selectionStart;
    const end = input.selectionEnd;
    const currentText = campaign.mensagens[activeMessageTab] || '';

    const newText = 
      currentText.substring(0, start) +
      variable +
      currentText.substring(end);

    dispatch({ type: 'MESSAGE_CHANGE', payload: { index: activeMessageTab, value: newText } });
    
    // Foca no input após a inserção
    setTimeout(() => {
      input.focus();
      const newCursorPosition = start + variable.length;
      input.setSelectionRange(newCursorPosition, newCursorPosition);
    }, 0);
  };

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

    return () => { isMounted = false; };
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
    setActiveMessageTab(campaign.mensagens.length);
  };

  const handleRemoveMessage = (index) => () => {
    if (campaign.mensagens.length <= 1) return;
    dispatch({ type: 'REMOVE_MESSAGE', payload: index });
    setActiveMessageTab(prev => Math.max(0, prev - 1));
  };

  const handleTabChange = (event, newValue) => {
    dispatch({ type: 'TAB_CHANGE', payload: newValue });
  };

  const isFormValid = useCallback(() => {
    const hasReward = campaign.rewardType === 'none' || (campaign.rewardType === 'recompensa' && campaign.recompensaId) || (campaign.rewardType === 'roleta' && campaign.roletaId);
    return campaign.nome && campaign.mensagens.every(msg => msg.trim() !== '') && campaign.dataValidade && hasReward;
  }, [campaign]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) {
      dispatch({ type: 'FETCH_ERROR', payload: 'Preencha todos os campos obrigatórios (Nome, Mensagem e Data de Validade).' });
      return;
    }

    const formData = new FormData();
    // Limpa o erro antes de submeter
    dispatch({ type: 'FETCH_ERROR', payload: '' });

    Object.keys(campaign).forEach(key => {
      const value = campaign[key];
      if (key === 'media' && value) {
        formData.append('media', value);
      } else if (value !== null && value !== undefined) {
        if (typeof value === 'object' && key !== 'media') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value);
        }
      }
    });

    try {
      if (id) {
        await campanhaService.update(id, formData);
      }
      else {
        await campanhaService.create(formData);
      }
      navigate('/dashboard/cupons/campanhas');
    } catch (err) {
      dispatch({ type: 'FETCH_ERROR', payload: err.response?.data?.message || 'Erro ao salvar campanha.' });
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 4, mb: 4 }}>
        {id ? 'Editar Campanha' : 'Nova Campanha'}
      </Typography>
      <form onSubmit={handleSubmit}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={activeTab} onChange={handleTabChange} aria-label="abas do formulário de campanha">
              <Tab label="1. Conteúdo e Visualização" />
              <Tab label="2. Público e Recompensa" />
              <Tab label="3. Agendamento e Envio" />
            </Tabs>
          </Box>

          {activeTab === 0 && (
            <Grid container spacing={4}>
              <Grid item xs={12} md={7}>
                <Typography variant="h6" gutterBottom>Editor da Campanha</Typography>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Nome da Campanha"
                  value={campaign.nome}
                  onChange={handleFieldChange('nome')}
                  required
                />
                
                <Button component="label" variant="outlined" startIcon={<PhotoCamera />} sx={{ mt: 2, mb: 2 }}>
                  {mediaPreview ? 'Trocar Imagem' : 'Adicionar Imagem'}
                  <VisuallyHiddenInput type="file" onChange={handleFileChange} accept="image/*" />
                </Button>

                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <Tabs value={activeMessageTab} onChange={(e, newValue) => setActiveMessageTab(newValue)} aria-label="abas de variações de mensagem">
                    {campaign.mensagens.map((_, index) => (
                      <Tab key={index} label={`Variação ${index + 1}`} />
                    ))}
                    <IconButton onClick={handleAddMessage} size="small" sx={{ ml: 1 }}><AddIcon /></IconButton>
                  </Tabs>
                </Box>

                <Box sx={{ pt: 2 }}>
                  <Paper variant="outlined" sx={{ p: 1, mb: 1, display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                    <Typography variant="subtitle2" sx={{ mr: 1 }}>Formatar:</Typography>
                    <ToggleButtonGroup size="small" aria-label="text formatting">
                      <Tooltip title="Negrito (*texto*)">
                        <ToggleButton value="bold" aria-label="bold" onClick={() => handleFormat('*')}>
                          <FormatBoldIcon />
                        </ToggleButton>
                      </Tooltip>
                      <Tooltip title="Itálico (_texto_)">
                        <ToggleButton value="italic" aria-label="italic" onClick={() => handleFormat('_')}>
                          <FormatItalicIcon />
                        </ToggleButton>
                      </Tooltip>
                      <Tooltip title="Riscado (~texto~)">
                        <ToggleButton value="strikethrough" aria-label="strikethrough" onClick={() => handleFormat('~')}>
                          <FormatStrikethroughIcon />
                        </ToggleButton>
                      </Tooltip>
                    </ToggleButtonGroup>
                  </Paper>
                   <Paper variant="outlined" sx={{ p: 1, mb: 1, display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                    <Typography variant="subtitle2" sx={{ mr: 1 }}>Variáveis:</Typography>
                    <Button size="small" variant="outlined" onClick={() => handleInsertVariable('{{nome_cliente}}')}>Nome</Button>
                    <Button size="small" variant="outlined" onClick={() => handleInsertVariable('{{codigo_premio}}')}>Prêmio</Button>
                    <Button size="small" variant="outlined" onClick={() => handleInsertVariable('{{data_validade}}')}>Validade</Button>
                    <Button size="small" variant="outlined" onClick={() => handleInsertVariable('{{nome_recompensa}}')}>Recompensa</Button>
                    <Button size="small" variant="outlined" onClick={() => handleInsertVariable('{{nome_campanha}}')}>Campanha</Button>
                  </Paper>
                  <TextField
                    fullWidth
                    label={`Texto da Mensagem ${activeMessageTab + 1}`}
                    value={campaign.mensagens[activeMessageTab]}
                    onChange={handleMessageChange(activeMessageTab)}
                    multiline
                    rows={8}
                    required
                    inputRef={textInputRef}
                  />
                  {campaign.mensagens.length > 1 && (
                    <Button onClick={handleRemoveMessage(activeMessageTab)} color="error" startIcon={<RemoveIcon />} sx={{ mt: 1 }}>
                      Remover Variação
                    </Button>
                  )}
                </Box>
              </Grid>
              
              <Grid item xs={12} md={5}>
                <Typography variant="h6" gutterBottom align="center">Pré-visualização</Typography>
                <Box sx={{ position: 'sticky', top: '80px' }}>
                  <WhatsappPreview
                    message={campaign.mensagens[activeMessageTab]}
                    imagePreview={mediaPreview}
                  />
                </Box>
              </Grid>
            </Grid>
          )}

          {activeTab === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <ClientSegmentSelector
                  selectedValue={campaign.criterioSelecao?.type}
                  onChange={(value) => dispatch({ type: 'FIELD_CHANGE', payload: { field: 'criterioSelecao', value: { type: value } } })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl component="fieldset" fullWidth margin="normal">
                  <FormLabel component="legend">Tipo de Prêmio</FormLabel>
                  <RadioGroup row name="rewardType" value={campaign.rewardType} onChange={(e) => dispatch({ type: 'REWARD_TYPE_CHANGE', payload: e.target.value })}>
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
                    required={campaign.rewardType === 'recompensa'}
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
                    required={campaign.rewardType === 'roleta'}
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
                  label="Data de Validade"
                  value={campaign.dataValidade ? new Date(campaign.dataValidade) : null}
                  onChange={(newValue) => handleDateChange('dataValidade', newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth margin="normal" required helperText="Data de validade para cupons e roletas." />}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <DateTimePicker
                  label="Data de Início do Envio (Opcional)"
                  value={campaign.startDate ? new Date(campaign.startDate) : null}
                  onChange={(newValue) => handleDateChange('startDate', newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth margin="normal" helperText="Deixe em branco para processar o envio imediatamente." />}
                />
              </Grid>
               <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Atraso Mínimo (segundos)"
                  type="number"
                  value={campaign.minMessageDelaySeconds}
                  onChange={handleFieldChange('minMessageDelaySeconds')}
                  inputProps={{ min: 0 }}
                  helperText="Atraso mínimo entre o envio de cada mensagem."
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  margin="normal"
                  label="Atraso Máximo (segundos)"
                  type="number"
                  value={campaign.maxMessageDelaySeconds}
                  onChange={handleFieldChange('maxMessageDelaySeconds')}
                  inputProps={{ min: 0 }}
                  helperText="Atraso máximo entre o envio de cada mensagem."
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