import React, { useState, useEffect } from 'react';
import { 
    Typography, Box, Button, Paper, CircularProgress,
    Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import publicSurveyService from '../services/publicSurveyService';

const SurveyIdentifyPage = () => {
    const navigate = useNavigate();
    const { tenantId, pesquisaId } = useParams();
    const [tenant, setTenant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false); // Estado para o modal

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
            // Passa os IDs para a página de agradecimento
            navigate('/agradecimento', { state: { tenantId, pesquisaId } });
        }
    };
    
    const handleRegisterFromModal = () => {
        setOpen(false);
        handleRegister();
    };

    const headerStyle = {
        background: `linear-gradient(135deg, ${tenant?.secondaryColor || '#2575fc'} 0%, ${tenant?.primaryColor || '#6a11cb'} 100%)`,
        padding: '30px',
        textAlign: 'center',
        color: 'white'
    };

    const buttonStyle = {
        background: `linear-gradient(135deg, ${tenant?.secondaryColor || '#2575fc'} 0%, ${tenant?.primaryColor || '#6a11cb'} 100%)`,
        color: 'white',
        '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)'
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
            <Paper elevation={10} sx={{ borderRadius: '20px', overflow: 'hidden', maxWidth: '500px', width: '100%' }}>
                <Box sx={headerStyle}>
                    {tenant?.logoUrl && (
                         <Box sx={{
                            width: { xs: 80, sm: 100, md: 100 }, 
                            height: { xs: 80, sm: 100, md: 100 }, 
                            borderRadius: '50%', backgroundColor: 'white',
                            margin: '0 auto 15px', display: 'flex', justifyContent: 'center', alignItems: 'center',
                            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)', border: '5px solid rgba(255, 255, 255, 0.3)'
                        }}>
                            <img src={tenant.logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                        </Box>
                    )}
                    <Typography variant="h5" component="h1" sx={{ mb: 1, fontWeight: 'bold' }}>Gire a roleta e ganhe prêmios!</Typography>
                </Box>

                <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="body1" sx={{ mb: 1, color: '#555' }}>
                        Para <strong>garantir seu prêmio</strong>, faça seu cadastro ou identifique-se.
                    </Typography>
                    <Typography variant="subtitle2" sx={{ mb: 4, color: 'red', fontWeight: 'bold' }}>
                        O cadastro leva apenas 15 segundos e é feito uma única vez.
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Button variant="contained" size="large" onClick={handleRegister} sx={buttonStyle}>
                            Quero me Cadastrar
                        </Button>
                        <Button variant="outlined" size="large" onClick={handleIdentify} sx={{ borderColor: tenant?.primaryColor, color: tenant?.primaryColor }}>
                            Já tenho Cadastro
                        </Button>
                        <Button variant="text" onClick={handleOpenModal} sx={{ mt: 2, color: '#777' }}>
                            Continuar sem cadastro
                        </Button>
                    </Box>
                </Box>
            </Paper>

            <Dialog
                open={open}
                onClose={() => handleCloseModal(false)}
                PaperProps={{
                    sx: {
                        borderRadius: "15px",
                        textAlign: 'center',
                        p: 2
                    }
                }}
            >
                <DialogContent>
                    <CardGiftcardIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                    <DialogTitle sx={{ fontWeight: 'bold', p: 1 }}>
                        Não deixe de ganhar seu prêmio!
                    </DialogTitle>
                    <DialogContentText>
                        Cadastre-se para girar a roleta e salvar seu prêmio.
                        O cadastro <strong>leva apenas 15 segundos, é feito uma única vez</strong> e garante seu benefício!
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', flexDirection: 'column', gap: 1, p: '0 24px 16px' }}>
                    <Button onClick={handleRegisterFromModal} variant="contained" fullWidth>
                        Cadastre-se agora
                    </Button>
                    <Button onClick={() => handleCloseModal(true)} color="secondary" fullWidth>
                        Continuar sem cadastro
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default SurveyIdentifyPage;
