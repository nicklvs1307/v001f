import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Switch,
  TextField,
  Button,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse,
  AppBar,
  Toolbar,
  Snackbar,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import MarkunreadMailboxOutlinedIcon from '@mui/icons-material/MarkunreadMailboxOutlined';
import UpcomingOutlinedIcon from '@mui/icons-material/UpcomingOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import CakeIcon from '@mui/icons-material/Cake'; // Ícone para aniversário

import automationService from '../services/automationService';
import recompensaService from '../services/recompensaService'; // Novo serviço
import roletaService from '../services/roletaService'; // Novo serviço

const initialAutomationState = {
  prizeRoulette: { enabled: false, template: '' },
  couponReminder: { enabled: false, daysBefore: 0, template: '' },
  dailyReport: { enabled: false, phoneNumbers: '' },
  birthdayAutomation: {
    enabled: false,
    messageTemplate: 'Feliz aniversário, {{cliente}}! Ganhe {{recompensa}} com o cupom {{cupom}}.',
    daysBefore: 0,
    rewardType: '',
    rewardId: '',
    couponValidityDays: 30,
  },
};

const AutomationItem = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  transition: 'box-shadow 0.3s',
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
}));

const AutomationsPage = () => {
  const [automations, setAutomations] = useState(initialAutomationState);
  const [originalAutomations, setOriginalAutomations] = useState(initialAutomationState);
  const [open, setOpen] = useState({ prizeRoulette: false, couponReminder: false, dailyReport: false, birthdayAutomation: false });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [recompensas, setRecompensas] = useState([]);
  const [roletas, setRoletas] = useState([]);
  const [sendingTest, setSendingTest] = useState(false);

  const isDirty = JSON.stringify(automations) !== JSON.stringify(originalAutomations);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [automationsResponse, recompensasResponse, roletasResponse] = await Promise.all([
        automationService.getAutomations(),
        recompensaService.getAll(),
        roletaService.getAll(),
      ]);
      setAutomations(automationsResponse.data);
      setOriginalAutomations(automationsResponse.data);
      setRecompensas(recompensasResponse.data);
      setRoletas(roletasResponse.data.roletas);
    } catch (err) {
      setError('Falha ao carregar as configurações de automação.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggle = (key) => {
    setAutomations(prev => ({
      ...prev,
      [key]: { ...prev[key], enabled: !prev[key].enabled },
    }));
  };

  const handleChange = (key, field, value) => {
    setAutomations(prev => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      const response = await automationService.updateAutomations(automations);
      setAutomations(response.data);
      setOriginalAutomations(response.data);
      setSnackbar({ open: true, message: 'Automações salvas com sucesso!', severity: 'success' });
    } catch (err) {
      console.error('Falha ao salvar:', err);
      setError('Falha ao salvar as automações. Verifique os dados e tente novamente.');
      setSnackbar({ open: true, message: 'Erro ao salvar as automações.', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleSendDailyReportTest = async () => {
    setSendingTest(true);
    try {
      await automationService.sendDailyReportTest({ phoneNumbers: automations.dailyReport.phoneNumbers });
      setSnackbar({ open: true, message: 'Relatório de teste enviado com sucesso!', severity: 'success' });
    } catch (err) {
      console.error('Falha ao enviar relatório de teste:', err);
      setSnackbar({ open: true, message: 'Erro ao enviar relatório de teste.', severity: 'error' });
    } finally {
      setSendingTest(false);
    }
  };

  const handleCancel = () => {
    setAutomations(originalAutomations);
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ p: 3, pb: 15 /* Padding extra para a barra de ações */ }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Automações do WhatsApp
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <List component="nav">
        {/* Relatório Diário */}
        <AutomationItem>
          <ListItem onClick={() => setOpen(prev => ({ ...prev, dailyReport: !prev.dailyReport }))} sx={{ cursor: 'pointer' }}>
            <ListItemIcon><AssessmentOutlinedIcon /></ListItemIcon>
            <ListItemText primary="Relatório Diário de NPS" secondary="Receber um resumo diário de performance via WhatsApp." />
            <Switch
              edge="end"
              onChange={() => handleToggle('dailyReport')}
              checked={automations.dailyReport.enabled}
              onClick={(e) => e.stopPropagation()}
            />
            {open.dailyReport ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse in={open.dailyReport} timeout="auto" unmountOnExit>
            <Box sx={{ p: 2, pl: 4, borderTop: '1px solid #eee' }}>
              <TextField
                label="Números de Telefone"
                value={automations.dailyReport.phoneNumbers}
                onChange={(e) => handleChange('dailyReport', 'phoneNumbers', e.target.value)}
                fullWidth
                multiline
                rows={2}
                helperText="Insira os números com DDI e DDD, separados por vírgula. Ex: 5511999998888, 5521988887777"
                margin="normal"
                disabled={!automations.dailyReport.enabled}
              />
              <Button
                variant="outlined"
                onClick={handleSendDailyReportTest}
                disabled={!automations.dailyReport.enabled || sendingTest}
                sx={{ mt: 2 }}
              >
                {sendingTest ? <CircularProgress size={24} /> : 'Enviar Teste'}
              </Button>
            </Box>
          </Collapse>
        </AutomationItem>

        {/* Prêmio da Roleta */}
        <AutomationItem>
          <ListItem onClick={() => setOpen(prev => ({ ...prev, prizeRoulette: !prev.prizeRoulette }))} sx={{ cursor: 'pointer' }}>
            <ListItemIcon><MarkunreadMailboxOutlinedIcon /></ListItemIcon>
            <ListItemText primary="Prêmio da Roleta" secondary="Enviar mensagem automática ao cliente após ganhar na roleta." />
            <Switch
              edge="end"
              onChange={() => handleToggle('prizeRoulette')}
              checked={automations.prizeRoulette.enabled}
              onClick={(e) => e.stopPropagation()}
            />
            {open.prizeRoulette ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse in={open.prizeRoulette} timeout="auto" unmountOnExit>
            <Box sx={{ p: 2, pl: 4, borderTop: '1px solid #eee' }}>
              <TextField
                label="Mensagem de Premiação"
                value={automations.prizeRoulette.template}
                onChange={(e) => handleChange('prizeRoulette', 'template', e.target.value)}
                fullWidth
                multiline
                rows={4}
                helperText="Variáveis: {{cliente}}, {{premio}}, {{cupom}}"
                margin="normal"
                disabled={!automations.prizeRoulette.enabled}
              />
            </Box>
          </Collapse>
        </AutomationItem>

        {/* Lembrete de Cupom */}
        <AutomationItem>
          <ListItem onClick={() => setOpen(prev => ({ ...prev, couponReminder: !prev.couponReminder }))} sx={{ cursor: 'pointer' }}>
            <ListItemIcon><UpcomingOutlinedIcon /></ListItemIcon>
            <ListItemText primary="Lembrete de Cupom Expirando" secondary="Lembrar clientes sobre cupons prestes a vencer." />
            <Switch
              edge="end"
              onChange={() => handleToggle('couponReminder')}
              checked={automations.couponReminder.enabled}
              onClick={(e) => e.stopPropagation()}
            />
            {open.couponReminder ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse in={open.couponReminder} timeout="auto" unmountOnExit>
            <Box sx={{ p: 2, pl: 4, borderTop: '1px solid #eee' }}>
              <TextField
                label="Dias antes do vencimento"
                type="number"
                value={automations.couponReminder.daysBefore}
                onChange={(e) => handleChange('couponReminder', 'daysBefore', e.target.value)}
                margin="normal"
                sx={{ mb: 2 }}
                disabled={!automations.couponReminder.enabled}
              />
              <TextField
                label="Mensagem do Lembrete"
                value={automations.couponReminder.template}
                onChange={(e) => handleChange('couponReminder', 'template', e.target.value)}
                fullWidth
                multiline
                rows={4}
                helperText="Variáveis: {{nome_cliente}}, {{codigo_cupom}}, {{data_validade}}"
                margin="normal"
                disabled={!automations.couponReminder.enabled}
              />
            </Box>
          </Collapse>
        </AutomationItem>

        {/* Automação de Aniversário */}
        <AutomationItem>
          <ListItem onClick={() => setOpen(prev => ({ ...prev, birthdayAutomation: !prev.birthdayAutomation }))} sx={{ cursor: 'pointer' }}>
            <ListItemIcon><CakeIcon /></ListItemIcon>
            <ListItemText primary="Automação de Aniversário" secondary="Enviar mensagem e cupom de presente no aniversário do cliente." />
            <Switch
              edge="end"
              onChange={() => handleToggle('birthdayAutomation')}
              checked={automations.birthdayAutomation.enabled}
              onClick={(e) => e.stopPropagation()}
            />
            {open.birthdayAutomation ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse in={open.birthdayAutomation} timeout="auto" unmountOnExit>
            <Box sx={{ p: 2, pl: 4, borderTop: '1px solid #eee' }}>
              <TextField
                label="Mensagem de Aniversário"
                value={automations.birthdayAutomation.messageTemplate}
                onChange={(e) => handleChange('birthdayAutomation', 'messageTemplate', e.target.value)}
                fullWidth
                multiline
                rows={4}
                helperText="Variáveis: {{cliente}}, {{recompensa}}, {{cupom}}"
                margin="normal"
                disabled={!automations.birthdayAutomation.enabled}
              />
              <TextField
                label="Dias antes do aniversário"
                type="number"
                value={automations.birthdayAutomation.daysBefore}
                onChange={(e) => handleChange('birthdayAutomation', 'daysBefore', e.target.value)}
                margin="normal"
                sx={{ mb: 2 }}
                disabled={!automations.birthdayAutomation.enabled}
              />
              <TextField
                label="Validade do Cupom (dias)"
                type="number"
                value={automations.birthdayAutomation.couponValidityDays}
                onChange={(e) => handleChange('birthdayAutomation', 'couponValidityDays', e.target.value)}
                margin="normal"
                sx={{ mb: 2 }}
                disabled={!automations.birthdayAutomation.enabled}
              />
              <FormControl fullWidth margin="normal" disabled={!automations.birthdayAutomation.enabled}>
                <InputLabel>Tipo de Recompensa</InputLabel>
                <Select
                  value={automations.birthdayAutomation.rewardType}
                  label="Tipo de Recompensa"
                  onChange={(e) => handleChange('birthdayAutomation', 'rewardType', e.target.value)}
                >
                  <MenuItem value="">Nenhum</MenuItem>
                  <MenuItem value="recompensa">Recompensa</MenuItem>
                  <MenuItem value="roleta">Roleta</MenuItem>
                </Select>
              </FormControl>
              {automations.birthdayAutomation.rewardType && (
                <FormControl fullWidth margin="normal" disabled={!automations.birthdayAutomation.enabled}>
                  <InputLabel>Recompensa/Roleta</InputLabel>
                  <Select
                    value={automations.birthdayAutomation.rewardId}
                    label="Recompensa/Roleta"
                    onChange={(e) => handleChange('birthdayAutomation', 'rewardId', e.target.value)}
                  >
                    <MenuItem value="">Selecione...</MenuItem>
                    {automations.birthdayAutomation.rewardType === 'recompensa' && recompensas.map(r => (
                      <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>
                    ))}
                    {automations.birthdayAutomation.rewardType === 'roleta' && roletas.map(r => (
                      <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Box>
          </Collapse>
        </AutomationItem>
      </List>

      {/* Barra de Ações Salvar/Cancelar */}
      <AppBar position="fixed" color="inherit" sx={{ top: 'auto', bottom: 0, background: '#fff', borderTop: '1px solid #ddd' }}>
        <Toolbar sx={{ justifyContent: 'flex-end' }}>
          {isDirty && (
            <Typography variant="body2" sx={{ mr: 2, color: 'text.secondary' }}>
              Você tem alterações não salvas.
            </Typography>
          )}
          <Button variant="outlined" onClick={handleCancel} disabled={!isDirty || saving} sx={{ mr: 2 }}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            disabled={!isDirty || saving}
            startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
          >
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </Toolbar>
      </AppBar>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AutomationsPage;
