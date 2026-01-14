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
    Alert,
    Drawer // Substituído Modal por Drawer
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings'; // Nova importação
import tenantService from '../services/tenantService';
import toast from 'react-hot-toast';
import UaiRangoLogo from '../assets/logo_uairango.png'; // Caminho corrigido
import IfoodLogo from '../assets/IfoodLogo.png';    // Caminho corrigido
import SaiposLogo from '../assets/SaiposLogo.jpg'; // Nova importação
import GoogleMeuNegocioLogo from '../assets/GoogleMeuNegocio.png'; // Nova importação


const IntegrationsPage = () => {
    const [loading, setLoading] = useState(true);
    const [tenant, setTenant] = useState(null);
    const [uairangoId, setUairangoId] = useState('');
    const [ifoodConnected, setIfoodConnected] = useState(false); // Novo estado para verificar conexão iFood
    const [gmbLink, setGmbLink] = useState(''); // Estado para o link do Google Meu Negócio
    const [showUaiRangoModal, setShowUaiRangoModal] = useState(false); // Estado para controlar o modal Uai Rango
    const [showIfoodModal, setShowIfoodModal] = useState(false);     // Estado para controlar o modal iFood
    const [showGMBDrawer, setShowGMBDrawer] = useState(false); // Estado para controlar o Drawer do GMB
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchTenantData = async () => {
            try {
                const response = await tenantService.getMe();
                setTenant(response.data);
                setUairangoId(response.data.uairangoEstablishmentId || '');
                setIfoodConnected(!!response.data.ifoodAccessToken); // Verifica se já tem token de acesso
                setGmbLink(response.data.gmb_link || ''); // Popula o estado gmbLink
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
            }

        } catch (err) {
            toast.error('Falha ao salvar a integração.');
        }
    };

    const handleSaveGMB = async () => {
        try {
            await tenantService.update({ gmb_link: gmbLink });
            toast.success('Link do Google Meu Negócio atualizado com sucesso!');
        } catch (err) {
            toast.error('Falha ao salvar o link do Google Meu Negócio.');
        }
    };

    const handleConnectIfood = async () => {
        try {
            // Requisição ao backend para iniciar o fluxo OAuth
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/ifood/authorize`);
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

            <>

                <Container maxWidth="lg">

                    <Box sx={{ my: 4 }}>

                        <Typography variant="h4" component="h1" gutterBottom>

                            Integrações de Delivery

                        </Typography>

                        <Typography variant="body1" sx={{ mb: 4 }}>

                            Gerencie aqui as integrações com as plataformas de delivery para automatizar o recebimento de pedidos e o envio de pesquisas.

                        </Typography>

    

                                                <Grid container spacing={4}>

    

                                                    {/* Card para Saipos */}

    

                                                    <Grid item xs={12} md={6} lg={4}>

    

                                                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out', '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 } }}>

    

                                                            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>

    

                                                                <Box

    

                                                                    component="img"

    

                                                                    src={SaiposLogo}

    

                                                                    alt="Saipos Logo"

    

                                                                    sx={{

    

                                                                        width: 100,

    

                                                                        height: 100,

    

                                                                        borderRadius: '15px',

    

                                                                        mb: 2,

    

                                                                    }}

    

                                                                />

    

                                                                <Typography variant="h5" component="div" gutterBottom>

    

                                                                    Saipos

    

                                                                </Typography>

    

                                                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>

    

                                                                    Em Breve

    

                                                                </Typography>

    

                                                            </CardContent>

    

                                                        </Card>

    

                                                    </Grid>

    

                        

    

                                                    {/* Card para Uai Rango */}

    

                                                    <Grid item xs={12} md={6} lg={4}>

    

                                                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out', '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 } }}>

    

                                                            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>

    

                                                                <Box

    

                                                                    component="img"

    

                                                                    src={UaiRangoLogo}

    

                                                                    alt="Uai Rango Logo"

    

                                                                    sx={{

    

                                                                        width: 100,

    

                                                                        height: 100,

    

                                                                        borderRadius: '15px', // Bordas arredondadas

    

                                                                        mb: 2,

    

                                                                    }}

    

                                                                />

    

                                                                <Typography variant="h5" component="div" gutterBottom>

    

                                                                    Uai Rango

    

                                                                </Typography>

    

                                                                <Button

    

                                                                    fullWidth

    

                                                                    variant="contained"

    

                                                                    startIcon={<SettingsIcon />}

    

                                                                    onClick={() => setShowUaiRangoModal(true)}

    

                                                                    sx={{ mt: 'auto' }}

    

                                                                >

    

                                                                    Configurar

    

                                                                </Button>

    

                                                            </CardContent>

    

                                                        </Card>

    

                                                    </Grid>

    

                        

    

                                                    {/* Card para iFood */}

    

                                                    <Grid item xs={12} md={6} lg={4}>

    

                                                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out', '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 } }}>

    

                                                            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>

    

                                                                <Box

    

                                                                    component="img"

    

                                                                    src={IfoodLogo}

    

                                                                    alt="iFood Logo"

    

                                                                    sx={{

    

                                                                        width: 100,

    

                                                                        height: 100,

    

                                                                        borderRadius: '15px',

    

                                                                        mb: 2,

    

                                                                    }}

    

                                                                />

    

                                                                <Typography variant="h5" component="div" gutterBottom>

    

                                                                    iFood

    

                                                                </Typography>

    

                                                                <Button

    

                                                                    fullWidth

    

                                                                    variant="contained"

    

                                                                    startIcon={<SettingsIcon />}

    

                                                                    onClick={() => setShowIfoodModal(true)}

    

                                                                    sx={{ mt: 'auto' }}

    

                                                                >

    

                                                                    Configurar

    

                                                                </Button>

    

                                                            </CardContent>

    

                                                        </Card>

    

                                                    </Grid>

    

                        

    

                                                    {/* Card para Google Meu Negócio */}

    

                                                    <Grid item xs={12} md={6} lg={4}>

    

                                                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out', '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 } }}>

    

                                                            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>

    

                                                                <Box

    

                                                                    component="img"

    

                                                                    src={GoogleMeuNegocioLogo}

    

                                                                    alt="Google Meu Negócio Logo"

    

                                                                    sx={{

    

                                                                        width: 100,

    

                                                                        height: 100,

    

                                                                        borderRadius: '15px',

    

                                                                        mb: 2,

    

                                                                    }}

    

                                                                />

    

                                                                <Typography variant="h5" component="div" gutterBottom>

    

                                                                    Google Meu Negócio

    

                                                                </Typography>

    

                                                                <Button

    

                                                                    fullWidth

    

                                                                    variant="contained"

    

                                                                    startIcon={<SettingsIcon />}

    

                                                                    onClick={() => setShowGMBDrawer(true)}

    

                                                                    sx={{ mt: 'auto' }}

    

                                                                >

    

                                                                    Configurar

    

                                                                </Button>

    

                                                            </CardContent>

    

                                                        </Card>

    

                                                    </Grid>

    

                                                </Grid>

                    </Box>

                </Container>

    

                <UaiRangoConfigModal

                    open={showUaiRangoModal}

                    onClose={() => setShowUaiRangoModal(false)}

                    uairangoId={uairangoId}

                    setUairangoId={setUairangoId}

                    handleSave={handleSave}

                />

    

                                <IfoodConfigModal

    

                                    open={showIfoodModal}

    

                                    onClose={() => setShowIfoodModal(false)}

    

                                    handleConnectIfood={handleConnectIfood}

    

                                                    ifoodConnected={ifoodConnected}

    

                                                />

                    

                                <GMBConfigDrawer

                                    open={showGMBDrawer}

                                    onClose={() => setShowGMBDrawer(false)}

                                    gmbLink={gmbLink}

                                    setGmbLink={setGmbLink}

                                    handleSaveGMB={handleSaveGMB}

                                />

                            </>

                        );

                    };

                    

                    const GMBConfigDrawer = ({ open, onClose, gmbLink, setGmbLink, handleSaveGMB }) => {

                        return (

                            <Drawer

                                anchor="right"

                                open={open}

                                onClose={onClose}

                                PaperProps={{

                                    sx: { width: 400 }

                                }}

                            >

                                <Box sx={{

                                    width: '100%',

                                    p: 4,

                                    display: 'flex',

                                    flexDirection: 'column',

                                    alignItems: 'center',

                                    height: '100%'

                                }}>

                                    <Box

                                        component="img"

                                        src={GoogleMeuNegocioLogo}

                                        alt="Google Meu Negócio Logo"

                                        sx={{

                                            width: 100,

                                            height: 100,

                                            mb: 2,

                                        }}

                                    />

                                    <Typography variant="h6" component="h2" gutterBottom>

                                        Configurar Google Meu Negócio

                                    </Typography>

                                    <Typography sx={{ mt: 2, mb: 2, textAlign: 'center' }}>

                                        Forneça o link do seu perfil no Google Meu Negócio.

                                    </Typography>

                                    <TextField

                                        fullWidth

                                        label="Link do Google Meu Negócio"

                                        variant="outlined"

                                        value={gmbLink}

                                        onChange={(e) => setGmbLink(e.target.value)}

                                        sx={{ mb: 2 }}

                                    />

                                    <Button

                                        variant="contained"

                                        onClick={() => {

                                            handleSaveGMB();

                                            onClose();

                                        }}

                                        sx={{ mb: 2 }}

                                    >

                                        Salvar

                                    </Button>

                                    <Button

                                        variant="outlined"

                                        onClick={onClose}

                                    >

                                        Cancelar

                                    </Button>

                                    <Alert severity="info" sx={{ mt: 2, textAlign: 'center' }}>

                                        Esta configuração é utilizada para direcionar clientes para deixar avaliações.

                                    </Alert>

                                </Box>

                            </Drawer>

                        );

                    };

const UaiRangoConfigModal = ({ open, onClose, uairangoId, setUairangoId, handleSave }) => {
    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: { width: 400 } // Ajustar a largura conforme necessário
            }}
        >
            <Box sx={{
                width: '100%',
                p: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center', // Centraliza o conteúdo horizontalmente
                height: '100%' // Ocupa a altura total do Drawer
            }}>
                <Box
                    component="img"
                    src={UaiRangoLogo} // Usar a logo do Uai Rango
                    alt="Uai Rango Logo"
                    sx={{
                        width: 100, // Tamanho da logo
                        height: 100,
                        mb: 2,
                    }}
                />
                <Typography variant="h6" component="h2" gutterBottom>
                    Configurar Uai Rango
                </Typography>
                <Typography sx={{ mt: 2, mb: 2, textAlign: 'center' }}>
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
                    onClick={() => {
                        handleSave('uairango');
                        onClose();
                    }}
                    sx={{ mb: 2 }}
                >
                    Salvar
                </Button>
                <Button
                    variant="outlined"
                    onClick={onClose}
                >
                    Cancelar
                </Button>
                <Alert severity="info" sx={{ mt: 2, textAlign: 'center' }}>
                    É necessário entrar em contato com o suporte do Voltaki para liberar a integração.
                </Alert>
            </Box>
        </Drawer>
    );
};

const IfoodConfigModal = ({ open, onClose, handleConnectIfood, ifoodConnected }) => {
    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: { width: 400 } // Ajustar a largura conforme necessário
            }}
        >
            <Box sx={{
                width: '100%',
                p: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center', // Centraliza o conteúdo horizontalmente
                height: '100%' // Ocupa a altura total do Drawer
            }}>
                <Box
                    component="img"
                    src={IfoodLogo} // Usar a logo do iFood
                    alt="iFood Logo"
                    sx={{
                        width: 100, // Tamanho da logo
                        height: 100,
                        mb: 2,
                    }}
                />
                <Typography variant="h6" component="h2" gutterBottom>
                    Configurar iFood
                </Typography>
                <Typography sx={{ mt: 2, mb: 2, textAlign: 'center' }}>
                    Conecte sua conta iFood para permitir que o sistema busque seus pedidos automaticamente.
                </Typography>
                <Button
                    variant="contained"
                    sx={{
                        mb: 2,
                        backgroundColor: '#EA1D2C', // Vermelho iFood
                        borderRadius: '20px', // Arredondado
                        '&:hover': {
                            backgroundColor: '#C81925', // Um tom mais escuro no hover
                        },
                    }}
                    onClick={() => {
                        handleConnectIfood();
                        onClose();
                    }}
                >
                    {ifoodConnected ? 'iFood Conectado' : 'Conectar iFood'}
                </Button>

                <Alert severity="info" sx={{ mt: 2, textAlign: 'center' }}>
                    A integração com o iFood utiliza polling para buscar pedidos. Certifique-se de que o Client ID e Client Secret do iFood estão configurados nas variáveis de ambiente do backend.
                </Alert>
            </Box>
        </Drawer>
    );
};

export default IntegrationsPage;

