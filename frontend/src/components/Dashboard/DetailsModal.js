
import React from 'react';
import {
    Modal,
    Box,
    Typography,
    IconButton,
    CircularProgress,
    Alert,
    Card,
    CardContent,
    Grid,
    Button,
    Divider,
    Paper,
    useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MessageIcon from '@mui/icons-material/Message';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { formatDateForDisplay } from '../../utils/dateUtils';
import { useNavigate } from 'react-router-dom';

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '90%',
    maxWidth: '900px',
    bgcolor: 'background.paper',
    borderRadius: '8px',
    boxShadow: 24,
    display: 'flex',
    flexDirection: 'column',
};

const DetailsModal = ({ open, handleClose, title, data, loading, error }) => {
    const navigate = useNavigate();
    const theme = useTheme();

    const handleViewClient = (clientId) => {
        navigate(`/clients/${clientId}`);
        handleClose(); // Fecha o modal ao navegar
    };

    const renderActions = (row) => (
        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button variant="outlined" size="small" startIcon={<MessageIcon />}>
                Enviar Mensagem
            </Button>
            <Button variant="contained" size="small" startIcon={<ConfirmationNumberIcon />}>
                Enviar Cupom
            </Button>
            {row.client?.id && (
                <Button
                    variant="contained"
                    size="small"
                    color="info"
                    onClick={() => handleViewClient(row.client.id)}
                    startIcon={<AccountCircleIcon />}
                >
                    Ver Cliente
                </Button>
            )}
        </Box>
    );

    const renderContent = () => {
        if (loading) {
            return (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
                    <CircularProgress />
                </Box>
            );
        }
        if (error) {
            return (
                <Alert severity="error" sx={{ m: 2 }}>
                    {error}
                </Alert>
            );
        }
        if (!data || data.length === 0) {
            return (
                <Typography sx={{ p: 3, textAlign: 'center' }}>
                    Nenhum dado encontrado.
                </Typography>
            );
        }

        let items;

        switch (title) {
            case 'Detalhes de Promotores (NPS)':
            case 'Detalhes de Detratores (NPS)':
            case 'Detalhes de Satisfeitos (CSAT)':
            case 'Detalhes de Insatisfeitos (CSAT)':
            case 'Detalhes de Neutros (NPS)':
                items = data.map((row) => (
                    <Paper key={row.id} elevation={2} sx={{ mb: 2, '&:hover': { boxShadow: 6 } }}>
                        <CardContent>
                            <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle1" component="strong">{row.client?.name || 'Cliente Anônimo'}</Typography>
                                    <Typography variant="body2" color="text.secondary">{`Respondido em: ${formatDateForDisplay(row.createdAt, 'dd/MM/yyyy HH:mm')}`}</Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="h6" component="div" textAlign={{ xs: 'left', md: 'right' }}>
                                        Nota: {row.ratingValue}
                                    </Typography>
                                </Grid>
                                {row.pergunta?.text && (
                                    <Grid item xs={12}>
                                        <Typography variant="body2" fontStyle="italic">"{row.pergunta.text}"</Typography>
                                    </Grid>
                                )}
                                {row.textValue && (
                                    <Grid item xs={12}>
                                        <Typography variant="body1"><strong>Comentário:</strong> {row.textValue}</Typography>
                                    </Grid>
                                )}
                                <Grid item xs={12}>
                                    {renderActions(row)}
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Paper>
                ));
                break;

            case 'Detalhes de Aniversariantes do Mês':
                items = data.map((row) => (
                    <Paper key={row.id} elevation={2} sx={{ mb: 2, '&:hover': { boxShadow: 6 } }}>
                        <CardContent>
                            <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle1" component="strong">{row.name || 'Cliente Anônimo'}</Typography>
                                    <Typography variant="body2" color="text.secondary">{`Aniversário em: ${formatDateForDisplay(row.birthDate, 'dd/MM')}`}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    {renderActions(row)}
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Paper>
                ));
                break;

            case 'Detalhes de Cadastros':
                items = data.map((row) => (
                    <Paper key={row.id} elevation={2} sx={{ p: 2, mb: 2, '&:hover': { boxShadow: 6 } }}>
                        <Typography variant="subtitle1"><strong>Nome:</strong> {row.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Data de Cadastro: {formatDateForDisplay(row.createdAt, 'dd/MM/yyyy HH:mm')}
                        </Typography>
                    </Paper>
                ));
                break;

            case 'Detalhes de Cupons Gerados':
            case 'Detalhes de Cupons Utilizados':
                items = data.map((row) => (
                    <Paper key={row.id} elevation={2} sx={{ p: 2, mb: 2, '&:hover': { boxShadow: 6 } }}>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={8}>
                                <Typography variant="subtitle1"><strong>Cliente:</strong> {row.client?.name || 'N/A'}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {title === 'Detalhes de Cupons Gerados' ? 'Gerado em:' : 'Utilizado em:'} {formatDateForDisplay(row.updatedAt, 'dd/MM/yyyy HH:mm')}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={4} textAlign="right">
                                <Typography variant="h6" component="div" color="primary">{row.code}</Typography>
                            </Grid>
                        </Grid>
                    </Paper>
                ));
                break;
                
            default:
                return (
                    <Typography sx={{ p: 3, textAlign: 'center' }}>
                        Categoria de dados não reconhecida.
                    </Typography>
                );
        }

        return <Box sx={{ p: 1, maxHeight: '70vh', overflowY: 'auto' }}>{items}</Box>;
    };

    return (
        <Modal open={open} onClose={handleClose} aria-labelledby="details-modal-title">
            <Box sx={modalStyle}>
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography id="details-modal-title" variant="h6" component="h2">
                        {title}
                    </Typography>
                    <IconButton aria-label="close" onClick={handleClose}>
                        <CloseIcon />
                    </IconButton>
                </Box>
                <Divider />
                <Box sx={{ flex: 1, overflowY: 'auto' }}>
                    {renderContent()}
                </Box>
                <Divider />
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button onClick={handleClose}>Fechar</Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default DetailsModal;

