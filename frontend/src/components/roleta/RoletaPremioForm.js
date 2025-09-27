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
  Box,
} from '@mui/material';
import recompensaService from '../../services/recompensaService';
import roletaService from '../../services/roletaService'; // Importar o serviço da roleta

const RoletaPremioForm = ({ open, handleClose, premio, handleSubmit }) => {
  const [formData, setFormData] = useState({
    roletaId: '', // Adicionar roletaId
    nome: '',
    descricao: '',
    probabilidade: '',
    recompensaId: '',
  });
  const [loadingRecompensas, setLoadingRecompensas] = useState(true);
  const [recompensas, setRecompensas] = useState([]);
  const [loadingRoletas, setLoadingRoletas] = useState(true); // Estado de loading para roletas
  const [roletas, setRoletas] = useState([]); // Estado para armazenar roletas
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoadingRecompensas(true);
        setLoadingRoletas(true);
        const recompensasData = await recompensaService.getAllRecompensas();
        setRecompensas(Array.isArray(recompensasData) ? recompensasData : []);
        
        const roletasData = await roletaService.getAllRoletas();
        setRoletas(roletasData.roletas && Array.isArray(roletasData.roletas) ? roletasData.roletas : []);

      } catch (err) {
        setError(err.message || 'Erro ao carregar dados.');
      } finally {
        setLoadingRecompensas(false);
        setLoadingRoletas(false);
      }
    };

    if (open) {
      fetchInitialData();
    }
  }, [open]);

  useEffect(() => {
    if (premio) {
      setFormData({
        roletaId: premio.roletaId || '',
        nome: premio.nome || '',
        descricao: premio.descricao || '',
        probabilidade: premio.probabilidade || '',
        recompensaId: premio.recompensaId || '',
      });
    } else {
      setFormData({
        roletaId: '',
        nome: '',
        descricao: '',
        probabilidade: '',
        recompensaId: '',
      });
    }
  }, [premio, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
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
              <FormControl fullWidth margin="dense" required>
                <InputLabel id="roleta-label">Roleta</InputLabel>
                <Select
                  labelId="roleta-label"
                  id="roletaId"
                  name="roletaId"
                  value={formData.roletaId}
                  label="Roleta"
                  onChange={handleChange}
                  disabled={!!premio} // Desabilitar se estiver editando
                >
                  {loadingRoletas ? (
                    <MenuItem disabled>
                      <CircularProgress size={20} /> Carregando roletas...
                    </MenuItem>
                  ) : (
                    roletas.map((roleta) => (
                      <MenuItem key={roleta.id} value={roleta.id}>
                        {roleta.name}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Grid>
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
                value={formData.nome}
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
                value={formData.probabilidade}
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
