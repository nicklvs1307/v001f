import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import roletaSpinService from '../services/roletaSpinService';

const RoletaSpinPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [spinData, setSpinData] = useState(null);
  const timeoutRef = useRef(null);
  const RoulettePageRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();

    const validateToken = async () => {
      try {
        const response = await roletaSpinService.validateToken(token);
        if (!controller.signal.aborted) setSpinData(response.data);
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err.response?.data?.message || 'Token inválido ou expirado.');
        timeoutRef.current = setTimeout(() => {
          if (!controller.signal.aborted) navigate('/login');
        }, 5000);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    validateToken();

    return () => {
      controller.abort();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [token, navigate]);

  useEffect(() => {
    if (spinData) {
      import('./RoulettePage').then(mod => {
        RoulettePageRef.current = mod.default;
      });
    }
  }, [spinData]);

  if (loading) {
    return (
      <Container sx={{ textAlign: 'center', mt: 10 }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Validando seu acesso...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 10, textAlign: 'center' }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  const RoulettePage = RoulettePageRef.current || require('./RoulettePage').default;
  return <RoulettePage spinData={spinData} />;
};

export default RoletaSpinPage;
