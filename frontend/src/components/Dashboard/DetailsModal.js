
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
    Button
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import MessageIcon from '@mui/icons-material/Message';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';

const DetailsModal = ({ open, handleClose, title, data, loading, error }) => {
    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90%',
        maxWidth: '900px',
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
        if (!data || data.length === 0) return <Typography>Nenhum dado encontrado.</Typography>;

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

        let items = [];

        switch (title) {
            case 'Detalhes de Promotores (NPS)':
            case 'Detalhes de Detratores (NPS)':
            case 'Detalhes de Satisfeitos (CSAT)':
            case 'Detalhes de Insatisfeitos (CSAT)':
                items = data.map((row) => (
                    <Card key={row.id} sx={{ mb: 2 }}>
                        <CardContent>
                            <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body1"><strong>Cliente:</strong> {row.client?.name || 'N/A'}</Typography>
                                    <Typography variant="body2" color="text.secondary"><strong>Data:</strong> {new Date(row.createdAt).toLocaleDateString()}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body1"><strong>Nota:</strong> {row.ratingValue}</Typography>
                                    <Typography variant="body2" color="text.secondary"><strong>Pergunta:</strong> {row.pergunta?.text || 'N/A'}</Typography>
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
                ));
                break;

            case 'Detalhes de Cadastros':
                items = data.map((row) => (
                    <Card key={row.id} sx={{ mb: 2 }}>
                        <CardContent>
                            <Typography variant="body1"><strong>Nome:</strong> {row.name}</Typography>
                            <Typography variant="body2" color="text.secondary"><strong>Data de Cadastro:</strong> {new Date(row.createdAt).toLocaleDateString()}</Typography>
                        </CardContent>
                    </Card>
                ));
                break;

            case 'Detalhes de Cupons Gerados':
                items = data.map((row) => (
                    <Card key={row.id} sx={{ mb: 2 }}>
                        <CardContent>
                            <Typography variant="body1"><strong>Cliente:</strong> {row.client?.name || 'N/A'}</Typography>
                            <Typography variant="body2" color="text.secondary"><strong>Data de Geração:</strong> {new Date(row.createdAt).toLocaleDateString()}</Typography>
                            <Typography variant="body2"><strong>Cupom:</strong> {row.code}</Typography>
                        </CardContent>
                    </Card>
                ));
                break;

            case 'Detalhes de Cupons Utilizados':
                items = data.map((row) => (
                    <Card key={row.id} sx={{ mb: 2 }}>
                        <CardContent>
                            <Typography variant="body1"><strong>Cliente:</strong> {row.client?.name || 'N/A'}</Typography>
                            <Typography variant="body2" color="text.secondary"><strong>Data de Utilização:</strong> {new Date(row.updatedAt).toLocaleDateString()}</Typography>
                            <Typography variant="body2"><strong>Cupom:</strong> {row.code}</Typography>
                        </CardContent>
                    </Card>
                ));
                break;

            default:
                return <Typography>Categoria não reconhecida.</Typography>;
        }

        return <Box sx={{ maxHeight: '70vh', overflowY: 'auto', p: 1 }}>{items}</Box>;
    };

    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="details-modal-title"
            aria-describedby="details-modal-description"
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
                <Typography id="details-modal-title" variant="h6" component="h2" gutterBottom>
                    {title}
                </Typography>
                {renderContent()}
            </Box>
        </Modal>
    );
};

export default DetailsModal;
