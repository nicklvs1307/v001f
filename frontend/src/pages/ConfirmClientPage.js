import React, { useState, useEffect, useMemo } from 'react';
import { 
    Typography, 
    Box, 
    Button, 
    Paper, 
    CircularProgress, 
    Alert, 
    Container,
    Fade,
    Avatar
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { Person as PersonIcon, Check as CheckIcon, Close as CloseIcon } from '@mui/icons-material';
import publicSurveyService from '../services/publicSurveyService';
import getDynamicTheme from '../getDynamicTheme';

const ConfirmClientPage = () => {
    const navigate = useNavigate();
    const { surveyId } = useParams();
    
    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [error, setError] = useState('');
    const [surveyData, setSurveyData] = useState(null);
    const [dynamicTheme, setDynamicTheme] = useState(null);
    const [phone, setPhone] = useState('');
    const [surveyState, setSurveyState] = useState(null);

    useEffect(() => {
        const init = async () => {
            try {
                let storedState = null;
                let storedPhone = null;

                try {
                    storedState = sessionStorage.getItem('surveyState');
                    storedPhone = localStorage.getItem('clientPhone');
                } catch (storageErr) {
                    console.warn("Erro de acesso ao storage:", storageErr);
                }

                if (!storedState || !storedPhone || !surveyId) {
                    console.error("Dados insuficientes para confirmação.");
                    navigate(`/identificacao-pesquisa/${surveyData?.tenantId || 'erro'}/${surveyId}`); 
                    return;
                }

                const parsedState = JSON.parse(storedState);
                setSurveyState(parsedState);
                setPhone(storedPhone);

                // Carrega dados da pesquisa para manter a identidade visual
                const data = await publicSurveyService.getPublicSurveyById(surveyId);
                setSurveyData(data);
                
                const theme = getDynamicTheme({ 
                    primaryColor: data.primaryColor, 
                    secondaryColor: data.secondaryColor 
                });
                setDynamicTheme(theme);
            } catch (err) {
                console.error("Erro ao inicializar página de confirmação:", err);
                setError("Ocorreu um erro ao carregar seus dados.");
            } finally {
                setLoading(false);
            }
        };

        init();
    }, [navigate, surveyId, surveyData?.tenantId]);

    const handleConfirm = async () => {
        setSubmitLoading(true);
        setError('');
        try {
            const payload = {
                surveyId,
                respondentSessionId: surveyState.respondentSessionId,
                client: { phone },
            };

            const response = await publicSurveyService.submitSurveyWithClient(payload);
            sessionStorage.removeItem('surveyState'); 
            navigate(`/roleta/${surveyState.tenantId}/${surveyId}/${response.clienteId}`);
        } catch (err) {
            console.error("Erro ao confirmar cliente:", err);
            setError(err.response?.data?.message || err.message || 'Ocorreu um erro ao confirmar sua identidade.');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleDeny = () => {
        localStorage.removeItem('clientPhone');
        if (surveyState && surveyState.tenantId && surveyId) {
            navigate(`/identificacao-pesquisa/${surveyState.tenantId}/${surveyId}`);
        } else {
            navigate('/');
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!dynamicTheme || !surveyData) {
        return <Box sx={{ p: 4 }}><Alert severity="error">{error || 'Erro ao carregar tema.'}</Alert></Box>;
    }

    const primaryColor = surveyData.primaryColor || '#FC4C35';
    const secondaryColor = surveyData.secondaryColor || '#1EBFAE';

    return (
        <ThemeProvider theme={dynamicTheme}>
            <Box sx={{ 
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`, 
                minHeight: '100vh', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                p: 2 
            }}>
                <Container maxWidth="xs">
                    <Fade in={true} timeout={800}>
                        <Paper elevation={10} sx={{ 
                            p: { xs: 3, sm: 4 }, 
                            textAlign: 'center', 
                            borderRadius: '24px',
                            boxShadow: '0 15px 35px rgba(0,0,0,0.2)'
                        }}>
                            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
                                <Avatar sx={{ 
                                    width: 80, 
                                    height: 80, 
                                    bgcolor: `${primaryColor}15`, 
                                    color: primaryColor,
                                    border: `2px solid ${primaryColor}`
                                }}>
                                    <PersonIcon sx={{ fontSize: 45 }} />
                                </Avatar>
                            </Box>

                            <Typography variant="h5" fontWeight="800" gutterBottom sx={{ color: '#222' }}>
                                Olá novamente!
                            </Typography>
                            
                            <Typography variant="body1" sx={{ mb: 4, color: '#666', lineHeight: 1.6 }}>
                                Identificamos que você já participou antes. Este é o seu telefone?
                                <Box component="span" sx={{ 
                                    display: 'block', 
                                    fontSize: '1.4rem', 
                                    fontWeight: 'bold', 
                                    color: primaryColor,
                                    mt: 1,
                                    letterSpacing: '1px'
                                }}>
                                    {phone}
                                </Box>
                            </Typography>

                            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>{error}</Alert>}

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Button 
                                    variant="contained" 
                                    size="large" 
                                    fullWidth
                                    startIcon={!submitLoading && <CheckIcon />}
                                    onClick={handleConfirm} 
                                    disabled={submitLoading}
                                    sx={{ 
                                        py: 1.5,
                                        fontSize: '1.1rem',
                                        boxShadow: `0 8px 20px ${primaryColor}40`,
                                        '&:hover': { transform: 'translateY(-2px)' }
                                    }}
                                >
                                    {submitLoading ? <CircularProgress size={26} color="inherit" /> : 'Sim, sou eu'}
                                </Button>
                                
                                <Button 
                                    variant="outlined" 
                                    color="inherit"
                                    size="large" 
                                    fullWidth
                                    startIcon={<CloseIcon />}
                                    onClick={handleDeny} 
                                    disabled={submitLoading}
                                    sx={{ 
                                        py: 1.5,
                                        color: '#666',
                                        borderColor: '#ddd',
                                        '&:hover': { borderColor: '#bbb', bgcolor: '#f9f9f9' }
                                    }}
                                >
                                    Não, sou outra pessoa
                                </Button>
                            </Box>
                            
                            {surveyData.restaurantLogoUrl && (
                                <Box sx={{ mt: 4, opacity: 0.6 }}>
                                    <img 
                                        src={`${process.env.REACT_APP_API_URL}${surveyData.restaurantLogoUrl}`} 
                                        alt="Logo" 
                                        style={{ height: '30px', filter: 'grayscale(100%)' }} 
                                    />
                                </Box>
                            )}
                        </Paper>
                    </Fade>
                </Container>
            </Box>
        </ThemeProvider>
    );
};

export default ConfirmClientPage;