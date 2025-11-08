import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  CircularProgress,
  Alert,
  Grid,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  CardMedia,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BarChartIcon from '@mui/icons-material/BarChart';
import PeopleIcon from '@mui/icons-material/People';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MessageIcon from '@mui/icons-material/Message';
import ScheduleIcon from '@mui/icons-material/Schedule';
import EventIcon from '@mui/icons-material/Event';
import campanhaService from '../services/campanhaService';
import AuthContext from '../context/AuthContext';

const CampaignDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [testPhoneNumber, setTestPhoneNumber] = useState('');

  useEffect(() => {
    const fetchCampaignDetails = async () => {
      setLoading(true);
      try {
        const response = await campanhaService.getById(id);
        setCampaign(response.data);
      } catch (err) {
        setError('Falha ao carregar detalhes da campanha. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    if (user?.tenantId && id) {
      fetchCampaignDetails();
    }
  }, [id, user]);

  const handleOpenTestDialog = () => setTestDialogOpen(true);
  const handleCloseTestDialog = () => {
    setTestDialogOpen(false);
    setTestPhoneNumber('');
  };

  const handleSendTest = async () => {
    if (!testPhoneNumber) return;
    try {
      await campanhaService.sendTest(id, { testPhoneNumber });
      // Adicionar notificação de sucesso
    } catch (err) {
      setError('Falha ao enviar teste da campanha.');
    } finally {
      handleCloseTestDialog();
    }
  };

  const getStatusChip = (status) => {
    const statusMap = {
      draft: { label: 'Rascunho', color: 'default' },
      scheduled: { label: 'Agendada', color: 'info' },
      processing: { label: 'Processando', color: 'warning' },
      sent: { label: 'Enviada', color: 'success' },
      failed: { label: 'Falhou', color: 'error' },
    };
    const { label, color } = statusMap[status] || { label: 'Desconhecido', color: 'default' };
    return <Chip label={label} color={color} />;
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!campaign) return <Alert severity="info">Campanha não encontrada.</Alert>;

  const imageUrl = campaign.mediaUrl ? `${process.env.REACT_APP_API_URL}${campaign.mediaUrl}` : null;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/dashboard/cupons/campanhas')} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          {campaign.nome}
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Coluna da Esquerda */}
        <Grid item xs={12} md={7}>
          <Card>
            {imageUrl && (
              <CardMedia
                component="img"
                height="300"
                image={imageUrl}
                alt={`Imagem da campanha ${campaign.nome}`}
                sx={{ objectFit: 'contain', p: 1, backgroundColor: '#f5f5f5' }}
              />
            )}
            <CardContent>
              <Typography variant="h6" gutterBottom>Variações de Mensagem</Typography>
              {campaign.mensagens.map((msg, index) => (
                <Paper key={index} variant="outlined" sx={{ p: 2, mb: 2, whiteSpace: 'pre-wrap', backgroundColor: '#fafafa' }}>
                  <Typography variant="body2">{msg}</Typography>
                </Paper>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Coluna da Direita */}
        <Grid item xs={12} md={5}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Status</Typography>
                  {getStatusChip(campaign.status)}
                  <Divider sx={{ my: 2 }} />
                  <List dense>
                    <ListItem>
                      <ListItemIcon><EventIcon /></ListItemIcon>
                      <ListItemText primary="Criada em" secondary={new Date(campaign.createdAt).toLocaleString()} />
                    </ListItem>
                    {campaign.startDate && (
                      <ListItem>
                        <ListItemIcon><ScheduleIcon /></ListItemIcon>
                        <ListItemText primary="Início agendado" secondary={new Date(campaign.startDate).toLocaleString()} />
                      </ListItem>
                    )}
                    {campaign.endDate && (
                      <ListItem>
                        <ListItemIcon><EventIcon color="error" /></ListItemIcon>
                        <ListItemText primary="Data de validade" secondary={new Date(campaign.endDate).toLocaleString()} />
                      </ListItem>
                    )}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Ações</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Button
                      variant="contained"
                      startIcon={<EditIcon />}
                      onClick={() => navigate(`/dashboard/cupons/campanhas/editar/${campaign.id}`)}
                    >
                      Editar Campanha
                    </Button>
                    <Button
                      variant="outlined"
                      color="secondary"
                      startIcon={<SendIcon />}
                      onClick={handleOpenTestDialog}
                    >
                      Enviar Teste
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Test Send Dialog */}
      <Dialog open={testDialogOpen} onClose={handleCloseTestDialog}>
        <DialogTitle>Enviar Campanha de Teste</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Digite o número de WhatsApp para enviar um teste da campanha "{campaign?.nome}".
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Número do WhatsApp"
            type="tel"
            fullWidth
            variant="standard"
            value={testPhoneNumber}
            onChange={(e) => setTestPhoneNumber(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTestDialog}>Cancelar</Button>
          <Button onClick={handleSendTest} disabled={!testPhoneNumber}>Enviar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CampaignDetailsPage;
