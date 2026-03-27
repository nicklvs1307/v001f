import React, { useState, useEffect, useMemo, useCallback } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Fade from '@mui/material/Fade';
import { ThemeProvider } from '@mui/material/styles';
import { useParams, useNavigate } from 'react-router-dom';
import clientService from '../services/clientService';
import publicSurveyService from '../services/publicSurveyService';
import getDynamicTheme from '../getDynamicTheme';

const isValidCPF = (cpf) => {
    const digits = cpf.replace(/\D/g, '');
    if (digits.length !== 11) return false;
    if (/^(\d)\1+$/.test(digits)) return false;

    let sum = 0;
    for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i);
    let remainder = (sum * 10) % 11;
    if (remainder === 10) remainder = 0;
    if (remainder !== parseInt(digits[9])) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) sum += parseInt(digits[i]) * (11 - i);
    remainder = (sum * 10) % 11;
    if (remainder === 10) remainder = 0;
    return remainder === parseInt(digits[10]);
};

const loadingBoxSx = { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' };

const ClientRegistrationPage = () => {
    const { tenantId, pesquisaId } = useParams();
    const [tenant, setTenant] = useState(null);
    const [survey, setSurvey] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const controller = new AbortController();

        if (!tenantId) {
            setError("ID do restaurante não encontrado na URL.");
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            try {
                const [tenantData, surveyData] = await Promise.all([
                    publicSurveyService.getPublicTenantById(tenantId),
                    pesquisaId ? publicSurveyService.getPublicSurveyById(pesquisaId) : Promise.resolve(null)
                ]);
                if (controller.signal.aborted) return;
                setTenant(tenantData);
                setSurvey(surveyData);
            } catch (err) {
                if (controller.signal.aborted) return;
                setError("Não foi possível carregar as informações.");
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        };

        fetchData();
        return () => controller.abort();
    }, [tenantId, pesquisaId]);

    const dynamicTheme = useMemo(() => {
        if (!tenant) return null;
        return getDynamicTheme({ primaryColor: tenant.primaryColor, secondaryColor: tenant.secondaryColor });
    }, [tenant]);

    if (loading) return <Box sx={loadingBoxSx}><CircularProgress /></Box>;
    if (error) return <Box sx={loadingBoxSx}><Alert severity="error">{error}</Alert></Box>;
    if (!dynamicTheme) return <Box sx={loadingBoxSx}><Alert severity="error">Erro ao carregar tema.</Alert></Box>;

    return (
        <ThemeProvider theme={dynamicTheme}>
            <RegistrationFormComponent tenant={tenant} survey={survey} />
        </ThemeProvider>
    );
};

