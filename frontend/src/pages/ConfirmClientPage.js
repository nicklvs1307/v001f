import React, { useState, useEffect } from 'react';
import { Typography, Box, Button, Paper, CircularProgress, Alert } from '@mui/material';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import PublicPageLayout from '../components/layout/PublicPageLayout';
import publicSurveyService from '../services/publicSurveyService'; // Supondo que haverá um serviço para isso

const ConfirmClientPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { surveyId } = useParams();
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [surveyState, setSurveyState] = useState(null);

    useEffect(() => {
        const storedState = sessionStorage.getItem('surveyState');
        const storedPhone = localStorage.getItem('clientPhone');

        if (!storedState || !storedPhone || !surveyId) {
            console.error("Estado da pesquisa, telefone ou ID não encontrado. Redirecionando.");
            navigate('/login'); // Redireciona para uma página segura
            return;
        }

        setSurveyState(JSON.parse(storedState));
        setPhone(storedPhone);
    }, [navigate, surveyId]);

    const handleConfirm = async () => {
        setLoading(true);
        setError('');
        try {
            const payload = {
                surveyId,
                respostas: surveyState.answers,
                atendenteId: surveyState.atendenteId,
                client: { phone },
                tenantId: surveyState.tenantId,
            };

            const response = await publicSurveyService.submitSurveyWithClient(payload);
            sessionStorage.removeItem('surveyState'); // Limpa o estado após o uso
            navigate(`/roleta/${surveyState.tenantId}/${surveyId}/${response.clienteId}`);
        } catch (err) {
            setError(err.message || 'Ocorreu um erro ao confirmar sua identidade.');
            setLoading(false);
        }
    };

    const handleDeny = () => {
        localStorage.removeItem('clientPhone');
        // Navega para a identificação, garantindo que tenantId e surveyId estejam na URL
        if (surveyState && surveyState.tenantId && surveyId) {
            navigate(`/identificacao-pesquisa/${surveyState.tenantId}/${surveyId}`);
        } else {
            navigate('/login'); // Fallback
        }
    };

    return (
        <PublicPageLayout maxWidth="sm">
            <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h5" component="h1" gutterBottom>
                    Já nos conhecemos?
                </Typography>
                <Typography variant="body1" sx={{ mb: 4 }}>
                    Você é o cliente com o telefone <strong>{phone}</strong>?
                </Typography>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Button variant="contained" color="primary" size="large" onClick={handleConfirm} disabled={loading}>
                        {loading ? <CircularProgress size={24} /> : 'Sim, sou eu'}
                    </Button>
                    <Button variant="outlined" color="secondary" size="large" onClick={handleDeny} disabled={loading}>
                        Não, sou outra pessoa
                    </Button>
                </Box>
            </Paper>
        </PublicPageLayout>
    );
};

export default ConfirmClientPage;
