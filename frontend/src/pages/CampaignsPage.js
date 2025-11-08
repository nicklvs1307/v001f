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
  Chip,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Skeleton,
  Tooltip,
  TextField,
  Container
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SendIcon from '@mui/icons-material/Send';
import CakeIcon from '@mui/icons-material/Cake';
import GroupIcon from '@mui/icons-material/Group';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import campanhaService from '../services/campanhaService';
import AuthContext from '../context/AuthContext';

const statusStyles = {
  draft: { label: 'Rascunho', color: 'grey.500' },
  scheduled: { label: 'Agendada', color: 'info.main' },
  processing: { label: 'Processando', color: 'warning.main' },
  sent: { label: 'Enviada', color: 'success.main' },
  failed: { label: 'Falhou', color: 'error.main' },
  default: { label: 'Desconhecido', color: 'grey.300' },
};

const CampaignsPage = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmProcessOpen, setConfirmProcessOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [campaignToAction, setCampaignToAction] = useState(null);
  const [testPhoneNumber, setTestPhoneNumber] = useState('');
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

  const handleOpenTestDialog = (campaign) => {
    setCampaignToAction(campaign);
    setTestDialogOpen(true);
  };

  const handleCloseDialogs = () => {
    setCampaignToAction(null);
    setConfirmProcessOpen(false);
    setConfirmDeleteOpen(false);
    setTestDialogOpen(false);
    setTestPhoneNumber('');
  };

  const handleProcessCampaign = async () => {
    if (!campaignToAction) return;
    try {
      await campanhaService.process(campaignToAction.id);
      setCampaigns(campaigns.map(c => c.id === campaignToAction.id ? { ...c, status: 'processing' } : c));
    } catch (err) {
      setError(`Falha ao iniciar a campanha "${campaignToAction.nome}".`);
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
    } finally {
      handleCloseDialogs();
    }
  };

  const handleSendTest = async () => {
    if (!campaignToAction || !testPhoneNumber) return;
    try {
      await campanhaService.sendTest(campaignToAction.id, { testPhoneNumber });
    } catch (err) {
      setError(`Falha ao enviar teste da campanha "${campaignToAction.nome}".`);
    } finally {
      handleCloseDialogs();
    }
  };

  const getStatusInfo = (status) => statusStyles[status] || statusStyles.default;

  const getCampaignTypeIcon = (criterio) => {
    const type = criterio?.type || 'all';
    if (type === 'birthday') {
      return <CakeIcon sx={{ mr: 1, color: 'secondary.main' }} />;
    }
    return <GroupIcon sx={{ mr: 1, color: 'primary.main' }} />;
  };

  const renderSkeletons = () => (
    <Grid container spacing={3}>
      {Array.from(new Array(3)).map((_, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <Card sx={{ display: 'flex' }}>
            <Box sx={{ width: 5, backgroundColor: 'grey.300' }} />
            <Box sx={{ flex: 1 }}>
              <CardContent>
                <Skeleton variant="text" width="80%" height={30} />
                <Skeleton variant="text" width="50%" />
                <Skeleton variant="text" width="60%" sx={{ mt: 1 }} />
              </CardContent>
              <CardActions sx={{ justifyContent: 'flex-end' }}>
                <Skeleton variant="circular" width={32} height={32} />
                <Skeleton variant="circular" width={32} height={32} />
                <Skeleton variant="circular" width={32} height={32} />
              </CardActions>
            </Box>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderEmptyState = () => (
    <Paper sx={{ textAlign: 'center', py: 10, backgroundColor: 'grey.50' }}>
      <Typography variant="h5" color="text.secondary">Nenhuma campanha criada ainda.</Typography>
      <Typography color="text.secondary" sx={{ mt: 1, mb: 2 }}>Comece a engajar seus clientes agora mesmo.</Typography>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => navigate('/dashboard/cupons/campanhas/nova')}
      >
        Criar Primeira Campanha
      </Button>
    </Paper>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
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
            {campaigns.map((campaign) => {
              const statusInfo = getStatusInfo(campaign.status);
              return (
                <Grid item xs={12} sm={6} md={4} key={campaign.id}>
                  <Card
                    sx={{
                      display: 'flex',
                      height: '100%',
                      transition: 'box-shadow 0.3s, transform 0.3s',
                      '&:hover': {
                        boxShadow: 6,
                        transform: 'translateY(-4px)',
                      },
                    }}
                  >
                    <Box sx={{ width: 5, backgroundColor: statusInfo.color, flexShrink: 0 }} />
                    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <CardContent sx={{ flexGrow: 1, cursor: 'pointer' }} onClick={() => navigate(`/dashboard/cupons/campanhas/detalhes/${campaign.id}`)}>
                        <Typography variant="h6" component="div" noWrap title={campaign.nome}>
                          {campaign.nome}
                        </Typography>
                        <Chip label={statusInfo.label} size="small" sx={{ backgroundColor: statusInfo.color, color: '#fff', my: 1 }} />
                        <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', mt: 1 }}>
                          {getCampaignTypeIcon(campaign.criterioSelecao)}
                          <Typography variant="body2">
                            {campaign.criterioSelecao?.type === 'birthday' ? 'Aniversariantes' : 'Disparo em Massa'}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1.5 }}>
                          Criada em: {new Date(campaign.createdAt).toLocaleDateString()}
                        </Typography>
                      </CardContent>
                      <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
                        <Tooltip title="Enviar Teste">
                          <IconButton size="small" color="secondary" onClick={() => handleOpenTestDialog(campaign)}>
                            <SendIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Iniciar Envio">
                          <span>
                            <IconButton size="small" color="primary" onClick={() => handleOpenProcessDialog(campaign)} disabled={!['draft', 'failed'].includes(campaign.status)}>
                              <PlayArrowIcon />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="Editar">
                          <IconButton size="small" onClick={() => navigate(`/dashboard/cupons/campanhas/editar/${campaign.id}`)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Deletar">
                          <IconButton size="small" color="error" onClick={() => handleOpenDeleteDialog(campaign)}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </CardActions>
                    </Box>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        ) : renderEmptyState()
      )}

      {/* Dialogs */}
      <Dialog open={confirmProcessOpen} onClose={handleCloseDialogs}>
        <DialogTitle>Confirmar Início da Campanha</DialogTitle>
        <DialogContent><DialogContentText>Tem certeza que deseja iniciar a campanha "{campaignToAction?.nome}"?</DialogContentText></DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Cancelar</Button>
          <Button onClick={handleProcessCampaign} color="primary">Confirmar</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={confirmDeleteOpen} onClose={handleCloseDialogs}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent><DialogContentText>Tem certeza que deseja excluir a campanha "{campaignToAction?.nome}"?</DialogContentText></DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Cancelar</Button>
          <Button onClick={handleDeleteCampaign} color="error">Excluir</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={testDialogOpen} onClose={handleCloseDialogs}>
        <DialogTitle>Enviar Teste da Campanha</DialogTitle>
        <DialogContent>
          <DialogContentText>Digite o número do WhatsApp para enviar um teste da campanha "{campaignToAction?.nome}".</DialogContentText>
          <TextField autoFocus margin="dense" label="Número do WhatsApp" type="tel" fullWidth variant="standard" value={testPhoneNumber} onChange={(e) => setTestPhoneNumber(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Cancelar</Button>
          <Button onClick={handleSendTest} disabled={!testPhoneNumber}>Enviar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CampaignsPage;
