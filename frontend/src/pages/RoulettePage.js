import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, Typography, Box, Button, CircularProgress, Alert,
} from '@mui/material';
import { useParams } from 'react-router-dom';


import publicSurveyService from '../services/publicSurveyService';
import tenantService from '../services/tenantService';
import publicRoletaService from '../services/publicRoletaService';
import SpinTheWheel from '../components/roleta/SpinTheWheel';
import getDynamicTheme from '../theme';

const RoulettePage = () => {
  const { tenantId, pesquisaId, clientId } = useParams();
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
    // A animação terminou, agora podemos mostrar o resultado final com segurança.
    setIsSpinning(false);
    // O resultado já está sendo exibido condicionalmente com base em `spinResult`
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

        {spinResult && (
          <Box sx={{ mt: 4, p: 3, border: '1px solid #ddd', borderRadius: '8px', bgcolor: 'background.paper' }}>
            <Typography variant="h5" color="primary" gutterBottom>
              Parabéns! Você ganhou:
            </Typography>
            <Typography variant="h6">{spinResult.premio.nome}</Typography>
            <Typography variant="body1">{spinResult.premio.descricao}</Typography>
            <Typography variant="body2" sx={{ mt: 2 }}>
              Use o cupom: <strong>{spinResult.cupom.codigo}</strong>
            </Typography>
            <Typography variant="body2">
              Válido até: {new Date(spinResult.cupom.dataValidade).toLocaleDateString('pt-BR')}
            </Typography>
          </Box>
        )}
      </Container>
    </ThemeProvider>
  );
};

export default RoulettePage;