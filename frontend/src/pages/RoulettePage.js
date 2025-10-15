import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, Typography, Box, Button, CircularProgress, Alert,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { ThemeProvider, useTheme } from '@mui/material/styles';
import publicSurveyService from '../services/publicSurveyService';
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

      setRoletaConfig(prev => ({ ...prev, hasSpun: true }));
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Erro ao girar a roleta.');
      setIsSpinning(false);
    }
  };

  const handleAnimationComplete = useCallback(() => {
    setIsSpinning(false);
    if (spinResult) {
      navigate('/parabens', { state: { premio: spinResult.premio, cupom: spinResult.cupom, tenantId: tenant.id } });
    }
  }, [navigate, spinResult, tenant]);

  if (loading || !dynamicTheme) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
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
      <RoulettePageComponent
        survey={survey}
        tenant={tenant}
        roletaConfig={roletaConfig}
        isSpinning={isSpinning}
        winningIndex={winningIndex}
        handleSpin={handleSpin}
        handleAnimationComplete={handleAnimationComplete}
        spinResult={spinResult}
      />
    </ThemeProvider>
  );
};

const RoulettePageComponent = ({ survey, tenant, roletaConfig, isSpinning, winningIndex, handleSpin, handleAnimationComplete, spinResult }) => {
  const theme = useTheme();
  const buttonNextStyle = { background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 100%)`, color: 'white', borderRadius: '50px', padding: '12px 25px', fontWeight: 600, '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)' } };

  return (
    <Box sx={{ background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`, minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', p: { xs: 1, sm: 2 }, textAlign: 'center' }}>
      <Container maxWidth="md">
          <Box sx={{ padding: { xs: '20px', sm: '30px' }, color: 'white' }}>
            {tenant?.logoUrl && (
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
                <img src={`${process.env.REACT_APP_API_URL}${tenant.logoUrl}`} alt="Logo" style={{ maxHeight: '70px', maxWidth: '180px', objectFit: 'contain' }} />
              </Box>
            )}
            <Typography variant="h4" component="h1" gutterBottom>
              Gire a Roleta e Ganhe um Prêmio!
            </Typography>
            <Typography variant="subtitle1">
              {survey.title}
            </Typography>
          </Box>

          <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
            {roletaConfig.hasSpun && !spinResult && (
              <Alert severity="info" sx={{ mb: 2, bgcolor: 'rgba(255, 255, 255, 0.2)', color: 'white' }}>
                Você já girou a roleta para esta pesquisa.
              </Alert>
            )}

            <Box sx={{ my: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <SpinTheWheel
                items={roletaConfig.items || []}
                segColors={['#FFD700', '#FF6347', '#3CB371', '#6A5ACD', '#FF8C00', '#4682B4']}
                winningIndex={winningIndex}
                onAnimationComplete={handleAnimationComplete}
              />
            </Box>

            <Button
              onClick={handleSpin}
              disabled={isSpinning || roletaConfig.hasSpun || !roletaConfig.items?.length}
              sx={buttonNextStyle}
            >
              {isSpinning ? <CircularProgress size={24} color="inherit" /> : (roletaConfig.hasSpun ? 'Já Girou' : 'GIRAR')}
            </Button>
          </Box>
      </Container>
    </Box>
  );
}

export default RoulettePage;