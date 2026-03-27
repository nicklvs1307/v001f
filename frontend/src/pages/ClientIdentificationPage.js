import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Fade from '@mui/material/Fade';
import Avatar from '@mui/material/Avatar';
import InputAdornment from '@mui/material/InputAdornment';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import PhoneIcon from '@mui/icons-material/Phone';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import BadgeIcon from '@mui/icons-material/Badge';
import { ThemeProvider } from '@mui/material/styles';
import publicSurveyService from '../services/publicSurveyService';
import getDynamicTheme from '../getDynamicTheme';

const loadingBoxSx = { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#f5f5f5' };

const ClientIdentificationPage = () => {
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
    if (error || !dynamicTheme) return <Box sx={loadingBoxSx}><Alert severity="error">{error || 'Erro ao carregar tema.'}</Alert></Box>;

    return (
        <ThemeProvider theme={dynamicTheme}>
            <IdentificationFormComponent tenant={tenant} survey={survey} />
        </ThemeProvider>
    );
};

const IdentificationFormComponent = ({ tenant, survey }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { surveyId, respondentSessionId } = location.state || {};
    const { pesquisaId, tenantId } = useParams();

    const [tabValue, setTabValue] = useState(0);
    const [phone, setPhone] = useState('');
    const [cpf, setCpf] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const primaryColor = tenant?.primaryColor || '#6a11cb';
    const secondaryColor = tenant?.secondaryColor || '#2575fc';

    const handleTabChange = useCallback((_, newValue) => {
        setTabValue(newValue);
        setError(null);
    }, []);

    const handlePhoneChange = useCallback((e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 11) value = value.slice(0, 11);
        if (value.length > 10) value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
        else if (value.length > 6) value = `(${value.slice(0, 2)}) ${value.slice(2, 6)}-${value.slice(6)}`;
        else if (value.length > 2) value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
        else if (value.length > 0) value = `(${value}`;
        setPhone(value);
    }, []);

    const handleCpfChange = useCallback((e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 11) value = value.slice(0, 11);
        if (value.length > 9) value = `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6, 9)}-${value.slice(9)}`;
        else if (value.length > 6) value = `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6)}`;
        else if (value.length > 3) value = `${value.slice(0, 3)}.${value.slice(3)}`;
        setCpf(value);
    }, []);

    const handleSubmit = useCallback(async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        setError(null);

        const surveyIdentifier = surveyId || pesquisaId;

        if (!surveyIdentifier || !respondentSessionId) {
            setError("Sessão da pesquisa não encontrada. Por favor, volte e tente novamente.");
            setLoading(false);
            return;
        }

        const clientPayload = tabValue === 0 ? { phone } : { cpf };

        try {
            const response = await publicSurveyService.submitSurveyWithClient({
                surveyId: surveyIdentifier,
                respondentSessionId,
                client: clientPayload
            });

            if (tabValue === 0) localStorage.setItem('clientPhone', phone);
            navigate(`/roleta/${tenantId}/${surveyIdentifier}/${response.clienteId}`);
        } catch (err) {
            if (err.response?.status === 404) {
                const tipo = tabValue === 0 ? "telefone" : "CPF";
                setError(`Nenhum cliente encontrado com este ${tipo}. Verifique os dados ou realize um novo cadastro.`);
            } else {
                setError(err.response?.data?.message || "Ocorreu um erro ao verificar seu cadastro.");
            }
        } finally {
            setLoading(false);
        }
    }, [surveyId, pesquisaId, respondentSessionId, tabValue, phone, cpf, tenantId, navigate]);

    const isDisabled = loading || (tabValue === 0 ? phone.length < 14 : cpf.length < 14);

    return (
        <Box sx={{
            background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
            minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2
        }}>
            <Container maxWidth="xs">
                <Fade in={true} timeout={800}>
                    <Paper elevation={10} sx={{
                        p: { xs: 3, sm: 4 }, textAlign: 'center', borderRadius: '24px',
                        boxShadow: '0 15px 35px rgba(0,0,0,0.2)', overflow: 'hidden'
                    }}>
                        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
                            <Avatar sx={{
                                width: 80, height: 80,
                                bgcolor: `${primaryColor}15`, color: primaryColor,
                                border: `2px solid ${primaryColor}`
                            }}>
                                <VpnKeyIcon sx={{ fontSize: 40 }} />
                            </Avatar>
                        </Box>

                        <Typography variant="h5" fontWeight="800" gutterBottom sx={{ color: '#222' }}>
                            Bem-vindo de volta!
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 3, color: '#555' }}>
                            Como você prefere se identificar?
                        </Typography>

                        {survey?.askForCpf && (
                            <Tabs
                                value={tabValue}
                                onChange={handleTabChange}
                                centered
                                sx={{ mb: 4, '& .MuiTabs-indicator': { height: 3, borderRadius: '3px' } }}
                            >
                                <Tab icon={<PhoneIcon />} label="Telefone" sx={{ textTransform: 'none', fontWeight: 700 }} />
                                <Tab icon={<BadgeIcon />} label="CPF" sx={{ textTransform: 'none', fontWeight: 700 }} />
                            </Tabs>
                        )}

                        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px', textAlign: 'left' }} role="alert">{error}</Alert>}

                        <Box component="form" onSubmit={handleSubmit}>
                            {tabValue === 0 ? (
                                <TextField
                                    fullWidth placeholder="(00) 00000-0000" label="Seu Telefone"
                                    value={phone} onChange={handlePhoneChange}
                                    inputMode="numeric" required autoComplete="tel"
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start"><PhoneIcon color="action" /></InputAdornment>,
                                    }}
                                    sx={{ mb: 4, '& .MuiOutlinedInput-root': { borderRadius: '16px', backgroundColor: '#fcfcfc' } }}
                                />
                            ) : (
                                <TextField
                                    fullWidth placeholder="000.000.000-00" label="Seu CPF"
                                    value={cpf} onChange={handleCpfChange}
                                    inputMode="numeric" required autoComplete="off"
                                    InputProps={{
                                        startAdornment: <InputAdornment position="start"><BadgeIcon color="action" /></InputAdornment>,
                                    }}
                                    sx={{ mb: 4, '& .MuiOutlinedInput-root': { borderRadius: '16px', backgroundColor: '#fcfcfc' } }}
                                />
                            )}

                            <Button
                                type="submit" variant="contained" size="large" fullWidth
                                endIcon={!loading && <ArrowForwardIcon />}
                                disabled={isDisabled}
                                aria-busy={loading}
                                sx={{
                                    py: 1.5, fontSize: '1.1rem',
                                    boxShadow: `0 8px 20px ${primaryColor}40`,
                                    '&:hover': { transform: 'translateY(-2px)' }
                                }}
                            >
                                {loading ? <CircularProgress size={26} color="inherit" /> : 'Confirmar e Continuar'}
                            </Button>

                            <Button
                                onClick={() => navigate(-1)}
                                fullWidth
                                sx={{ mt: 2, color: '#666', textTransform: 'none' }}
                            >
                                Voltar
                            </Button>
                        </Box>

                        {tenant?.logoUrl && (
                            <Box sx={{ mt: 4, opacity: 0.6, display: 'flex', justifyContent: 'center' }}>
                                <img
                                    src={`${process.env.REACT_APP_API_URL}${tenant.logoUrl}`}
                                    alt={`${tenant.name || 'Empresa'} logo`}
                                    style={{ height: '30px', filter: 'grayscale(100%)' }}
                                    loading="lazy"
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
