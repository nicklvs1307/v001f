import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box, // Adicionar Box
} from '@mui/material';
import recompensaService from '../../services/recompensaService';

const RoletaPremioForm = ({ open, handleClose, premio, handleSubmit }) => {
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    probabilidade: '',
    recompensaId: '',
  });
  const [loadingRecompensas, setLoadingRecompensas] = useState(true);
  const [recompensas, setRecompensas] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecompensas = async () => {
      try {
        setLoadingRecompensas(true);
        const data = await recompensaService.getAllRecompensas();
        setRecompensas(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || 'Erro ao carregar recompensas.');
      } finally {
        setLoadingRecompensas(false);
      }
    };

    fetchRecompensas();
  }, []);

  useEffect(() => {
    if (premio) {
      setFormData({
        nome: premio.nome || '',
        descricao: premio.descricao || '',
        probabilidade: premio.probabilidade || '',
        recompensaId: premio.recompensaId || '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        chance: '',
        recompensaId: '',
      });
    }
  }, [premio]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    console.log('RoletaPremioForm - formData antes de enviar:', formData);
    handleSubmit(formData);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{premio ? 'Editar Prêmio da Roleta' : 'Novo Prêmio da Roleta'}</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={onSubmit} sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                autoFocus
                margin="dense"
                id="nome"
                name="nome"
                label="Nome do Prêmio"
                type="text"
                fullWidth
                variant="outlined"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                id="descricao"
                name="descricao"
                label="Descrição"
                type="text"
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                value={formData.descricao}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="dense"
                id="probabilidade"
                name="probabilidade"
                label="Probabilidade (Peso)"
                type="number"
                fullWidth
                variant="outlined"
                value={formData.chance}
                onChange={handleChange}
                required
                inputProps={{ min: 1 }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="dense" required>
                <InputLabel id="recompensa-label">Recompensa Associada</InputLabel>
                <Select
                  labelId="recompensa-label"
                  id="recompensaId"
                  name="recompensaId"
                  value={formData.recompensaId}
                  label="Recompensa Associada"
                  onChange={handleChange}
                  renderValue={(selected) => {
                    const selectedRecompensa = recompensas.find(r => r.id === selected);
                    return selectedRecompensa ? selectedRecompensa.name : '';
                  }}
                >
                  {loadingRecompensas ? (
                    <MenuItem disabled>
                      <CircularProgress size={20} /> Carregando...
                    </MenuItem>
                  ) : (
                    recompensas.map((recompensa) => (
                      <MenuItem key={recompensa.id} value={recompensa.id}>
                        {recompensa.name} ({recompensa.value} {recompensa.type === 'percent' ? '%' : ''})
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">Cancelar</Button>
        <Button onClick={onSubmit} color="primary" variant="contained">Salvar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default RoletaPremioForm;
