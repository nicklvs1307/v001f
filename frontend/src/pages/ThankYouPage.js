import React from 'react';
import { Typography, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PublicPageLayout from '../components/layout/PublicPageLayout';

const ThankYouPage = () => {
    const navigate = useNavigate();

    const handleGoHome = () => {
        navigate('/');
    };

    return (
        <PublicPageLayout>
            <Typography variant="h4" component="h1" gutterBottom>
                Obrigado por sua participação!
            </Typography>
            <Typography variant="body1" sx={{ mb: 4 }}>
                Sua resposta foi registrada com sucesso.
            </Typography>
            <Box sx={{ mt: 3 }}>
                <Button variant="contained" color="primary" onClick={handleGoHome}>
                    Voltar para o Início
                </Button>
            </Box>
        </PublicPageLayout>
    );
};

export default ThankYouPage;
