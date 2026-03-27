import React, { useEffect, useState, useCallback } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import { useLocation, useNavigate } from 'react-router-dom';
import { ThemeProvider, useTheme } from '@mui/material/styles';
import getDynamicTheme from '../getDynamicTheme';
import publicSurveyService from '../services/publicSurveyService';

const loadingBoxSx = { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' };

const NoPrizePage = () => {
    const location = useLocation();
    const { message, tenantId } = location.state || {};
    const [dynamicTheme, setDynamicTheme] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const controller = new AbortController();

        if (tenantId) {
            publicSurveyService.getPublicTenantById(tenantId)
                .then(tenantData => {
                    if (controller.signal.aborted) return;
                    setDynamicTheme(getDynamicTheme({ primaryColor: tenantData.primaryColor, secondaryColor: tenantData.secondaryColor }));
                })
                .catch(() => {
                    if (!controller.signal.aborted) setError('Não foi possível carregar o tema da empresa.');
                })
                .finally(() => {
                    if (!controller.signal.aborted) setLoading(false);
                });
        } else {
            setError('ID da empresa não encontrado.');
            setLoading(false);
        }

        return () => controller.abort();
    }, [tenantId]);

    if (loading) return <Box sx={loadingBoxSx}><CircularProgress /></Box>;
    if (error) return <Box sx={loadingBoxSx}><Alert severity="error">{error}</Alert></Box>;

    return (
        <ThemeProvider theme={dynamicTheme}>
            <NoPrizeComponent message={message} />
        </ThemeProvider>
    );
};

const NoPrizeComponent = ({ message }) => {
    const theme = useTheme();
    const navigate = useNavigate();

    const handleGoHome = useCallback(() => navigate('/'), [navigate]);

    return (
        <Box sx={{
            background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 100%)`,
            minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center',
            p: { xs: 1, sm: 2 }, position: 'relative'
        }}>
            <Box sx={{
                maxWidth: '800px', width: '100%', backgroundColor: 'white', borderRadius: '20px',
                boxShadow: '0 15px 30px rgba(0, 0, 0, 0.2)', overflow: 'hidden',
                textAlign: 'center', position: 'relative', zIndex: 2, margin: { xs: '0 16px', sm: 0 }
            }}>
                <Box sx={{
                    background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 100%)`,
                    padding: { xs: '30px 20px', sm: '40px 20px' }, color: 'white'
                }}>
                    <Typography variant="h3" component="h1" gutterBottom sx={{
                        fontSize: { xs: '2rem', sm: '3rem' },
                        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)', fontWeight: 'bold'
                    }}>
                        Não foi dessa vez!
                    </Typography>
                    <Typography variant="h5" component="h2" sx={{ fontSize: { xs: '1.1rem', sm: '1.5rem' }, opacity: 0.9 }}>
                        {message || 'Continue tentando e boa sorte na próxima!'}
                    </Typography>
                </Box>

                <Box sx={{ padding: { xs: '20px', sm: '30px', md: '40px' } }}>
                    <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mt: 2 }}>
                        A roleta girou, mas infelizmente não saiu um prêmio para você desta vez.
                    </Typography>
                    <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mt: 1 }}>
                        Não desanime! Tente novamente na sua próxima visita ou pedido.
                    </Typography>

                    <Button
                        variant="contained"
                        onClick={handleGoHome}
                        sx={{ mt: 4, borderRadius: '50px', px: 4, py: 1.5, fontWeight: 700, textTransform: 'none' }}
                    >
                        Voltar ao Início
                    </Button>
                </Box>

                <Box sx={{ padding: '20px', backgroundColor: theme.palette.grey[100], color: theme.palette.text.secondary, fontSize: { xs: '0.8rem', sm: '0.9rem' } }}>
                    <Typography variant="inherit">Agradecemos sua participação. Volte sempre!</Typography>
                </Box>
            </Box>
        </Box>
    );
};

export default NoPrizePage;
