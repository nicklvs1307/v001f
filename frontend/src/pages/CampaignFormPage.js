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
  Grid, // Adicionado Grid
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import campanhaService from '../services/campanhaService';
import recompensaService from '../services/recompensaService';
import clientService from '../services/clientService';
import AuthContext from '../context/AuthContext';

const CampaignFormPage = () => {
  const [form, setForm] = useState({
    nome: '',
    mensagem: 'Olá {{nome_cliente}}, aqui está seu cupom: {{codigo_cupom}}',
    recompensaId: '',
    dataValidade: '',
    criterioSelecao: { type: 'all', clientIds: [], month: new Date().getMonth() + 1 },
  });
  const [rewards, setRewards] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rewardsRes, clientsRes] = await Promise.all([
          recompensaService.getAllRecompensas(),
          clientService.getAllClients(),
        ]);
        setRewards(rewardsRes);
        setClients(clientsRes);
      } catch (err) {
        setError('Falha ao carregar dados necessários.');
      }
    };
    if (user?.tenantId) {
      fetchData();
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
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
      await campanhaService.create({ ...form, tenantId: user.tenantId });
      navigate('/cupons/campanhas');
    } catch (err) {
      setError(err.response?.data?.message || 'Falha ao criar campanha.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component={Paper} sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>Nova Campanha</Typography>
      <form onSubmit={handleSubmit}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              name="nome"
              label="Nome da Campanha"
              value={form.nome}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="mensagem"
              label="Mensagem para WhatsApp"
              value={form.mensagem}
              onChange={handleChange}
              fullWidth
              required
              multiline
              rows={4}
              helperText="Use {{nome_cliente}} e {{codigo_cupom}} como variáveis."
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="recompensaId"
              label="Recompensa"
              value={form.recompensaId}
              onChange={handleChange}
              fullWidth
              required
              select
            >
              {rewards.map(reward => (
                <MenuItem key={reward.id} value={reward.id}>{reward.nome}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="dataValidade"
              label="Data de Validade dos Cupons"
              type="date"
              value={form.dataValidade}
              onChange={handleChange}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 3, mt: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Critérios de Seleção de Clientes</Typography>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Tipo de Critério</InputLabel>
                <Select
                  name="type"
                  value={form.criterioSelecao.type}
                  onChange={handleCriterioChange}
                  label="Tipo de Critério"
                >
                  <MenuItem value="all">Todos os Clientes</MenuItem>
                  <MenuItem value="birthday">Aniversariantes do Mês</MenuItem>
                  <MenuItem value="specific">Clientes Específicos</MenuItem>
                </Select>
              </FormControl>

              {form.criterioSelecao.type === 'birthday' && (
                <TextField
                  name="month"
                  label="Mês do Aniversário"
                  type="number"
                  value={form.criterioSelecao.month}
                  onChange={handleCriterioChange}
                  fullWidth
                  select
                  sx={{ mb: 2 }}
                >
                  {[...Array(12).keys()].map(m => (
                    <MenuItem key={m + 1} value={m + 1}>{new Date(0, m).toLocaleString('default', { month: 'long' })}</MenuItem>
                  ))}
                </TextField>
              )}

              {form.criterioSelecao.type === 'specific' && (
                <TextField
                  name="clientIds"
                  label="Clientes Específicos"
                  value={form.criterioSelecao.clientIds}
                  onChange={handleCriterioChange}
                  fullWidth
                  select
                  SelectProps={{ multiple: true }}
                  sx={{ mb: 2 }}
                >
                  {clients.map(client => (
                    <MenuItem key={client.id} value={client.id}>{client.name} - {client.phone}</MenuItem>
                  ))}
                </TextField>
              )}
            </Paper>
          </Grid>
        </Grid>

        <Box sx={{ mt: 2 }}>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Criar Campanha'}
          </Button>
          <Button variant="outlined" onClick={() => navigate('/cupons/campanhas')} sx={{ ml: 2 }}>
            Cancelar
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default CampaignFormPage;
