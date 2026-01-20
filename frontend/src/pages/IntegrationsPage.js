import React, { useState, useEffect, useContext } from 'react';
import {
    Container, Typography, Box, Grid, Card, CardContent, TextField, Button,
    CircularProgress, Alert, Drawer, List, ListItem, ListItemText, Divider, Snackbar, Paper, Link, IconButton
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import tenantService from '../services/tenantService';
import gmbConfigService from '../services/gmbConfigService';
import gmbReviewService from '../services/gmbReviewService';
import AuthContext from '../context/AuthContext';
import { formatDateForDisplay } from '../utils/dateUtils';
import toast from 'react-hot-toast';
import UaiRangoLogo from '../assets/logo_uairango.png';
import IfoodLogo from '../assets/IfoodLogo.png';
import SaiposLogo from '../assets/SaiposLogo.jpg';
import GoogleMeuNegocioLogo from '../assets/GoogleMeuNegocio.png';
import apiAuthenticated from '../services/apiAuthenticated';

const IntegrationsPage = () => {
    const [loading, setLoading] = useState(true);
    const [tenant, setTenant] = useState(null);
    const [uairangoId, setUairangoId] = useState('');
    const [showUaiRangoModal, setShowUaiRangoModal] = useState(false);
    const [showIfoodModal, setShowIfoodModal] = useState(false);
    const [showGMBDrawer, setShowGMBDrawer] = useState(false);
    const [error, setError] = useState('');

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

    useEffect(() => {
        fetchTenantData();

        const urlParams = new URLSearchParams(window.location.search);
        const gmbAuthSuccess = urlParams.get('gmb_auth_success');
        const gmbAuthError = urlParams.get('gmb_auth_error');
        const ifoodSuccess = urlParams.get('ifood_success');
        const ifoodError = urlParams.get('ifood_error');

        if (gmbAuthSuccess) {
            toast.success('Google Meu Negócio conectado com sucesso!');
            setShowGMBDrawer(true);
            window.history.replaceState({}, document.title, window.location.pathname);
        } else if (gmbAuthError) {
            toast.error(`Falha ao conectar Google Meu Negócio: ${decodeURIComponent(gmbAuthError)}`);
            window.history.replaceState({}, document.title, window.location.pathname);
        }

        if (ifoodSuccess) {
             toast.success('iFood conectado com sucesso!');
             // Opcional: abrir o modal ou apenas atualizar os dados
             window.history.replaceState({}, document.title, window.location.pathname);
        } else if (ifoodError) {
            toast.error(`Falha ao conectar iFood: ${decodeURIComponent(ifoodError)}`);
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

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    return (
        <>
            <Container maxWidth="lg">
                <Box sx={{ my: 4 }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Integrações
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 4 }}>
                        Gerencie aqui suas integrações para automatizar processos e ampliar suas funcionalidades.
                    </Typography>

                    <Grid container spacing={4}>
                        <Grid item xs={12} md={6} lg={4}>
                            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out', '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 } }}>
                                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                    <Box component="img" src={GoogleMeuNegocioLogo} alt="Google Meu Negócio Logo" sx={{ width: 100, height: 100, borderRadius: '15px', mb: 2 }} />
                                    <Typography variant="h5" component="div" gutterBottom>
                                        Google Meu Negócio
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
                                        Gerencie avaliações e conecte sua conta.
                                    </Typography>
                                    <Button fullWidth variant="contained" startIcon={<SettingsIcon />} onClick={() => setShowGMBDrawer(true)} sx={{ mt: 'auto' }}>
                                        Configurar
                                    </Button>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={6} lg={4}>
                            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out', '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 } }}>
                                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                    <Box component="img" src={UaiRangoLogo} alt="Uai Rango Logo" sx={{ width: 100, height: 100, borderRadius: '15px', mb: 2 }} />
                                    <Typography variant="h5" component="div" gutterBottom>
                                        Uai Rango
                                    </Typography>
                                    <Button fullWidth variant="contained" startIcon={<SettingsIcon />} onClick={() => setShowUaiRangoModal(true)} sx={{ mt: 'auto' }}>
                                        Configurar
                                    </Button>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={6} lg={4}>
                            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out', '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 } }}>
                                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                    <Box component="img" src={IfoodLogo} alt="iFood Logo" sx={{ width: 100, height: 100, borderRadius: '15px', mb: 2 }} />
                                    <Typography variant="h5" component="div" gutterBottom>
                                        iFood
                                    </Typography>
                                    <Button fullWidth variant="contained" startIcon={<SettingsIcon />} onClick={() => setShowIfoodModal(true)} sx={{ mt: 'auto' }}>
                                        Configurar
                                    </Button>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={6} lg={4}>
                            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out', '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 } }}>
                                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                    <Box component="img" src={SaiposLogo} alt="Saipos Logo" sx={{ width: 100, height: 100, borderRadius: '15px', mb: 2 }}/>
                                    <Typography variant="h5" component="div" gutterBottom>
                                        Saipos
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
                                        Em Breve
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Box>
            </Container>

            <UaiRangoConfigModal open={showUaiRangoModal} onClose={() => setShowUaiRangoModal(false)} uairangoId={uairangoId} setUairangoId={setUairangoId} handleSave={handleSave} />
            <IfoodConfigModal open={showIfoodModal} onClose={() => { setShowIfoodModal(false); }} tenant={tenant} fetchTenantData={fetchTenantData} />
            <GMBConfigDrawer open={showGMBDrawer} onClose={() => setShowGMBDrawer(false)} />
        </>
    );
};

