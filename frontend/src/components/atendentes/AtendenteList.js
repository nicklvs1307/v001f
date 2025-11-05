import React, { useState, useContext } from 'react';
import useAtendentes from '../../hooks/useAtendentes';
import AuthContext from '../../context/AuthContext';
import AtendenteModal from './AtendenteModal';
import ConfirmationDialog from '../layout/ConfirmationDialog';
import { useSnackbar } from '../../context/SnackbarContext';
import { 
    Box, 
    Typography, 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow, 
    Paper, 
    CircularProgress, 
    Alert,
    Button,
    IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const AtendenteList = () => {
    const { user } = useContext(AuthContext);
    const { atendentes, loading, error, createAtendente, updateAtendente, deleteAtendente } = useAtendentes();
    const { showSnackbar } = useSnackbar();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [selectedAtendente, setSelectedAtendente] = useState(null);
    const [formError, setFormError] = useState('');


    const handleOpenModal = (atendente = null) => {
        setSelectedAtendente(atendente);
        setFormError(''); // Clear previous errors
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setSelectedAtendente(null);
        setIsModalOpen(false);
        setFormError(''); // Also clear errors on close
    };
    


    const handleOpenConfirm = (atendente) => {
        setSelectedAtendente(atendente);
        setIsConfirmOpen(true);
    };

    const handleCloseConfirm = () => {
        setSelectedAtendente(null);
        setIsConfirmOpen(false);
    };

    const handleAtendenteCreate = async (atendenteData) => {
        try {
            await createAtendente(atendenteData);
            showSnackbar('Atendente criado com sucesso!', 'success');
            handleCloseModal();
        } catch (err) {
            setFormError(err.message);
            showNotification(err.message, 'error');
        }
    };

    const handleAtendenteUpdate = async (atendenteData) => {
        try {
            await updateAtendente(selectedAtendente.id, atendenteData);
            showSnackbar('Atendente atualizado com sucesso!', 'success');
            handleCloseModal();
        } catch (err) {
            setFormError(err.message);
            showNotification(err.message, 'error');
        }
    };

    const handleAtendenteDelete = async () => {
        try {
            await deleteAtendente(selectedAtendente.id);
            showSnackbar('Atendente deletado com sucesso!', 'success');
            handleCloseConfirm();
        } catch (err) {
showSnackbar(err.message, 'error');
        }
    };

    if (loading) {
        return <CircularProgress />;
    }

    return (
        <Box sx={{ mt: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1">Atendentes</Typography>
                {(user?.role?.toLowerCase() === 'super admin' || user?.role?.toLowerCase() === 'admin') && (
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenModal()}
                    >
                        Novo Atendente
                    </Button>
                )}
            </Box>

            {error && <Alert severity="error">{error}</Alert>}

            <Paper elevation={2}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Nome</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="right">Ações</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {atendentes.map((atendente) => (
                                <TableRow key={atendente.id}>
                                    <TableCell>{atendente.name}</TableCell>
                                    <TableCell>{atendente.status === 'active' ? 'Ativo' : 'Inativo'}</TableCell>
                                    <TableCell align="right">
                                        <IconButton color="primary" onClick={() => handleOpenModal(atendente)}>
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton color="secondary" onClick={() => handleOpenConfirm(atendente)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <AtendenteModal
                open={isModalOpen}
                onClose={handleCloseModal}
                onAtendenteCreated={handleAtendenteCreate}
                onAtendenteUpdated={handleAtendenteUpdate}
                initialData={selectedAtendente}
                formError={formError}
                onError={setFormError}
            />

            <ConfirmationDialog
                open={isConfirmOpen}
                onClose={handleCloseConfirm}
                onConfirm={handleAtendenteDelete}
                title="Confirmar Exclusão"
                description={`Tem certeza que deseja deletar o atendente ${selectedAtendente?.name}?`}
            />
        </Box>
    );
};

export default AtendenteList;
