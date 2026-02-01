import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Confetti from 'react-confetti';
import { ThemeProvider, useTheme } from '@mui/material/styles';
import { Container, Box, Typography, Button, CircularProgress, Alert } from '@mui/material';
import publicSurveyService from '../services/publicSurveyService';
import publicRoletaService from '../services/publicRoletaService';
import roletaSpinService from '../services/roletaSpinService';
import SpinTheWheel from '../components/roleta/SpinTheWheel';
import getDynamicTheme from '../getDynamicTheme';
import { keyframes } from '@mui/system';

const kenBurns = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`;

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
  const [showConfetti, setShowConfetti] = useState(false);

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
// ... (lógica existente mantida implicitamente pelo contexto, mas focando na estrutura ao redor)
// Como o bloco é grande, vou focar em substituir handleAnimationComplete e o return
// Mas primeiro preciso garantir que as variáveis de estado sejam adicionadas corretamente.
// Vou substituir apenas as declarações de estado e o handleAnimationComplete.

              // Se spinData for fornecido (acesso via token)

              currentTenantId = spinData.roleta.tenantId;

              currentPesquisaId = spinData.campanhaId; // Assumindo que campanhaId pode ser usado como pesquisaId para contexto

              currentClientId = spinData.clienteId;

              currentRoletaId = spinData.roletaId;

              roletaData = spinData.roleta;

              clientData = spinData.client;

      

              setRoletaConfig({
                items: roletaData.premios.map(p => ({
                  ...p,
                  isNoPrizeOption: p.isNoPrizeOption || false,
                })),
                hasSpun: spinData.status === 'USED'
              });

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

                            setRoletaConfig({

                              items: configData.data.items.map(item => ({

                                ...item,

                                isNoPrizeOption: item.isNoPrizeOption || false,

                              })),

                              hasSpun: configData.data.hasSpun

                            });

              actualTenant = tenantResponse;

            }

      

                  const theme = getDynamicTheme({ primaryColor: actualTenant?.primaryColor, secondaryColor: actualTenant?.secondaryColor });

      

                  setDynamicTheme(theme);

    } catch (err) {
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
    
    // Ativar confetes se ganhou prêmio
    if (spinResultRef.current?.premio && !spinResultRef.current.premio.isNoPrizeOption) {
        setShowConfetti(true);
    }

    // Adiciona um atraso de 4 segundos antes de enviar a mensagem e navegar
    setTimeout(async () => {
      if (spinResultRef.current && spinResultRef.current.premio) {
        if (spinResultRef.current.premio.isNoPrizeOption) {
          console.log(spinResultRef.current.message);
          navigate('/nao-ganhou', {
            state: {
              message: spinResultRef.current.message,
              tenantId: tenant.id
            }
          });
        } else if (spinResultRef.current.cupom) {
          try {
            await publicRoletaService.sendPrizeMessage(spinResultRef.current.cupom.id);
          } catch (error) {
            // Continua a navegação mesmo se o envio da mensagem falhar
          }
          navigate('/parabens', { state: { premio: spinResultRef.current.premio, cupom: spinResultRef.current.cupom, tenantId: tenant.id } });
        }
      }
    }, 4000); 
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
      <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1, overflow: 'hidden' }}>
        {/* Camada 1: Imagem com Ken Burns */}
        <Box 
          sx={{ 
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            backgroundImage: 'url(/bg-roleta.png)', 
            backgroundSize: 'cover', backgroundPosition: 'center',
            animation: `${kenBurns} 20s infinite ease-in-out`
          }} 
        />
        {/* Camada 2: Filtro de Cor Dinâmico */}
        <Box 
          sx={{ 
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            background: `linear-gradient(135deg, ${dynamicTheme.palette.primary.main}dd 0%, ${dynamicTheme.palette.secondary.main}dd 100%)`,
            backdropFilter: 'blur(2px)'
          }} 
        />
      </Box>
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={200} />}
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

  // Estilo do Botão Turbinado
  const buttonNextStyle = { 
    background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 100%)`, 
    color: 'white', 
    borderRadius: '50px', 
    padding: { xs: '18px 60px', sm: '12px 40px' }, // Aumentado significativamente
    fontSize: { xs: '1.3rem', sm: '1.1rem' }, // Fonte maior
    fontWeight: 800, 
    letterSpacing: '1px',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)',
    width: { xs: '90%', sm: 'auto' }, // Quase largura total no mobile
    transition: 'all 0.3s ease',
    animation: !isSpinning && !roletaConfig.hasSpun ? 'pulse-button 2s infinite' : 'none',
    '@keyframes pulse-button': {
      '0%': { transform: 'scale(1)', boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)' },
      '50%': { transform: 'scale(1.05)', boxShadow: '0 12px 35px rgba(0, 0, 0, 0.4)' },
      '100%': { transform: 'scale(1)', boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)' },
    },
    '&:hover': { 
      transform: 'translateY(-3px) scale(1.02)', 
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)' 
    },
    '&:disabled': {
      background: '#ccc',
      animation: 'none'
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', display: 'flex', flexDirection: 'column', 
      justifyContent: 'flex-start', alignItems: 'center', 
      p: { xs: 1, sm: 2 }, textAlign: 'center',
      position: 'relative',
      zIndex: 1
    }}>
      <Container maxWidth="md" sx={{ pt: { xs: 6, sm: 8 } }}>
          <Box sx={{ padding: { xs: '5px 20px', sm: '15px 30px' }, color: 'white', mb: 2 }}>
            <Typography 
                variant="h4" 
                component="h1" 
                gutterBottom
                sx={{ 
                    fontWeight: 900, 
                    fontSize: { xs: '1.6rem', sm: '2.5rem' },
                    textShadow: '0 4px 10px rgba(0,0,0,0.3)',
                    background: 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(5px)',
                    borderRadius: '20px',
                    p: 2,
                    display: 'inline-block',
                    border: '1px solid rgba(255,255,255,0.2)',
                    lineHeight: 1.2
                }}
            >
              Gire a Roleta e Ganhe um Prêmio!
            </Typography>
            <Typography variant="subtitle1" sx={{ mt: 2, opacity: 0.9, fontWeight: 500, textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
              {survey.title}
            </Typography>
          </Box>

          <Box sx={{ p: { xs: 1, sm: 3 } }}>
            {roletaConfig.hasSpun && !spinResult && (
              <Alert severity="info" sx={{ mb: 2, bgcolor: 'rgba(255, 255, 255, 0.2)', color: 'white' }}>
                Você já girou a roleta para esta pesquisa.
              </Alert>
            )}

            <Box sx={{ my: { xs: 2, sm: 4 }, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <SpinTheWheel
                items={roletaConfig.items || []}
                segColors={segColors}
                winningIndex={winningIndex}
                onAnimationComplete={handleAnimationComplete}
                logoUrl={tenant?.logoUrl ? `${process.env.REACT_APP_API_URL}${tenant.logoUrl}` : null}
                isSpinning={isSpinning}
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

      {/* Rodapé Voltaki */}
      <Box sx={{ mt: 'auto', pb: 3, opacity: 0.8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
        <Typography variant="caption" sx={{ color: 'white', fontWeight: 500, fontSize: '0.7rem', letterSpacing: '1px' }}>
          POWERED BY
        </Typography>
        <img 
          src="/logo.png" 
          alt="Voltaki Logo" 
          style={{ 
            height: '25px', 
            filter: 'brightness(0) invert(1)', // Deixa a logo branca para combinar com o fundo
            opacity: 0.9
          }} 
        />
      </Box>
    </Box>
  );
}

export default RoulettePage;