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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import MarkunreadMailboxOutlinedIcon from '@mui/icons-material/MarkunreadMailboxOutlined';
import UpcomingOutlinedIcon from '@mui/icons-material/UpcomingOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CakeIcon from '@mui/icons-material/Cake';
import SmsFailedOutlinedIcon from '@mui/icons-material/SmsFailedOutlined';

import automationService from '../services/automationService';
import recompensaService from '../services/recompensaService';
import roletaService from '../services/roletaService';
import AutomationTester from '../components/AutomationTester';

const initialAutomationState = {
  dailyReport: { enabled: false, phoneNumbers: '' },
  weeklyReport: { enabled: false, phoneNumbers: '' },
  monthlyReport: { enabled: false, phoneNumbers: '' },
  prizeRoulette: { enabled: false, template: '' },
  couponReminder: { enabled: false, daysBefore: 0, message: '' },
  birthdayAutomation: {
    enabled: false,
    messageTemplate: 'Feliz aniversário, {{cliente}}! Ganhe {{recompensa}} com o cupom {{cupom}}.',
    daysBefore: 0,
    rewardType: '',
    rewardId: '',
    couponValidityDays: 30,
  },
  detractorAutomation: {
    enabled: false,
    messageTemplate: 'Olá, {{cliente}}. Vimos que você teve um problema conosco e gostaríamos de entender melhor. Podemos ajudar de alguma forma?',
    notifyOwner: false,
    ownerMessageTemplate: 'Alerta de Detrator: Cliente {{cliente}} deu a nota {{nota}}. Comentário: {{comentario}}',
    ownerPhoneNumbers: '',
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
  const [open, setOpen] = useState({ dailyReport: false, weeklyReport: false, monthlyReport: false, prizeRoulette: false, couponReminder: false, birthdayAutomation: false, detractorAutomation: false });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [recompensas, setRecompensas] = useState([]);
  const [roletas, setRoletas] = useState([]);

  const isDirty = JSON.stringify(automations) !== JSON.stringify(originalAutomations);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const automationsResponse = await automationService.getAutomations();
      const mergedAutomations = {
        ...initialAutomationState,
        ...automationsResponse,
      };
      setAutomations(mergedAutomations);
      setOriginalAutomations(mergedAutomations);
      setRecompensas(Array.isArray(automationsResponse.recompensas) ? automationsResponse.recompensas : []);
      // Assumindo que as roletas também podem vir da mesma resposta
      setRoletas(Array.isArray(automationsResponse.roletas) ? automationsResponse.roletas : []);
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
      await automationService.updateAutomations(automations);
      await loadData(); // Recarrega os dados
      setSnackbar({ open: true, message: 'Automações salvas com sucesso!', severity: 'success' });
    } catch (err) {
      console.error('Falha ao salvar:', err);
      setError('Falha ao salvar as automações. Verifique os dados e tente novamente.');
      setSnackbar({ open: true, message: 'Erro ao salvar as automações.', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleTestSent = ({ success, message }) => {
    setSnackbar({
      open: true,
      message: message,
      severity: success ? 'success' : 'error',
    });
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
    <Box sx={{ p: 3, pb: 15 }}>
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
                label="Números de Telefone para Relatórios"
                value={automations.dailyReport.reportPhoneNumbers || ''}
                onChange={(e) => handleChange('dailyReport', 'reportPhoneNumbers', e.target.value)}
                fullWidth
                multiline
                rows={2}
                helperText="Insira os números com DDI e DDD, separados por vírgula."
                margin="normal"
                disabled={!automations.dailyReport.enabled}
              />
              <AutomationTester automationType="daily-report" onTestSent={handleTestSent} />
            </Box>
          </Collapse>
        </AutomationItem>

        {/* Relatório Semanal */}
        <AutomationItem>
          <ListItem onClick={() => setOpen(prev => ({ ...prev, weeklyReport: !prev.weeklyReport }))} sx={{ cursor: 'pointer' }}>
            <ListItemIcon><AssessmentOutlinedIcon /></ListItemIcon>
            <ListItemText primary="Relatório Semanal de NPS" secondary="Receber um resumo semanal de performance via WhatsApp." />
            <Switch
              edge="end"
              onChange={() => handleToggle('weeklyReport')}
              checked={automations.weeklyReport.enabled}
              onClick={(e) => e.stopPropagation()}
            />
            {open.weeklyReport ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse in={open.weeklyReport} timeout="auto" unmountOnExit>
            <Box sx={{ p: 2, pl: 4, borderTop: '1px solid #eee' }}>
              <TextField
                label="Números de Telefone para Relatórios"
                value={automations.weeklyReport.reportPhoneNumbers || ''}
                onChange={(e) => handleChange('weeklyReport', 'reportPhoneNumbers', e.target.value)}
                fullWidth
                multiline
                rows={2}
                helperText="Insira os números com DDI e DDD, separados por vírgula."
                margin="normal"
                disabled={!automations.weeklyReport.enabled}
              />
              <AutomationTester automationType="weekly-report" onTestSent={handleTestSent} />
            </Box>
          </Collapse>
        </AutomationItem>

        {/* Relatório Mensal */}
        <AutomationItem>
          <ListItem onClick={() => setOpen(prev => ({ ...prev, monthlyReport: !prev.monthlyReport }))} sx={{ cursor: 'pointer' }}>
            <ListItemIcon><AssessmentOutlinedIcon /></ListItemIcon>
            <ListItemText primary="Relatório Mensal de NPS" secondary="Receber um resumo mensal de performance via WhatsApp." />
            <Switch
              edge="end"
              onChange={() => handleToggle('monthlyReport')}
              checked={automations.monthlyReport.enabled}
              onClick={(e) => e.stopPropagation()}
            />
            {open.monthlyReport ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse in={open.monthlyReport} timeout="auto" unmountOnExit>
            <Box sx={{ p: 2, pl: 4, borderTop: '1px solid #eee' }}>
              <TextField
                label="Números de Telefone para Relatórios"
                value={automations.monthlyReport.reportPhoneNumbers || ''}
                onChange={(e) => handleChange('monthlyReport', 'reportPhoneNumbers', e.target.value)}
                fullWidth
                multiline
                rows={2}
                helperText="Insira os números com DDI e DDD, separados por vírgula."
                margin="normal"
                disabled={!automations.monthlyReport.enabled}
              />
              <AutomationTester automationType="monthly-report" onTestSent={handleTestSent} />
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
              <AutomationTester automationType="roleta-prize" onTestSent={handleTestSent} />
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
                value={automations.couponReminder.message}
                onChange={(e) => handleChange('couponReminder', 'message', e.target.value)}
                fullWidth
                multiline
                rows={4}
                helperText="Variáveis: {{cliente}}, {{recompensa}}, {{cupom}}, {{data_validade}}"
                margin="normal"
                disabled={!automations.couponReminder.enabled}
              />
              <AutomationTester automationType="coupon-reminder" onTestSent={handleTestSent} />
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
                sx={{ mb: 2, mr: 2 }}
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
              <AutomationTester automationType="birthday" onTestSent={handleTestSent} />
            </Box>
          </Collapse>
        </AutomationItem>

        {/* Automação de Detratores */}
        <AutomationItem>
          <ListItem onClick={() => setOpen(prev => ({ ...prev, detractorAutomation: !prev.detractorAutomation }))} sx={{ cursor: 'pointer' }}>
            <ListItemIcon><SmsFailedOutlinedIcon /></ListItemIcon>
            <ListItemText primary="Mensagem para Detratores" secondary="Enviar uma mensagem automática para clientes que deram uma nota baixa." />
            <Switch
              edge="end"
              onChange={() => handleToggle('detractorAutomation')}
              checked={automations.detractorAutomation.enabled}
              onClick={(e) => e.stopPropagation()}
            />
            {open.detractorAutomation ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse in={open.detractorAutomation} timeout="auto" unmountOnExit>
            <Box sx={{ p: 2, pl: 4, borderTop: '1px solid #eee' }}>
              <Typography variant="subtitle2" gutterBottom>Para o Cliente</Typography>
              <Switch
                checked={automations.detractorAutomation.enabled}
                onChange={() => handleToggle('detractorAutomation')}
              />
              <TextField
                label="Mensagem para Detratores"
                value={automations.detractorAutomation.messageTemplate}
                onChange={(e) => handleChange('detractorAutomation', 'messageTemplate', e.target.value)}
                fullWidth
                multiline
                rows={4}
                helperText="Variáveis: {{cliente}}"
                margin="normal"
                disabled={!automations.detractorAutomation.enabled}
              />
              <AutomationTester automationType="detractor-message" onTestSent={handleTestSent} />
              
              <Divider sx={{ my: 3 }} />

              <Typography variant="subtitle2" gutterBottom>Notificação para o Estabelecimento</Typography>
              <Switch
                checked={automations.detractorAutomation.notifyOwner}
                onChange={(e) => handleChange('detractorAutomation', 'notifyOwner', e.target.checked)}
              />
              <TextField
                label="Mensagem de Alerta para o Dono"
                value={automations.detractorAutomation.ownerMessageTemplate}
                onChange={(e) => handleChange('detractorAutomation', 'ownerMessageTemplate', e.target.value)}
                fullWidth
                multiline
                rows={4}
                helperText="Variáveis: {{cliente}}, {{nota}}, {{comentario}}"
                margin="normal"
                disabled={!automations.detractorAutomation.notifyOwner}
              />
              <TextField
                label="Números para Notificação"
                value={automations.detractorAutomation.ownerPhoneNumbers}
                onChange={(e) => handleChange('detractorAutomation', 'ownerPhoneNumbers', e.target.value)}
                fullWidth
                multiline
                rows={2}
                helperText="Insira os números com DDI e DDD, separados por vírgula."
                margin="normal"
                disabled={!automations.detractorAutomation.notifyOwner}
              />
            </Box>
          </Collapse>
        </AutomationItem>
      </List>

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
