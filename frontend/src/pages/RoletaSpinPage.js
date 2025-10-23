
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CircularProgress, Alert, Container, Typography } from '@mui/material';
import roletaSpinService from '../services/roletaSpinService';
import RoulettePage from './RoulettePage'; // Reutilizaremos a página da roleta

const RoletaSpinPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [spinData, setSpinData] = useState(null);

  useEffect(() => {
    const validateToken = async () => {
      try {
        const response = await roletaSpinService.validateToken(token);
        setSpinData(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Token inválido ou expirado.');
        // Redireciona para uma página de erro ou login após um tempo
        setTimeout(() => navigate('/login'), 5000);
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, [token, navigate]);

  if (loading) {
    return (
      <Container sx={{ textAlign: 'center', mt: 10 }}>
        <CircularProgress />
        <Typography>Validando seu acesso...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 10 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  // Se o token for válido, renderiza a página da roleta com os dados obtidos
  // A página RoulettePage precisará ser adaptada para receber esses dados
  return <RoulettePage spinData={spinData} />;
};

export default RoletaSpinPage;
