// src/pages/CampaignFormPage.js
import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Paper,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Grid,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import campanhaService from '../services/campanhaService';
import recompensaService from '../services/recompensaService';
import roletaService from '../services/roletaService';
import clientService from '../services/clientService';
import AuthContext from '../context/AuthContext';

const CampaignFormPage = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [form, setForm] = useState({
    nome: '',
    mensagem: 'Olá {{nome_cliente}}, aqui está seu prêmio: {{codigo_premio}}',
    rewardType: 'RECOMPENSA',
    recompensaId: '',
    roletaId: '',
    dataValidade: '',
    criterioSelecao: { type: 'all', clientIds: [], month: new Date().getMonth() + 1 },
  });
  const [rewards, setRewards] = useState([]);
  const [roletas, setRoletas] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pageLoading, setPageLoading] = useState(isEditMode);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rewardsRes, clientsRes, roletasRes] = await Promise.all([
          recompensaService.getAllRecompensas(),
          clientService.getAllClients(),
          roletaService.getAllRoletas(),
        ]);
        setRewards(rewardsRes);
        setClients(clientsRes);
        setRoletas(roletasRes.data); // Assuming service returns { data: [...] }

        if (isEditMode) {
          const campaignData = await campanhaService.getById(id);
          if (campaignData.dataValidade) {
            campaignData.dataValidade = campaignData.dataValidade.split('T')[0];
          }
          setForm(campaignData);
        }
      } catch (err) {
        setError('Falha ao carregar dados necessários.');
      } finally {
        if (isEditMode) setPageLoading(false);
      }
    };
    if (user?.tenantId) {
      fetchData();
    }
  }, [user, id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newForm = { ...form, [name]: value };

    if (name === 'rewardType') {
      if (value === 'RECOMPENSA') {
        newForm.roletaId = '';
      } else if (value === 'ROLETA') {
        newForm.recompensaId = '';
      }
    }

    setForm(newForm);
  };

  const handleCriterioChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, criterioSelecao: { ...form.criterioSelecao, [name]: value } });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = { ...form, tenantId: user.tenantId };
      if (isEditMode) {
        await campanhaService.update(id, payload);
      } else {
        await campanhaService.create(payload);
      }
      navigate('/whatsapp/campanhas');
    } catch (err) {
      setError(err.response?.data?.message || `Falha ao ${isEditMode ? 'atualizar' : 'criar'} campanha.`);
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return <CircularProgress />;
  }

  return (
    <Box component={Paper} sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        {isEditMode ? 'Editar Campanha' : 'Nova Campanha'}
      </Typography>
      <form onSubmit={handleSubmit}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField name="nome" label="Nome da Campanha" value={form.nome} onChange={handleChange} fullWidth required />
          </Grid>
          <Grid item xs={12}>
            <TextField name="mensagem" label="Mensagem para WhatsApp" value={form.mensagem} onChange={handleChange} fullWidth required multiline rows={4} helperText="Use {{nome_cliente}} e {{codigo_premio}} como variáveis." />
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth required>
              <InputLabel>Tipo de Prêmio</InputLabel>
              <Select name="rewardType" value={form.rewardType} onChange={handleChange} label="Tipo de Prêmio">
                <MenuItem value="RECOMPENSA">Recompensa (Gera Cupom)</MenuItem>
                <MenuItem value="ROLETA">Giro na Roleta</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {form.rewardType === 'RECOMPENSA' ? (
            <Grid item xs={12} sm={8}>
              <TextField name="recompensaId" label="Recompensa" value={form.recompensaId} onChange={handleChange} fullWidth required select>
                {rewards.map(reward => <MenuItem key={reward.id} value={reward.id}>{reward.name}</MenuItem>)}
              </TextField>
            </Grid>
          ) : (
            <Grid item xs={12} sm={8}>
              <TextField name="roletaId" label="Roleta" value={form.roletaId} onChange={handleChange} fullWidth required select>
                {roletas.map(roleta => <MenuItem key={roleta.id} value={roleta.id}>{roleta.name}</MenuItem>)}
              </TextField>
            </Grid>
          )}

          <Grid item xs={12}>
            <TextField name="dataValidade" label="Data de Validade (para cupons de recompensa)" type="date" value={form.dataValidade} onChange={handleChange} fullWidth required={form.rewardType === 'RECOMPENSA'} InputLabelProps={{ shrink: true }} />
          </Grid>

          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 3, mt: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Critérios de Seleção de Clientes</Typography>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Tipo de Critério</InputLabel>
                <Select name="type" value={form.criterioSelecao.type} onChange={handleCriterioChange} label="Tipo de Critério">
                  <MenuItem value="all">Todos os Clientes</MenuItem>
                  <MenuItem value="birthday">Aniversariantes do Mês</MenuItem>
                  <MenuItem value="specific">Clientes Específicos</MenuItem>
                </Select>
              </FormControl>
              {form.criterioSelecao.type === 'birthday' && (
                <TextField name="month" label="Mês do Aniversário" type="number" value={form.criterioSelecao.month} onChange={handleCriterioChange} fullWidth select sx={{ mb: 2 }}>
                  {[...Array(12).keys()].map(m => <MenuItem key={m + 1} value={m + 1}>{new Date(0, m).toLocaleString('default', { month: 'long' })}</MenuItem>)}
                </TextField>
              )}
              {form.criterioSelecao.type === 'specific' && (
                <TextField name="clientIds" label="Clientes Específicos" value={form.criterioSelecao.clientIds} onChange={handleCriterioChange} fullWidth select SelectProps={{ multiple: true }} sx={{ mb: 2 }}>
                  {clients.map(client => <MenuItem key={client.id} value={client.id}>{client.name} - {client.phone}</MenuItem>)}
                </TextField>
              )}
            </Paper>
          </Grid>
        </Grid>

        <Box sx={{ mt: 2 }}>
          <Button type="submit" variant="contained" disabled={loading || pageLoading}>
            {loading ? <CircularProgress size={24} /> : (isEditMode ? 'Salvar Alterações' : 'Criar Campanha')}
          </Button>
          <Button variant="outlined" onClick={() => navigate('/whatsapp/campanhas')} sx={{ ml: 2 }}>
            Cancelar
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default CampaignFormPage;