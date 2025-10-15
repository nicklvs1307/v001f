import React, { useState, useEffect, useCallback } from 'react';
import { Container, Typography, Box, Button, CircularProgress, Alert, Paper } from '@mui/material';
import PublicPageLayout from '../components/layout/PublicPageLayout';
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
    <PublicPageLayout maxWidth="md">
      <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
        {survey?.title || 'Gire a Roleta e Ganhe um Prêmio!'}
      </Typography>
      <Typography variant="subtitle1" sx={{ mb: 4, color: 'text.secondary' }}>
        {survey?.description || 'Gire a roleta para ganhar prêmios incríveis.'}
      </Typography>

      <Paper elevation={6} sx={{ my: 4, p: 4, borderRadius: 2, bgcolor: 'background.paper' }}>
        <SpinTheWheel
          items={roletaConfig.items || []}
          winningIndex={winningIndex}
          onAnimationComplete={handleAnimationComplete}
          primaryColor={tenant.primaryColor}
          contrastColor="#ffffff"
          buttonText={roletaConfig.hasSpun ? 'Já Girou' : 'GIRAR'}
          isSpinning={isSpinning}
          disabled={isSpinning || roletaConfig.hasSpun || !roletaConfig.items?.length}
          onSpin={handleSpin}
        />
      </Paper>

      <Button
        variant="contained"
        color="primary"
        size="large"
        onClick={handleSpin}
        disabled={isSpinning || roletaConfig.hasSpun || !roletaConfig.items?.length}
        sx={{ mt: 3 }}
      >
        {isSpinning ? <CircularProgress size={24} /> : 'GIRAR'}
      </Button>
    </PublicPageLayout>
  );
};

export default RoulettePage;