const RegistrationFormComponent = ({ tenant, survey }) => {
    const { tenantId, pesquisaId } = useParams();
    const navigate = useNavigate();

    const [clientData, setClientData] = useState({ name: '', email: '', phone: '', birthDate: '', gender: '', cpf: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setClientData(prev => ({ ...prev, [name]: value }));
        setFieldErrors(prev => prev[name] ? { ...prev, [name]: '' } : prev);
    }, []);

    const handleCpfChange = useCallback((e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 11) value = value.slice(0, 11);
        if (value.length > 9) value = `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6, 9)}-${value.slice(9)}`;
        else if (value.length > 6) value = `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6)}`;
        else if (value.length > 3) value = `${value.slice(0, 3)}.${value.slice(3)}`;
        setClientData(prev => ({ ...prev, cpf: value }));
        setFieldErrors(prev => prev.cpf ? { ...prev, cpf: '' } : prev);
    }, []);

    const handleDateChange = useCallback((e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 8) value = value.slice(0, 8);
        if (value.length > 4) value = `${value.slice(0, 2)}/${value.slice(2, 4)}/${value.slice(4)}`;
        else if (value.length > 2) value = `${value.slice(0, 2)}/${value.slice(2)}`;
        setClientData(prev => ({ ...prev, birthDate: value }));
        setFieldErrors(prev => prev.birthDate ? { ...prev, birthDate: '' } : prev);
    }, []);

    const handlePhoneChange = useCallback((e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 11) value = value.slice(0, 11);
        if (value.length > 10) value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
        else if (value.length > 6) value = `(${value.slice(0, 2)}) ${value.slice(2, 6)}-${value.slice(6)}`;
        else if (value.length > 2) value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
        else if (value.length > 0) value = `(${value}`;
        setClientData(prev => ({ ...prev, phone: value }));
        setFieldErrors(prev => prev.phone ? { ...prev, phone: '' } : prev);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setFieldErrors({});

        if (survey?.askForCpf && clientData.cpf && !isValidCPF(clientData.cpf)) {
            setFieldErrors({ cpf: 'CPF inválido. Verifique os dígitos.' });
            setError("Por favor, verifique os campos destacados.");
            setLoading(false);
            return;
        }

        try {
            let storedState = null;
            try { storedState = sessionStorage.getItem('surveyState'); } catch {}

            if (!storedState) {
                throw new Error("Estado da pesquisa não encontrado. Por favor, tente novamente.");
            }
            const surveyState = JSON.parse(storedState);

            const response = await clientService.registerClient({
                ...clientData, tenantId, pesquisaId,
                respondentSessionId: surveyState.respondentSessionId,
            });

            try {
                localStorage.setItem('clientPhone', clientData.phone);
                sessionStorage.removeItem('surveyState');
            } catch {}

            navigate(`/roleta/${tenantId}/${pesquisaId}/${response.client.id}`);
        } catch (err) {
            const status = err.response?.status;
            const data = err.response?.data;

            if (status === 400 && data?.errors) {
                setFieldErrors(data.errors);
                setError("Por favor, verifique os campos destacados.");
            } else if (status === 409) {
                const errorMessage = data?.message || '';
                if (errorMessage.toLowerCase().includes('email')) {
                    setFieldErrors({ email: "Este e-mail já está em uso." });
                } else if (errorMessage.toLowerCase().includes('whatsapp') || errorMessage.toLowerCase().includes('telefone')) {
                    setFieldErrors({ phone: "Este número já possui cadastro." });
                    setError("Este número de telefone já possui cadastro. Volte e escolha 'Já tenho cadastro'.");
                } else {
                    setError("Já existe um cadastro com estes dados.");
                }
            } else {
                setError(data?.message || err.message || 'Erro ao registrar cliente.');
            }
        } finally {
            setLoading(false);
        }
    };

    const primaryColor = '#FC4C35';
    const secondaryColor = '#1EBFAE';

    const inputSx = {
        '& .MuiOutlinedInput-root': {
            borderRadius: '12px', backgroundColor: '#f9f9f9',
            '& fieldset': { borderColor: '#e0e0e0' },
        },
        mb: 2
    };

    return (
        <Box sx={{
            background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
            minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center',
            p: { xs: 1, sm: 2 }
        }}>
            <Fade in={true} timeout={600}>
                <Paper elevation={10} sx={{ borderRadius: '25px', overflow: 'hidden', maxWidth: '500px', width: '100%', margin: '0 16px' }}>
                    <Box sx={{
                        background: `linear-gradient(135deg, ${secondaryColor} 0%, ${primaryColor} 100%)`,
                        padding: { xs: '30px 20px', sm: '40px' }, textAlign: 'center', color: 'white'
                    }}>
                        {tenant?.logoUrl && (
                            <Box sx={{
                                width: { xs: 80, sm: 100 }, height: { xs: 80, sm: 100 },
                                borderRadius: '50%', backgroundColor: 'white',
                                margin: '0 auto 15px', display: 'flex', justifyContent: 'center', alignItems: 'center',
                                boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)', border: '4px solid rgba(255, 255, 255, 0.3)'
                            }}>
                                <img src={`${process.env.REACT_APP_API_URL}${tenant.logoUrl}`} alt={`${tenant.name || 'Empresa'} logo`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
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
                        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '10px' }} role="alert">{error}</Alert>}

                        <TextField margin="normal" required fullWidth id="name" label="Nome Completo" name="name" autoComplete="name" autoFocus value={clientData.name} onChange={handleChange} error={!!fieldErrors.name} helperText={fieldErrors.name} sx={inputSx} />
                        <TextField margin="normal" fullWidth id="email" label="Endereço de Email (Opcional)" name="email" autoComplete="email" value={clientData.email} onChange={handleChange} error={!!fieldErrors.email} helperText={fieldErrors.email} sx={inputSx} />
                        {survey?.askForCpf && (
                            <TextField margin="normal" required={survey.requireCpf} fullWidth id="cpf" label={survey.requireCpf ? "CPF (Obrigatório)" : "CPF (Opcional)"} name="cpf" value={clientData.cpf} onChange={handleCpfChange} inputMode="numeric" error={!!fieldErrors.cpf} helperText={fieldErrors.cpf} sx={inputSx} />
                        )}
                        <TextField margin="normal" required fullWidth id="phone" label="Telefone (com DDD)" name="phone" autoComplete="tel" value={clientData.phone} onChange={handlePhoneChange} inputMode="numeric" error={!!fieldErrors.phone} helperText={fieldErrors.phone} sx={inputSx} />
                        <TextField margin="normal" required fullWidth id="birthDate" label="Data de Nascimento" name="birthDate" type="text" placeholder="DD/MM/AAAA" value={clientData.birthDate} onChange={handleDateChange} inputMode="numeric" error={!!fieldErrors.birthDate} helperText={fieldErrors.birthDate} sx={inputSx} />

                        <FormControl fullWidth margin="normal" error={!!fieldErrors.gender} sx={inputSx}>
                            <InputLabel id="gender-label">Gênero</InputLabel>
                            <Select labelId="gender-label" id="gender" name="gender" value={clientData.gender} label="Gênero" onChange={handleChange}>
                                <MenuItem value="Masculino">Masculino</MenuItem>
                                <MenuItem value="Feminino">Feminino</MenuItem>
                                <MenuItem value="Prefiro não responder">Prefiro não responder</MenuItem>
                            </Select>
                        </FormControl>

                        <Button type="submit" fullWidth variant="contained" disabled={loading} sx={{
                            mt: 2, background: `linear-gradient(135deg, ${secondaryColor} 0%, ${primaryColor} 100%)`,
                            color: 'white', padding: '16px 0', borderRadius: '50px', fontWeight: 700,
                            fontSize: '1.1rem', textTransform: 'none', boxShadow: '0 8px 15px rgba(0,0,0,0.1)',
                            '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 12px 20px rgba(0, 0, 0, 0.2)' }
                        }}>
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Cadastrar e Girar Roleta'}
                        </Button>
                    </Box>
                </Paper>
            </Fade>
        </Box>
    );
};

export default ClientRegistrationPage;
