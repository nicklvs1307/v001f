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
import UaiRangoLogo from '../assets/logo_uairango.png'; // Caminho corrigido
import IfoodLogo from '../assets/IfoodLogo.png';    // Caminho corrigido


const IntegrationsPage = () => {
    const [loading, setLoading] = useState(true);
    const [tenant, setTenant] = useState(null);
    const [uairangoId, setUairangoId] = useState('');
    const [ifoodMerchantId, setIfoodMerchantId] = useState('');
    const [ifoodConnected, setIfoodConnected] = useState(false); // Novo estado para verificar conexão iFood
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchTenantData = async () => {
            try {
                const response = await tenantService.getMe();
                setTenant(response.data);
                setUairangoId(response.data.uairangoEstablishmentId || '');
                setIfoodMerchantId(response.data.ifoodMerchantId || '');
                setIfoodConnected(!!response.data.ifoodAccessToken); // Verifica se já tem token de acesso
            } catch (err) {
                setError('Falha ao carregar os dados da empresa.');
                toast.error('Falha ao carregar os dados da empresa.');
            } finally {
                setLoading(false);
            }
        };

        fetchTenantData();

        // Lidar com o retorno do OAuth
        const urlParams = new URLSearchParams(window.location.search);
        const ifoodAuthSuccess = urlParams.get('ifood_auth_success');
        const ifoodAuthError = urlParams.get('ifood_auth_error');

        if (ifoodAuthSuccess) {
            toast.success('iFood conectado com sucesso!');
            // Limpa os parâmetros da URL
            window.history.replaceState({}, document.title, window.location.pathname);
            fetchTenantData(); // Recarrega os dados do tenant para atualizar o status de conexão
        } else if (ifoodAuthError) {
            toast.error(`Falha ao conectar iFood: ${ifoodAuthError}`);
            // Limpa os parâmetros da URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);

    const handleSave = async (integrationType) => {
        try {
            if (integrationType === 'uairango') {
                await tenantService.update({ uairangoEstablishmentId: uairangoId });
                toast.success('Integração com Uai Rango atualizada com sucesso!');
            } else if (integrationType === 'ifood') {
                await tenantService.update({ ifoodMerchantId: ifoodMerchantId });
                toast.success('ID do Estabelecimento iFood atualizado com sucesso!');
            }
        } catch (err) {
            toast.error('Falha ao salvar a integração.');
        }
    };

    const handleConnectIfood = async () => {
        try {
            // Requisição ao backend para iniciar o fluxo OAuth
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/ifood/authorize?merchantId=${ifoodMerchantId}`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Falha ao iniciar a autorização do iFood.');
            }
            const data = await response.json();
            window.location.href = data.authorizationUrl; // Redireciona o usuário para o iFood
        } catch (err) {
            toast.error(err.message || 'Erro ao iniciar o processo de conexão com o iFood.');
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
                                <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
                                    <Box
                                        component="img"
                                        src={UaiRangoLogo}
                                        alt="Uai Rango Logo"
                                        sx={{
                                            width: 80,
                                            height: 80,
                                            borderRadius: '15px', // Bordas arredondadas
                                            mb: 1,
                                        }}
                                    />
                                    <Typography variant="h5" component="div" gutterBottom>
                                        Uai Rango
                                    </Typography>
                                </Box>
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
                                    onClick={() => handleSave('uairango')}
                                >
                                    Salvar
                                </Button>
                                <Alert severity="info" sx={{ mt: 2 }}>
                                    É necessário entrar em contato com o suporte do Voltaki para liberar a integração.
                                </Alert>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Card para iFood */}
                    <Grid item xs={12} md={6} lg={4}>
                        <Card>
                            <CardContent>
                                <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
                                    <Box
                                        component="img"
                                        src={IfoodLogo}
                                        alt="iFood Logo"
                                        sx={{
                                            width: 80,
                                            height: 80,
                                            borderRadius: '15px',
                                            mb: 1,
                                        }}
                                    />
                                    <Typography variant="h5" component="div" gutterBottom>
                                        iFood
                                    </Typography>
                                </Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                    Conecte sua conta iFood para permitir que o sistema busque seus pedidos automaticamente. Primeiro, salve o ID do estabelecimento, depois conecte a conta iFood.
                                </Typography>
                                <TextField
                                    fullWidth
                                    label="ID do Estabelecimento iFood"
                                    variant="outlined"
                                    id="ifoodMerchantId"
                                    value={ifoodMerchantId}
                                    onChange={(e) => setIfoodMerchantId(e.target.value)}
                                    sx={{ mb: 2 }}
                                />
                                <Button
                                    variant="contained"
                                    onClick={() => handleSave('ifood')}
                                    sx={{ mr: 2 }}
                                >
                                    Salvar ID
                                </Button>
                                <Button
                                    variant="contained"
                                    color={ifoodConnected ? 'success' : 'primary'}
                                    onClick={handleConnectIfood}
                                    disabled={!ifoodMerchantId} // Desabilita se o merchantId não estiver preenchido
                                >
                                    {ifoodConnected ? 'iFood Conectado' : 'Conectar iFood'}
                                </Button>

                                <Alert severity="info" sx={{ mt: 2 }}>
                                    A integração com o iFood utiliza polling para buscar pedidos. Certifique-se de que o Client ID e Client Secret do iFood estão configurados nas variáveis de ambiente do backend.
                                </Alert>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>
        </Container>
    );
};

export default IntegrationsPage;

