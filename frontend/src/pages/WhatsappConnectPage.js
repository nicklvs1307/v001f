import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, Typography, Box, Button, CircularProgress,
  Alert, Paper, Grid, Card, CardContent, Divider, Chip, Dialog, 
  DialogActions, DialogContent, DialogContentText, DialogTitle,
  Stepper, Step, StepLabel, Stack, AlertTitle, TextField
} from '@mui/material';
import whatsappConfigService from '../services/whatsappConfigService';
import QRCode from 'react-qr-code';
import { CheckCircle, HourglassEmpty, LinkOff, QrCodeScanner, AddCircleOutline, PermPhoneMsg, AccountCircle } from '@mui/icons-material';

// --- Subcomponentes ---

const StatusChip = ({ status }) => {
  const statusInfo = {
    no_instance: { label: 'Não Criada', color: 'default', icon: <HourglassEmpty /> },
    unconfigured: { label: 'Não Configurada', color: 'default', icon: <HourglassEmpty /> },
    disconnected: { label: 'Desconectado', color: 'error', icon: <LinkOff /> },
    connecting: { label: 'Conectando...', color: 'warning', icon: <CircularProgress size={16} color="inherit" /> },
    connected: { label: 'Conectado', color: 'success', icon: <CheckCircle /> },
  };
  const currentStatus = statusInfo[status] || statusInfo.disconnected;
  return <Chip icon={currentStatus.icon} label={currentStatus.label} color={currentStatus.color} variant="outlined" />;
};

const steps = ['Criar Instância', 'Escanear QR Code', 'Conectado'];

// --- Componente Principal ---

