
import React from 'react';
import {
    Modal,
    Box,
    Typography,
    IconButton,
    CircularProgress,
    Alert,
    Grid,
    Card,
    CardContent,
    Button
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MessageIcon from '@mui/icons-material/Message';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import { formatDateForDisplay } from '../../utils/dateUtils';

const AttendantDetailsModal = ({ open, handleClose, data, loading, error }) => {
    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90%',
        maxWidth: '1000px',
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
        display: 'flex',
        flexDirection: 'column',
    };

    const renderContent = () => {
        if (loading) return <CircularProgress />;
        if (error) return <Alert severity="error">{error}</Alert>;
        if (!data) return <Typography>Nenhum dado encontrado.</Typography>;

        const { attendantName, npsScore, promoters, neutrals, detractors, totalResponses, responses } = data;

        const renderActions = (row) => (
            <Box sx={{ mt: 2 }}>
                <Button variant="outlined" size="small" sx={{ mr: 1 }}>
                    <MessageIcon sx={{ mr: 0.5 }} fontSize="small" />
                    Enviar Mensagem
                </Button>
                <Button variant="contained" size="small">
                    <ConfirmationNumberIcon sx={{ mr: 0.5 }} fontSize="small" />
                    Enviar Cupom
                </Button>
            </Box>
        );

        return (
            <Box>
                <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={12} sm={6} md={3}><Typography><strong>NPS:</strong> {npsScore}</Typography></Grid>
                    <Grid item xs={12} sm={6} md={3}><Typography><strong>Promotores:</strong> {promoters}</Typography></Grid>
                    <Grid item xs={12} sm={6} md={3}><Typography><strong>Neutros:</strong> {neutrals}</Typography></Grid>
                    <Grid item xs={12} sm={6} md={3}><Typography><strong>Detratores:</strong> {detractors}</Typography></Grid>
                    <Grid item xs={12}><Typography><strong>Total de Respostas:</strong> {totalResponses}</Typography></Grid>
                </Grid>

                <Box sx={{ maxHeight: '60vh', overflowY: 'auto', p: 1 }}>
                    {responses && responses.map((row) => (
                        <Card key={row.id} sx={{ mb: 2 }}>
                            <CardContent>
                                <Grid container spacing={2} alignItems="center">
                                    <Grid item xs={12} sm={4}>
                                        <Typography variant="body1"><strong>Cliente:</strong> {row.client?.name || 'N/A'}</Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <Typography variant="body2" color="text.secondary"><strong>Data:</strong> {formatDateForDisplay(row.createdAt, 'dd/MM/yyyy')}</Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <Typography variant="body2" color="text.secondary"><strong>Nota:</strong> {row.ratingValue}</Typography>
                                    </Grid>
                                    {row.textValue && (
                                        <Grid item xs={12}>
                                            <Typography variant="body2"><strong>Comentário:</strong> {row.textValue}</Typography>
                                        </Grid>
                                    )}
                                    <Grid item xs={12}>
                                        {renderActions(row)}
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    ))}
                </Box>
            </Box>
        );
    };

    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="attendant-details-modal-title"
        >
            <Box sx={style}>
                <IconButton
                    aria-label="close"
                    onClick={handleClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon />
                </IconButton>
                <Typography id="attendant-details-modal-title" variant="h6" component="h2" gutterBottom>
                    Detalhes do Atendente: {data?.attendantName}
                </Typography>
                {renderContent()}
            </Box>
        </Modal>
    );
};

export default AttendantDetailsModal;
