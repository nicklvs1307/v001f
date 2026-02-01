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
  Typography,
  Chip,
} from '@mui/material';

const commonRules = [
  "Válido apenas para consumo no local",
  "Não cumulativo com outras promoções",
  "Válido de segunda a quinta-feira",
  "Apresentar cupom ao fazer o pedido",
  "Válido por tempo limitado",
  "Consumo mínimo de R$ 50,00",
  "Um cupom por mesa/atendimento"
];

const RecompensaForm = ({ open, handleClose, recompensa, handleSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    conditionDescription: '', 
    pointsRequired: '',
    active: true,
  });

  useEffect(() => {
    if (recompensa) {
      setFormData({
        name: recompensa.name || '',
        description: recompensa.description || '',
        conditionDescription: recompensa.conditionDescription || '', 
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

  const addRule = (rule) => {
    const current = formData.conditionDescription || '';
    const separator = current && !current.endsWith('\n') ? '\n' : '';
    setFormData(prev => ({
      ...prev,
      conditionDescription: current + separator + rule
    }));
  };

  const onSubmit = () => {
    handleSubmit(formData);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
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
          sx={{ mb: 2, mt: 1 }}
        />
        <TextField
          margin="dense"
          name="description"
          label="Descrição Interna"
          type="text"
          fullWidth
          multiline
          rows={2}
          variant="outlined"
          value={formData.description}
          onChange={handleChange}
          sx={{ mb: 2 }}
          helperText="Ex: 10% de desconto no prato feito"
        />
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
            Regras e Condições (Visível para o cliente)
          </Typography>
          <TextField
            margin="dense"
            name="conditionDescription"
            placeholder="Digite uma regra por linha..."
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={formData.conditionDescription || ''}
            onChange={handleChange}
          />
          <Box sx={{ mt: 1.5, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="caption" sx={{ display: 'block', width: '100%', mb: 0.5, fontWeight: 'bold' }}>
              Sugestões rápidas (clique para adicionar):
            </Typography>
            {commonRules.map((rule, idx) => (
              <Chip 
                key={idx} 
                label={rule} 
                size="small" 
                onClick={() => addRule(rule)}
                sx={{ cursor: 'pointer' }}
              />
            ))}
          </Box>
        </Box>

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
        <Box sx={{ mt: 1 }}>
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
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={handleClose} color="secondary">Cancelar</Button>
        <Button onClick={onSubmit} variant="contained" color="primary">{recompensa ? 'Salvar Alterações' : 'Criar Recompensa'}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default RecompensaForm;