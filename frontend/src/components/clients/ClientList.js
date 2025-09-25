import React, { useState } from 'react';
import useClients from '../../hooks/useClients';
import ClientModal from './ClientModal';
import SendMessageModal from './SendMessageModal'; // Importar o novo modal
import ConfirmationDialog from '../layout/ConfirmationDialog';
import { 
    Box, Typography, CircularProgress, Alert, Button, IconButton, 
    Table, TableBody, TableCell, TableContainer, TableHead, 
    TableRow, Paper, TablePagination, TableSortLabel, TextField, Tooltip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit'; 
import DeleteIcon from '@mui/icons-material/Delete'; 
import WhatsAppIcon from '@mui/icons-material/WhatsApp'; // Importar ícone do WhatsApp
import { formatDateForDisplay } from '../../utils/dateUtils';

const ClientList = () => {
    const { 
        clients, totalClients, loading, error, page, rowsPerPage, 
        orderBy, order, filterText, createClient, updateClient, deleteClient,
        handleRequestSort, handleChangePage, handleChangeRowsPerPage, handleFilterChange
    } = useClients();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isMessageModalOpen, setIsMessageModalOpen] = useState(false); // Estado para o novo modal
    const [selectedClient, setSelectedClient] = useState(null);
    const [formError, setFormError] = useState('');

    const handleOpenModal = (client = null) => {
        setSelectedClient(client);
        setIsModalOpen(true);
        setFormError('');
    };

    const handleCloseModal = () => {
        setSelectedClient(null);
        setIsModalOpen(false);
        setFormError('');
    };

    const handleOpenConfirm = (client) => {
        setSelectedClient(client);
        setIsConfirmOpen(true);
    };

    const handleCloseConfirm = () => {
        setSelectedClient(null);
        setIsConfirmOpen(false);
    };

    const handleOpenMessageModal = (client) => {
        setSelectedClient(client);
        setIsMessageModalOpen(true);
    };

    const handleCloseMessageModal = () => {
        setSelectedClient(null);
        setIsMessageModalOpen(false);
    };

    const handleClientCreate = async (clientData) => {
        try {
            await createClient(clientData);
            handleCloseModal();
        } catch (err) {
            setFormError(err.message);
        }
    };

    const handleClientUpdate = async (clientData) => {
        try {
            await updateClient(selectedClient.id, clientData);
            handleCloseModal();
        } catch (err) {
            setFormError(err.message);
        }
    };

    const handleClientDelete = async () => {
        try {
            await deleteClient(selectedClient.id);
            handleCloseConfirm();
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) {
        return <CircularProgress />;
    }

    return (
        <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom>Gerenciamento de Clientes</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <TextField
                    label="Buscar Cliente"
                    variant="outlined"
                    size="small"
                    value={filterText}
                    onChange={handleFilterChange}
                />
                <Button variant="contained" onClick={() => handleOpenModal()}>Adicionar Novo Cliente</Button>
            </Box>
            {error && <Alert severity="error">{error}</Alert>}
            
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }}>
                    <TableHead>
                        <TableRow>
                            {[ 
                                { id: 'name', label: 'Nome' }, 
                                { id: 'phone', label: 'Telefone' }, 
                                { id: 'birthDate', label: 'Data de Nascimento' }, 
                                { id: 'createdAt', label: 'Criado em' }, 
                                { id: 'actions', label: 'Ações', disableSorting: true } 
                            ].map((headCell) => (
                                <TableCell 
                                    key={headCell.id} 
                                    align={headCell.id === 'actions' ? 'right' : 'left'}
                                    sortDirection={orderBy === headCell.id ? order : false}
                                >
                                    {headCell.disableSorting ? headCell.label : (
                                        <TableSortLabel
                                            active={orderBy === headCell.id}
                                            direction={orderBy === headCell.id ? order : 'asc'}
                                            onClick={() => handleRequestSort(headCell.id)}
                                        >
                                            {headCell.label}
                                        </TableSortLabel>
                                    )}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {(clients || []).map((client) => (
                            <TableRow key={client.id}>
                                <TableCell component="th" scope="row">{client.name}</TableCell>
                                <TableCell>{client.phone || 'N/A'}</TableCell>
                                <TableCell>{formatDateForDisplay(client.birthDate)}</TableCell>
                                <TableCell>{formatDateForDisplay(client.createdAt)}</TableCell>
                                <TableCell align="right">
                                    <Tooltip title="Enviar WhatsApp">
                                        <span>
                                            <IconButton 
                                                edge="end" 
                                                aria-label="whatsapp" 
                                                onClick={() => handleOpenMessageModal(client)}
                                                disabled={!client.phone} // Desabilita se não tiver telefone
                                            >
                                                <WhatsAppIcon />
                                            </IconButton>
                                        </span>
                                    </Tooltip>
                                    <Tooltip title="Editar">
                                        <IconButton edge="end" aria-label="edit" onClick={() => handleOpenModal(client)}>
                                            <EditIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Deletar">
                                        <IconButton edge="end" aria-label="delete" onClick={() => handleOpenConfirm(client)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={totalClients}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />

            <ClientModal
                open={isModalOpen}
                onClose={handleCloseModal}
                onClientCreated={handleClientCreate}
                onClientUpdated={handleClientUpdate}
                initialData={selectedClient}
                formError={formError}
                onError={setFormError}
            />

            <SendMessageModal 
                open={isMessageModalOpen}
                onClose={handleCloseMessageModal}
                client={selectedClient}
            />

            <ConfirmationDialog
                open={isConfirmOpen}
                onClose={handleCloseConfirm}
                onConfirm={handleClientDelete}
                title="Confirmar Deleção"
                description={`Tem certeza que deseja deletar o cliente "${selectedClient?.name}"?`}
            />
        </Box>
    );
};

export default ClientList;