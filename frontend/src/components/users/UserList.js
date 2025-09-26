import React, { useState, useContext } from 'react';
import useUsers from '../../hooks/useUsers';
import AuthContext from '../../context/AuthContext';
import UserModal from './UserModal';
import ConfirmationDialog from '../layout/ConfirmationDialog';
import { 
    Box, 
    Typography, 
    List, 
    ListItem, 
    ListItemText, 
    CircularProgress, 
    Alert,
    Button,
    IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNotification } from '../../context/NotificationContext'; // Import useNotification

const UserList = () => {
    const { user: currentUser } = useContext(AuthContext);
    const { users, loading, error, createUser, updateUser, deleteUser } = useUsers();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    // const [formError, setFormError] = useState(''); // Removed
    const { showNotification } = useNotification(); // Get showNotification

    const handleOpenModal = (user = null) => {
        setSelectedUser(user);
        setIsModalOpen(true);
        // setFormError(''); // Removed
    };

    const handleCloseModal = () => {
        setSelectedUser(null);
        setIsModalOpen(false);
        // setFormError(''); // Removed
    };

    const handleOpenConfirm = (user) => {
        setSelectedUser(user);
        setIsConfirmOpen(true);
    };

    const handleCloseConfirm = () => {
        setSelectedUser(null);
        setIsConfirmOpen(false);
    };

    const handleUserCreate = async (userData) => {
        try {
            await createUser(userData);
            handleCloseModal();
            showNotification('Usuário criado com sucesso!', 'success');
        } catch (err) {
            showNotification(err.message || 'Erro ao criar usuário.', 'error');
        }
    };

    const handleUserUpdate = async (userData) => {
        try {
            await updateUser(selectedUser.id, userData);
            handleCloseModal();
            showNotification('Usuário atualizado com sucesso!', 'success');
        } catch (err) {
            showNotification(err.message || 'Erro ao atualizar usuário.', 'error');
        }
    };

    const handleUserDelete = async () => {
        try {
            await deleteUser(selectedUser.id);
            handleCloseConfirm();
            showNotification('Usuário deletado com sucesso!', 'success');
        } catch (err) {
            showNotification(err.message || 'Erro ao deletar usuário.', 'error');
        }
    };

    if (loading) {
        return <CircularProgress />;
    }

    return (
        <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom>Gerenciamento de Usuários</Typography>
            {(currentUser.role === 'Super Admin' || currentUser.role === 'Admin') && (
                <Button variant="contained" sx={{ mb: 2 }} onClick={() => handleOpenModal()}>Adicionar Novo Usuário</Button>
            )}
            
            {error && <Alert severity="error">{error}</Alert>}
            <List>
                {users.length > 0 ? (
                    users.map((user) => (
                        <ListItem 
                            key={user.id} 
                            divider
                            secondaryAction={
                                <>
                                    {(currentUser.role === 'Super Admin' || 
                                      (currentUser.role === 'Admin' && user.tenant_id === currentUser.tenantId)) && (
                                        <IconButton edge="end" aria-label="edit" onClick={() => handleOpenModal(user)}>
                                            <EditIcon />
                                        </IconButton>
                                    )}
                                    {(currentUser.role === 'Super Admin' || 
                                      (currentUser.role === 'Admin' && user.tenant_id === currentUser.tenantId)) && 
                                      currentUser.userId !== user.id && (
                                        <IconButton edge="end" aria-label="delete" onClick={() => handleOpenConfirm(user)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    )}
                                </>
                            }
                        >
                            <ListItemText 
                                primary={`${user.name} (${user.email})`}
                                secondary={`Papel: ${user.role_name} ${user.tenant_id ? ` | Tenant ID: ${user.tenant_id}` : ''}`}
                            />
                        </ListItem>
                    ))
                ) : (
                    <Typography>Nenhum usuário encontrado.</Typography>
                )}
            </List>

            <UserModal
                open={isModalOpen}
                onClose={handleCloseModal}
                onUserCreated={handleUserCreate}
                onUserUpdated={handleUserUpdate}
                initialData={selectedUser}
                // formError={formError} // Removed
                // onError={setFormError} // Removed
            />

            <ConfirmationDialog
                open={isConfirmOpen}
                onClose={handleCloseConfirm}
                onConfirm={handleUserDelete}
                title="Confirmar Deleção"
                description={`Tem certeza que deseja deletar o usuário "${selectedUser?.name}"? Esta ação é irreversível.`}
            />
        </Box>
    );
};

export default UserList;
