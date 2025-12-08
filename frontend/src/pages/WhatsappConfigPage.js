import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
  Container, Typography, Box, Button, CircularProgress, Snackbar, Alert, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton,
  Chip, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Tooltip,
  FormGroup, FormControlLabel, Switch, Divider,
} from '@mui/material';
import { Edit, Delete, Refresh, VpnKey, PowerSettingsNew, LinkOff } from '@mui/icons-material';
import AuthContext from '../context/AuthContext';
import whatsappConfigService from '../services/whatsappConfigService';

const statusMap = {
  connected: { label: 'Conectado', color: 'success' },
  disconnected: { label: 'Desconectado', color: 'error' },
  not_created: { label: 'Não Criado', color: 'default' },
  unconfigured: { label: 'Não Configurado', color: 'warning' },
  error: { label: 'Erro', color: 'error' },
};

const EditConfigDialog = ({ open, onClose, config, onSave, saving }) => {
  const [formData, setFormData] = useState({
    url: '',
    apiKey: '',
    dailyReportEnabled: false,
    weeklyReportEnabled: false,
    monthlyReportEnabled: false,
    reportPhoneNumbers: '',
    sendPrizeMessage: false,
    prizeMessageTemplate: '',
    sendDetractorMessageToClient: false,
    detractorMessageTemplate: '',
    notifyDetractorToOwner: false,
    detractorOwnerMessageTemplate: '',
    detractorOwnerPhoneNumbers: '',
  });

  useEffect(() => {
    if (config) {
      setFormData({
        url: config.url || '',
        apiKey: config.apiKey || '',
        dailyReportEnabled: config.dailyReportEnabled || false,
        weeklyReportEnabled: config.weeklyReportEnabled || false,
        monthlyReportEnabled: config.monthlyReportEnabled || false,
        reportPhoneNumbers: config.reportPhoneNumbers || '',
        sendPrizeMessage: config.sendPrizeMessage || false,
        prizeMessageTemplate: config.prizeMessageTemplate || '',
        sendDetractorMessageToClient: config.sendDetractorMessageToClient || false,
        detractorMessageTemplate: config.detractorMessageTemplate || '',
        notifyDetractorToOwner: config.notifyDetractorToOwner || false,
        detractorOwnerMessageTemplate: config.detractorOwnerMessageTemplate || '',
        detractorOwnerPhoneNumbers: config.detractorOwnerPhoneNumbers || '',
      });
    }
  }, [config]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = () => {
    onSave(config.tenantId, formData);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Editar Configuração de {config?.Tenant?.name}</DialogTitle>
      <DialogContent>
        <Typography variant="h6" gutterBottom>Configurações da API</Typography>
        <TextField
          fullWidth
          label="URL da Instância da API"
          name="url"
          value={formData.url}
          onChange={handleChange}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Chave de API (API Key)"
          name="apiKey"
          value={formData.apiKey}
          onChange={handleChange}
          margin="normal"
          required
        />
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" gutterBottom>Relatórios Automáticos</Typography>
        <FormGroup>
          <FormControlLabel
            control={
              <Switch
                checked={formData.dailyReportEnabled}
                onChange={handleChange}
                name="dailyReportEnabled"
              />
            }
            label="Enviar Relatório Diário"
          />
          <FormControlLabel
            control={
              <Switch
                checked={formData.weeklyReportEnabled}
                onChange={handleChange}
                name="weeklyReportEnabled"
              />
            }
            label="Enviar Relatório Semanal"
          />
          <FormControlLabel
            control={
              <Switch
                checked={formData.monthlyReportEnabled}
                onChange={handleChange}
                name="monthlyReportEnabled"
              />
            }
            label="Enviar Relatório Mensal"
          />
          <TextField
            fullWidth
            label="Números para Relatórios (separados por vírgula)"
            name="reportPhoneNumbers"
            value={formData.reportPhoneNumbers}
            onChange={handleChange}
            margin="normal"
            disabled={!formData.dailyReportEnabled && !formData.weeklyReportEnabled && !formData.monthlyReportEnabled}
            helperText="Os números de telefone para todos os relatórios habilitados."
          />
        </FormGroup>

        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" gutterBottom>Outras Automações</Typography>

        <FormGroup sx={{ mt: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.sendPrizeMessage}
                onChange={handleChange}
                name="sendPrizeMessage"
              />
            }
            label="Enviar Mensagem de Prêmio (Roleta)"
          />
          <TextField
            fullWidth
            label="Template da Mensagem de Prêmio"
            name="prizeMessageTemplate"
            value={formData.prizeMessageTemplate}
            onChange={handleChange}
            margin="normal"
            multiline
            rows={3}
            disabled={!formData.sendPrizeMessage}
            helperText="Use {{cliente}}, {{premio}}, e {{cupom}} como variáveis."
          />
        </FormGroup>
        <FormGroup sx={{ mt: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.sendDetractorMessageToClient}
                onChange={handleChange}
                name="sendDetractorMessageToClient"
              />
            }
            label="Enviar Mensagem para Detratores (Cliente)"
          />
          <TextField
            fullWidth
            label="Template da Mensagem de Detrator"
            name="detractorMessageTemplate"
            value={formData.detractorMessageTemplate}
            onChange={handleChange}
            margin="normal"
            multiline
            rows={3}
            disabled={!formData.sendDetractorMessageToClient}
            helperText="Use {{cliente}} como variável."
          />
        </FormGroup>
        <FormGroup sx={{ mt: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.notifyDetractorToOwner}
                onChange={handleChange}
                name="notifyDetractorToOwner"
              />
            }
            label="Notificar Detrator para o Proprietário"
          />
          <TextField
            fullWidth
            label="Template de Notificação do Detrator (Proprietário)"
            name="detractorOwnerMessageTemplate"
            value={formData.detractorOwnerMessageTemplate}
            onChange={handleChange}
            margin="normal"
            multiline
            rows={3}
            disabled={!formData.notifyDetractorToOwner}
            helperText="Use {{cliente}}, {{nota}}, {{comentario}} como variáveis."
          />
          <TextField
            fullWidth
            label="Números de Telefone do Proprietário (separados por vírgula)"
            name="detractorOwnerPhoneNumbers"
            value={formData.detractorOwnerPhoneNumbers}
            onChange={handleChange}
            margin="normal"
            disabled={!formData.notifyDetractorToOwner}
          />
        </FormGroup>

      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained" disabled={saving}>
          {saving ? <CircularProgress size={24} /> : 'Salvar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const SuperAdminView = () => {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({}); // { tenantId: boolean }
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState(null);

  const fetchConfigs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await whatsappConfigService.getAllTenantConfigsWithStatus();
      setConfigs(response.data || []);
    } catch (error) {
      setSnackbar({ open: true, message: 'Falha ao buscar configurações.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfigs();
  }, [fetchConfigs]);

  const handleAction = async (tenantId, action, successMessage) => {
    setActionLoading(prev => ({ ...prev, [tenantId]: true }));
    try {
      await action(tenantId);
      setSnackbar({ open: true, message: successMessage, severity: 'success' });
      fetchConfigs(); // Refresh data
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Ocorreu um erro.';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    } finally {
      setActionLoading(prev => ({ ...prev, [tenantId]: false }));
    }
  };

  const handleSave = async (tenantId, data) => {
    await handleAction(tenantId, (id) => whatsappConfigService.saveTenantConfig(id, data), 'Configuração salva com sucesso!');
    setEditDialogOpen(false);
  };

  const handleDelete = async () => {
    if (selectedConfig) {
      await handleAction(selectedConfig.tenantId, whatsappConfigService.superAdminDeleteInstance, 'Instância deletada com sucesso!');
    }
    setConfirmDeleteDialogOpen(false);
  };

  const openEditDialog = (config) => {
    setSelectedConfig(config);
    setEditDialogOpen(true);
  };

  const openConfirmDeleteDialog = (config) => {
    setSelectedConfig(config);
    setConfirmDeleteDialogOpen(true);
  };

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <IconButton onClick={fetchConfigs} disabled={loading}>
          <Refresh />
        </IconButton>
      </Box>
      <Paper sx={{ p: 0 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tenant</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>URL da API</TableCell>
                <TableCell>Chave da API</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center"><CircularProgress /></TableCell>
                </TableRow>
              ) : (
                configs.map((config) => (
                  <TableRow key={config.tenantId}>
                    <TableCell>{config.Tenant?.name || 'N/A'}</TableCell>
                    <TableCell>
                      <Chip
                        label={statusMap[config.status]?.label || 'Desconhecido'}
                        color={statusMap[config.status]?.color || 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{config.url || '-'}</TableCell>
                    <TableCell>{config.apiKey ? '••••••••' + config.apiKey.slice(-4) : '-'}</TableCell>
                    <TableCell align="center">
                      {actionLoading[config.tenantId] ? <CircularProgress size={24} /> : (
                        <>
                          <Tooltip title="Editar Configuração">
                            <IconButton onClick={() => openEditDialog(config)}><Edit /></IconButton>
                          </Tooltip>
                          <Tooltip title="Reiniciar Instância">
                            <span>
                              <IconButton 
                                onClick={() => handleAction(config.tenantId, whatsappConfigService.superAdminRestartInstance, 'Instância reiniciada.')}
                                disabled={config.status === 'unconfigured' || config.status === 'not_created'}
                              >
                                <PowerSettingsNew />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title="Desconectar Instância">
                            <span>
                              <IconButton 
                                onClick={() => handleAction(config.tenantId, whatsappConfigService.superAdminLogoutInstance, 'Instância desconectada.')}
                                disabled={config.status !== 'connected'}
                              >
                                <LinkOff />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title="Deletar Instância">
                            <span>
                              <IconButton 
                                onClick={() => openConfirmDeleteDialog(config)}
                                disabled={config.status === 'unconfigured' || config.status === 'not_created'}
                              >
                                <Delete />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {selectedConfig && (
        <EditConfigDialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          config={selectedConfig}
          onSave={handleSave}
          saving={actionLoading[selectedConfig.tenantId]}
        />
      )}

      <Dialog open={confirmDeleteDialogOpen} onClose={() => setConfirmDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar Deleção</DialogTitle>
        <DialogContent>
          <Typography>Tem certeza que deseja deletar a instância de <strong>{selectedConfig?.Tenant?.name}</strong>?</Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>Esta ação é irreversível e removerá a configuração do sistema.</Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleDelete} color="error" autoFocus>Deletar</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
        <Alert onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

const WhatsappConfigPage = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (user?.role?.name !== 'Super Admin') {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 3 }}>Acesso não autorizado.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom sx={{ mt: 3, mb: 2 }}>
        Gerenciador de Instâncias WhatsApp
      </Typography>
      <SuperAdminView />
    </Container>
  );
};

export default WhatsappConfigPage;