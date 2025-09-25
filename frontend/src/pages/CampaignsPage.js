// src/pages/CampaignsPage.js
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
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit'; // Adicionado EditIcon
import { useNavigate } from 'react-router-dom';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import campanhaService from '../services/campanhaService';
import AuthContext from '../context/AuthContext';

const CampaignsPage = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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

  const handleProcessCampaign = async (id) => {
    try {
      await campanhaService.process(id);
      // Atualizar o status na UI ou recarregar a lista
      setCampaigns(campaigns.map(c => c.id === id ? { ...c, status: 'processing' } : c));
      alert('Campanha enviada para processamento!');
    } catch (err) {
      setError('Falha ao iniciar o processamento da campanha.');
      console.error(err);
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

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">Campanhas de Cupons</Typography>
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
                  onClick={() => navigate(`/cupons/campanhas/editar/${campaign.id}`)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>{campaign.nome}</TableCell>
                  <TableCell>{getStatusChip(campaign.status)}</TableCell>
                  <TableCell>{new Date(campaign.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}> {/* Impede que o clique no botão propague para a linha */}
                    <IconButton
                      color="primary"
                      onClick={() => handleProcessCampaign(campaign.id)}
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
                <TableCell colSpan={4} align="center">
                  Nenhuma campanha encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default CampaignsPage;
