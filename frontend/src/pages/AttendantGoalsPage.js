import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import dashboardService from '../services/dashboardService'; // Reutilizar o serviço de dashboard

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
        // Este endpoint já busca os dados de performance que precisamos
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

  const handleRowClick = (atendenteId) => {
    navigate(`/dashboard/metas-atendentes/${atendenteId}`);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography>Carregando performance dos atendentes...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        Painel de Performance dos Atendentes
      </Typography>

      <Paper elevation={2} sx={{ p: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Atendente</TableCell>
                <TableCell align="center">NPS Atual</TableCell>
                <TableCell align="center">Total de Respostas (Mês)</TableCell>
                <TableCell align="center">Total de Cadastros (Mês)</TableCell>
                <TableCell align="center">Configurar</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {performanceData.length > 0 ? (
                performanceData.map((atendente) => (
                  <TableRow 
                    key={atendente.id} 
                    hover 
                    onClick={() => handleRowClick(atendente.id)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell component="th" scope="row">
                      {atendente.name}
                    </TableCell>
                    <TableCell align="center">{atendente.currentNPS?.toFixed(0) || 'N/A'}</TableCell>
                    <TableCell align="center">{atendente.responses || 0}</TableCell>
                    <TableCell align="center">{atendente.registrations || 0}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Configurar Metas e Prêmios">
                        <ArrowForwardIcon color="primary" />
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">Nenhum atendente encontrado.</TableCell>
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