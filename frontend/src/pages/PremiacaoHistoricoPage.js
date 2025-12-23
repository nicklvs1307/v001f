import React, { useState, useEffect } from 'react';
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
  Avatar,
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { formatDateForDisplay } from '../utils/dateUtils';
import premiacaoService from '../services/premiacaoService'; // Vamos precisar criar este serviço

const PremiacaoHistoricoPage = () => {
  const [premiacoes, setPremiacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPremiacoes = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await premiacaoService.getAllPremiacoes(); // Este serviço ainda precisa ser implementado no backend
        setPremiacoes(data);
      } catch (err) {
        setError(err.message || 'Falha ao carregar histórico de premiações.');
      } finally {
        setLoading(false);
      }
    };

    fetchPremiacoes();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography>Carregando histórico de premiações...</Typography>
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
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <EmojiEventsIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
        <Typography variant="h4" component="h1" fontWeight="bold">
          Histórico de Premiações
        </Typography>
      </Box>

      <Paper elevation={2}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Atendente</TableCell>
                <TableCell>Prêmio</TableCell>
                <TableCell>Meta Atingida</TableCell>
                <TableCell>Valor Atingido</TableCell>
                <TableCell>Data da Premiação</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {premiacoes.length > 0 ? (
                premiacoes.map((premiacao) => (
                  <TableRow key={premiacao.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 1, bgcolor: 'primary.light' }}>{premiacao.atendente?.name?.charAt(0)}</Avatar>
                        {premiacao.atendente?.name || 'N/A'}
                      </Box>
                    </TableCell>
                    <TableCell>{premiacao.recompensa?.name || 'N/A'}</TableCell>
                    <TableCell>
                        {premiacao.meta?.npsGoal > 0 && `NPS: ${premiacao.meta?.npsGoal} `}
                        {premiacao.meta?.responsesGoal > 0 && `Respostas: ${premiacao.meta?.responsesGoal} `}
                        {premiacao.meta?.registrationsGoal > 0 && `Cadastros: ${premiacao.meta?.registrationsGoal}`}
                    </TableCell>
                    <TableCell>{premiacao.metricValueAchieved}</TableCell>
                    <TableCell>{formatDateForDisplay(premiacao.dateAwarded)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">Nenhuma premiação encontrada.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default PremiacaoHistoricoPage;