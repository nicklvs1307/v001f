import React, { useState, useEffect } from 'react';
import { 
    Container, 
    Typography, 
    Box, 
    Grid, 
    Card, 
    CardContent, 
    TextField, 
    Button, 
    CircularProgress, 
    Alert 
} from '@mui/material';
import tenantService from '../services/tenantService';
import toast from 'react-hot-toast';

const IntegrationsPage = () => {
    const [loading, setLoading] = useState(true);
    const [tenant, setTenant] = useState(null);
    const [uairangoId, setUairangoId] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchTenantData = async () => {
            try {
                const response = await tenantService.getMe();
                setTenant(response.data);
                setUairangoId(response.data.uairangoEstablishmentId || '');
            } catch (err) {
                setError('Falha ao carregar os dados da empresa.');
                toast.error('Falha ao carregar os dados da empresa.');
            } finally {
                setLoading(false);
            }
        };

        fetchTenantData();
    }, []);

    const handleSave = async () => {
        try {
            await tenantService.update({ uairangoEstablishmentId: uairangoId });
            toast.success('Integração com Uai Rango atualizada com sucesso!');
        } catch (err) {
            toast.error('Falha ao salvar a integração.');
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    return (
        <Container maxWidth="lg">
            <Box sx={{ my: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Integrações de Delivery
                </Typography>
                <Typography variant="body1" sx={{ mb: 4 }}>
                    Gerencie aqui as integrações com as plataformas de delivery para automatizar o recebimento de pedidos e o envio de pesquisas.
                </Typography>
                
                <Grid container spacing={4}>
                    {/* Card para Uai Rango */}
                    <Grid item xs={12} md={6} lg={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h5" component="div" gutterBottom>
                                    Uai Rango
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    Forneça o ID do seu estabelecimento no Uai Rango e configure o webhook para começar a receber os pedidos.
                                </Typography>
                                <TextField
                                    fullWidth
                                    label="ID do Estabelecimento Uai Rango"
                                    variant="outlined"
                                    value={uairangoId}
                                    onChange={(e) => setUairangoId(e.target.value)}
                                    sx={{ mb: 2 }}
                                />
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    URL do Webhook:
                                </Typography>
                                <TextField
                                    fullWidth
                                    variant="outlined"
                                    value={`${process.env.REACT_APP_API_URL}/api/delivery-webhooks/uairango`}
                                    InputProps={{
                                        readOnly: true,
                                    }}
                                    sx={{ mb: 2 }}
                                />
                                <Button
                                    variant="contained"
                                    onClick={handleSave}
                                >
                                    Salvar
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Placeholder para iFood */}
                    <Grid item xs={12} md={6} lg={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h5" component="div" gutterBottom>
                                    iFood
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    Integração em breve.
                                </Typography>
                                <TextField
                                    fullWidth
                                    label="ID do Estabelecimento iFood"
                                    variant="outlined"
                                    disabled
                                />
                                <Button
                                    variant="contained"
                                    disabled
                                    sx={{ mt: 2 }}
                                >
                                    Salvar
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>
        </Container>
    );
};

export default IntegrationsPage;
