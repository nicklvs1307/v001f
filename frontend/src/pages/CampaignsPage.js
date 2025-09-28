import React, { useEffect, useState, useContext } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CakeIcon from '@mui/icons-material/Cake';
import GroupIcon from '@mui/icons-material/Group';
import { useNavigate } from 'react-router-dom';
import campanhaService from '../services/campanhaService';
import AuthContext from '../context/AuthContext';

const CampaignsPage = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [campaignToProcess, setCampaignToProcess] = useState(null);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await campanhaService.getAll(user.tenantId);
        setCampaigns(response.data);
      } catch (err) {
        setError('Falha ao carregar campanhas.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.tenantId) {
      fetchCampaigns();
    }
  }, [user]);

  const handleOpenConfirmDialog = (campaign) => {
    setCampaignToProcess(campaign);
    setConfirmOpen(true);
  };

  const handleCloseConfirmDialog = () => {
    setCampaignToProcess(null);
    setConfirmOpen(false);
  };

  const handleProcessCampaign = async () => {
    if (!campaignToProcess) return;

    try {
      await campanhaService.process(campaignToProcess.id);
      setCampaigns(campaigns.map(c => c.id === campaignToProcess.id ? { ...c, status: 'processing' } : c));
    } catch (err) {
      setError('Falha ao iniciar o processamento da campanha.');
      console.error(err);
    } finally {
      handleCloseConfirmDialog();
    }
  };

  const getStatusChip = (status) => {
    const statusMap = {
      draft: { label: 'Rascunho', color: 'default' },
      processing: { label: 'Processando', color: 'warning' },
      sent: { label: 'Enviada', color: 'success' },
      failed: { label: 'Falhou', color: 'error' },
    };
    const { label, color } = statusMap[status] || { label: 'Desconhecido', color: 'default' };
    return <Chip label={label} color={color} size="small" />;
  };

  const getCampaignType = (criterio) => {
    if (criterio?.type === 'birthday') {
      return <Box sx={{ display: 'flex', alignItems: 'center' }}><CakeIcon sx={{ mr: 1, color: 'secondary.main' }} /> Aniversariantes</Box>;
    }
    if (criterio?.type === 'all') {
      return <Box sx={{ display: 'flex', alignItems: 'center' }}><GroupIcon sx={{ mr: 1, color: 'primary.main' }} /> Disparo em Massa</Box>;
    }
    return 'Não definido';
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">Campanhas de WhatsApp</Typography>
        <Button variant="contained" onClick={() => navigate('/cupons/campanhas/nova')}>
          Nova Campanha
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Data de Criação</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {campaigns.length > 0 ? (
              campaigns.map((campaign) => (
                <TableRow
                  key={campaign.id}
                  hover
                >
                  <TableCell onClick={() => navigate(`/cupons/campanhas/editar/${campaign.id}`)} sx={{cursor: 'pointer'}}>{campaign.nome}</TableCell>
                  <TableCell onClick={() => navigate(`/cupons/campanhas/editar/${campaign.id}`)} sx={{cursor: 'pointer'}}>{getCampaignType(campaign.criterioSelecao)}</TableCell>
                  <TableCell onClick={() => navigate(`/cupons/campanhas/editar/${campaign.id}`)} sx={{cursor: 'pointer'}}>{getStatusChip(campaign.status)}</TableCell>
                  <TableCell onClick={() => navigate(`/cupons/campanhas/editar/${campaign.id}`)} sx={{cursor: 'pointer'}}>{new Date(campaign.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <IconButton
                      color="primary"
                      onClick={() => handleOpenConfirmDialog(campaign)}
                      disabled={campaign.status !== 'draft'}
                      title="Iniciar envio"
                    >
                      <PlayArrowIcon />
                    </IconButton>
                    <IconButton
                      color="info"
                      onClick={() => navigate(`/cupons/campanhas/editar/${campaign.id}`)}
                      title="Editar Campanha"
                    >
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Nenhuma campanha encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={confirmOpen}
        onClose={handleCloseConfirmDialog}
      >
        <DialogTitle>Confirmar Início da Campanha</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Você tem certeza que deseja iniciar a campanha "{campaignToProcess?.nome}"?
            <br />
            Esta ação não pode ser desfeita e começará o processo de envio das mensagens.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog}>Cancelar</Button>
          <Button onClick={handleProcessCampaign} color="primary" autoFocus>
            Confirmar e Enviar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CampaignsPage;