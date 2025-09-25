import React, { useState, useEffect } from 'react';
import { Typography, Box, Button, Paper, CircularProgress } from '@mui/material';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import publicSurveyService from '../services/publicSurveyService';

const SurveyIdentifyPage = () => {
    const navigate = useNavigate();
    const { tenantId, pesquisaId } = useParams();
    const [tenant, setTenant] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTenant = async () => {
            try {
                const tenantData = await publicSurveyService.getPublicTenantById(tenantId);
                setTenant(tenantData);
            } catch (error) {
                console.error("Erro ao buscar tenant:", error);
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
        navigate(`/identificacao-cliente/${tenantId}/${pesquisaId}`);
    };

    const handleAnonymous = () => {
        navigate('/agradecimento');
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
                    <Typography variant="h5" component="h1" sx={{ mb: 1, fontWeight: 'bold' }}>Obrigado por responder!</Typography>
                </Box>

                <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="body1" sx={{ mb: 4, color: '#555' }}>
                        Para receber recompensas e acompanhar seus feedbacks, identifique-se.
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Button variant="contained" size="large" onClick={handleRegister} sx={buttonStyle}>
                            Quero me Cadastrar
                        </Button>
                        <Button variant="outlined" size="large" onClick={handleIdentify} sx={{ borderColor: tenant?.primaryColor, color: tenant?.primaryColor }}>
                            Já tenho Cadastro
                        </Button>
                        <Button variant="text" onClick={handleAnonymous} sx={{ mt: 2, color: '#777' }}>
                            Continuar como anônimo
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
};

export default SurveyIdentifyPage;
