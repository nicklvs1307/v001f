import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Typography,
  Paper,
  Switch,
  TextField,
  Button,
  CircularProgress,
  Alert,
  FormControlLabel,
} from '@mui/material';
import whatsappTemplateService from '../services/whatsappTemplateService';
import AuthContext from '../context/AuthContext';

const CouponReminderAutomation = () => {
  const [template, setTemplate] = useState({
    type: 'COUPON_REMINDER',
    isEnabled: false,
    daysBefore: 7,
    message: 'Olá {{nome_cliente}}, seu cupom {{codigo_cupom}} está prestes a vencer! Use antes que expire em {{data_validade}}.',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { user } = useContext(AuthContext);

  useEffect(() => {
    whatsappTemplateService.get('COUPON_REMINDER')
      .then(response => {
        if (response.data) {
          setTemplate(response.data);
        }
      })
      .catch(err => {
        // Não é um erro se o template ainda não existir
        if (err.response && err.response.status !== 404) {
          setError('Falha ao carregar configuração.');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTemplate(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = () => {
    setSaving(true);
    setError('');
    setSuccess('');
    whatsappTemplateService.upsert({ ...template, tenantId: user.tenantId })
      .then(() => {
        setSuccess('Configuração salva com sucesso!');
      })
      .catch(() => {
        setError('Falha ao salvar configuração.');
      })
      .finally(() => setSaving(false));
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Paper sx={{ p: 4, mt: 4 }}>
      <Typography variant="h5" gutterBottom>Lembrete de Cupom Expirando</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Envie uma mensagem automática para seus clientes quando o cupom deles estiver prestes a vencer.
      </Typography>

      <FormControlLabel
        control={<Switch checked={template.isEnabled} onChange={handleChange} name="isEnabled" />}
        label={template.isEnabled ? 'Automação Ativa' : 'Automação Inativa'}
        sx={{ mb: 2 }}
      />

      {template.isEnabled && (
        <Box>
          <TextField
            label="Enviar lembrete quantos dias antes do vencimento?"
            name="daysBefore"
            type="number"
            value={template.daysBefore}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 3 }}
          />
          <TextField
            label="Mensagem do Lembrete"
            name="message"
            value={template.message}
            onChange={handleChange}
            fullWidth
            multiline
            rows={5}
            helperText="Variáveis disponíveis: {{nome_cliente}}, {{codigo_cupom}}, {{data_validade}}"
            sx={{ mb: 3 }}
          />
        </Box>
      )}

      <Button variant="contained" onClick={handleSave} disabled={saving}>
        {saving ? <CircularProgress size={24} /> : 'Salvar'}
      </Button>

      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
    </Paper>
  );
}

const AutomationsPage = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>Automações do WhatsApp</Typography>
      <CouponReminderAutomation />
      {/* Outras automações podem ser adicionadas aqui no futuro */}
    </Box>
  );
};

export default AutomationsPage;
