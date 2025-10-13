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
  Grid,
} from '@mui/material';
import whatsappTemplateService from '../services/whatsappTemplateService';
import whatsappConfigService from '../services/whatsappConfigService';
import AuthContext from '../context/AuthContext';

const PrizeRouletteAutomation = () => {
  const [config, setConfig] = useState({
    sendPrizeMessage: false,
    prizeMessageTemplate: 'Parabéns, {{cliente}}! Você ganhou um prêmio: {{premio}}. Use o cupom {{cupom}} para resgatar.',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setLoading(true);
    whatsappConfigService.getInstanceConfig()
      .then(response => {
        if (response && response.status !== 'unconfigured') {
          setConfig(prev => ({
            ...prev,
            sendPrizeMessage: response.sendPrizeMessage || false,
            prizeMessageTemplate: response.prizeMessageTemplate || prev.prizeMessageTemplate,
          }));
        } else {
          setError('A configuração do WhatsApp ainda não foi feita. Conecte uma instância primeiro.');
        }
      })
      .catch(() => {
        setError('Falha ao carregar a configuração do WhatsApp.');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = () => {
    setSaving(true);
    setError('');
    setSuccess('');
    whatsappConfigService.saveAutomationsConfig(config)
      .then(() => {
        setSuccess('Automação da Roleta salva com sucesso!');
      })
      .catch(() => {
        setError('Falha ao salvar a automação da roleta.');
      })
      .finally(() => setSaving(false));
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Paper sx={{ p: 4, height: '100%' }}>
      <Typography variant="h5" gutterBottom>Prêmio da Roleta</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Envie uma mensagem automática para o cliente assim que ele ganhar um prêmio na roleta.
      </Typography>

      {error && !config.sendPrizeMessage ? (
          <Alert severity="warning">{error}</Alert>
      ) : (
        <>
          <FormControlLabel
            control={<Switch checked={config.sendPrizeMessage} onChange={handleChange} name="sendPrizeMessage" />}
            label={config.sendPrizeMessage ? 'Automação Ativa' : 'Automação Inativa'}
            sx={{ mb: 2 }}
          />

          {config.sendPrizeMessage && (
            <Box>
              <TextField
                label="Mensagem de Premiação"
                name="prizeMessageTemplate"
                value={config.prizeMessageTemplate}
                onChange={handleChange}
                fullWidth
                multiline
                rows={5}
                helperText="Variáveis disponíveis: {{cliente}}, {{premio}}, {{cupom}}"
                sx={{ mb: 3 }}
              />
            </Box>
          )}

          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? <CircularProgress size={24} /> : 'Salvar'}
          </Button>

          {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
        </>
      )}
    </Paper>
  );
}

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
    <Paper sx={{ p: 4, height: '100%' }}>
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
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Automações do WhatsApp</Typography>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <CouponReminderAutomation />
        </Grid>
        <Grid item xs={12} md={6}>
          <PrizeRouletteAutomation />
        </Grid>
      </Grid>
    </Box>
  );
};

export default AutomationsPage;