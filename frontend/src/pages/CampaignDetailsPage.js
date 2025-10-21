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
} from '@mui/material';
import campanhaService from '../services/campanhaService';
import AuthContext from '../context/AuthContext';

const CampaignDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCampaignDetails = async () => {
      setLoading(true);
      try {
        const response = await campanhaService.getById(id);
        setCampaign(response.data);
      } catch (err) {
        setError('Falha ao carregar detalhes da campanha. Tente novamente.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.tenantId && id) {
      fetchCampaignDetails();
    }
  }, [id, user]);

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

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!campaign) {
    return <Alert severity="info">Campanha não encontrada.</Alert>;
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Detalhes da Campanha: {campaign.nome}
        </Typography>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h6">Nome:</Typography>
              <Typography>{campaign.nome}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6">Mensagem:</Typography>
              <Typography sx={{ whiteSpace: 'pre-wrap' }}>{campaign.mensagem}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6">Status:</Typography>
              {getStatusChip(campaign.status)}
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6">Tipo de Recompensa:</Typography>
              <Typography>{campaign.rewardType}</Typography>
            </Grid>
            {campaign.recompensa && (
              <Grid item xs={12} sm={6}>
                <Typography variant="h6">Recompensa:</Typography>
                <Typography>{campaign.recompensa.nome}</Typography>
              </Grid>
            )}
            {campaign.roleta && (
              <Grid item xs={12} sm={6}>
                <Typography variant="h6">Roleta:</Typography>
                <Typography>{campaign.roleta.nome}</Typography>
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <Typography variant="h6">Critério de Seleção:</Typography>
              <Typography>{campaign.criterioSelecao.type || 'Não especificado'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6">Atraso de Mensagem:</Typography>
              <Typography>{campaign.messageDelaySeconds} segundos</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6">Criada em:</Typography>
              <Typography>{new Date(campaign.createdAt).toLocaleString()}</Typography>
            </Grid>
            {campaign.updatedAt && (
              <Grid item xs={12}>
                <Typography variant="h6">Última Atualização:</Typography>
                <Typography>{new Date(campaign.updatedAt).toLocaleString()}</Typography>
              </Grid>
            )}
          </Grid>
        </Paper>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Button variant="outlined" onClick={() => navigate('/cupons/campanhas')} sx={{ mr: 2 }}>
            Voltar para Campanhas
          </Button>
          <Button variant="contained" onClick={() => navigate(`/cupons/campanhas/editar/${campaign.id}`)}>
            Editar Campanha
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default CampaignDetailsPage;
