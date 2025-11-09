import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  Select, MenuItem, FormControl, InputLabel, Grid
} from '@mui/material';

const SenderFormModal = ({ open, onClose, onSave, sender }) => {
  const initialState = {
    name: '',
    apiUrl: '',
    apiKey: '',
    instanceName: '',
    status: 'disconnected',
    priority: 0,
    dailyLimit: 100,
  };

  const [formData, setFormData] = useState(initialState);

  useEffect(() => {
    if (sender) {
      setFormData({
        name: sender.name || '',
        apiUrl: sender.apiUrl || '',
        apiKey: sender.apiKey || '',
        instanceName: sender.instanceName || '',
        status: sender.status || 'disconnected',
        priority: sender.priority || 0,
        dailyLimit: sender.dailyLimit || 100,
      });
    } else {
      setFormData(initialState);
    }
  }, [sender, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{sender ? 'Editar Disparador' : 'Novo Disparador'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              name="name"
              label="Nome de Identificação"
              value={formData.name}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="apiUrl"
              label="URL da API"
              value={formData.apiUrl}
              onChange={handleChange}
              fullWidth
              required
              placeholder="http://localhost:8081"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="apiKey"
              label="API Key"
              value={formData.apiKey}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="instanceName"
              label="Nome da Instância"
              value={formData.instanceName}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={formData.status}
                label="Status"
                onChange={handleChange}
              >
                <MenuItem value="active">Ativo</MenuItem>
                <MenuItem value="warming_up">Aquecendo</MenuItem>
                <MenuItem value="resting">Descansando</MenuItem>
                <MenuItem value="blocked">Bloqueado</MenuItem>
                <MenuItem value="disconnected">Desconectado</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <TextField
              name="priority"
              label="Prioridade"
              type="number"
              value={formData.priority}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="dailyLimit"
              label="Limite Diário de Envios"
              type="number"
              value={formData.dailyLimit}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained">Salvar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SenderFormModal;
