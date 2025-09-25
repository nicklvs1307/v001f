import React, { useState, useEffect } from 'react';
import { TextField, Button, Typography, Box, CircularProgress, Alert, Paper } from '@mui/material';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import clientService from '../services/clientService';
import publicSurveyService from '../services/publicSurveyService';

const ClientRegistrationPage = () => {
    const { tenantId, pesquisaId } = useParams();
    const navigate = useNavigate();

    const [clientData, setClientData] = useState({ name: '', email: '', phone: '', birthDate: '' });
    const [tenant, setTenant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchTenant = async () => {
            if (tenantId) {
                try {
                    const tenantData = await publicSurveyService.getPublicTenantById(tenantId);
                    setTenant(tenantData);
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

    const handleChange = (e) => {
        setClientData({ ...clientData, [e.target.name]: e.target.value });
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
            sessionStorage.removeItem('surveyState'); // Limpa o estado após o uso
            navigate(`/roleta/${tenantId}/${pesquisaId}/${response.client.id}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Erro ao registrar cliente.');
        } finally {
            setLoading(false);
        }
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
        padding: '12px 0',
        '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)'
        }
    };

    if (loading && !tenant) {
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
                    <Typography variant="h5" component="h1" sx={{ mb: 1, fontWeight: 'bold' }}>
                        Participe e Ganhe Prêmios!
                    </Typography>
                    <Typography variant="body2">
                        Preencha seus dados para participar da roleta de prêmios!
                    </Typography>
                </Box>

                <Box component="form" onSubmit={handleSubmit} sx={{ p: 4 }}>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    <TextField margin="normal" required fullWidth id="name" label="Nome Completo" name="name" autoComplete="name" autoFocus value={clientData.name} onChange={handleChange} />
                    <TextField margin="normal" fullWidth id="email" label="Endereço de Email (Opcional)" name="email" autoComplete="email" value={clientData.email} onChange={handleChange} />
                    <TextField margin="normal" required fullWidth id="phone" label="Telefone (com DDD)" name="phone" autoComplete="tel" value={clientData.phone} onChange={handleChange} />
                    <TextField margin="normal" fullWidth id="birthDate" label="Data de Nascimento (Opcional)" name="birthDate" type="date" InputLabelProps={{ shrink: true }} value={clientData.birthDate} onChange={handleChange} />
                    <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, ...buttonStyle }} disabled={loading}>
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Cadastrar e Girar a Roleta'}
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};

export default ClientRegistrationPage;