// ... GMBConfigDrawer and UaiRangoConfigModal components remain the same ...

const GMBConfigDrawer = ({ open, onClose }) => {
    const { user } = useContext(AuthContext);
    const [config, setConfig] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loadingConfig, setLoadingConfig] = useState(true);
    const [loadingReviews, setLoadingReviews] = useState(false);
    const [syncingReviews, setSyncingReviews] = useState(false);
    const [reviewsError, setReviewsError] = useState(null);
    const [replyingToReview, setReplyingToReview] = useState(null);
    const [replyComment, setReplyComment] = useState('');
    const [replyLoading, setReplyLoading] = useState(false);
    const [replyError, setReplyError] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') return;
        setSnackbarOpen(false);
    };

    const fetchConfig = async () => {
        setLoadingConfig(true);
        try {
            const data = await gmbConfigService.getConfig();
            if (data && data.accessToken) {
                setConfig(data);
                fetchReviews();
            } else {
                setConfig(null);
            }
        } catch (err) {
            setConfig(null);
        } finally {
            setLoadingConfig(false);
        }
    };

    const fetchReviews = async () => {
        setLoadingReviews(true);
        try {
            const data = await gmbReviewService.getAllReviews();
            setReviews(data);
        } catch (err) {
            setReviewsError('Erro ao carregar avaliações GMB.');
        } finally {
            setLoadingReviews(false);
        }
    };

    useEffect(() => {
        if (open && user) {
            fetchConfig();
        }
    }, [open, user]);

    const handleSyncReviews = async () => {
        setSyncingReviews(true);
        setReviewsError(null);
        try {
            await gmbReviewService.syncReviews();
            fetchReviews();
            setSnackbarMessage('Sincronização iniciada com sucesso!');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
        } catch (err) {
            setReviewsError(err.message || 'Erro ao sincronizar avaliações.');
        } finally {
            setSyncingReviews(false);
        }
    };
    
    const handleReplyClick = (review) => {
        setReplyingToReview(review);
        setReplyComment(review.replyComment || '');
        setReplyError(null);
      };
    
      const handleSendReply = async () => {
        setReplyLoading(true);
        setReplyError(null);
        try {
          await gmbReviewService.replyToReview(replyingToReview.id, replyComment);
          setReviews(prevReviews =>
            prevReviews.map(r =>
              r.id === replyingToReview.id ? { ...r, replyComment, repliedAt: new Date().toISOString() } : r
            )
          );
          setReplyingToReview(null);
          setReplyComment('');
          setSnackbarMessage('Resposta enviada com sucesso!');
          setSnackbarSeverity('success');
          setSnackbarOpen(true);
        } catch (err) {
          setReplyError(err.message || 'Erro ao enviar resposta.');
        } finally {
          setReplyLoading(false);
        }
      };

    return (
        <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: '80%', md: '60%' } } }}>
            <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Typography variant="h5" component="h2" gutterBottom>
                    Integração Google Meu Negócio
                </Typography>
                <Divider sx={{ mb: 2 }} />

                {loadingConfig ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>
                ) : !config ? (
                    <Paper elevation={0} sx={{ p: 4, textAlign: 'center' }}>
                        <Typography variant="h6" gutterBottom>Conecte sua conta do Google</Typography>
                        <Typography sx={{ mb: 3 }}>
                            Para gerenciar suas avaliações do Google Meu Negócio, você precisa autorizar o acesso à sua conta.
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            href={`${process.env.REACT_APP_API_URL}/gmb-auth`}
                            component="a"
                        >
                            Conectar com o Google
                        </Button>
                    </Paper>
                ) : (
                    <Paper elevation={0} sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>Avaliações Recebidas</Typography>
                        <Button variant="outlined" sx={{ mb: 2 }} onClick={handleSyncReviews} disabled={syncingReviews}>
                            {syncingReviews ? <CircularProgress size={20} /> : 'Sincronizar Novas Avaliações'}
                        </Button>
                        {reviewsError && <Alert severity="error" sx={{ mb: 2 }}>{reviewsError}</Alert>}
                        {loadingReviews ? <CircularProgress /> : (
                            <List sx={{ maxHeight: 'calc(100vh - 300px)', overflowY: 'auto' }}>
                                {reviews.length > 0 ? reviews.map((review) => (
                                    <React.Fragment key={review.id}>
                                        <ListItem alignItems="flex-start">
                                            <ListItemText
                                                primary={`${review.reviewerName || 'Anônimo'} - ${review.starRating} Estrelas`}
                                                secondary={
                                                    <>
                                                        <Typography component="span" variant="body2" color="text.primary">{review.comment}</Typography>
                                                        {review.repliedAt && <Typography variant="caption" display="block" color="text.secondary">Respondido em: {formatDateForDisplay(review.repliedAt, 'dd/MM/yyyy')}</Typography>}
                                                        {review.replyComment && <Typography variant="caption" display="block" color="text.secondary">Sua resposta: {review.replyComment}</Typography>}
                                                    </>
                                                }
                                            />
                                              {!review.repliedAt && (
                                                <Button size="small" onClick={() => handleReplyClick(review)}>Responder</Button>
                                            )}
                                        </ListItem>
                                         {replyingToReview?.id === review.id && (
                                            <Box sx={{ mt: 1, mb: 2, ml: 2, width: '100%' }}>
                                                <TextField label="Sua Resposta" multiline rows={3} fullWidth value={replyComment} onChange={(e) => setReplyComment(e.target.value)} sx={{ mb: 1 }} />
                                                {replyError && <Alert severity="error" sx={{ mb: 1 }}>{replyError}</Alert>}
                                                <Button variant="contained" size="small" onClick={handleSendReply} disabled={replyLoading}>
                                                {replyLoading ? <CircularProgress size={20} /> : 'Enviar Resposta'}
                                                </Button>
                                            </Box>
                                        )}
                                        <Divider component="li" />
                                    </React.Fragment>
                                )) : <Typography>Nenhuma avaliação encontrada.</Typography>}
                            </List>
                        )}
                    </Paper>
                )}
                <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
                    <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
                        {snackbarMessage}
                    </Alert>
                </Snackbar>
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
                sx: { width: 400 }
            }}
        >
            <Box sx={{ width: '100%', p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
                <Box component="img" src={UaiRangoLogo} alt="Uai Rango Logo" sx={{ width: 100, height: 100, mb: 2 }} />
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
                    InputProps={{ readOnly: true }}
                    sx={{ mb: 2 }}
                />
                <Button
                    variant="contained"
                    onClick={() => { handleSave('uairango'); onClose(); }}
                    sx={{ mb: 2 }}
                >
                    Salvar
                </Button>
                <Button variant="outlined" onClick={onClose}>
                    Cancelar
                </Button>
                <Alert severity="info" sx={{ mt: 2, textAlign: 'center' }}>
                    É necessário entrar em contato com o suporte do Voltaki para liberar a integração.
                </Alert>
            </Box>
        </Drawer>
    );
};