const WhatsappConnectPage = () => {
  const [config, setConfig] = useState(null);
  const [connectionInfo, setConnectionInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [error, setError] = useState('');
  const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [apiKey, setApiKey] = useState('');

  const fetchConfig = useCallback(async () => {
    try {
      const response = await whatsappConfigService.getInstanceConfig();
      setConfig(response.data);
      if (response.data.status === 'connected') {
        setQrCode(''); // Limpa QR code antigo
        // Busca as informações da conexão se estiver conectado
        const info = await whatsappConfigService.getConnectionInfo();
        setConnectionInfo(info.data);
      } else {
        setConnectionInfo(null); // Limpa info se não estiver conectado
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Falha ao buscar configuração.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig(); // Busca inicial
  
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchConfig();
      }
    };
  
    document.addEventListener('visibilitychange', handleVisibilityChange);
  
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchConfig]);
  
  // Polling para verificar o status da conexão
  useEffect(() => {
    let statusInterval;
  
    // Inicia o polling se a configuração existe e não está conectado
    if (config && config.status !== 'connected') {
      statusInterval = setInterval(() => {
        // Adiciona uma verificação de visibilidade para evitar chamadas em background
        if (document.visibilityState === 'visible') {
          fetchConfig();
        }
      }, 5000); // Verifica a cada 5 segundos
    }
  
    // Limpa o intervalo se o status mudar para conectado ou o componente for desmontado
    return () => clearInterval(statusInterval);
  }, [config, fetchConfig]);

  const getActiveStep = () => {
    if (!config || config.status === 'no_instance') return 0;
    if (config.status === 'disconnected' || qrCode) return 1;
    if (config.status === 'connected') return 2;
    return 0;
  };

  const handleAction = async (serviceCall) => {
    setActionLoading(true);
    setError('');
    try {
      await serviceCall();
      await fetchConfig();
    } catch (err) {
      setError(err.response?.data?.message || 'Ocorreu um erro inesperado.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleGetQrCode = async () => {
    setActionLoading(true);
    setError('');
    setQrCode('');
    try {
      const response = await whatsappConfigService.getInstanceQrCode();
      setQrCode(response.data.code);
    } catch (err) {
      setError(err.response?.data?.message || 'Falha ao obter QR Code.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    setConfirmDeleteDialogOpen(false);
    await handleAction(whatsappConfigService.deleteInstance);
  };

  const renderContent = () => {
    if (loading) {
      return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
    }

    if (!config || config.status === 'no_instance' || config.status === 'unconfigured') {
      return (
        <CardContent sx={{ textAlign: 'center', p: 4 }}>
          <AddCircleOutline sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom>Primeiro Passo: Configurar Instância</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Insira a URL da sua API do WhatsApp e a Chave de API para criar sua instância.
          </Typography>
          <TextField
            fullWidth
            label="URL da Instância da API"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Chave de API (API Key)"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            margin="normal"
            required
          />
          <Button
            variant="contained"
            onClick={() => handleAction(() => whatsappConfigService.createInstance({ url, apiKey }))}
            disabled={actionLoading || !url || !apiKey}
            sx={{ mt: 2 }}
          >
            {actionLoading ? <CircularProgress size={24} /> : 'Criar Instância Agora'}
          </Button>
        </CardContent>
      );
    }

    return (
      <Grid container spacing={4}>
        {/* Painel de Controle (Esquerda) */}
        <Grid item xs={12} md={5}>
          <Typography variant="h6" gutterBottom>Painel de Controle</Typography>
          <Stack spacing={2}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="body2" color="text.secondary">Status da Conexão</Typography>
                <StatusChip status={config.status} />
              </CardContent>
            </Card>
            {config.status === 'connected' && connectionInfo && (
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>Conta Conectada</Typography>
                  <Stack spacing={1}>
                    <Box display="flex" alignItems="center"><AccountCircle sx={{ mr: 1, color: 'text.secondary' }} /> {connectionInfo.profileName}</Box>
                    <Box display="flex" alignItems="center"><PermPhoneMsg sx={{ mr: 1, color: 'text.secondary' }} /> +{connectionInfo.phoneNumber}</Box>
                  </Stack>
                </CardContent>
              </Card>
            )}
            <Divider />
            <Typography variant="subtitle2" color="text.secondary">Ações Disponíveis</Typography>
            <Stack spacing={1.5}>
              {config.status === 'disconnected' && (
                <Button variant="contained" color="primary" onClick={handleGetQrCode} disabled={actionLoading} startIcon={<QrCodeScanner />}>
                  Obter QR Code
                </Button>
              )}
              {config.status === 'connected' && (
                <Button variant="contained" color="warning" onClick={() => handleAction(whatsappConfigService.logoutInstance)} disabled={actionLoading} startIcon={<LinkOff />}>
                  Desconectar (Logout)
                </Button>
              )}
              <Button variant="outlined" color="error" onClick={() => setConfirmDeleteDialogOpen(true)} disabled={actionLoading}>
                Deletar Instância
              </Button>
            </Stack>
          </Stack>
        </Grid>

        {/* Área de Passos e QR Code (Direita) */}
        <Grid item xs={12} md={7}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Stepper activeStep={getActiveStep()} alternativeLabel>
                {steps.map((label) => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
              </Stepper>
              <Box sx={{ mt: 4, p: 2, minHeight: 280, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5', borderRadius: 2 }}>
                {actionLoading && !qrCode && <CircularProgress />}
                {qrCode ? (
                  <>
                    <Typography variant="h6" gutterBottom>Escaneie para Conectar</Typography>
                    <Box sx={{ p: 1, background: 'white', borderRadius: '8px' }}><QRCode value={qrCode} size={220} /></Box>
                    <Typography variant="caption" display="block" mt={2}>A página será atualizada automaticamente.</Typography>
                  </>
                ) : config.status === 'connected' ? (
                  <>
                    <CheckCircle color="success" sx={{ fontSize: 60, mb: 2 }} />
                    <Typography variant="h5" color="success.main">Conexão Ativa!</Typography>
                    <Typography color="text.secondary">Sua conta está conectada e pronta para uso.</Typography>
                  </>
                ) : (
                  <Typography color="text.secondary">Clique em "Obter QR Code" para iniciar.</Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom sx={{ mt: 3 }}>Conectar WhatsApp</Typography>
      <Alert severity="warning" sx={{ mt: 2, mb: 3 }}>
        <AlertTitle>Aviso Importante</AlertTitle>
        O uso desta ferramenta está sujeito aos <strong>Termos de Serviço do WhatsApp.</strong> O envio de spam pode levar ao <strong>bloqueio do seu número.</strong><br/>
        <strong>Não nos responsabilizamos por bloqueios.</strong> Use com consciência.
      </Alert>
      <Paper sx={{ p: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {renderContent()}
      </Paper>
      <Dialog open={confirmDeleteDialogOpen} onClose={() => setConfirmDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar Deleção</DialogTitle>
        <DialogContent>
          <DialogContentText>Tem certeza que deseja deletar a instância? Esta ação é irreversível.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleDelete} color="error" autoFocus>Deletar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default WhatsappConnectPage;