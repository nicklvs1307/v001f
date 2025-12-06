import React from 'react';
import { Typography, Box, Button, Paper } from '@mui/material';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import PublicPageLayout from '../components/layout/PublicPageLayout';
import { motion } from 'framer-motion';

const ThankYouPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Extrai tenantId e pesquisaId do estado da navegação, se existirem
    const { tenantId, pesquisaId } = location.state || {};

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

            {/* Seção Condicional para Cadastro */}
            {tenantId && pesquisaId && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                >
                    <Paper 
                        elevation={4} 
                        sx={{ 
                            p: 3, 
                            mt: 4, 
                            mb: 4,
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                            textAlign: 'center'
                        }}
                    >
                        <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', mb: 2 }}>
                            Não perca seu prêmio!
                        </Typography>
                        <Button 
                            variant="contained" 
                            color="primary" 
                            component={Link}
                            to={`/cadastro-cliente/${tenantId}/${pesquisaId}`}
                        >
                            Cadastre-se para girar a roleta
                        </Button>
                    </Paper>
                </motion.div>
            )}

            <Box sx={{ mt: 3 }}>
                <Button variant="outlined" color="primary" onClick={handleGoHome}>
                    Voltar para o Início
                </Button>
            </Box>
        </PublicPageLayout>
    );
};

export default ThankYouPage;
