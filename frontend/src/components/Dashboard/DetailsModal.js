
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
    Alert
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const DetailsModal = ({ open, handleClose, title, data, loading, error }) => {
    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '80%',
        maxWidth: '900px',
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
    };

    const renderContent = () => {
        if (loading) return <CircularProgress />;
        if (error) return <Alert severity="error">{error}</Alert>;
        if (!data || data.length === 0) return <Typography>Nenhum dado encontrado.</Typography>;

        let headers = [];
        let rows = [];

        switch (title) {
            case 'Detalhes de Promotores':
            case 'Detalhes de Neutros':
            case 'Detalhes de Detratores':
                headers = ['Cliente', 'Data', 'Comentário', 'Ações'];
                rows = data.map((row) => (
                    <TableRow key={row.id}>
                        <TableCell>{row.client?.name || 'N/A'}</TableCell>
                        <TableCell>{new Date(row.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>{row.textValue || 'N/A'}</TableCell>
                        <TableCell>{/* Ações */}</TableCell>
                    </TableRow>
                ));
                break;

            case 'Detalhes de Cadastros':
                headers = ['Nome', 'Data de Cadastro'];
                rows = data.map((row) => (
                    <TableRow key={row.id}>
                        <TableCell>{row.name}</TableCell>
                        <TableCell>{new Date(row.createdAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                ));
                break;

            case 'Detalhes de Cupons Gerados':
                headers = ['Cliente', 'Data de Geração', 'Cupom'];
                rows = data.map((row) => (
                    <TableRow key={row.id}>
                        <TableCell>{row.client?.name || 'N/A'}</TableCell>
                        <TableCell>{new Date(row.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>{row.code}</TableCell>
                    </TableRow>
                ));
                break;

            case 'Detalhes de Cupons Utilizados':
                headers = ['Cliente', 'Data de Utilização', 'Cupom'];
                rows = data.map((row) => (
                    <TableRow key={row.id}>
                        <TableCell>{row.client?.name || 'N/A'}</TableCell>
                        <TableCell>{new Date(row.updatedAt).toLocaleDateString()}</TableCell>
                        <TableCell>{row.code}</TableCell>
                    </TableRow>
                ));
                break;

            default:
                return <Typography>Categoria não reconhecida.</Typography>;
        }

        return (
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            {headers.map((header) => <TableCell key={header}>{header}</TableCell>)}
                        </TableRow>
                    </TableHead>
                    <TableBody>{rows}</TableBody>
                </Table>
            </TableContainer>
        );
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
