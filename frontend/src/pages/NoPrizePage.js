import React, { useEffect, useState } from 'react';
import { Typography, Box, Alert, CircularProgress } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom'; // Adicionado useNavigate
import { keyframes } from '@mui/system';
import { ThemeProvider, useTheme } from '@mui/material/styles';
// import ReactConfetti from 'react-confetti'; // Removido
// import useWindowSize from '../hooks/useWindowSize'; // Removido
import getDynamicTheme from '../getDynamicTheme';
import publicSurveyService from '../services/publicSurveyService';

const floatAnimation = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

// Wrapper Component
const NoPrizePage = () => {
    const location = useLocation();
    const navigate = useNavigate(); // Adicionado
    const { message, tenantId } = location.state || {}; // Alterado para message
    const [dynamicTheme, setDynamicTheme] = useState(null);
    const [tenant, setTenant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (tenantId) {
            publicSurveyService.getPublicTenantById(tenantId)
                .then(tenantData => {
                    setTenant(tenantData);
                    const theme = getDynamicTheme({ primaryColor: tenantData.primaryColor, secondaryColor: tenantData.secondaryColor });
                    setDynamicTheme(theme);
                })
                .catch(err => setError('Não foi possível carregar o tema da empresa.'))
                .finally(() => setLoading(false));
        } else {
            setError('ID da empresa não encontrado.');
            setLoading(false);
        }
    }, [tenantId]);

    // Redireciona se não houver mensagem ou tenantId
    useEffect(() => {
        if (!message || !tenantId) {
            // navigate('/dashboard/roletas'); // Ou para a home ou uma página de erro genérica
        }
    }, [message, tenantId, navigate]);


    if (loading || !dynamicTheme) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress /></Box>;
    }

    if (error) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><Alert severity="error">{error}</Alert></Box>;
    }

    return (
        <ThemeProvider theme={dynamicTheme}>
            <NoPrizeComponent message={message} tenant={tenant} />
        </ThemeProvider>
    );
};

// UI Component
const NoPrizeComponent = ({ message, tenant }) => {
    const theme = useTheme();
    // const { width, height } = useWindowSize(); // Removido

    return (
        <Box sx={{ background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 100%)`, minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', p: { xs: 1, sm: 2 }, position: 'relative' }}>
            {/* <ReactConfetti width={width} height={height} style={{ zIndex: 9999 }} /> */} {/* Removido */}
            <Box sx={{ maxWidth: '800px', width: '100%', backgroundColor: 'white', borderRadius: '20px', boxShadow: '0 15px 30px rgba(0, 0, 0, 0.2)', overflow: 'hidden', textAlign: 'center', position: 'relative', zIndex: 2, margin: { xs: '0 16px', sm: 0 } }}>
                <Box sx={{ background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 100%)`, padding: { xs: '30px 20px', sm: '40px 20px' }, color: 'white', position: 'relative', zIndex: 2 }}>
                    {tenant?.logoUrl && (
                        <Box sx={{ mb: 2 }}>
                            <img src={`${process.env.REACT_APP_API_URL}${tenant.logoUrl}`} alt="Logo" style={{ maxHeight: '70px', maxWidth: '180px', objectFit: 'contain' }} />
                        </Box>
                    )}
                    <Typography variant="h3" component="h1" gutterBottom sx={{ fontSize: { xs: '2rem', sm: '3rem' }, marginBottom: '10px', textShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)', fontWeight: 'bold' }}>😔 Não foi dessa vez! 😔</Typography>
                    <Typography variant="h5" component="h2" sx={{ fontSize: { xs: '1.1rem', sm: '1.5rem' }, opacity: 0.9 }}>{message || 'Continue tentando e boa sorte na próxima!'}</Typography>
                </Box>
                <Box sx={{ padding: { xs: '20px', sm: '30px', md: '40px' }, position: 'relative', zIndex: 2 }}>
                    
                    <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mt: 2 }}>
                        A roleta girou, mas infelizmente não saiu um prêmio para você desta vez.
                    </Typography>
                    <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mt: 1 }}>
                        Não desanime! Tente novamente na sua próxima visita ou pedido.
                    </Typography>
                </Box>
                <Box sx={{ padding: '20px', backgroundColor: theme.palette.grey[100], color: theme.palette.dark.main, fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
                    
                    <Typography variant="inherit">Agradecemos sua participação. Volte sempre!</Typography>
                </Box>
            </Box>
        </Box>
    );
};

export default NoPrizePage;
