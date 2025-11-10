import React, { useState, useEffect, useCallback, useContext, useRef } from 'react';
import {
  Container, Typography, Box, Button, CircularProgress,
  Alert, Paper, Grid, Card, CardContent, Divider, Chip, Dialog, 
  DialogActions, DialogContent, DialogContentText, DialogTitle,
  Stack, AlertTitle, IconButton
} from '@mui/material';
import AuthContext from '../context/AuthContext';
import whatsappConfigService from '../services/whatsappConfigService';
import QRCode from 'react-qr-code';
import { CheckCircle, HourglassEmpty, LinkOff, QrCodeScanner, AddCircle, DeleteForever, Wifi, WifiOff, Refresh, Replay } from '@mui/icons-material';

// --- Subcomponentes para a nova estrutura ---

const InstanceCard = ({ config, onAction, actionLoading }) => {
  const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false);

  const handleDelete = () => {
    setConfirmDeleteDialogOpen(false);
    onAction(whatsappConfigService.deleteInstance);
  };

  const isCreated = config.status !== 'not_created' && config.status !== 'unconfigured';

  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>1. Gerenciamento da Instância</Typography>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="body1">Status:</Typography>
          <Chip 
            icon={isCreated ? <CheckCircle /> : <HourglassEmpty />}
            label={isCreated ? 'Criada' : 'Não Criada'}
            color={isCreated ? 'success' : 'default'}
            variant="outlined"
          />
        </Stack>
        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Ações:</Typography>
        <Stack spacing={1.5}>
          {!isCreated ? (
            <Button 
              variant="contained" 
              onClick={() => onAction(whatsappConfigService.createInstance)} 
              disabled={actionLoading} 
              startIcon={<AddCircle />}
            >
              Criar Instância na API
            </Button>
          ) : (
            <>
              <Button 
                variant="outlined" 
                color="warning" 
                onClick={() => onAction(whatsappConfigService.restartInstance)} 
                disabled={actionLoading}
                startIcon={<Replay />}
              >
                Reiniciar Instância
              </Button>
              <Button 
                variant="outlined" 
                color="error" 
                onClick={() => setConfirmDeleteDialogOpen(true)} 
                disabled={actionLoading}
                startIcon={<DeleteForever />}
              >
                Deletar Instância
              </Button>
            </>
          )}
        </Stack>
      </CardContent>
      <Dialog open={confirmDeleteDialogOpen} onClose={() => setConfirmDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar Deleção</DialogTitle>
        <DialogContent>
          <DialogContentText>Tem certeza que deseja deletar a instância? Esta ação é irreversível e limpará sua configuração.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleDelete} color="error" autoFocus>Deletar</Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

