import React, { useState, useEffect } from 'react';
import { TextField, Button, Typography, Box, CircularProgress, Alert, Paper, FormControl, InputLabel, Select, MenuItem, Fade } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import clientService from '../services/clientService';
import publicSurveyService from '../services/publicSurveyService';
import { ThemeProvider, useTheme } from '@mui/material/styles';
import getDynamicTheme from '../getDynamicTheme';

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
                    const theme = getDynamicTheme({ primaryColor: tenantData.primaryColor, secondaryColor: tenantData.secondaryColor });
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

    const [clientData, setClientData] = useState({ name: '', email: '', phone: '', birthDate: '', gender: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});

    const handleChange = (e) => {
        setClientData({ ...clientData, [e.target.name]: e.target.value });
        // Limpar erro do campo ao digitar
        if (fieldErrors[e.target.name]) {
            setFieldErrors({ ...fieldErrors, [e.target.name]: '' });
        }
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
        if (fieldErrors.birthDate) {
            setFieldErrors({ ...fieldErrors, birthDate: '' });
        }
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
        if (fieldErrors.phone) {
            setFieldErrors({ ...fieldErrors, phone: '' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setFieldErrors({});

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
            console.error("Erro no registro:", err);
            const status = err.response?.status;
            const data = err.response?.data;

            if (status === 400 && data?.errors) {
                // Erros de validação do backend (agora retornam um objeto { campo: msg })
                setFieldErrors(data.errors);
                setError("Por favor, verifique os campos destacados.");
            } else if (status === 409) {
                // Erros de duplicidade
                const errorMessage = data?.message || '';
                if (errorMessage.toLowerCase().includes('email')) {
                    setFieldErrors({ email: "Este e-mail já está em uso." });
                } else if (errorMessage.toLowerCase().includes('whatsapp') || errorMessage.toLowerCase().includes('telefone')) {
                    setFieldErrors({ phone: "Este número já possui cadastro." });
                    setError("Este número de telefone já possui cadastro. Volte e escolha a opção 'Já tenho cadastro'.");
                } else {
                    setError("Já existe um cadastro com estes dados.");
                }
            } else {
                setError(data?.message || 'Erro ao registrar cliente.');
            }
        } finally {
            setLoading(false);
        }
    };

    const headerStyle = {
        background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 100%)`,
        padding: { xs: '30px 20px', sm: '40px' },
        textAlign: 'center',
        color: 'white'
    };

    const buttonStyle = {
        background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 100%)`,
        color: 'white',
        padding: '16px 0',
        borderRadius: '50px',
        fontWeight: 700,
        fontSize: '1.1rem',
        textTransform: 'none',
        boxShadow: '0 8px 15px rgba(0,0,0,0.1)',
        '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 12px 20px rgba(0, 0, 0, 0.2)'
        }
    };

    // Estilo moderno para inputs
    const inputSx = {
        '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            backgroundColor: '#f9f9f9',
            '& fieldset': { borderColor: '#e0e0e0' },
            '&:hover fieldset': { borderColor: theme.palette.primary.light },
            '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main },
        },
        mb: 2
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
            <Fade in={true} timeout={600}>
                <Paper elevation={10} sx={{ borderRadius: '25px', overflow: 'hidden', maxWidth: '500px', width: '100%', margin: '0 16px' }}>
                    <Box sx={headerStyle}>
                        {tenant?.logoUrl && (
                             <Box sx={{
                                width: { xs: 80, sm: 100 }, 
                                height: { xs: 80, sm: 100 }, 
                                borderRadius: '50%', backgroundColor: 'white',
                                margin: '0 auto 15px', display: 'flex', justifyContent: 'center', alignItems: 'center',
                                boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)', border: '4px solid rgba(255, 255, 255, 0.3)'
                            }}>
                                <img src={`${process.env.REACT_APP_API_URL}${tenant.logoUrl}`} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                            </Box>
                        )}
                        <Typography variant="h5" component="h1" sx={{ mb: 1, fontWeight: 800, fontSize: { xs: '1.4rem', sm: '1.8rem' } }}>
                            Participe e Ganhe!
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.95rem' }}>
                            Preencha rapidinho para liberar a roleta.
                        </Typography>
                    </Box>

                    <Box component="form" onSubmit={handleSubmit} sx={{ p: { xs: 3, sm: 5 } }}>
                        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '10px' }}>{error}</Alert>}
                        
                        <TextField 
                            margin="normal" 
                            required 
                            fullWidth 
                            id="name" 
                            label="Nome Completo" 
                            name="name" 
                            autoComplete="name" 
                            autoFocus 
                            value={clientData.name} 
                            onChange={handleChange} 
                            error={!!fieldErrors.name}
                            helperText={fieldErrors.name}
                            sx={inputSx} 
                        />
                        <TextField 
                            margin="normal" 
                            fullWidth 
                            id="email" 
                            label="Endereço de Email (Opcional)" 
                            name="email" 
                            autoComplete="email" 
                            value={clientData.email} 
                            onChange={handleChange} 
                            error={!!fieldErrors.email}
                            helperText={fieldErrors.email}
                            sx={inputSx} 
                        />
                        <TextField 
                            margin="normal" 
                            required 
                            fullWidth 
                            id="phone" 
                            label="Telefone (com DDD)" 
                            name="phone" 
                            autoComplete="tel" 
                            value={clientData.phone} 
                            onChange={handlePhoneChange} 
                            inputMode="numeric" 
                            error={!!fieldErrors.phone}
                            helperText={fieldErrors.phone}
                            sx={inputSx} 
                        />
                        <TextField 
                            margin="normal" 
                            required 
                            fullWidth 
                            id="birthDate" 
                            label="Data de Nascimento" 
                            name="birthDate" 
                            type="text" 
                            placeholder="DD/MM/AAAA" 
                            value={clientData.birthDate} 
                            onChange={handleDateChange} 
                            inputMode="numeric" 
                            error={!!fieldErrors.birthDate}
                            helperText={fieldErrors.birthDate}
                            sx={inputSx} 
                        />
                        
                        <FormControl fullWidth margin="normal" error={!!fieldErrors.gender} sx={inputSx}>
                            <InputLabel id="gender-label">Gênero</InputLabel>
                            <Select
                                labelId="gender-label"
                                id="gender"
                                name="gender"
                                value={clientData.gender}
                                label="Gênero"
                                onChange={handleChange}
                            >
                                <MenuItem value="Masculino">Masculino</MenuItem>
                                <MenuItem value="Feminino">Feminino</MenuItem>
                                <MenuItem value="Prefiro não responder">Prefiro não responder</MenuItem>
                            </Select>
                            {/* Opcional: mostrar erro do gênero também se necessário, usando FormHelperText do MUI */}
                        </FormControl>

                        <Button type="submit" fullWidth variant="contained" sx={{ mt: 2, ...buttonStyle }} disabled={loading}>
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Cadastrar e Girar Roleta'}
                        </Button>
                    </Box>
                </Paper>
            </Fade>
        </Box>
    );
};

export default ClientRegistrationPage;