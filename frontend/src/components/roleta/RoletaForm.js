import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  FormControlLabel,
  Switch,
  Box,
} from '@mui/material';

const RoletaForm = ({ open, handleClose, roleta, handleSubmit }) => {
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    active: true,
  });

  useEffect(() => {
    if (roleta) {
      setFormData({
        nome: roleta.nome || '',
        descricao: roleta.descricao || '',
        active: roleta.active !== undefined ? roleta.active : true,
      });
    } else {
      setFormData({
        nome: '',
        descricao: '',
        active: true,
      });
    }
  }, [roleta, open]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    handleSubmit(formData);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{roleta ? 'Editar Roleta' : 'Nova Roleta'}</DialogTitle>
      <Box component="form" onSubmit={onSubmit}>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                autoFocus
                margin="dense"
                id="nome"
                name="nome"
                label="Nome da Roleta"
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
              <FormControlLabel
                control={<Switch checked={formData.active} onChange={handleChange} name="active" />}
                label="Ativa"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button type="submit" variant="contained">Salvar</Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default RoletaForm;
