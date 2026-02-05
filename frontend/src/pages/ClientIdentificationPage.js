import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Box,
    CircularProgress,
    Alert,
    Fade,
    Avatar,
    InputAdornment
} from '@mui/material';
import { 
    Phone as PhoneIcon, 
    ArrowForward as ArrowForwardIcon, 
    VpnKey as LoginIcon 
} from '@mui/icons-material';
import publicSurveyService from '../services/publicSurveyService';
import { ThemeProvider, useTheme } from '@mui/material/styles';
import getDynamicTheme from '../getDynamicTheme';

const ClientIdentificationPage = () => {
    const { tenantId, pesquisaId } = useParams();
    const [tenant, setTenant] = useState(null);
    const [dynamicTheme, setDynamicTheme] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchTenant = async () => {
            if (tenantId) {
                try {
                    const tenantData = await publicSurveyService.getPublicTenantById(tenantId);
                    setTenant(tenantData);
                    const theme = getDynamicTheme({ 
                        primaryColor: tenantData.primaryColor, 
                        secondaryColor: tenantData.secondaryColor 
                    });
                    setDynamicTheme(theme);
                } catch (error) {
                    console.error("Erro ao buscar tenant:", error);
                    setError("Não foi possível carregar as informações do restaurante.");
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
                setError("ID do restaurante não encontrado na URL.");
            }
        };
        fetchTenant();
    }, [tenantId]);

    if (loading || !dynamicTheme) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#f5f5f5' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <ThemeProvider theme={dynamicTheme}>
            <IdentificationFormComponent tenant={tenant} />
        </ThemeProvider>
    );
};

const IdentificationFormComponent = ({ tenant }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { surveyId, tenantId, respondentSessionId } = location.state || {};
    const { pesquisaId } = useParams();
    const theme = useTheme();

    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handlePhoneChange = (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 11) value = value.slice(0, 11);
        if (value.length > 10) value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
        else if (value.length > 6) value = `(${value.slice(0, 2)}) ${value.slice(2, 6)}-${value.slice(6)}`;
        else if (value.length > 2) value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
        else if (value.length > 0) value = `(${value}`;
        setPhone(value);
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        setError(null);

        const surveyIdentifier = surveyId || pesquisaId;

        if (!surveyIdentifier || !respondentSessionId) {
            setError("Sessão da pesquisa não encontrada. Por favor, volte e tente novamente.");
            setLoading(false);
            return;
        }

        try {
            const response = await publicSurveyService.submitSurveyWithClient({
                surveyId: surveyIdentifier,
                respondentSessionId,
                client: { phone }
            });
            localStorage.setItem('clientPhone', phone);
            navigate(`/roleta/${tenantId}/${surveyIdentifier}/${response.clienteId}`);
        } catch (err) {
            console.error("Erro na identificação:", err);
            if (err.response?.status === 404) {
                setError("Nenhum cliente encontrado com este telefone. Verifique o número digitado ou realize um novo cadastro.");
            } else {
                setError(err.response?.data?.message || "Ocorreu um erro ao verificar seu cadastro.");
            }
        } finally {
            setLoading(false);
        }
    };

    const primaryColor = theme.palette.primary.main;
    const secondaryColor = theme.palette.secondary.main;

    return (
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
                                <LoginIcon sx={{ fontSize: 40 }} />
                            </Avatar>
                        </Box>

                        <Typography variant="h5" fontWeight="800" gutterBottom sx={{ color: '#222' }}>
                            Bem-vindo de volta!
                        </Typography>
                        
                        <Typography variant="body1" sx={{ mb: 4, color: '#666' }}>
                            Digite seu telefone cadastrado para continuar.
                        </Typography>

                        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px', textAlign: 'left' }}>{error}</Alert>}

                        <Box component="form" onSubmit={handleSubmit}>
                            <TextField 
                                fullWidth
                                placeholder="(00) 00000-0000"
                                label="Seu Telefone"
                                value={phone} 
                                onChange={handlePhoneChange}
                                inputMode="numeric"
                                required
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <PhoneIcon color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{ 
                                    mb: 4,
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '16px',
                                        backgroundColor: '#fcfcfc'
                                    }
                                }}
                            />

                            <Button 
                                type="submit"
                                variant="contained" 
                                size="large" 
                                fullWidth
                                endIcon={!loading && <ArrowForwardIcon />}
                                disabled={loading || phone.length < 14}
                                sx={{ 
                                    py: 1.5,
                                    fontSize: '1.1rem',
                                    boxShadow: `0 8px 20px ${primaryColor}40`,
                                    '&:hover': { transform: 'translateY(-2px)' }
                                }}
                            >
                                {loading ? <CircularProgress size={26} color="inherit" /> : 'Confirmar e Continuar'}
                            </Button>
                            
                            <Button 
                                onClick={() => navigate(-1)}
                                fullWidth
                                sx={{ mt: 2, color: '#888', textTransform: 'none' }}
                            >
                                Voltar
                            </Button>
                        </Box>

                        {tenant?.logoUrl && (
                            <Box sx={{ mt: 4, opacity: 0.6, display: 'flex', justifyContent: 'center' }}>
                                <img 
                                    src={`${process.env.REACT_APP_API_URL}${tenant.logoUrl}`} 
                                    alt="Logo" 
                                    style={{ height: '30px', filter: 'grayscale(100%)' }} 
                                />
                            </Box>
                        )}
                    </Paper>
                </Fade>
            </Container>
        </Box>
    );
};

export default ClientIdentificationPage;