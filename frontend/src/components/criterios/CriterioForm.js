import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
} from '@mui/material';

const CriterioForm = ({ criterioToEdit, onSubmit, onCancel, loading: propLoading = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    description: '',
  });
  const [loading, setLoading] = useState(propLoading);

  useEffect(() => {
    if (criterioToEdit) {
      setFormData({
        name: criterioToEdit.name || '',
        type: criterioToEdit.type || '',
        description: criterioToEdit.description || '',
      });
    } else {
      // Reset form for creation
      setFormData({ name: '', type: '', description: '' });
    }
  }, [criterioToEdit]);

  useEffect(() => {
    setLoading(propLoading);
  }, [propLoading]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit(formData);
    setLoading(false);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Stack spacing={2}>
        <TextField
          label="Nome do Critério"
          name="name"
          value={formData.name}
          onChange={handleChange}
          fullWidth
          required
          autoFocus
        />
        <FormControl fullWidth required>
          <InputLabel id="type-select-label">Tipo de Critério</InputLabel>
          <Select
            labelId="type-select-label"
            id="type"
            name="type"
            value={formData.type}
            label="Tipo de Critério"
            onChange={handleChange}
          >
            <MenuItem value="NPS">NPS (Net Promoter Score)</MenuItem>
            <MenuItem value="CSAT">CSAT (Customer Satisfaction)</MenuItem>
            <MenuItem value="CES">CES (Customer Effort Score)</MenuItem>
            <MenuItem value="Star">Avaliação por Estrelas</MenuItem>
            <MenuItem value="Text">Texto Aberto</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Descrição do Critério"
          name="description"
          value={formData.description}
          onChange={handleChange}
          fullWidth
          multiline
          rows={3}
        />
        <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 2 }}>
          <Button onClick={onCancel} color="secondary" disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Salvar'}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default CriterioForm;