import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ThemeProvider, useTheme } from '@mui/material/styles';
import { Container, Box, Typography, Button, CircularProgress, Alert } from '@mui/material';
import publicSurveyService from '../services/publicSurveyService';
import publicRoletaService from '../services/publicRoletaService';
import roletaSpinService from '../services/roletaSpinService';
import SpinTheWheel from '../components/roleta/SpinTheWheel';
import getDynamicTheme from '../getDynamicTheme';

const RoulettePage = ({ spinData }) => {
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

  const spinResultRef = useRef(spinResult);
  spinResultRef.current = spinResult;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      let currentTenantId, currentPesquisaId, currentClientId, currentRoletaId;
      let roletaData, clientData;

            let actualTenant;

            if (spinData) {

              // Se spinData for fornecido (acesso via token)

              currentTenantId = spinData.roleta.tenantId;

              currentPesquisaId = spinData.campanhaId; // Assumindo que campanhaId pode ser usado como pesquisaId para contexto

              currentClientId = spinData.clienteId;

              currentRoletaId = spinData.roletaId;

              roletaData = spinData.roleta;

              clientData = spinData.client;

      

              setRoletaConfig({ items: roletaData.premios, hasSpun: spinData.status === 'USED' });

              setTenant(spinData.roleta.tenant);

              setSurvey({ title: 'Gire a Roleta e Ganhe um Prêmio!', roletaId: spinData.roletaId }); // Mock de survey para contexto

              actualTenant = spinData.roleta.tenant;

      

            } else {

              // Se acesso via parâmetros de URL (rota antiga)

              currentTenantId = tenantId;

              currentPesquisaId = pesquisaId;

              currentClientId = clientId;

      

              if (!currentTenantId || !currentPesquisaId) {

                setError("ID do restaurante ou da pesquisa não encontrado na URL.");

                return;

              }

      

              const [surveyResponse, tenantResponse] = await Promise.all([

                publicSurveyService.getPublicSurveyById(currentPesquisaId),

                publicSurveyService.getPublicTenantById(currentTenantId),

              ]);

      

              setSurvey(surveyResponse);

              setTenant(tenantResponse);

              const configData = await publicRoletaService.getRoletaConfig(currentPesquisaId, currentClientId);

              setRoletaConfig(configData.data);

              actualTenant = tenantResponse;

            }

      

                  const theme = getDynamicTheme({ primaryColor: actualTenant?.primaryColor, secondaryColor: actualTenant?.secondaryColor });

      

                  setDynamicTheme(theme);

    } catch (err) {
      console.error("Erro ao buscar dados iniciais:", err);
      setError(err.message || 'Erro ao carregar dados da pesquisa ou roleta.');
    } finally {
      setLoading(false);
    }
  }, [tenantId, pesquisaId, clientId, spinData]); // Removido 'tenant' das dependências para evitar loop infinito

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSpin = async () => {
    if (isSpinning || roletaConfig.hasSpun) return;

    try {
      setIsSpinning(true);
      setError('');
      let result;

      if (spinData) {
        // Se acesso via token, usar o novo serviço
        result = await roletaSpinService.spinRoleta(spinData.token);
      } else {
        // Se acesso via parâmetros de URL, usar o serviço antigo
        result = await publicRoletaService.spinRoleta(pesquisaId, clientId);
      }

      const spinDataResult = result.data;
      setSpinResult(spinDataResult);

      const winnerIndex = roletaConfig.items.findIndex(item => item.id === spinDataResult.premio.id);
      setWinningIndex(winnerIndex);

      setRoletaConfig(prev => ({ ...prev, hasSpun: true }));
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Erro ao girar a roleta.');
      setIsSpinning(false);
    }
  };

  const handleAnimationComplete = useCallback(() => {
    setIsSpinning(false);
    // Adiciona um atraso de 4 segundos antes de enviar a mensagem e navegar
    setTimeout(async () => {
      if (spinResultRef.current && spinResultRef.current.cupom) {
        try {
          console.log('Enviando solicitação para mensagem de prêmio...');
          await publicRoletaService.sendPrizeMessage(spinResultRef.current.cupom.id);
          console.log('Solicitação de mensagem de prêmio enviada com sucesso.');
        } catch (error) {
          console.error('Falha ao enviar solicitação de mensagem de prêmio:', error);
          // Continua a navegação mesmo se o envio da mensagem falhar
        }
        navigate('/parabens', { state: { premio: spinResultRef.current.premio, cupom: spinResultRef.current.cupom, tenantId: tenant.id } });
      }
    }, 4000); // Atraso de 4 segundos
  }, [navigate, tenant]);

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

  // A verificação de survey.roletaId pode precisar ser ajustada se o survey for mockado
  // ou se a roleta for diretamente do spinData
  if (!roletaConfig.items || roletaConfig.items.length === 0) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <Alert severity="warning">{tenant?.name || 'O restaurante'} não configurou uma roleta ou prêmios para esta campanha.</Alert>
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
  const segColors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.primary.light || theme.palette.primary.main,
    theme.palette.secondary.light || theme.palette.secondary.main,
    theme.palette.primary.dark || theme.palette.primary.main,
    theme.palette.secondary.dark || theme.palette.secondary.main,
  ];
  const buttonNextStyle = { background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 100%)`, color: 'white', borderRadius: '50px', padding: { xs: '8px 16px', sm: '12px 25px' }, fontWeight: 600, '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)' } };

  return (
    <Box sx={{ background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`, minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', p: { xs: 1, sm: 2 }, textAlign: 'center' }}>
      <Container maxWidth="md">
          <Box sx={{ padding: { xs: '20px', sm: '30px' }, color: 'white' }}>
            {tenant?.logoUrl && (
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
                <img src={`${process.env.REACT_APP_API_URL}${tenant.logoUrl}`} alt="Logo" style={{ maxHeight: { xs: '50px', sm: '70px' }, maxWidth: { xs: '120px', sm: '180px' }, objectFit: 'contain' }} />
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
                segColors={segColors}
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