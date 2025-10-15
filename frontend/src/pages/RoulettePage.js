import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, Typography, Box, Button, CircularProgress, Alert,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';


import { ThemeProvider } from '@mui/material/styles';
import publicSurveyService from '../services/publicSurveyService';
import tenantService from '../services/tenantService';
import publicRoletaService from '../services/publicRoletaService';
import SpinTheWheel from '../components/roleta/SpinTheWheel';
import getDynamicTheme from '../theme';

const RoulettePage = () => {
  const { tenantId, pesquisaId, clientId } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState(null);
  const [roletaConfig, setRoletaConfig] = useState({ items: [], hasSpun: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [spinResult, setSpinResult] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [dynamicTheme, setDynamicTheme] = useState(null);
  const [winningIndex, setWinningIndex] = useState(-1);
  const [isSpinning, setIsSpinning] = useState(false);


  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      if (!tenantId || !pesquisaId) {
        setError("ID do restaurante ou da pesquisa não encontrado na URL.");
        return;
      }

      const [surveyResponse, tenantResponse] = await Promise.all([
        publicSurveyService.getPublicSurveyById(pesquisaId),
        publicSurveyService.getPublicTenantById(tenantId),
      ]);

      setSurvey(surveyResponse);
      setTenant(tenantResponse);

      const theme = getDynamicTheme(tenantResponse.primaryColor, tenantResponse.secondaryColor);
      setDynamicTheme(theme);

      // Carregar a configuração da roleta
      const configData = await publicRoletaService.getRoletaConfig(pesquisaId, clientId);
      setRoletaConfig(configData.data);

    } catch (err) {
      console.error("Erro ao buscar dados iniciais:", err);
      setError(err.message || 'Erro ao carregar dados da pesquisa ou roleta.');
    } finally {
      setLoading(false);
    }
  }, [tenantId, pesquisaId, clientId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSpin = async () => {
    if (isSpinning || roletaConfig.hasSpun) return;

    try {
      setIsSpinning(true);
      setError('');
      const result = await publicRoletaService.spinRoleta(pesquisaId, clientId);
      const spinData = result.data;
      setSpinResult(spinData);

      const winnerIndex = roletaConfig.items.findIndex(item => item.id === spinData.premio.id);
      setWinningIndex(winnerIndex);

      // Atualizar o estado para refletir que a roleta foi girada
      setRoletaConfig(prev => ({ ...prev, hasSpun: true }));
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Erro ao girar a roleta.');
      setIsSpinning(false);
    }
  };

  const handleAnimationComplete = () => {
    setIsSpinning(false);
    if (spinResult) {
      navigate('/parabens', { state: { premio: spinResult.premio, cupom: spinResult.cupom, tenantId: tenant.id } });
    }
  };


  if (loading || !dynamicTheme) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!survey || !survey.roletaId) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <Alert severity="warning">{tenant?.name || 'O restaurante'} não configurou uma roleta para esta pesquisa.</Alert>
      </Container>
    );
  }

  return (
    <ThemeProvider theme={dynamicTheme}>
      <Container maxWidth="md" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Gire a Roleta e Ganhe um Prêmio!
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          {survey.title}
        </Typography>

        {roletaConfig.hasSpun && !spinResult && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Você já girou a roleta para esta pesquisa.
          </Alert>
        )}

        <Box sx={{ my: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <SpinTheWheel
            items={roletaConfig.items || []}
            segColors={['#FFD700', '#FF6347', '#3CB371', '#6A5ACD', '#FF8C00', '#4682B4']}
            winningIndex={winningIndex}
            onAnimationComplete={handleAnimationComplete}
            primaryColor={tenant.primaryColor}
            contrastColor="#ffffff"
            buttonText={roletaConfig.hasSpun ? 'Já Girou' : 'GIRAR'}
            isSpinning={isSpinning}
            disabled={isSpinning || roletaConfig.hasSpun || !roletaConfig.items?.length}
            onSpin={handleSpin}
          />
        </Box>


      </Container>
    </ThemeProvider>
  );
};

export default RoulettePage;