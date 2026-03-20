import React, { useState } from 'react';
import {
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Box,
  Typography
} from '@mui/material';
import useAtendenteForm from '../../hooks/useAtendenteForm';

const AtendenteForm = ({ initialData, onAtendenteCreated, onAtendenteUpdated, onError, onClose }) => {
  const { formData, handleChange, setFormData } = useAtendenteForm(initialData);
  const [nameError, setNameError] = useState('');

  React.useEffect(() => {
    setFormData(initialData || { name: '', status: 'active' });
    setNameError(''); // Clear error when initialData changes
  }, [initialData, setFormData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    onError(''); // Clear general error
    setNameError(''); // Clear name specific error

    if (!formData.name.trim()) {
      setNameError('Nome do atendente é obrigatório.');
      return;
    }

    try {
      if (initialData) {
        await onAtendenteUpdated(formData);
      } else {
        await onAtendenteCreated(formData);
      }
      onClose();
    } catch (err) {
      console.error('Form submission error:', err);
      onError(err.message);
    }
  };

  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    
    if (value.length > 10) {
        value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
    } else if (value.length > 6) {
        value = `(${value.slice(0, 2)}) ${value.slice(2, 6)}-${value.slice(6)}`;
    } else if (value.length > 2) {
        value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    } else if (value.length > 0) {
        value = `(${value}`;
    }
    
    handleChange({ target: { name: 'phone', value } });
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {initialData ? 'Editar Atendente' : 'Criar Novo Atendente'}
      </Typography>
      <TextField
        autoFocus
        margin="dense"
        name="name"
        label="Nome do Atendente"
        type="text"
        fullWidth
        variant="outlined"
        value={formData.name}
        onChange={handleChange}
        sx={{ mb: 2 }}
        required
        error={!!nameError}
        helperText={nameError}
      />

      <TextField
        margin="dense"
        name="phone"
        label="WhatsApp (com DDD)"
        type="text"
        fullWidth
        variant="outlined"
        value={formData.phone || ''}
        onChange={handlePhoneChange}
        placeholder="(00) 00000-0000"
        sx={{ mb: 2 }}
      />

      <FormControl fullWidth variant="outlined" margin="dense">
        <InputLabel>Status</InputLabel>
        <Select
          name="status"
          value={formData.status}
          onChange={handleChange}
          label="Status"
        >
          <MenuItem value="active">Ativo</MenuItem>
          <MenuItem value="inactive">Inativo</MenuItem>
        </Select>
      </FormControl>
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button onClick={onClose} color="secondary" sx={{ mr: 1 }}>
          Cancelar
        </Button>
        <Button type="submit" color="primary" variant="contained">
          {initialData ? 'Salvar' : 'Criar'}
        </Button>
      </Box>
    </Box>
  );
};

export default AtendenteForm;
