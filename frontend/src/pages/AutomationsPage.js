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

const PrizeRouletteAutomation = ({ config, handleChange, disabled }) => {
  return (
    <Paper sx={{ p: 4, height: '100%' }}>
      <Typography variant="h5" gutterBottom>Prêmio da Roleta</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Envie uma mensagem automática para o cliente assim que ele ganhar um prêmio na roleta.
      </Typography>

      <FormControlLabel
        control={<Switch checked={config.sendPrizeMessage} onChange={handleChange} name="sendPrizeMessage" />}
        label={config.sendPrizeMessage ? 'Automação Ativa' : 'Automação Inativa'}
        sx={{ mb: 2 }}
        disabled={disabled}
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
            disabled={disabled}
          />
        </Box>
      )}
    </Paper>
  );
}

const CouponReminderAutomation = ({ template, handleChange, disabled }) => {
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
        disabled={disabled}
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
            disabled={disabled}
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
            disabled={disabled}
          />
        </Box>
      )}
    </Paper>
  );
}

const AutomationsPage = () => {
  const [config, setConfig] = useState({
    sendPrizeMessage: false,
    prizeMessageTemplate: 'Parabéns, {{cliente}}! Você ganhou um prêmio: {{premio}}. Use o cupom {{cupom}} para resgatar.',
  });
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
    setLoading(true);
    setError('');
    Promise.all([
      whatsappConfigService.getInstanceConfig(),
      whatsappTemplateService.get('COUPON_REMINDER')
    ])
    .then(([configResponse, templateResponse]) => {
      if (configResponse && configResponse.status !== 'unconfigured') {
        setConfig(prev => ({
          ...prev,
          sendPrizeMessage: configResponse.sendPrizeMessage || false,
          prizeMessageTemplate: configResponse.prizeMessageTemplate || prev.prizeMessageTemplate,
        }));
      } else {
        setError('A configuração do WhatsApp ainda não foi feita. Conecte uma instância primeiro.');
      }

      if (templateResponse.data) {
        setTemplate(templateResponse.data);
      }
    })
    .catch((err) => {
      if (err?.response?.status !== 404) {
        setError('Falha ao carregar as configurações de automação.');
      }
    })
    .finally(() => setLoading(false));
  }, []);

  const handleConfigChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleTemplateChange = (e) => {
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

    const automationsConfig = {
      sendPrizeMessage: config.sendPrizeMessage,
      prizeMessageTemplate: config.prizeMessageTemplate,
    };

    const templateConfig = {
      ...template,
      tenantId: user.tenantId,
    };

    Promise.all([
      whatsappConfigService.saveAutomationsConfig(automationsConfig),
      whatsappTemplateService.upsert(templateConfig)
    ])
      .then(() => {
        setSuccess('Automações salvas com sucesso!');
      })
      .catch(() => {
        setError('Falha ao salvar as automações.');
      })
      .finally(() => setSaving(false));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Automações do WhatsApp</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <CouponReminderAutomation template={template} handleChange={handleTemplateChange} disabled={loading || saving} />
        </Grid>
        <Grid item xs={12} md={6}>
          <PrizeRouletteAutomation config={config} handleChange={handleConfigChange} disabled={loading || saving} />
        </Grid>
      </Grid>

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" color="primary" onClick={handleSave} disabled={loading || saving}>
          {saving ? <CircularProgress size={24} /> : 'Salvar Todas as Automações'}
        </Button>
      </Box>

      {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
    </Box>
  );
};

export default AutomationsPage;
