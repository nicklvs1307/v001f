import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  FormHelperText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';

const CriterioForm = ({ formData, setFormData, onSubmit, loading = false }) => { // Removed error prop
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        {formData.id ? 'Editar Critério' : 'Criar Novo Critério'}
      </Typography>
      <TextField
        label="Nome do Critério"
        name="name"
        value={formData.name || ''}
        onChange={handleChange}
        fullWidth
        margin="normal"
        required
      />
      <FormControl fullWidth margin="normal" required>
        <InputLabel id="type-select-label">Tipo de Critério</InputLabel>
        <Select
          labelId="type-select-label"
          id="type"
          name="type"
          value={formData.type || ''}
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
        value={formData.description || ''}
        onChange={handleChange}
        fullWidth
        margin="normal"
        multiline
        rows={3}
      />

      {/* error and FormHelperText were removed */}

      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        disabled={loading}
        sx={{ mt: 2 }}
      >
        {loading ? <CircularProgress size={24} /> : 'Salvar Critério'}
      </Button>
    </Box>
  );
};

export default CriterioForm;