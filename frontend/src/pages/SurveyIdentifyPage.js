import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Grow from '@mui/material/Grow';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LoginIcon from '@mui/icons-material/Login';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate, useParams } from 'react-router-dom';
import publicSurveyService from '../services/publicSurveyService';
import { ThemeProvider } from '@mui/material/styles';
import getDynamicTheme from '../getDynamicTheme';

const loadingBoxSx = { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' };

const SurveyIdentifyPage = () => {
    const navigate = useNavigate();
    const { tenantId, pesquisaId } = useParams();
    const [tenant, setTenant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' });

    useEffect(() => {
        const controller = new AbortController();

        publicSurveyService.getPublicTenantById(tenantId, controller.signal)
            .then(tenantData => {
                if (!controller.signal.aborted) setTenant(tenantData);
            })
            .catch(() => {})
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });

        return () => controller.abort();
    }, [tenantId]);

    const showSnackbar = useCallback((message, severity = 'error') => {
        setSnackbar({ open: true, message, severity });
    }, []);

    const handleRegister = useCallback(() => {
        navigate(`/cadastro-cliente/${tenantId}/${pesquisaId}`);
    }, [navigate, tenantId, pesquisaId]);

    const handleIdentify = useCallback(() => {
        let storedState = null;
        try {
            storedState = sessionStorage.getItem('surveyState');
        } catch (e) {
            console.warn("Erro ao acessar sessionStorage:", e);
        }

        if (!storedState) {
            showSnackbar("Ocorreu um erro ao recuperar os dados da sua pesquisa. Por favor, tente novamente ou cadastre-se como novo cliente.");
            return;
        }

        try {
            navigate(`/identificacao-cliente/${tenantId}/${pesquisaId}`);
        } catch (e) {
            console.error("Erro ao processar dados da sessão:", e);
            showSnackbar("Sua sessão expirou ou é inválida. Por favor, recomece a pesquisa.");
        }
    }, [navigate, tenantId, pesquisaId, showSnackbar]);

    const handleOpenModal = useCallback(() => setOpen(true), []);
    const handleCloseModal = useCallback((proceed) => {
        setOpen(false);
        if (proceed) navigate('/agradecimento', { state: { tenantId, pesquisaId } });
    }, [navigate, tenantId, pesquisaId]);
    const handleRegisterFromModal = useCallback(() => {
        setOpen(false);
        handleRegister();
    }, [handleRegister]);

    const dynamicTheme = useMemo(() => {
        if (!tenant) return null;
        return getDynamicTheme({ primaryColor: tenant.primaryColor, secondaryColor: tenant.secondaryColor });
    }, [tenant]);

    if (loading) return <Box sx={loadingBoxSx}><CircularProgress /></Box>;
    if (!dynamicTheme) return <Box sx={loadingBoxSx}><Alert severity="error">Erro ao carregar tema.</Alert></Box>;

    const primaryColor = tenant?.primaryColor || '#6a11cb';
    const secondaryColor = tenant?.secondaryColor || '#2575fc';

    return (
        <ThemeProvider theme={dynamicTheme}>
            <Box sx={{
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2
            }}>
            <Grow in={true} timeout={800}>
                <Paper elevation={20} sx={{ borderRadius: '25px', overflow: 'hidden', maxWidth: '480px', width: '100%' }}>
                    <Box sx={{
                        background: `linear-gradient(135deg, ${secondaryColor} 0%, ${primaryColor} 100%)`,
                        padding: '40px 20px', textAlign: 'center', color: 'white'
                    }}>
                        {tenant?.logoUrl && (
                            <Box sx={{
                                width: { xs: 90, sm: 110 }, height: { xs: 90, sm: 110 },
                                borderRadius: '50%', backgroundColor: 'white',
                                margin: '0 auto 20px', display: 'flex', justifyContent: 'center', alignItems: 'center',
                                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)', border: '4px solid rgba(255, 255, 255, 0.4)'
                            }}>
                                <img src={`${process.env.REACT_APP_API_URL}${tenant.logoUrl}`} alt={`${tenant.name || 'Empresa'} logo`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                            </Box>
                        )}
                        <Typography variant="h5" component="h1" sx={{ mb: 1, fontWeight: 800 }}>Quase lá!</Typography>
                        <Typography variant="body1" sx={{ opacity: 0.9 }}>Identifique-se para garantir seu giro na roleta.</Typography>
                    </Box>

                    <Box sx={{ p: { xs: 3, sm: 5 }, textAlign: 'center' }}>
                        <Grow in={true} timeout={1000}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                                <Button
                                    variant="contained"
                                    onClick={handleRegister}
                                    fullWidth
                                    startIcon={<PersonAddIcon sx={{ fontSize: 30 }} />}
                                    endIcon={<ArrowForwardIcon />}
                                    sx={{
                                        padding: '16px 24px', borderRadius: '16px', textTransform: 'none',
                                        fontSize: '1.2rem', fontWeight: 700,
                                        boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
                                        background: `linear-gradient(45deg, ${secondaryColor}, ${primaryColor})`,
                                        color: 'white',
                                        transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                                        '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 25px rgba(0,0,0,0.15)' }
                                    }}
                                >
                                    <Box sx={{ textAlign: 'left', flex: 1 }}>
                                        <Typography variant="button" display="block" sx={{ fontWeight: 800 }}>Quero me Cadastrar</Typography>
                                        <Typography variant="caption" display="block" sx={{ opacity: 0.9, fontWeight: 400, textTransform: 'none' }}>É rápido, só 15 segundos!</Typography>
                                    </Box>
                                </Button>

                                <Button
                                    variant="outlined"
                                    onClick={handleIdentify}
                                    fullWidth
                                    startIcon={<LoginIcon />}
                                    sx={{
                                        padding: '16px 24px', borderRadius: '16px', textTransform: 'none',
                                        fontSize: '1.1rem', fontWeight: 700,
                                        boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
                                        borderColor: '#e0e0e0', color: '#555',
                                        transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                                        '&:hover': {
                                            transform: 'translateY(-4px)', borderColor: primaryColor,
                                            backgroundColor: 'rgba(0,0,0,0.02)', boxShadow: '0 12px 25px rgba(0,0,0,0.15)'
                                        }
                                    }}
                                >
                                    <Box sx={{ textAlign: 'left', flex: 1 }}>
                                        <Typography variant="button" display="block" sx={{ fontWeight: 700 }}>Já tenho Cadastro</Typography>
                                    </Box>
                                </Button>
                            </Box>
                        </Grow>

                        <Box sx={{ mt: 4 }}>
                            <Button
                                variant="text"
                                onClick={handleOpenModal}
                                sx={{ color: '#777', textTransform: 'none', fontSize: '0.9rem', '&:hover': { color: '#555', background: 'transparent' } }}
                            >
                                Continuar sem cadastro e perder prêmio
                            </Button>
                        </Box>
                    </Box>
                </Paper>
            </Grow>

            <Dialog
                open={open}
                onClose={() => handleCloseModal(false)}
                aria-labelledby="confirm-dialog-title"
                aria-describedby="confirm-dialog-description"
                PaperProps={{ sx: { borderRadius: "20px", textAlign: 'center', p: 1 } }}
            >
                <DialogTitle id="confirm-dialog-title" sx={{ fontWeight: 800, fontSize: '1.4rem', pt: 3 }}>
                    <Box sx={{ bgcolor: '#fff3cd', width: 80, height: 80, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                        <CardGiftcardIcon sx={{ fontSize: 40, color: '#d9a406' }} />
                    </Box>
                    Tem certeza?
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="confirm-dialog-description" sx={{ color: '#555' }}>
                        Sem o cadastro, você <strong>não poderá resgatar</strong> o prêmio que ganhar na roleta.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', flexDirection: 'column', gap: 1.5, p: 3 }}>
                    <Button
                        onClick={handleRegisterFromModal}
                        variant="contained"
                        fullWidth
                        sx={{ borderRadius: '50px', py: 1.5, fontWeight: 700, background: `linear-gradient(45deg, ${secondaryColor}, ${primaryColor})` }}
                    >
                        Voltar e me Cadastrar
                    </Button>
                    <Button
                        onClick={() => handleCloseModal(true)}
                        fullWidth
                        sx={{ color: '#777', borderRadius: '50px' }}
                    >
                        Continuar sem prêmio
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
        </ThemeProvider>
    );
};

export default SurveyIdentifyPage;
