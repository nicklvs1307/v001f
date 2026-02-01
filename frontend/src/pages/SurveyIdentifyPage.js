import React, { useState, useEffect } from 'react';
import { 
    Typography, Box, Button, Paper, CircularProgress,
    Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
    Grow, Fade
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import PersonAddIcon from '@mui/icons-material/PersonAdd'; // Icone Cadastro
import LoginIcon from '@mui/icons-material/Login'; // Icone Login
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'; // Seta
import publicSurveyService from '../services/publicSurveyService';

const SurveyIdentifyPage = () => {
    const navigate = useNavigate();
    const { tenantId, pesquisaId } = useParams();
    const [tenant, setTenant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const fetchTenant = async () => {
            try {
                const tenantData = await publicSurveyService.getPublicTenantById(tenantId);
                setTenant(tenantData);
            } catch (error) {
            } finally {
                setLoading(false);
            }
        };
        fetchTenant();
    }, [tenantId]);

    const handleRegister = () => {
        navigate(`/cadastro-cliente/${tenantId}/${pesquisaId}`);
    };

    const handleIdentify = () => {
        const storedState = sessionStorage.getItem('surveyState');
        if (!storedState) {
            alert("Ocorreu um erro ao recuperar os dados da sua pesquisa. Por favor, tente novamente.");
            return;
        }
        const surveyState = JSON.parse(storedState);
        navigate(`/identificacao-cliente/${tenantId}/${pesquisaId}`, { 
            state: {
                surveyId: pesquisaId,
                answers: surveyState.answers,
                tenantId: surveyState.tenantId,
                atendenteId: surveyState.atendenteId,
                respondentSessionId: surveyState.respondentSessionId
            } 
        });
    };

    const handleOpenModal = () => {
        setOpen(true);
    };

    const handleCloseModal = (proceed) => {
        setOpen(false);
        if (proceed) {
            navigate('/agradecimento', { state: { tenantId, pesquisaId } });
        }
    };
    
    const handleRegisterFromModal = () => {
        setOpen(false);
        handleRegister();
    };

    const headerStyle = {
        background: `linear-gradient(135deg, ${tenant?.secondaryColor || '#2575fc'} 0%, ${tenant?.primaryColor || '#6a11cb'} 100%)`,
        padding: '40px 20px',
        textAlign: 'center',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
    };

    // Estilo Base dos Botões Grandes
    const actionButtonStyle = {
        padding: '16px 24px',
        borderRadius: '16px',
        textTransform: 'none',
        fontSize: '1.1rem',
        fontWeight: 700,
        boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'flex-start', // Alinhamento à esquerda para ícone
        gap: 2,
        transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
        '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 25px rgba(0,0,0,0.15)',
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{
            background: `linear-gradient(135deg, ${tenant?.primaryColor || '#6a11cb'} 0%, ${tenant?.secondaryColor || '#2575fc'} 100%)`,
            minHeight: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            p: 2
        }}>
            <Fade in={true} timeout={800}>
                <Paper elevation={20} sx={{ borderRadius: '25px', overflow: 'hidden', maxWidth: '480px', width: '100%' }}>
                    <Box sx={headerStyle}>
                        {tenant?.logoUrl && (
                             <Box sx={{
                                width: { xs: 90, sm: 110 }, 
                                height: { xs: 90, sm: 110 }, 
                                borderRadius: '50%', backgroundColor: 'white',
                                margin: '0 auto 20px', display: 'flex', justifyContent: 'center', alignItems: 'center',
                                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)', border: '4px solid rgba(255, 255, 255, 0.4)'
                            }}>
                                <img src={tenant.logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                            </Box>
                        )}
                        <Typography variant="h5" component="h1" sx={{ mb: 1, fontWeight: 800, letterSpacing: '-0.5px' }}>Quase lá!</Typography>
                        <Typography variant="body1" sx={{ opacity: 0.9 }}>Identifique-se para garantir seu giro na roleta.</Typography>
                    </Box>

                    <Box sx={{ p: { xs: 3, sm: 5 }, textAlign: 'center' }}>
                        
                        <Grow in={true} timeout={1000}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                                {/* Botão Principal: Cadastrar */}
                                <Button 
                                    variant="contained" 
                                    onClick={handleRegister} 
                                    fullWidth
                                    startIcon={<PersonAddIcon sx={{ fontSize: 30 }} />}
                                    endIcon={<ArrowForwardIcon />}
                                    sx={{
                                        ...actionButtonStyle,
                                        background: `linear-gradient(45deg, ${tenant?.secondaryColor}, ${tenant?.primaryColor})`,
                                        color: 'white',
                                        fontSize: '1.2rem', // Maior destaque
                                    }}
                                >
                                    <Box sx={{ textAlign: 'left', flex: 1 }}>
                                        <Typography variant="button" display="block" sx={{ fontWeight: 800 }}>Quero me Cadastrar</Typography>
                                        <Typography variant="caption" display="block" sx={{ opacity: 0.9, fontWeight: 400, textTransform: 'none' }}>É rápido, só 15 segundos!</Typography>
                                    </Box>
                                </Button>

                                {/* Botão Secundário: Login */}
                                <Button 
                                    variant="outlined" 
                                    onClick={handleIdentify} 
                                    fullWidth
                                    startIcon={<LoginIcon />}
                                    sx={{
                                        ...actionButtonStyle,
                                        borderColor: '#e0e0e0',
                                        color: '#555',
                                        '&:hover': {
                                            borderColor: tenant?.primaryColor,
                                            backgroundColor: 'rgba(0,0,0,0.02)'
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
                                sx={{ color: '#999', textTransform: 'none', fontSize: '0.9rem', '&:hover': { color: '#666', background: 'transparent' } }}
                            >
                                Continuar sem cadastro e perder prêmio
                            </Button>
                        </Box>
                    </Box>
                </Paper>
            </Fade>

            {/* Modal mantido funcionalmente igual, mas poderia ser estilizado também se desejado */}
            <Dialog
                open={open}
                onClose={() => handleCloseModal(false)}
                PaperProps={{ sx: { borderRadius: "20px", textAlign: 'center', p: 1 } }}
            >
                <DialogContent>
                    <Box sx={{ bgcolor: '#fff3cd', width: 80, height: 80, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                        <CardGiftcardIcon sx={{ fontSize: 40, color: '#d9a406' }} />
                    </Box>
                    <DialogTitle sx={{ fontWeight: 800, p: 1, fontSize: '1.4rem' }}>
                        Tem certeza?
                    </DialogTitle>
                    <DialogContentText sx={{ color: '#555' }}>
                        Sem o cadastro, você <strong>não poderá resgatar</strong> o prêmio que ganhar na roleta.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', flexDirection: 'column', gap: 1.5, p: 3 }}>
                    <Button 
                        onClick={handleRegisterFromModal} 
                        variant="contained" 
                        fullWidth
                        sx={{ borderRadius: '50px', py: 1.5, fontWeight: 700, background: `linear-gradient(45deg, ${tenant?.secondaryColor}, ${tenant?.primaryColor})` }}
                    >
                        Voltar e me Cadastrar
                    </Button>
                    <Button 
                        onClick={() => handleCloseModal(true)} 
                        fullWidth
                        sx={{ color: '#999', borderRadius: '50px' }}
                    >
                        Continuar sem prêmio
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default SurveyIdentifyPage;
