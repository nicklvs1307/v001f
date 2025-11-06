import React, { useEffect, useState, useContext } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  CardActions,
  CardActionArea,
  Chip,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Skeleton,
  Tooltip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CakeIcon from '@mui/icons-material/Cake';
import GroupIcon from '@mui/icons-material/Group';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import campanhaService from '../services/campanhaService';
import AuthContext from '../context/AuthContext';

const CampaignsPage = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmProcessOpen, setConfirmProcessOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [campaignToAction, setCampaignToAction] = useState(null);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchCampaigns = async () => {
      setLoading(true);
      try {
        const response = await campanhaService.getAll(user.tenantId);
        setCampaigns(response.data);
      } catch (err) {
        setError('Falha ao carregar campanhas. Tente novamente mais tarde.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.tenantId) {
      fetchCampaigns();
    }
  }, [user]);

  const handleOpenProcessDialog = (campaign) => {
    setCampaignToAction(campaign);
    setConfirmProcessOpen(true);
  };

  const handleOpenDeleteDialog = (campaign) => {
    setCampaignToAction(campaign);
    setConfirmDeleteOpen(true);
  };

  const handleCloseDialogs = () => {
    setCampaignToAction(null);
    setConfirmProcessOpen(false);
    setConfirmDeleteOpen(false);
  };

  const handleProcessCampaign = async () => {
    if (!campaignToAction) return;
    try {
      await campanhaService.process(campaignToAction.id);
      setCampaigns(campaigns.map(c => c.id === campaignToAction.id ? { ...c, status: 'processing' } : c));
    } catch (err) {
      setError(`Falha ao iniciar a campanha "${campaignToAction.nome}".`);
      console.error(err);
    } finally {
      handleCloseDialogs();
    }
  };

  const handleDeleteCampaign = async () => {
    if (!campaignToAction) return;
    try {
      await campanhaService.delete(campaignToAction.id);
      setCampaigns(campaigns.filter(c => c.id !== campaignToAction.id));
    } catch (err) {
      setError(`Falha ao deletar a campanha "${campaignToAction.nome}".`);
      console.error(err);
    } finally {
      handleCloseDialogs();
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
    const type = criterio?.type || 'all'; // Default to 'all' if not specified
    if (type === 'birthday') {
      return <Box sx={{ display: 'flex', alignItems: 'center' }}><CakeIcon sx={{ mr: 1, color: 'secondary.main' }} /> Aniversariantes</Box>;
    }
    return <Box sx={{ display: 'flex', alignItems: 'center' }}><GroupIcon sx={{ mr: 1, color: 'primary.main' }} /> Disparo em Massa</Box>;
  };

  const renderSkeletons = () => (
    <Grid container spacing={3}>
      {Array.from(new Array(3)).map((_, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <Card>
            <CardContent>
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="text" width="40%" />
              <Skeleton variant="rectangular" height={20} width="30%" sx={{ mt: 1 }} />
            </CardContent>
            <CardActions sx={{ justifyContent: 'flex-end' }}>
              <Skeleton variant="circular" width={40} height={40} />
              <Skeleton variant="circular" width={40} height={40} />
              <Skeleton variant="circular" width={40} height={40} />
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderEmptyState = () => (
    <Box sx={{ textAlign: 'center', py: 10 }}>
      <Typography variant="h6" color="text.secondary">Nenhuma campanha encontrada.</Typography>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        sx={{ mt: 2 }}
        onClick={() => navigate('/dashboard/cupons/campanhas/nova')}
      >
        Criar Nova Campanha
      </Button>
    </Box>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">Campanhas de WhatsApp</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/dashboard/cupons/campanhas/nova')}
        >
          Nova Campanha
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {loading ? renderSkeletons() : (
        campaigns.length > 0 ? (
          <Grid container spacing={3}>
            {campaigns.map((campaign) => (
              <Grid item xs={12} sm={6} md={4} key={campaign.id}>
                <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <CardActionArea onClick={() => navigate(`/dashboard/cupons/campanhas/detalhes/${campaign.id}`)} sx={{ flexGrow: 1 }}>
                    <CardContent>
                      <Typography variant="h6" component="div" noWrap title={campaign.nome}>
                        {campaign.nome}
                      </Typography>
                      <Box sx={{ my: 1 }}>
                        {getCampaignType(campaign.criterioSelecao)}
                      </Box>
                      {getStatusChip(campaign.status)}
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
                        Criada em: {new Date(campaign.createdAt).toLocaleDateString()}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                  <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
                    <Tooltip title="Iniciar Envio">
                      <span>
                        <IconButton
                          color="primary"
                          onClick={() => handleOpenProcessDialog(campaign)}
                          disabled={campaign.status !== 'draft'}
                        >
                          <PlayArrowIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Editar Campanha">
                      <IconButton
                        color="info"
                        onClick={() => navigate(`/dashboard/cupons/campanhas/editar/${campaign.id}`)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Deletar Campanha">
                      <IconButton
                        color="error"
                        onClick={() => handleOpenDeleteDialog(campaign)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : renderEmptyState()
      )}

      {/* Process Confirmation Dialog */}
      <Dialog open={confirmProcessOpen} onClose={handleCloseDialogs}>
        <DialogTitle>Confirmar Início da Campanha</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Você tem certeza que deseja iniciar a campanha "{campaignToAction?.nome}"?
            <br />
            Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Cancelar</Button>
          <Button onClick={handleProcessCampaign} color="primary" autoFocus>
            Confirmar e Enviar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmDeleteOpen} onClose={handleCloseDialogs}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Você tem certeza que deseja excluir a campanha "{campaignToAction?.nome}"?
            <br />
            Esta ação é irreversível.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Cancelar</Button>
          <Button onClick={handleDeleteCampaign} color="error" autoFocus>
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CampaignsPage;
