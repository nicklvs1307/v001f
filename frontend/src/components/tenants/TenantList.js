import React, { useState, useEffect } from 'react';
import tenantService from '../../services/tenantService';
import TenantForm from './TenantForm'; 
import { 
    Box, 
    Typography, 
    CircularProgress, 
    Alert,
    Button,
    Modal, 
    Backdrop, 
    Fade,
    IconButton, 
    Dialog, 
    DialogActions, 
    DialogContent, 
    DialogContentText, 
    DialogTitle,
    Table, // Importar Table
    TableBody, // Importar TableBody
    TableCell, // Importar TableCell
    TableContainer, // Importar TableContainer
    TableHead, // Importar TableHead
    TableRow, // Importar TableRow
    Paper // Importar Paper para a TableContainer
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit'; 
import DeleteIcon from '@mui/icons-material/Delete'; 
import { useNotification } from '../../context/NotificationContext'; // Import useNotification
import { formatDateForDisplay } from '../../utils/dateUtils';

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 600, // Aumentar a largura para acomodar mais campos
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

const TenantList = () => {
    const [tenants, setTenants] = useState([]);
    const [loading, setLoading] = useState(true);
    // const [error, setError] = useState(''); // Removed
    const [openCreateModal, setOpenCreateModal] = useState(false); 
    const [openEditModal, setOpenEditModal] = useState(false); 
    const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false); 
    const [selectedTenant, setSelectedTenant] = useState(null); 
    // const [formError, setFormError] = useState(''); // Removed
    const { showNotification } = useNotification(); // Get showNotification

    const handleOpenCreateModal = () => setOpenCreateModal(true);
    const handleCloseCreateModal = () => {
        setOpenCreateModal(false);
        // setFormError(''); // Removed
    };

    const handleOpenEditModal = (tenant) => {
        setSelectedTenant(tenant);
        setOpenEditModal(true);
    };
    const handleCloseEditModal = () => {
        setSelectedTenant(null);
        setOpenEditModal(false);
        // setFormError(''); // Removed
    };

    const handleOpenDeleteConfirm = (tenant) => {
        setSelectedTenant(tenant);
        setOpenDeleteConfirm(true);
    };
    const handleCloseDeleteConfirm = () => {
        setSelectedTenant(null);
        setOpenDeleteConfirm(false);
    };

    const fetchTenants = async () => {
        try {
            setLoading(true);
            const response = await tenantService.getAllTenants();
            setTenants(response.data);
            // setError(''); // Removed
        } catch (err) {
            showNotification(err.message || 'Falha ao buscar tenants.', 'error'); // Show error notification
            // setError(err.message || 'Falha ao buscar tenants.'); // Removed
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTenants();
    }, [showNotification]); // Add showNotification to dependencies

    const handleTenantCreated = (newTenant) => {
        setTenants((prevTenants) => [...prevTenants, newTenant]);
        handleCloseCreateModal();
        showNotification('Restaurante criado com sucesso!', 'success'); // Show success notification
    };

    const handleTenantUpdated = (updatedTenant) => {
        setTenants((prevTenants) => 
            prevTenants.map((tenant) => {
                // Garante que updatedTenant.tenant existe antes de tentar acessá-lo
                if (updatedTenant && updatedTenant.tenant && tenant.id === updatedTenant.tenant.id) {
                    return updatedTenant.tenant;
                } else {
                    return tenant;
                }
            })
        );
        handleCloseEditModal();
        showNotification('Restaurante atualizado com sucesso!', 'success'); // Show success notification
    };

    const handleTenantDeleted = async () => {
        try {
            await tenantService.deleteTenant(selectedTenant.id);
            setTenants((prevTenants) => 
                prevTenants.filter((tenant) => tenant.id !== selectedTenant.id)
            );
            handleCloseDeleteConfirm();
            showNotification('Restaurante deletado com sucesso!', 'success'); // Show success notification
        } catch (err) {
            showNotification(err.message || 'Falha ao deletar restaurante.', 'error'); // Show error notification
            // setError(err.message || 'Falha ao deletar tenant.'); // Removed
        }
    };

    // const handleFormError = (msg) => { // Removed
    //     setFormError(msg);
    // };

    if (loading) {
        return <CircularProgress />;
    }

    return (
        <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom>Gerenciamento de Restaurantes</Typography>
            <Button variant="contained" sx={{ mb: 2 }} onClick={handleOpenCreateModal}>Adicionar Novo Restaurante</Button>
            {/* error && <Alert severity="error">{error}</Alert> */}
            
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Nome</TableCell>
                            <TableCell>Endereço</TableCell>
                            <TableCell>Telefone</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>CNPJ</TableCell>
                            <TableCell>Descrição</TableCell>
                            <TableCell>Criado em</TableCell>
                            <TableCell align="right">Ações</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {tenants.length > 0 ? (
                            tenants.map((tenant) => (
                                // Adiciona verificação para garantir que tenant não é null/undefined
                                tenant ? (
                                    <TableRow
                                        key={tenant.id}
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                    >
                                        <TableCell component="th" scope="row">
                                            {tenant.name}
                                        </TableCell>
                                        <TableCell>{tenant.address || 'N/A'}</TableCell>
                                        <TableCell>{tenant.phone || 'N/A'}</TableCell>
                                        <TableCell>{tenant.email || 'N/A'}</TableCell>
                                        <TableCell>{tenant.cnpj || 'N/A'}</TableCell>
                                        <TableCell>{tenant.description || 'N/A'}</TableCell>
                                        <TableCell>{formatDateForDisplay(tenant.createdAt, 'dd/MM/yyyy')}</TableCell>
                                        <TableCell align="right">
                                            <IconButton edge="end" aria-label="edit" onClick={() => handleOpenEditModal(tenant)}>
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton edge="end" aria-label="delete" onClick={() => handleOpenDeleteConfirm(tenant)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ) : null // Retorna null se tenant for null/undefined
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={8} align="center">
                                    Nenhum restaurante encontrado.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Modal para adicionar novo tenant */}
            <Modal
                aria-labelledby="create-tenant-modal-title"
                aria-describedby="create-tenant-modal-description"
                open={openCreateModal}
                onClose={handleCloseCreateModal}
                closeAfterTransition
                slots={{ backdrop: Backdrop }}
                slotProps={{
                    backdrop: {
                        timeout: 500,
                    },
                }}
            >
                <Fade in={openCreateModal}>
                    <Box sx={modalStyle}>
                        {/* formError was removed, global notification will handle it */}
                        <TenantForm 
                            onTenantCreated={handleTenantCreated} 
                            // onError={handleFormError} // Removed
                            onClose={handleCloseCreateModal}
                        />
                    </Box>
                </Fade>
            </Modal>

            {/* Modal para editar tenant */}
            <Modal
                aria-labelledby="edit-tenant-modal-title"
                aria-describedby="edit-tenant-modal-description"
                open={openEditModal}
                onClose={handleCloseEditModal}
                closeAfterTransition
                slots={{ backdrop: Backdrop }}
                slotProps={{
                    backdrop: {
                        timeout: 500,
                    },
                }}
            >
                <Fade in={openEditModal}>
                    <Box sx={modalStyle}>
                        {/* formError was removed, global notification will handle it */}
                        {selectedTenant && (
                            <TenantForm 
                                initialData={selectedTenant} 
                                onTenantUpdated={handleTenantUpdated} 
                                // onError={handleFormError}
                                onClose={handleCloseEditModal}
                            />
                        )}
                    </Box>
                </Fade>
            </Modal>

            {/* Diálogo de Confirmação para Deleção */}
            <Dialog
                open={openDeleteConfirm}
                onClose={handleCloseDeleteConfirm}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Confirmar Deleção"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Tem certeza que deseja deletar o restaurante "{selectedTenant?.name}"? Esta ação é irreversível.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteConfirm}>Cancelar</Button>
                    <Button onClick={handleTenantDeleted} autoFocus color="error">
                        Deletar
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default TenantList;
