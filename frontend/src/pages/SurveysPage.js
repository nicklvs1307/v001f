import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    Grid,
    Button,
    LinearProgress,
    Menu,
    MenuItem,
    useTheme,
    CircularProgress,
    Alert,
    // Snackbar // Removed
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClipboardListIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PercentIcon from '@mui/icons-material/Percent';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import VisibilityIcon from '@mui/icons-material/Visibility';
import BarChartIcon from '@mui/icons-material/BarChart';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import QrCodeIcon from '@mui/icons-material/QrCode';
import { Dialog, DialogTitle, DialogContent, DialogActions, Link } from '@mui/material';
import surveyService from '../services/surveyService';
import AuthContext from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';

const SurveyListPage = () => {
    const theme = useTheme();
    const { user } = useContext(AuthContext);
    const tenantId = user?.role === 'Super Admin' ? null : user?.tenantId;
    const navigate = useNavigate();
    const { showNotification } = useNotification();

    const [anchorEl, setAnchorEl] = useState(null);
    const openFilterMenu = Boolean(anchorEl);

    const [surveyStats, setSurveyStats] = useState(null);
    const [surveys, setSurveys] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(''); // Keep local error for now, might be used for Alert component

    const [openQrCodeModal, setOpenQrCodeModal] = useState(false);
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
    const [publicSurveyUrl, setPublicSurveyUrl] = useState('');
    const [qrCodeLoading, setQrCodeLoading] = useState(false);
    // const [qrCodeError, setQrCodeError] = useState(''); // Removed
    
    // const [snackbarOpen, setSnackbarOpen] = useState(false); // Removed
    // const [snackbarMessage, setSnackbarMessage] = useState(''); // Removed
    // const [snackbarSeverity, setSnackbarSeverity] = useState('success'); // Removed

    // const handleCloseSnackbar = (event, reason) => { // Removed
    //     if (reason === 'clickaway') {
    //         return;
    //     }
    //     setSnackbarOpen(false);
    // };

    const handleCloseQrCodeModal = () => {
        setOpenQrCodeModal(false);
        setQrCodeDataUrl('');
        setPublicSurveyUrl('');
        // setQrCodeError(''); // Removed
    };

    const handleCopyLink = (link) => {
        navigator.clipboard.writeText(link)
            .then(() => {
                showNotification('Link copiado para a área de transferência!', 'success'); // Use global notification
            })
            .catch(err => {
                showNotification('Falha ao copiar o link.', 'error'); // Use global notification
            });
    };

    const handleGenerateQrCode = async (publicUrl) => {
        setQrCodeLoading(true);
        // setQrCodeError(''); // Removed
        setOpenQrCodeModal(true);
        try {
            setPublicSurveyUrl(publicUrl);
            const qrCodeResponse = await surveyService.generateQrCode(publicUrl);
            setQrCodeDataUrl(qrCodeResponse.qrCode);
        } catch (err) {
            showNotification('Falha ao gerar o QR Code.', 'error'); // Use global notification
        } finally {
            setQrCodeLoading(false);
        }
    };

    const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'active', 'inactive', 'draft'

    const handleFilterSelect = (status) => {
        setFilterStatus(status);
        handleFilterClose();
    };

    const handleFilterClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleFilterClose = () => {
        setAnchorEl(null);
    };

    const fetchSurveyData = useCallback(async () => {
        try {
            setLoading(true);
            setError('');

            const stats = await surveyService.getSurveyStats();
            // Passa o status do filtro para o serviço
            const surveysList = await surveyService.getSurveysList(filterStatus);

            setSurveyStats(stats);
            setSurveys(surveysList);
        } catch (err) {
            showNotification(err.message || 'Falha ao carregar os dados das pesquisas.', 'error'); // Use global notification
            setError(err.message || 'Falha ao carregar os dados das pesquisas.'); // Keep local error for now
        } finally {
            setLoading(false);
        }
    }, [filterStatus, showNotification]); // Add showNotification to dependencies

    useEffect(() => {
        fetchSurveyData();
    }, [fetchSurveyData]);

    const handleDeleteSurvey = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir esta pesquisa?')) {
            try {
                await surveyService.deleteSurvey(id);
                fetchSurveyData();
                showNotification('Pesquisa deletada com sucesso!', 'success'); // Show success notification
            } catch (err) {
                showNotification(err.message || 'Falha ao excluir a pesquisa.', 'error'); // Use global notification
                setError(err.message || 'Falha ao excluir a pesquisa.'); // Keep local error for now
            }
        }
    };

    const StatCard = ({ title, value, icon: IconComponent, iconColor }) => (
        <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={2} sx={{
                p: 2,
                height: '100%',
                borderLeft: `4px solid ${iconColor || theme.palette.primary.main}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'transform 0.3s',
                '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: theme.shadows[4],
                },
            }}>
                <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold" textTransform="uppercase">
                        {title}
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" color="text.primary">
                        {value}
                    </Typography>
                </Box>
                <Box>
                    <IconComponent sx={{ fontSize: '2.5rem', color: iconColor || theme.palette.primary.main }} />
                </Box>
            </Paper>
        </Grid>
    );

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
                <CircularProgress />
                <Typography>Carregando dados das pesquisas...</Typography>
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    if (!surveyStats || !surveys) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
                <Typography>Nenhum dado de pesquisa encontrado.</Typography>
            </Container>
        );
    }

    return (
        <>
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                {/* Header */}
                <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                    <Grid item>
                        <Typography variant="h4" component="h1" gutterBottom>
                            Módulo de Pesquisas
                        </Typography>
                    </Grid>
                    <Grid item>
                        <Button 
                            variant="contained" 
                            color="primary" 
                            onClick={() => navigate('/dashboard/pesquisas/create')} // Changed from /surveys/new
                        >
                            <AddIcon sx={{ mr: 1 }} /> Nova Pesquisa
                        </Button>
                    </Grid>
                </Grid>

                {/* Dashboard Stats */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <StatCard 
                        title="Pesquisas Ativas" 
                        value={surveyStats.activeSurveys} 
                        icon={ClipboardListIcon} 
                        iconColor={theme.palette.primary.main}
                    />
                    <StatCard 
                        title="Respostas (Mês)" 
                        value={surveyStats.responsesMonth} 
                        icon={CheckCircleIcon} 
                        iconColor={theme.palette.success.main}
                    />
                    <StatCard 
                        title="Taxa de Resposta" 
                        value={`${surveyStats.responseRate}%`} 
                        icon={PercentIcon} 
                        iconColor={theme.palette.info.main}
                    />
                    <StatCard 
                        title="Pesquisas Pendentes" 
                        value={surveyStats.pendingSurveys} 
                        icon={AccessTimeIcon} 
                        iconColor={theme.palette.warning.main}
                    />
                </Grid>

                {/* Pesquisas Ativas */}
                <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" fontWeight="bold" color="primary">
                            Pesquisas Ativas
                        </Typography>
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={handleFilterClick}
                            endIcon={<FilterListIcon />}
                        >
                            Filtrar
                        </Button>
                        <Menu
                            anchorEl={anchorEl}
                            open={openFilterMenu}
                            onClose={handleFilterClose}
                        >
                            <MenuItem onClick={() => handleFilterSelect('all')}>Todas</MenuItem>
                            <MenuItem onClick={() => handleFilterSelect('active')}>Ativas</MenuItem>
                            <MenuItem onClick={() => handleFilterSelect('inactive')}>Inativas</MenuItem>
                            <MenuItem onClick={() => handleFilterSelect('draft')}>Rascunhos</MenuItem>
                        </Menu>
                    </Box>

                    {/* Lista de Pesquisas */}
                    {Array.isArray(surveys) && surveys.map((survey) => (
                        <Paper key={survey.id} elevation={1} sx={{
                            mb: 2,
                            p: 2,
                            position: 'relative',
                            overflow: 'hidden',
                            transition: 'all 0.3s',
                            '&:hover': {
                                boxShadow: theme.shadows[4],
                            },
                        }}>
                            <Box sx={{
                                position: 'absolute',
                                top: 15,
                                right: 15,
                                bgcolor: survey.status === 'Ativa' ? theme.palette.success.main : theme.palette.warning.main, // Simplified color logic
                                color: 'white',
                                px: 1.5,
                                py: 0.5,
                                borderRadius: '20px',
                                fontSize: '0.8rem',
                                fontWeight: 'bold',
                            }}>
                                {survey.status}
                            </Box>
                            <Typography variant="h5" component="h2" gutterBottom>
                                {survey.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                {survey.description}
                            </Typography>

                            <Grid container spacing={2} alignItems="center" sx={{ mt: 2 }}>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="body2" mb={1}>Progresso: {survey.progress || 0}%</Typography>
                                    <LinearProgress 
                                        variant="determinate" 
                                        value={survey.progress || 0} 
                                        sx={{ height: 10, borderRadius: 5, bgcolor: theme.palette.grey[300] }}
                                        color={survey.status === 'Ativa' ? 'success' : 'warning'}
                                    />
                                </Grid>
                                <Grid item xs={6} md={3}>
                                    <Typography variant="body2">
                                        <PersonIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                                        {survey.respondents || 0}/{survey.expectedRespondents || 'N/A'}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">Respondentes</Typography>
                                </Grid>
                                <Grid item xs={6} md={3}>
                                    <Typography variant="body2">
                                        <CalendarTodayIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                                        {new Date(survey.dueDate).toLocaleDateString() || 'N/A'}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">Data limite</Typography>
                                </Grid>
                            </Grid>

                            <Box sx={{ mt: 3 }}>
                                <Button 
                                    variant="outlined" 
                                    size="small" 
                                    sx={{ mr: 1 }} 
                                    onClick={() => window.open(survey.publicUrl, '_blank')}
                                >
                                    <VisibilityIcon fontSize="small" sx={{ mr: 0.5 }} /> Visualizar
                                </Button>
                                <Button 
                                    variant="outlined" 
                                    size="small" 
                                    sx={{ mr: 1 }} 
                                    onClick={() => navigate(`/dashboard/pesquisas/results/${survey.id}`)}
                                >
                                    <BarChartIcon fontSize="small" sx={{ mr: 0.5 }} /> Resultados
                                </Button>
                                <Button 
                                    variant="outlined" 
                                    size="small" 
                                    sx={{ mr: 1 }} 
                                    onClick={() => navigate(`/dashboard/pesquisas/edit/${survey.id}`)}
                                >
                                    <EditIcon fontSize="small" sx={{ mr: 0.5 }} /> Editar
                                </Button>
                                <Button 
                                    variant="outlined" 
                                    size="small" 
                                    sx={{ mr: 1 }} 
                                    onClick={() => handleCopyLink(survey.publicUrl)}
                                >
                                    <ContentCopyIcon fontSize="small" sx={{ mr: 0.5 }} /> Link
                                </Button>
                                <Button 
                                    variant="outlined" 
                                    size="small" 
                                    sx={{ mr: 1 }} 
                                    onClick={() => handleGenerateQrCode(survey.publicUrl)}
                                >
                                    <QrCodeIcon fontSize="small" sx={{ mr: 0.5 }} /> QR Code
                                </Button>
                                <Button 
                                    variant="outlined" 
                                    size="small" 
                                    color="error" 
                                    onClick={() => handleDeleteSurvey(survey.id)}
                                >
                                    <DeleteIcon fontSize="small" sx={{ mr: 0.5 }} /> Excluir
                                </Button>
                            </Box>
                        </Paper>
                    ))}

                    {/* Botão Ver Todas as Pesquisas */}
                    <Box sx={{ textAlign: 'center', mt: 4 }}>
                        <Button variant="outlined" color="primary" onClick={() => handleFilterSelect('all')}>
                            <ClipboardListIcon sx={{ mr: 1 }} /> Ver Todas as Pesquisas
                        </Button>
                    </Box>
                </Paper>

                {/* Modal do QR Code */}
                <Dialog open={openQrCodeModal} onClose={handleCloseQrCodeModal}>
                    <DialogTitle>QR Code da Pesquisa</DialogTitle>
                    <DialogContent sx={{ textAlign: 'center', p: 3 }}>
                        {qrCodeLoading && <CircularProgress />}
                        {qrCodeDataUrl && (
                            <Box>
                                <img src={qrCodeDataUrl} alt="QR Code da Pesquisa" style={{ maxWidth: '250px', height: 'auto' }} />
                                <Typography variant="body2" sx={{ mt: 2 }}>
                                    Link da Pesquisa: <Link href={publicSurveyUrl} target="_blank" rel="noopener noreferrer">{publicSurveyUrl}</Link>
                                </Typography>
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseQrCodeModal}>Fechar</Button>
                        {qrCodeDataUrl && (
                            <Button
                                variant="contained"
                                color="primary"
                                href={qrCodeDataUrl}
                                download={`qrcode-pesquisa-${publicSurveyUrl.split('/').pop()}.png`}
                            >
                                Baixar QR Code
                            </Button>
                        )}
                    </DialogActions>
                </Dialog>
            </Container>

        </>
    );
};

export default SurveyListPage;