import React from 'react';
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

  React.useEffect(() => {
    setFormData(initialData || { name: '', status: 'active' });
  }, [initialData, setFormData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    onError('');
    try {
      if (initialData) {
        await onAtendenteUpdated(formData);
      } else {
        await onAtendenteCreated(formData);
      }
      onClose();
    } catch (err) {
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
