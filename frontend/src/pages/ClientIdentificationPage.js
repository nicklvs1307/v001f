import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Box,
    CircularProgress,
    Alert
} from '@mui/material';
import publicSurveyService from '../services/publicSurveyService';

const ClientIdentificationPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { surveyId, answers, tenantId, atendenteId } = location.state || {};

    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isFinished, setIsFinished] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!surveyId || !answers) {
            setError("Dados da pesquisa não encontrados. Por favor, tente novamente.");
            setLoading(false);
            return;
        }

        try {
            const response = await publicSurveyService.submitSurveyWithClient({
                surveyId,
                respostas: answers,
                atendenteId,
                client: { name, phone },
                tenantId,
            });
            localStorage.setItem('clientPhone', phone);
            navigate(`/roleta/${tenantId}/${surveyId}/${response.clienteId}`);
        } catch (err) {
            setError(err.message || "Ocorreu um erro ao enviar suas informações.");
        } finally {
            setLoading(false);
        }
    };

    if (isFinished) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', p: 2 }}>
                <Paper elevation={3} sx={{ p: 4, textAlign: 'center', borderRadius: '15px' }}>
                    <Typography variant="h4" color="primary" sx={{ mb: 2 }}>
                        Obrigado!
                    </Typography>
                    <Typography>
                        Sua avaliação foi registrada com sucesso.
                    </Typography>
                </Paper>
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', p: 2 }}>
            <Container maxWidth="sm">
                <Paper elevation={3} sx={{ p: 4, borderRadius: '15px' }}>
                    <Typography variant="h5" component="h1" sx={{ mb: 3, textAlign: 'center' }}>
                        Identifique-se para concluir
                    </Typography>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Nome Completo"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            label="Telefone (com DDD)"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                            sx={{ mb: 2 }}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={loading}
                            sx={{ p: 1.5 }}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Finalizar Avaliação'}
                        </Button>
                    </form>
                </Paper>
            </Container>
        </Box>
    );
};

export default ClientIdentificationPage;
