import React, { useState, useEffect, useCallback, useRef, useContext } from 'react';
import {
  Container, Typography, Box, Button, CircularProgress, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton,
  Alert, Chip, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LinkIcon from '@mui/icons-material/Link';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import RefreshIcon from '@mui/icons-material/Refresh';
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
  not_created: 'default', // Adicionado para consistência
  connected: 'success', // Adicionado para consistência
};

const SenderPoolPage = () => {
  const [senders, setSenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({}); // { senderId: boolean }
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [qrCodeModalOpen, setQrCodeModalOpen] = useState(false);
  const [currentSender, setCurrentSender] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false);
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
        setSnackbar({ open: true, message: 'Disparador atualizado com sucesso!', severity: 'success' });
      } else {
        await senderPoolService.createSender(data);
        setSnackbar({ open: true, message: 'Disparador criado com sucesso!', severity: 'success' });
      }
      fetchSenders();
      handleCloseModal();
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || "Falha ao salvar o disparador.", severity: 'error' });
    }
  };

  const handleAction = async (senderId, actionServiceCall, successMessage) => {
    setActionLoading(prev => ({ ...prev, [senderId]: true }));
    try {
      await actionServiceCall(senderId);
      setSnackbar({ open: true, message: successMessage, severity: 'success' });
      fetchSenders(); // Refresh data
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Ocorreu um erro.';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    } finally {
      setActionLoading(prev => ({ ...prev, [senderId]: false }));
    }
  };

  const handleDelete = async () => {
    if (currentSender) {
      await handleAction(currentSender.id, senderPoolService.deleteSender, 'Disparador excluído com sucesso!');
    }
    setConfirmDeleteDialogOpen(false);
  };

  const openConfirmDeleteDialog = (sender) => {
    setCurrentSender(sender);
    setConfirmDeleteDialogOpen(true);
  };

  const handleConnect = async (id) => {
    setActionLoading(prev => ({ ...prev, [id]: true }));
    try {
      const response = await senderPoolService.getSenderQrCode(id);
      setQrCode(response.data.qrCode);
      setQrCodeModalOpen(true);
    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.message || "Falha ao obter o QR Code.", severity: 'error' });
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
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
        <Box>
          <IconButton onClick={fetchSenders} disabled={loading}>
            <RefreshIcon />
          </IconButton>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenModal()}
            sx={{ ml: 2 }}
          >
            Novo Disparador
          </Button>
        </Box>
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
                    {actionLoading[sender.id] ? <CircularProgress size={24} /> : (
                      <>
                        <Tooltip title="Conectar / Gerar QR Code">
                          <span>
                            <IconButton
                              aria-label="connect"
                              onClick={() => handleConnect(sender.id)}
                              disabled={sender.status === 'active' || sender.status === 'connected'}
                            >
                              <LinkIcon />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="Reiniciar Instância">
                          <span>
                            <IconButton
                              aria-label="restart"
                              onClick={() => handleAction(sender.id, senderPoolService.restartSender, 'Instância reiniciada!')}
                              disabled={sender.status === 'not_created'}
                            >
                              <PowerSettingsNewIcon />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="Desconectar Instância">
                          <span>
                            <IconButton
                              aria-label="logout"
                              onClick={() => handleAction(sender.id, senderPoolService.logoutSender, 'Instância desconectada!')}
                              disabled={sender.status === 'not_created' || sender.status === 'disconnected'}
                            >
                              <LinkOffIcon />
                            </IconButton>
                          </span>
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
                            onClick={() => openConfirmDeleteDialog(sender)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
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

      <Dialog open={confirmDeleteDialogOpen} onClose={() => setConfirmDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar Deleção</DialogTitle>
        <DialogContent>
          <Typography>Tem certeza que deseja deletar o disparador <strong>{currentSender?.name}</strong>?</Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>Esta ação é irreversível e removerá o disparador e sua instância do sistema.</Alert>
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
    </Container>
  );
};

export default SenderPoolPage;