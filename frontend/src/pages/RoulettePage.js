import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, Typography, Box, Button, CircularProgress, Alert,
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';

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

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      if (!tenantId || !pesquisaId) {
        setError("ID do restaurante ou da pesquisa não encontrado na URL.");
        return;
      }

      console.log("DEBUG: publicSurveyService no RoulettePage:", publicSurveyService);

      const [surveyResponse, tenantResponse] = await Promise.all([
        publicSurveyService.getPublicSurveyById(pesquisaId),
        tenantService.getTenantById(tenantId),
      ]);

      setSurvey(surveyResponse.data);
      setTenant(tenantResponse.data);

      const theme = getDynamicTheme(tenantResponse.data.primaryColor, tenantResponse.data.secondaryColor);
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
    try {
      setError('');
      const result = await publicRoletaService.spinRoleta(pesquisaId, clientId);
      setSpinResult(result.data);
      // Atualizar o estado para refletir que a roleta foi girada
      setRoletaConfig(prev => ({ ...prev, hasSpun: true }));
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Erro ao girar a roleta.');
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
            Você já girou a roleta para esta pesquisa nas últimas 24 horas. Volte amanhã para tentar novamente!
          </Alert>
        )}

        <Box sx={{ my: 4 }}>
          <SpinTheWheel
            segments={roletaConfig.items.map(item => item.name)}
            segColors={['#FFD700', '#FF6347', '#3CB371', '#6A5ACD', '#FF8C00', '#4682B4']}
            onFinished={(winner) => console.log('Vencedor:', winner)}
            primaryColor='#1976d2'
            contrastColor='#ffffff'
            buttonText={roletaConfig.hasSpun ? 'Já Girou' : 'GIRAR'}
            isSpinning={false} // Controlar isso com o estado de loading do handleSpin
            disabled={roletaConfig.hasSpun || !roletaConfig.items.length}
            onSpin={handleSpin}
          />
        </Box>

        {spinResult && (
          <Box sx={{ mt: 4, p: 3, border: '1px solid #ddd', borderRadius: '8px', bgcolor: '#f9f9f9' }}>
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