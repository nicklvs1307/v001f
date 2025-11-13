import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useClients from '../../hooks/useClients';
import ClientModal from './ClientModal';
import SendMessageModal from './SendMessageModal';
import ConfirmationDialog from '../layout/ConfirmationDialog';
import ImportClientsModal from './ImportClientsModal';
import { 
    Box, Typography, CircularProgress, Alert, Button, IconButton, 
    Grid, Card, CardActionArea, CardContent, CardActions, Avatar, 
    TextField, Tooltip, TablePagination, Menu, MenuItem, Paper, Divider, Stack
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit'; 
import DeleteIcon from '@mui/icons-material/Delete'; 
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import EventIcon from '@mui/icons-material/Event';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { formatDateForDisplay } from '../../utils/dateUtils';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';

const ClientList = () => {
    const {
        clients, totalClients, loading, error, page, rowsPerPage, 
        filterText, createClient, updateClient, deleteClient,
        handleChangePage, handleChangeRowsPerPage, handleFilterChange
    } = useClients();

    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);
    const [formError, setFormError] = useState('');
    const [anchorEl, setAnchorEl] = useState(null);

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

    const handleOpenImportModal = () => {
        setIsImportModalOpen(true);
        handleMenuClose();
    };

    const handleCloseImportModal = () => {
        setIsImportModalOpen(false);
    };

    const handleOpenMessageModal = (client) => {
        setSelectedClient(client);
        setIsMessageModalOpen(true);
    };

    const handleCloseMessageModal = () => {
        setSelectedClient(null);
        setIsMessageModalOpen(false);
    };

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleCardClick = (id) => {
        navigate(`/dashboard/clientes/${id}`);
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
            <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6} md={8}>
                        <TextField
                            label="Buscar Cliente por nome, e-mail ou telefone"
                            variant="outlined"
                            size="small"
                            fullWidth
                            value={filterText}
                            onChange={handleFilterChange}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button variant="contained" onClick={() => handleOpenModal()}>Adicionar Cliente</Button>
                        <IconButton
                            aria-label="mais opções"
                            aria-controls="client-options-menu"
                            aria-haspopup="true"
                            onClick={handleMenuOpen}
                            color="inherit"
                            sx={{ ml: 1 }}
                        >
                            <MoreVertIcon />
                        </IconButton>
                        <Menu
                            id="client-options-menu"
                            anchorEl={anchorEl}
                            keepMounted
                            open={Boolean(anchorEl)}
                            onClose={handleMenuClose}
                        >
                            <MenuItem onClick={handleOpenImportModal}>Importar Clientes</MenuItem>
                        </Menu>
                    </Grid>
                </Grid>
            </Paper>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Grid container spacing={3}>
                {(clients || []).map((client) => (
                    <Grid item key={client.id} xs={12} sm={6} md={4}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', '&:hover': { boxShadow: 6 } }}>
                            <CardActionArea onClick={() => handleCardClick(client.id)} sx={{ flexGrow: 1 }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <Avatar sx={{ width: 64, height: 64, mr: 2, bgcolor: 'primary.main' }}>
                                            {client.name.charAt(0).toUpperCase()}
                                        </Avatar>
                                        <Stack spacing={0.5}>
                                            <Typography variant="h6" noWrap>{client.name}</Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                                                <PhoneIcon sx={{ mr: 1, fontSize: '1rem' }} />
                                                <Typography variant="body2">{client.phone || 'N/A'}</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                                                <EmailIcon sx={{ mr: 1, fontSize: '1rem' }} />
                                                <Typography variant="body2" noWrap>{client.email || 'N/A'}</Typography>
                                            </Box>
                                        </Stack>
                                    </Box>
                                    <Divider sx={{ my: 1.5 }} />
                                    <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                                        <EventIcon sx={{ mr: 1, fontSize: '1rem' }} />
                                        <Typography variant="caption">
                                            Última visita: {client.lastVisit ? formatDateForDisplay(client.lastVisit) : 'N/A'}
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </CardActionArea>
                            <CardActions sx={{ justifyContent: 'flex-end', p: 1 }}>
                                <Tooltip title="Enviar WhatsApp">
                                    <span>
                                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleOpenMessageModal(client); }} disabled={!client.phone}>
                                            <WhatsAppIcon />
                                        </IconButton>
                                    </span>
                                </Tooltip>
                                <Tooltip title="Editar">
                                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleOpenModal(client); }}>
                                        <EditIcon />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Deletar">
                                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleOpenConfirm(client); }}>
                                        <DeleteIcon />
                                    </IconButton>
                                </Tooltip>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={totalClients}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                sx={{ mt: 3 }}
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

            <ImportClientsModal
                open={isImportModalOpen}
                onClose={handleCloseImportModal}
            />
        </Box>
    );
};

export default ClientList;