const IfoodConfigModal = ({ open, onClose, tenant, fetchTenantData }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (open) {
            setError('');
        }
    }, [open]);

    const handleInitiateAuth = async () => {
        setLoading(true);
        setError('');
        try {
            const { data } = await apiAuthenticated.get('/ifood/authorize');
            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error('URL de autorização não recebida.');
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Erro ao iniciar conexão com iFood.';
            setError(errorMessage);
            toast.error(errorMessage);
            setLoading(false);
        }
    };

    return (
        <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: {xs: '90%', sm: 450} } }}>
            <Box sx={{ width: '100%', p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
                <Box component="img" src={IfoodLogo} alt="iFood Logo" sx={{ width: 100, height: 100, mb: 2 }} />
                <Typography variant="h6" component="h2" gutterBottom>
                    Configurar iFood
                </Typography>
                
                {tenant?.ifoodAccessToken ? (
                    <Alert severity="success" sx={{ my: 2, width: '100%', textAlign: 'center' }}>
                        Sua conta iFood está conectada e sincronizada.
                    </Alert>
                ) : (
                    <>
                        <Typography sx={{ mt: 2, mb: 2, textAlign: 'center' }}>
                            Conecte sua conta iFood para que o sistema busque seus pedidos automaticamente.
                        </Typography>
                         {error && <Alert severity="error" sx={{ my: 2, width: '100%' }}>{error}</Alert>}
                        <Button 
                            variant="contained" 
                            onClick={handleInitiateAuth} 
                            disabled={loading} 
                            sx={{ backgroundColor: '#EA1D2C', '&:hover': { backgroundColor: '#C81925' }, mt: 2 }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Conectar iFood'}
                        </Button>
                    </>
                )}
            </Box>
        </Drawer>
    );
};

export default IntegrationsPage;