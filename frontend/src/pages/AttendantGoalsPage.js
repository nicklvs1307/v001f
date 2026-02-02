import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Box,
  Tooltip,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import MoneyIcon from '@mui/icons-material/AttachMoney';
import dashboardService from '../services/dashboardService';

const AttendantGoalsPage = () => {
  const [performanceData, setPerformanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        const attendantsPerformance = await dashboardService.getAttendantsPerformance();
        setPerformanceData(attendantsPerformance || []);
      } catch (err) {
        setError(err.message || 'Falha ao carregar o painel de performance.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = useMemo(() => {
    const totalPotential = performanceData.reduce((sum, att) => sum + (att.bonus?.totalPotential || 0), 0);
    const totalEarned = performanceData.reduce((sum, att) => sum + (att.bonus?.totalEarned || 0), 0);
    const winners = performanceData.filter(att => att.bonus?.totalEarned > 0).length;

    return { totalPotential, totalEarned, winners };
  }, [performanceData]);

  const handleRowClick = (atendenteId) => {
    navigate(`/dashboard/metas-atendentes/${atendenteId}`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
        <CircularProgress size={60} />
        <Typography sx={{ mt: 2 }}>Carregando Quadro de Incentivos...</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold" color="primary">
            Quadro de Metas e Incentivos
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Gerencie as recompensas e acompanhe quem está próximo de conquistar os bônus.
          </Typography>
        </Box>
        <Tooltip title="As metas ajudam a manter a equipe motivada e a qualidade do atendimento alta.">
          <IconButton><InfoOutlinedIcon /></IconButton>
        </Tooltip>
      </Box>

      {/* Resumo Financeiro das Metas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>INVESTIMENTO EM PRÊMIOS (MÊS)</Typography>
              <Typography variant="h4" fontWeight="bold">R$ {stats.totalPotential.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Typography>
              <Typography variant="caption">Total planejado se todos baterem as metas</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>BÔNUS ACUMULADOS HOJE</Typography>
              <Typography variant="h4" fontWeight="bold">R$ {stats.totalEarned.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Typography>
              <Typography variant="caption">{stats.winners} atendentes já atingiram algum bônus</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary">ECONOMIA ESTIMADA</Typography>
              <Typography variant="h4" fontWeight="bold" color="primary">R$ {(stats.totalPotential - stats.totalEarned).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Typography>
              <Typography variant="caption">Valor ainda disponível no orçamento de bônus</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Paper elevation={3} sx={{ p: 0, borderRadius: '15px', overflow: 'hidden' }}>
        <Box sx={{ p: 3, borderBottom: '1px solid #eee' }}>
          <Typography variant="h6" fontWeight="bold">Status de Conquistas por Atendente</Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#fafafa' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Atendente</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Metas Batidas</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>NPS Atual</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Bônus Conquistado</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Ação</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {performanceData.length > 0 ? (
                performanceData.map((atendente) => {
                  const goalsMetCount = [
                    atendente.progress?.isNpsMet,
                    atendente.progress?.isResponsesMet,
                    atendente.progress?.isRegistrationsMet
                  ].filter(Boolean).length;

                  return (
                    <TableRow 
                      key={atendente.id} 
                      hover 
                      onClick={() => handleRowClick(atendente.id)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>
                        <Typography variant="body1" fontWeight="600">{atendente.name}</Typography>
                        <Typography variant="caption" color="textSecondary">Código: {atendente.code}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                          {[...Array(3)].map((_, i) => (
                            <EmojiEventsIcon 
                              key={i}
                              sx={{ 
                                color: i < goalsMetCount ? 'warning.main' : '#e0e0e0',
                                fontSize: '1.2rem'
                              }} 
                            />
                          ))}
                        </Box>
                        <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                          {goalsMetCount} de 3 metas
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={`NPS ${atendente.currentNPS?.toFixed(0)}`}
                          color={atendente.currentNPS >= 70 ? "success" : atendente.currentNPS >= 50 ? "warning" : "error"}
                          size="small"
                          variant="outlined"
                          sx={{ fontWeight: 'bold' }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                          <MoneyIcon color="success" fontSize="small" />
                          <Typography variant="body1" fontWeight="bold" color="success.main">
                            R$ {atendente.bonus?.totalEarned.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="textSecondary">
                          Potencial: R$ {atendente.bonus?.totalPotential.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Editar Metas e Prêmios">
                          <Box sx={{ bgcolor: 'primary.light', color: 'primary.main', borderRadius: '50%', p: 1, display: 'inline-flex' }}>
                            <ArrowForwardIcon fontSize="small" />
                          </Box>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    Nenhum atendente cadastrado no sistema.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default AttendantGoalsPage;