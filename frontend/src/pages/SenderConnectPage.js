import React, { useState, useEffect, useCallback, useRef, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Typography, Box, Button, CircularProgress,
  Alert, Paper, Chip, Stack, IconButton, Divider
} from '@mui/material';
import senderPoolService from '../services/senderPoolService';
import { Wifi, WifiOff, QrCodeScanner, ArrowBack, Refresh } from '@mui/icons-material';
import { SocketContext } from '../context/SocketContext';

const SenderConnectPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const socket = useContext(SocketContext);
  const [sender, setSender] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [qrCodeImg, setQrCodeImg] = useState('');
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState('');
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchSenderStatus = useCallback(async () => {
    if (!isMounted.current) return;
    try {
      const response = await senderPoolService.getSenderById(id);
      if (isMounted.current) {
        setSender(response.data);
        if (response.data.status === 'active') {
          setQrCodeImg('');
          setIsPolling(false);
        }
      }
    } catch (err) {
      if (isMounted.current) {
        setError(err.response?.data?.message || 'Falha ao buscar dados do disparador.');
        setIsPolling(false);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [id]);

  useEffect(() => {
    fetchSenderStatus();
  }, [fetchSenderStatus]);

  useEffect(() => {
    if (socket) {
      const qrCodeEventHandler = (data) => {
        if (data.qrCode) {
          setQrCodeImg(`data:image/png;base64,${data.qrCode}`);
          setActionLoading(false);
        }
      };
      socket.on(`qrcode:update:${id}`, qrCodeEventHandler);

      return () => {
        socket.off(`qrcode:update:${id}`, qrCodeEventHandler);
      };
    }
  }, [socket, id]);

  useEffect(() => {
    let statusInterval;
    if (isPolling) {
      statusInterval = setInterval(() => {
        if (document.visibilityState === 'visible') {
          fetchSenderStatus();
        }
      }, 5000);
    }
    return () => clearInterval(statusInterval);
  }, [isPolling, fetchSenderStatus]);

  const handleGetQrCode = useCallback(async () => {
    if (!isMounted.current) return;
    setActionLoading(true);
    setError('');
    setQrCodeImg('');
    setIsPolling(true);
    try {
      await senderPoolService.getSenderQrCode(id);
      // O QR code será recebido via websocket
    } catch (err) {
      if (isMounted.current) {
        setError(err.response?.data?.message || 'Ocorreu um erro ao solicitar o QR Code.');
        setIsPolling(false);
        setActionLoading(false);
      }
    }
  }, [id]);

  const renderContent = () => {
    if (loading) {
      return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
    }
    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }
    if (!sender) {
        return <Alert severity="warning">Disparador não encontrado.</Alert>;
    }

    const isConnected = sender.status === 'active';

    return (
      <Paper sx={{ p: 3, mt: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="body1">Status da Conexão:</Typography>
          <Chip 
            icon={isConnected ? <Wifi /> : <WifiOff />}
            label={isConnected ? 'Conectado' : 'Desconectado'}
            color={isConnected ? 'success' : 'error'}
            variant="outlined"
          />
        </Stack>
        <Divider sx={{ my: 2 }} />
        {!isConnected && (
          <Button 
            variant="contained" 
            onClick={handleGetQrCode} 
            disabled={actionLoading}
            startIcon={<QrCodeScanner />}
          >
            {actionLoading ? 'Aguardando QR Code...' : 'Gerar QR Code para Conectar'}
          </Button>
        )}
        {qrCodeImg && !isConnected && (
          <Box sx={{ mt: 3, p: 2, textAlign: 'center', backgroundColor: '#f5f5f5', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>Escaneie para Conectar</Typography>
            <Box sx={{ p: 1, background: 'white', borderRadius: '8px', display: 'inline-block' }}>
              <img src={qrCodeImg} alt="QR Code para conexão do WhatsApp" style={{ maxWidth: '100%', height: 'auto' }} />
            </Box>
            <Typography variant="caption" display="block" mt={2}>A página será atualizada automaticamente após a conexão.</Typography>
          </Box>
        )}
        {actionLoading && !qrCodeImg && (
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <CircularProgress />
            <Typography variant="body1" mt={2}>Gerando QR Code, por favor aguarde...</Typography>
          </Box>
        )}
        {isConnected && (
            <Alert severity="success">A instância está conectada com sucesso!</Alert>
        )}
      </Paper>
    );
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 3, mb: 1 }}>
        <IconButton onClick={() => navigate('/superadmin/sender-pool')} sx={{ mr: 1 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" gutterBottom sx={{ flexGrow: 1, mb: 0 }}>
          Conectar Disparador: {sender?.name || ''}
        </Typography>
        <IconButton onClick={fetchSenderStatus} disabled={loading || actionLoading} color="primary">
          <Refresh />
        </IconButton>
      </Box>
      {renderContent()}
    </Container>
  );
};

export default SenderConnectPage;