const ConnectionCard = ({ config, qrCode, onAction, actionLoading }) => {
  const isCreated = config.status !== 'not_created' && config.status !== 'unconfigured';
  const isConnected = config.status === 'connected';

  if (!isCreated) {
    return (
      <Card variant="outlined" sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CardContent sx={{ textAlign: 'center' }}>
          <Typography color="text.secondary">Crie uma instância primeiro.</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>2. Gerenciamento da Conexão</Typography>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="body1">Status:</Typography>
          <Chip 
            icon={isConnected ? <Wifi /> : <WifiOff />}
            label={isConnected ? 'Conectado' : 'Desconectado'}
            color={isConnected ? 'success' : 'error'}
            variant="outlined"
          />
        </Stack>
        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Ações:</Typography>
        <Stack spacing={1.5}>
          {isConnected ? (
            <Button 
              variant="contained" 
              color="warning" 
              onClick={() => onAction(whatsappConfigService.logoutInstance)} 
              disabled={actionLoading}
              startIcon={<LinkOff />}
            >
              Desconectar (Logout)
            </Button>
          ) : (
            <Button 
              variant="contained" 
              onClick={() => onAction(whatsappConfigService.getQrCode, true)} 
              disabled={actionLoading}
              startIcon={<QrCodeScanner />}
            >
              Gerar Novo QR Code
            </Button>
          )}
        </Stack>
        {actionLoading && !qrCode && !isConnected && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <CircularProgress size={24} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Aguarde, gerando novo QR Code...
            </Typography>
          </Box>
        )}
        {qrCode && !isConnected && (
          <Box sx={{ mt: 2, p: 2, textAlign: 'center', backgroundColor: '#f5f5f5', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>Escaneie para Conectar</Typography>
            <Box sx={{ p: 1, background: 'white', borderRadius: '8px', display: 'inline-block' }}><QRCode value={qrCode} size={200} /></Box>
            <Typography variant="caption" display="block" mt={2}>A página será atualizada automaticamente.</Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};


// --- Componente Principal ---

import React, { useState, useEffect, useCallback, useContext, useRef } from 'react';
import {
  Container, Typography, Box, Button, CircularProgress,
  Alert, Paper, Grid, Card, CardContent, Divider, Chip, Dialog, 
  DialogActions, DialogContent, DialogContentText, DialogTitle,
  Stack, AlertTitle, IconButton
} from '@mui/material';
import AuthContext from '../context/AuthContext';
import { SocketContext } from '../context/SocketContext'; // Importar SocketContext
import whatsappConfigService from '../services/whatsappConfigService';
import QRCode from 'react-qr-code';
import { CheckCircle, HourglassEmpty, LinkOff, QrCodeScanner, AddCircle, DeleteForever, Wifi, WifiOff, Refresh, Replay } from '@mui/icons-material';

// --- Subcomponentes (permanecem os mesmos) ---

const InstanceCard = ({ config, onAction, actionLoading }) => {
  const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false);

  const handleDelete = () => {
    setConfirmDeleteDialogOpen(false);
    onAction(whatsappConfigService.deleteInstance);
  };

  const isCreated = config.status !== 'not_created' && config.status !== 'unconfigured';

  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>1. Gerenciamento da Instância</Typography>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="body1">Status:</Typography>
          <Chip 
            icon={isCreated ? <CheckCircle /> : <HourglassEmpty />}
            label={isCreated ? 'Criada' : 'Não Criada'}
            color={isCreated ? 'success' : 'default'}
            variant="outlined"
          />
        </Stack>
        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Ações:</Typography>
        <Stack spacing={1.5}>
          {!isCreated ? (
            <Button 
              variant="contained" 
              onClick={() => onAction(whatsappConfigService.createInstance)} 
              disabled={actionLoading} 
              startIcon={<AddCircle />}
            >
              Criar Instância na API
            </Button>
          ) : (
            <>
              <Button 
                variant="outlined" 
                color="warning" 
                onClick={() => onAction(whatsappConfigService.restartInstance)} 
                disabled={actionLoading}
                startIcon={<Replay />}
              >
                Reiniciar Instância
              </Button>
              <Button 
                variant="outlined" 
                color="error" 
                onClick={() => setConfirmDeleteDialogOpen(true)} 
                disabled={actionLoading}
                startIcon={<DeleteForever />}
              >
                Deletar Instância
              </Button>
            </>
          )}
        </Stack>
      </CardContent>
      <Dialog open={confirmDeleteDialogOpen} onClose={() => setConfirmDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar Deleção</DialogTitle>
        <DialogContent>
          <DialogContentText>Tem certeza que deseja deletar a instância? Esta ação é irreversível e limpará sua configuração.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleDelete} color="error" autoFocus>Deletar</Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

const ConnectionCard = ({ config, qrCode, onAction, actionLoading }) => {
  const isCreated = config.status !== 'not_created' && config.status !== 'unconfigured';
  const isConnected = config.status === 'connected';

  if (!isCreated) {
    return (
      <Card variant="outlined" sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CardContent sx={{ textAlign: 'center' }}>
          <Typography color="text.secondary">Crie uma instância primeiro.</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>2. Gerenciamento da Conexão</Typography>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="body1">Status:</Typography>
          <Chip 
            icon={isConnected ? <Wifi /> : <WifiOff />}
            label={isConnected ? 'Conectado' : 'Desconectado'}
            color={isConnected ? 'success' : 'error'}
            variant="outlined"
          />
        </Stack>
        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Ações:</Typography>
        <Stack spacing={1.5}>
          {isConnected ? (
            <Button 
              variant="contained" 
              color="warning" 
              onClick={() => onAction(whatsappConfigService.logoutInstance)} 
              disabled={actionLoading}
              startIcon={<LinkOff />}
            >
              Desconectar (Logout)
            </Button>
          ) : (
            <Button 
              variant="contained" 
              onClick={() => onAction(whatsappConfigService.getQrCode, true)} 
              disabled={actionLoading}
              startIcon={<QrCodeScanner />}
            >
              Gerar Novo QR Code
            </Button>
          )}
        </Stack>
        {actionLoading && !qrCode && !isConnected && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <CircularProgress size={24} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Aguarde, gerando novo QR Code...
            </Typography>
          </Box>
        )}
        {qrCode && !isConnected && (
          <Box sx={{ mt: 2, p: 2, textAlign: 'center', backgroundColor: '#f5f5f5', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>Escaneie para Conectar</Typography>
            <Box sx={{ p: 1, background: 'white', borderRadius: '8px', display: 'inline-block' }}><QRCode value={qrCode} size={200} /></Box>
            <Typography variant="caption" display="block" mt={2}>A página será atualizada automaticamente.</Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};


// --- Componente Principal (Refatorado com Sockets) ---

const WhatsappConnectPage = () => {
  const { user } = useContext(AuthContext);
  const socket = useContext(SocketContext);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [error, setError] = useState('');
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchConfig = useCallback(async () => {
    if (!isMounted.current) return;
    setLoading(true);
    try {
      const response = await whatsappConfigService.getInstanceConfig();
      if (isMounted.current) {
        setConfig(response.data);
        if (response.data.status === 'connected') {
          setQrCode('');
        }
      }
    } catch (err) {
      if (isMounted.current) {
        setError(err.response?.data?.message || 'Falha ao buscar configuração.');
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, []);

  // Fetch inicial
  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  // Lógica de Socket.IO para atualizações em tempo real
  useEffect(() => {
    if (!socket) return;

    const handleStatusUpdate = (payload) => {
      console.log('Socket event received: whatsapp:status', payload);
      // Atualiza o status apenas se a configuração já foi carregada e o tenantId corresponde
      if (config && config.tenantId === payload.tenantId) {
        setConfig(prevConfig => ({ ...prevConfig, status: payload.status }));
        if (payload.status === 'connected') {
          setQrCode(''); // Limpa o QR code ao conectar
        }
      }
    };

    socket.on('whatsapp:status', handleStatusUpdate);

    return () => {
      socket.off('whatsapp:status', handleStatusUpdate);
    };
  }, [socket, config]); // Depende do socket e da config para ter o tenantId

  const handleAction = useCallback(async (serviceCall, expectQrCode = false) => {
    if (!isMounted.current) return;
    
    setActionLoading(true);
    setError('');

    if (expectQrCode) {
      setQrCode('');
    }

    try {
      const response = await serviceCall();
      if (isMounted.current) {
        if (expectQrCode) {
          setQrCode(response.data.code || '');
        }
        // Força uma busca de status imediata após a ação para sincronizar
        await fetchConfig();
      }
    } catch (err) {
      if (isMounted.current) {
        setError(err.response?.data?.message || 'Ocorreu um erro inesperado.');
      }
    } finally {
      if (isMounted.current) {
        setActionLoading(false);
      }
    }
  }, [fetchConfig]);

  const renderContent = () => {
    if (loading) {
      return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
    }

    if (!config || user?.role?.name !== 'Admin') {
        return <Alert severity="error">Você não tem permissão para ver esta página ou a configuração inicial não foi encontrada.</Alert>;
    }

    if (config.status === 'unconfigured') {
        return (
            <Card sx={{ textAlign: 'center', p: 4 }}>
              <HourglassEmpty sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>Configuração Pendente</Typography>
              <Typography variant="body2" color="text.secondary">
                A configuração do WhatsApp para sua loja ainda não foi realizada pelo administrador.
                <br />
                Por favor, entre em contato com o suporte para habilitar esta funcionalidade.
              </Typography>
            </Card>
        );
    }

    return (
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <InstanceCard config={config} onAction={handleAction} actionLoading={actionLoading} />
        </Grid>
        <Grid item xs={12} md={6}>
          <ConnectionCard config={config} qrCode={qrCode} onAction={handleAction} actionLoading={actionLoading} />
        </Grid>
      </Grid>
    );
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 3, mb: 1 }}>
        <Typography variant="h4" gutterBottom sx={{ flexGrow: 1, mb: 0 }}>
          Conectar WhatsApp
        </Typography>
        <IconButton onClick={fetchConfig} disabled={loading || actionLoading} color="primary">
          <Refresh />
        </IconButton>
      </Box>
      <Alert severity="warning" sx={{ mt: 2, mb: 3 }}>
        <AlertTitle>Aviso Importante</AlertTitle>
        O uso desta ferramenta está sujeito aos <strong>Termos de Serviço do WhatsApp.</strong> O envio de spam pode levar ao <strong>bloqueio do seu número.</strong><br/>
        <strong>Não nos responsabilizamos por bloqueios.</strong> Use com consciência.
      </Alert>
      <Paper sx={{ p: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {renderContent()}
      </Paper>
    </Container>
  );
};

export default WhatsappConnectPage;
export default WhatsappConnectPage;
