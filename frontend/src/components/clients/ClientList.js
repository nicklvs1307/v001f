import { 
    Box, Typography, CircularProgress, Alert, Button, IconButton, 
    Grid, Card, CardActionArea, CardContent, CardActions, Avatar, 
    TextField, Tooltip, TablePagination, Menu, MenuItem
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit'; 
import DeleteIcon from '@mui/icons-material/Delete'; 
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import EventIcon from '@mui/icons-material/Event';
import MoreVertIcon from '@mui/icons-material/MoreVert'; // Import MoreVertIcon
import { formatDateForDisplay } from '../../utils/dateUtils';

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
    const [isImportModalOpen, setIsImportModalOpen] = useState(false); // State for the import modal
    const [selectedClient, setSelectedClient] = useState(null);
    const [formError, setFormError] = useState('');
    const [anchorEl, setAnchorEl] = useState(null); // State for the menu anchor

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
        handleMenuClose(); // Close the menu after opening the modal
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
        navigate(`/clientes/${id}`);
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
                    sx={{ width: '40%' }}
                />
                <Box>
                    <Button variant="contained" onClick={() => handleOpenModal()}>Adicionar Novo Cliente</Button>
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
                </Box>
            </Box>
            {error && <Alert severity="error">{error}</Alert>}

            <Grid container spacing={3}>
                {(clients || []).map((client) => (
                    <Grid item key={client.id} xs={12} sm={6} md={4}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <CardActionArea onClick={() => handleCardClick(client.id)} sx={{ flexGrow: 1 }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <Avatar sx={{ width: 56, height: 56, mr: 2, bgcolor: 'primary.main' }}>
                                            {client.name.charAt(0).toUpperCase()}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="h6">{client.name}</Typography>
                                            <Typography variant="body2" color="text.secondary">{client.phone || 'Telefone não cadastrado'}</Typography>
                                        </Box>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, color: 'text.secondary' }}>
                                        <EventIcon sx={{ mr: 1, fontSize: '1rem' }} />
                                        <Typography variant="caption">
                                            Última visita: {client.lastVisit ? formatDateForDisplay(client.lastVisit) : 'Nenhuma visita registrada'}
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </CardActionArea>
                            <CardActions sx={{ justifyContent: 'flex-end' }}>
                                <Tooltip title="Enviar WhatsApp">
                                    <span>
                                        <IconButton onClick={(e) => { e.stopPropagation(); handleOpenMessageModal(client); }} disabled={!client.phone}>
                                            <WhatsAppIcon />
                                        </IconButton>
                                    </span>
                                </Tooltip>
                                <Tooltip title="Editar">
                                    <IconButton onClick={(e) => { e.stopPropagation(); handleOpenModal(client); }}>
                                        <EditIcon />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Deletar">
                                    <IconButton onClick={(e) => { e.stopPropagation(); handleOpenConfirm(client); }}>
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

