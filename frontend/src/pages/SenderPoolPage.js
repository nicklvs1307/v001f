import React, { useState, useEffect, useCallback, useRef, useContext } from 'react';
import {
  Container, Typography, Box, Button, CircularProgress, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton,
  Alert, Chip, Tooltip, Dialog, DialogTitle, DialogContent
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LinkIcon from '@mui/icons-material/Link';
import QRCode from 'react-qr-code';
import senderPoolService from '../services/senderPoolService';
import SenderFormModal from '../components/SenderFormModal';
import { SocketContext } from '../context/SocketContext';

const statusColors = {
  active: 'success',
  warming_up: 'info',
  resting: 'warning',
  blocked: 'error',
  disconnected: 'default',
  connected: 'success',
};

const SenderPoolPage = () => {
  const [senders, setSenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [qrCodeModalOpen, setQrCodeModalOpen] = useState(false);
  const [currentSender, setCurrentSender] = useState(null);
  const socket = useContext(SocketContext);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchSenders = useCallback(async () => {
    if (!isMounted.current) return;
    setLoading(true);
    try {
      const response = await senderPoolService.getAllSenders();
      if (isMounted.current) {
        setSenders(response.data);
        setError(null);
      }
    } catch (error) {
      if (isMounted.current) {
        console.error("Failed to fetch senders", error);
        setError("Falha ao carregar a lista de disparadores. Tente novamente mais tarde.");
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchSenders();
  }, [fetchSenders]);

  useEffect(() => {
    if (!socket) return;

    const handleSenderUpdate = (updatedSender) => {
      setSenders((prevSenders) =>
        prevSenders.map((sender) =>
          sender.id === updatedSender.id ? { ...sender, ...updatedSender } : sender
        )
      );
      if (qrCodeModalOpen && updatedSender.status === 'connected') {
        handleCloseQrCodeModal();
      }
    };

    socket.on('sender:update', handleSenderUpdate);

    return () => {
      socket.off('sender:update', handleSenderUpdate);
    };
  }, [socket, qrCodeModalOpen]);

  const handleOpenModal = (sender = null) => {
    setCurrentSender(sender);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setCurrentSender(null);
    setModalOpen(false);
  };

  const handleSave = async (data) => {
    try {
      if (currentSender) {
        await senderPoolService.updateSender(currentSender.id, data);
      } else {
        await senderPoolService.createSender(data);
      }
      fetchSenders();
      handleCloseModal();
    } catch (err) {
      console.error("Failed to save sender", err);
      setError("Falha ao salvar o disparador. Verifique os dados e tente novamente.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este disparador?')) {
      try {
        await senderPoolService.deleteSender(id);
        fetchSenders();
      } catch (err) {
        setError("Falha ao excluir o disparador.");
      }
    }
  };

  const handleConnect = async (id) => {
    try {
      const response = await senderPoolService.getSenderQrCode(id);
      setQrCode(response.data.qrCode);
      setQrCodeModalOpen(true);
    } catch (error) {
      setError("Falha ao obter o QR Code.");
    }
  };

  const handleCloseQrCodeModal = () => {
    setQrCodeModalOpen(false);
    setQrCode('');
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', my: 4 }}>
        <Typography variant="h4">
          Pool de Disparadores de Campanha
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenModal()}
        >
          Novo Disparador
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Instância</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Prioridade</TableCell>
                <TableCell>Envios Hoje</TableCell>
                <TableCell>Limite Diário</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {senders.map((sender) => (
                <TableRow key={sender.id}>
                  <TableCell>{sender.name}</TableCell>
                  <TableCell>{sender.instanceName}</TableCell>
                  <TableCell>
                    <Chip label={sender.status} color={statusColors[sender.status] || 'default'} size="small" />
                  </TableCell>
                  <TableCell>{sender.priority}</TableCell>
                  <TableCell>{sender.messagesSentToday}</TableCell>
                  <TableCell>{sender.dailyLimit}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Conectar">
                      <IconButton
                        aria-label="connect"
                        onClick={() => handleConnect(sender.id)}
                      >
                        <LinkIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Editar">
                      <IconButton
                        aria-label="edit"
                        onClick={() => handleOpenModal(sender)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Deletar">
                      <IconButton
                        aria-label="delete"
                        onClick={() => handleDelete(sender.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <SenderFormModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        sender={currentSender}
      />

      <Dialog open={qrCodeModalOpen} onClose={handleCloseQrCodeModal}>
        <DialogTitle>Conectar ao WhatsApp</DialogTitle>
        <DialogContent>
          <Box sx={{ p: 2, textAlign: 'center' }}>
            {qrCode ? (
              <>
                <Typography variant="h6" gutterBottom>Escaneie para Conectar</Typography>
                <Box sx={{ p: 1, background: 'white', borderRadius: '8px', display: 'inline-block' }}>
                  <QRCode value={qrCode} size={256} />
                </Box>
                <Typography variant="caption" display="block" mt={2}>
                  A página será atualizada automaticamente assim que a conexão for estabelecida.
                </Typography>
              </>
            ) : (
              <CircularProgress />
            )}
          </Box>
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default SenderPoolPage;
