
import React from 'react';
import {
    Modal,
    Box,
    Typography,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
    Alert,
    Grid
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const AttendantDetailsModal = ({ open, handleClose, data, loading, error }) => {
    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '80%',
        maxWidth: '1000px',
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
    };

    const renderContent = () => {
        if (loading) return <CircularProgress />;
        if (error) return <Alert severity="error">{error}</Alert>;
        if (!data) return <Typography>Nenhum dado encontrado.</Typography>;

        const { attendantName, npsScore, promoters, neutrals, detractors, totalResponses, responses } = data;

        return (
            <Box>
                <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={12} sm={6} md={3}><Typography><strong>NPS:</strong> {npsScore}</Typography></Grid>
                    <Grid item xs={12} sm={6} md={3}><Typography><strong>Promotores:</strong> {promoters}</Typography></Grid>
                    <Grid item xs={12} sm={6} md={3}><Typography><strong>Neutros:</strong> {neutrals}</Typography></Grid>
                    <Grid item xs={12} sm={6} md={3}><Typography><strong>Detratores:</strong> {detractors}</Typography></Grid>
                    <Grid item xs={12}><Typography><strong>Total de Respostas:</strong> {totalResponses}</Typography></Grid>
                </Grid>

                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell>Cliente</TableCell>
                                <TableCell>Data</TableCell>
                                <TableCell>Nota</TableCell>
                                <TableCell>Comentário</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {responses && responses.map((row) => (
                                <TableRow key={row.id}>
                                    <TableCell>{row.client?.name || 'N/A'}</TableCell>
                                    <TableCell>{new Date(row.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell>{row.ratingValue}</TableCell>
                                    <TableCell>{row.textValue || 'N/A'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
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
