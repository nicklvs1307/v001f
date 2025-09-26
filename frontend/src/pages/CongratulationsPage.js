import React, { useEffect, useRef, useState } from 'react';
import { Typography, Box, Alert, Paper, CircularProgress } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { keyframes } from '@mui/system';
import { ThemeProvider, useTheme } from '@mui/material/styles';
import getDynamicTheme from '../theme';
import publicSurveyService from '../services/publicSurveyService';

const floatAnimation = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const fallAnimation = keyframes`
  0% { transform: translateY(-100px) rotate(0deg); opacity: 1; }
  100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
`;

// Wrapper Component
const CongratulationsPage = () => {
    const location = useLocation();
    const { premio, cupom, tenantId } = location.state || {};
    const [dynamicTheme, setDynamicTheme] = useState(null);
    const [tenant, setTenant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (tenantId) {
            publicSurveyService.getPublicTenantById(tenantId)
                .then(tenantData => {
                    setTenant(tenantData);
                    const theme = getDynamicTheme(tenantData.primaryColor, tenantData.secondaryColor);
                    setDynamicTheme(theme);
                })
                .catch(err => setError('Não foi possível carregar o tema da empresa.'))
                .finally(() => setLoading(false));
        } else {
            setError('ID da empresa não encontrado.');
            setLoading(false);
        }
    }, [tenantId]);

    if (loading || !dynamicTheme) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress /></Box>;
    }

    if (error) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><Alert severity="error">{error}</Alert></Box>;
    }

    return (
        <ThemeProvider theme={dynamicTheme}>
            <CongratulationsComponent premio={premio} cupom={cupom} tenant={tenant} />
        </ThemeProvider>
    );
};

// UI Component
const CongratulationsComponent = ({ premio, cupom, tenant }) => {
    const confettiRef = useRef(null);
    const theme = useTheme();

    useEffect(() => {
        const currentConfettiContainer = confettiRef.current;
        const createConfetti = () => {
            if (!currentConfettiContainer) return;
            const colors = [theme.palette.warning.main, theme.palette.danger.main, theme.palette.primary.main, theme.palette.secondary.main, '#00c9ff'];
            for (let i = 0; i < 100; i++) {
                const confetti = document.createElement('div');
                confetti.style.position = 'absolute';
                confetti.style.width = Math.random() * 10 + 5 + 'px';
                confetti.style.height = Math.random() * 10 + 5 + 'px';
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.top = Math.random() * -20 + '%';
                confetti.style.left = Math.random() * 100 + '%';
                confetti.style.opacity = Math.random() * 0.5 + 0.5;
                confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
                confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
                confetti.style.animation = `${fallAnimation} ${Math.random() * 3 + 2}s linear infinite`;
                confetti.style.zIndex = 1;
                currentConfettiContainer.appendChild(confetti);
            }
        };
        createConfetti();
        return () => { if (currentConfettiContainer) currentConfettiContainer.innerHTML = ''; };
    }, [theme]);

    if (!premio || !cupom) {
        return (
            <Box sx={{ background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 100%)`, minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
                <Box sx={{ maxWidth: '800px', width: '100%', backgroundColor: 'white', borderRadius: '20px', boxShadow: '0 15px 30px rgba(0, 0, 0, 0.2)', overflow: 'hidden', textAlign: 'center', position: 'relative', p: 3 }}>
                    <Alert severity="error">Erro: Dados do prêmio ou cupom não encontrados.</Alert>
                </Box>
            </Box>
        );
    }

    return (
        <Box sx={{ background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 100%)`, minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', p: { xs: 1, sm: 2 }, position: 'relative' }}>
            <Box ref={confettiRef} sx={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0, zIndex: 9999, pointerEvents: 'none' }} />
            <Box sx={{ maxWidth: '800px', width: '100%', backgroundColor: 'white', borderRadius: '20px', boxShadow: '0 15px 30px rgba(0, 0, 0, 0.2)', overflow: 'hidden', textAlign: 'center', position: 'relative', zIndex: 2, margin: { xs: '0 16px', sm: 0 } }}>
                <Box sx={{ background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 100%)`, padding: { xs: '30px 20px', sm: '40px 20px' }, color: 'white', position: 'relative', zIndex: 2 }}>
                    {tenant?.logoUrl && (
                        <Box sx={{ mb: 2 }}>
                            <img src={`${process.env.REACT_APP_API_URL}${tenant.logoUrl}`} alt="Logo" style={{ maxHeight: '70px', maxWidth: '180px', objectFit: 'contain' }} />
                        </Box>
                    )}
                    <Typography variant="h3" component="h1" gutterBottom sx={{ fontSize: { xs: '2rem', sm: '3rem' }, marginBottom: '10px', textShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)', fontWeight: 'bold' }}>🎉 Parabéns! 🎉</Typography>
                    <Typography variant="h5" component="h2" sx={{ fontSize: { xs: '1.1rem', sm: '1.5rem' }, opacity: 0.9 }}>Você acaba de ganhar um prêmio especial!</Typography>
                </Box>
                <Box sx={{ padding: { xs: '20px', sm: '30px', md: '40px' }, position: 'relative', zIndex: 2 }}>
                    <Typography sx={{ mb: 2 }}>Estamos muito felizes em anunciar que <strong>você foi selecionado(a)</strong> para receber um presente especial como agradecimento pela sua fidelidade!</Typography>
                    <Paper elevation={3} sx={{ background: `linear-gradient(45deg, ${theme.palette.background.default}, ${theme.palette.grey[100]})`, borderRadius: '15px', padding: { xs: '20px', sm: '30px' }, margin: '30px 0', border: `2px dashed ${theme.palette.warning.main}`, position: 'relative', animation: `${floatAnimation} 3s ease-in-out infinite` }}>
                        <Typography variant="h6" sx={{ fontSize: { xs: '1.2rem', sm: '1.8rem' }, color: theme.palette.danger.main, marginBottom: '15px' }}>Sua Recompensa:</Typography>
                        <Typography><strong>Nome:</strong> {premio.nome}</Typography>
                        <Typography><strong>Descrição:</strong> {premio.descricao}</Typography>
                        <Box sx={{ fontSize: { xs: '1.5rem', sm: '2.5rem' }, fontWeight: 'bold', background: 'white', padding: { xs: '10px', sm: '15px' }, borderRadius: '10px', margin: '20px auto', letterSpacing: '2px', color: theme.palette.primary.main, border: `2px solid ${theme.palette.primary.main}`, display: 'inline-block', wordBreak: 'break-all' }}>
                            {cupom.codigo}
                        </Box>
                        <Typography>Use este código durante o checkout para resgatar sua recompensa.</Typography>
                    </Paper>
                    <Box sx={{ backgroundColor: theme.palette.augmentColor({ color: { main: theme.palette.warning.main } }).light, padding: '15px', borderRadius: '10px', margin: '20px 0', border: `1px solid ${theme.palette.warning.main}` }}>
                        <Typography><strong>Validade:</strong> Este cupom é válido por <strong>30 dias</strong> a partir de hoje.</Typography>
                    </Box>
                </Box>
                <Box sx={{ padding: '20px', backgroundColor: theme.palette.light.main, color: theme.palette.dark.main, fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
                    <Typography variant="inherit">Em caso de dúvidas, entre em contato com nosso suporte: suporte@empresa.com</Typography>
                    <Typography variant="inherit">Oferta válida apenas para o destinatário deste e-mail. Não acumulativo com outras promoções.</Typography>
                </Box>
            </Box>
        </Box>
    );
};

export default CongratulationsPage;
