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
    console.log('handleSubmit called');
    console.log('Initial data:', initialData);
    onError(''); // Clear general error
    setNameError(''); // Clear name specific error

    if (!formData.name.trim()) {
      setNameError('Nome do atendente é obrigatório.');
      console.log('Validation failed: name is empty');
      return;
    }

    try {
      console.log('Validation passed, attempting to submit form data:', formData);
      if (initialData) {
        try {
          await onAtendenteUpdated(formData);
          console.log('onAtendenteUpdated completed');
        } catch (updateError) {
          console.error('Error in onAtendenteUpdated:', updateError);
          onError(updateError.message);
        }
      } else {
        try {
          await onAtendenteCreated(formData);
          console.log('onAtendenteCreated completed');
        } catch (createError) {
          console.error('Error in onAtendenteCreated:', createError);
          onError(createError.message);
        }
      }
      onClose();
      console.log('Form submission successful, modal closed');
    } catch (err) {
      console.error('Form submission error:', err);
      onError(err.message);
    }
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
