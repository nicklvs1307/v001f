import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField,
  Grid,
} from '@mui/material';

const SenderFormModal = ({ open, onClose, onSave, sender }) => {
  const [formData, setFormData] = useState({
    name: '',
    apiUrl: '',
    apiKey: '',
    instanceName: '',
    priority: 1,
    dailyLimit: 100,
  });

  useEffect(() => {
    if (sender) {
      setFormData({
        name: sender.name || '',
        apiUrl: sender.apiUrl || '',
        apiKey: sender.apiKey || '',
        instanceName: sender.instanceName || '',
        priority: sender.priority || 1,
        dailyLimit: sender.dailyLimit || 100,
      });
    } else {
      setFormData({
        name: '',
        apiUrl: '',
        apiKey: '',
        instanceName: '',
        priority: 1,
        dailyLimit: 100,
      });
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
              label="Nome"
              name="name"
              value={formData.name}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="URL da API"
              name="apiUrl"
              value={formData.apiUrl}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="API Key"
              name="apiKey"
              type="password"
              value={formData.apiKey}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Nome da Instância"
              name="instanceName"
              value={formData.instanceName}
              onChange={handleChange}
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Prioridade"
              name="priority"
              type="number"
              value={formData.priority}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Limite Diário de Envios"
              name="dailyLimit"
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
