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
    Alert
} from '@mui/material';
import publicSurveyService from '../services/publicSurveyService';
import { ThemeProvider, useTheme } from '@mui/material/styles';
import getDynamicTheme from '../getDynamicTheme';

// Wrapper Component: Fetches data and provides theme
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
                    const theme = getDynamicTheme(tenantData.primaryColor, tenantData.secondaryColor);
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
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Alert severity="error">{error}</Alert>
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
    const { surveyId, answers, tenantId, atendenteId, respondentSessionId } = location.state || {};
    const { pesquisaId } = useParams();
    const theme = useTheme();

    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handlePhoneChange = (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 11) {
            value = value.slice(0, 11);
        }
    
        if (value.length > 10) {
            value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
        } else if (value.length > 6) {
            value = `(${value.slice(0, 2)}) ${value.slice(2, 6)}-${value.slice(6)}`;
        } else if (value.length > 2) {
            value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
        } else if (value.length > 0) {
            value = `(${value}`;
        }
    
        setPhone(value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const surveyIdentifier = surveyId || pesquisaId;

        if (!surveyIdentifier || !answers) {
            setError("Dados da pesquisa não encontrados. Por favor, tente novamente.");
            setLoading(false);
            return;
        }

        try {
            const response = await publicSurveyService.submitSurveyWithClient({
                surveyId: surveyIdentifier,
                respostas: answers,
                atendenteId,
                client: { phone },
                tenantId,
                respondentSessionId, // Adicionado para manter a sessão
            });
            localStorage.setItem('clientPhone', phone);
            navigate(`/roleta/${tenantId}/${surveyIdentifier}/${response.clienteId}`);
        } catch (err) {
            if (err.response?.status === 404) {
                setError("Nenhum cliente encontrado com este telefone. Verifique o número digitado ou realize um novo cadastro.");
            } else {
                setError(err.response?.data?.message || "Ocorreu um erro ao enviar suas informações.");
            }
        } finally {
            setLoading(false);
        }
    };

    const headerStyle = {
        background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 100%)`,
        padding: { xs: '20px', sm: '30px' },
        textAlign: 'center',
        color: 'white'
    };

    const buttonStyle = {
        background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 100%)`,
        color: 'white',
        padding: '12px 0',
        '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)'
        }
    };

    return (
        <Box sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            minHeight: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            p: { xs: 1, sm: 2 }
        }}>
            <Paper elevation={10} sx={{ borderRadius: '20px', overflow: 'hidden', maxWidth: '500px', width: '100%', margin: '0 16px' }}>
                <Box sx={headerStyle}>
                    {tenant?.logoUrl && (
                         <Box sx={{
                            width: { xs: 80, sm: 100 }, 
                            height: { xs: 80, sm: 100 }, 
                            borderRadius: '50%', backgroundColor: 'white',
                            margin: '0 auto 15px', display: 'flex', justifyContent: 'center', alignItems: 'center',
                            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)', border: '5px solid rgba(255, 255, 255, 0.3)'
                        }}>
                            <img src={`${process.env.REACT_APP_API_URL}${tenant.logoUrl}`} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                        </Box>
                    )}
                    <Typography variant="h5" component="h1" sx={{ mb: 1, fontWeight: 'bold', fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>
                        Identifique-se para Continuar
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                        Digite seu número de telefone para prosseguir.
                    </Typography>
                </Box>

                <Box component="form" onSubmit={handleSubmit} sx={{ p: { xs: 2, sm: 4 } }}>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    <TextField 
                        margin="normal" 
                        required 
                        fullWidth 
                        id="phone" 
                        label="Telefone (com DDD)" 
                        name="phone" 
                        autoComplete="tel" 
                        autoFocus
                        value={phone} 
                        onChange={handlePhoneChange} 
                        inputMode="numeric" 
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        disabled={loading}
                        sx={{ mt: 3, ...buttonStyle }}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Finalizar Avaliação'}
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};

export default ClientIdentificationPage;