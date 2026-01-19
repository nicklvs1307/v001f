import React, { useState, useEffect } from 'react';
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Switch,
  Box,
} from '@mui/material';

const RecompensaForm = ({ open, handleClose, recompensa, handleSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    conditionDescription: '', // Campo restaurado
    pointsRequired: '',
    active: true,
  });

  useEffect(() => {
    if (recompensa) {
      setFormData({
        name: recompensa.name || '',
        description: recompensa.description || '',
        conditionDescription: recompensa.conditionDescription || '', // Campo restaurado
        pointsRequired: recompensa.pointsRequired || '',
        active: recompensa.active !== undefined ? recompensa.active : true,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        conditionDescription: '',
        pointsRequired: '',
        active: true,
      });
    }
  }, [recompensa]);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const onSubmit = () => {
    // Apenas os campos do formulário serão enviados
    handleSubmit(formData);
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>{recompensa ? 'Editar Recompensa' : 'Criar Nova Recompensa'}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          name="name"
          label="Nome da Recompensa"
          type="text"
          fullWidth
          variant="outlined"
          value={formData.name}
          onChange={handleChange}
          sx={{ mb: 2 }}
        />
        <TextField
          margin="dense"
          name="description"
          label="Descrição"
          type="text"
          fullWidth
          multiline
          rows={3}
          variant="outlined"
          value={formData.description}
          onChange={handleChange}
          sx={{ mb: 2 }}
        />
        {/* Campo restaurado */}
        <TextField
          margin="dense"
          name="conditionDescription"
          label="Regras e Condições (visível para o cliente)"
          type="text"
          fullWidth
          multiline
          rows={3}
          variant="outlined"
          value={formData.conditionDescription || ''}
          onChange={handleChange}
          sx={{ mb: 2 }}
        />
        <TextField
          margin="dense"
          name="pointsRequired"
          label="Pontos Necessários"
          type="number"
          fullWidth
          variant="outlined"
          value={formData.pointsRequired}
          onChange={handleChange}
          sx={{ mb: 2 }}
        />
        <Box sx={{ mt: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.active}
                onChange={handleChange}
                name="active"
                color="primary"
              />
            }
            label="Ativo"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary">Cancelar</Button>
        <Button onClick={onSubmit} color="primary">{recompensa ? 'Salvar' : 'Criar'}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default RecompensaForm;