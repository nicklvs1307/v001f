import React, { useState, useEffect } from 'react';
import { TextField, Button, Typography, Box, CircularProgress, Alert, Paper } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import clientService from '../services/clientService';
import publicSurveyService from '../services/publicSurveyService';
import { ThemeProvider, useTheme } from '@mui/material/styles';
import getDynamicTheme from '../theme';

// Wrapper Component: Fetches data and provides theme
const ClientRegistrationPage = () => {
    const { tenantId } = useParams();
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
            <RegistrationFormComponent tenant={tenant} />
        </ThemeProvider>
    );
};

// UI Component: Renders the form using the provided theme
const RegistrationFormComponent = ({ tenant }) => {
    const { tenantId, pesquisaId } = useParams();
    const navigate = useNavigate();
    const theme = useTheme(); // Now uses the correct, dynamic theme

    const [clientData, setClientData] = useState({ name: '', email: '', phone: '', birthDate: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setClientData({ ...clientData, [e.target.name]: e.target.value });
    };

    const handleDateChange = (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 8) {
            value = value.slice(0, 8);
        }
    
        if (value.length > 4) {
            value = `${value.slice(0, 2)}/${value.slice(2, 4)}/${value.slice(4)}`;
        } else if (value.length > 2) {
            value = `${value.slice(0, 2)}/${value.slice(2)}`;
        }
    
        setClientData({ ...clientData, birthDate: value });
    };

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
    
        setClientData({ ...clientData, phone: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const storedState = sessionStorage.getItem('surveyState');
            if (!storedState) {
                throw new Error("Estado da pesquisa não encontrado. Por favor, tente novamente.");
            }
            const surveyState = JSON.parse(storedState);

            const response = await clientService.registerClient({
                ...clientData,
                tenantId,
                pesquisaId,
                respondentSessionId: surveyState.respondentSessionId,
            });
            localStorage.setItem('clientPhone', clientData.phone);
            sessionStorage.removeItem('surveyState');
            navigate(`/roleta/${tenantId}/${pesquisaId}/${response.client.id}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Erro ao registrar cliente.');
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
                        Participe e Ganhe Prêmios!
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                        Preencha seus dados para participar da roleta de prêmios!
                    </Typography>
                </Box>

                <Box component="form" onSubmit={handleSubmit} sx={{ p: { xs: 2, sm: 4 } }}>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    <TextField margin="normal" required fullWidth id="name" label="Nome Completo" name="name" autoComplete="name" autoFocus value={clientData.name} onChange={handleChange} />
                    <TextField margin="normal" fullWidth id="email" label="Endereço de Email (Opcional)" name="email" autoComplete="email" value={clientData.email} onChange={handleChange} />
                    <TextField margin="normal" required fullWidth id="phone" label="Telefone (com DDD)" name="phone" autoComplete="tel" value={clientData.phone} onChange={handlePhoneChange} inputMode="numeric" />
                    <TextField margin="normal" required fullWidth id="birthDate" label="Data de Nascimento" name="birthDate" type="text" placeholder="DD/MM/AAAA" value={clientData.birthDate} onChange={handleDateChange} inputMode="numeric" />
                    <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, ...buttonStyle }} disabled={loading}>
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Cadastrar e Girar a Roleta'}
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};

export default ClientRegistrationPage;