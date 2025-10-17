import React, { useState, useContext } from 'react';
import useUsers from '../../hooks/useUsers';
import AuthContext from '../../context/AuthContext';
import UserModal from './UserModal';
import ConfirmationDialog from '../layout/ConfirmationDialog';
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
    IconButton,
    TextField,
    InputAdornment,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import { useNotification } from '../../context/NotificationContext'; // Import useNotification

const UserList = () => {
    const { user: currentUser } = useContext(AuthContext);
    const { users, loading, error, createUser, updateUser, deleteUser } = useUsers();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const { showNotification } = useNotification();
    const [filter, setFilter] = useState('');

    const handleOpenModal = (user = null) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setSelectedUser(null);
        setIsModalOpen(false);
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

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(filter.toLowerCase()) ||
        user.email.toLowerCase().includes(filter.toLowerCase())
    );

    if (loading) {
        return <CircularProgress />;
    }

    return (
        <Box sx={{ mt: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <TextField
                    label="Filtrar por nome ou email"
                    variant="outlined"
                    size="small"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                />
                {(currentUser.role === 'Super Admin' || currentUser.role === 'Admin') && (
                    <Button variant="contained" onClick={() => handleOpenModal()}>Adicionar Novo Usuário</Button>
                )}
            </Box>
            
            {error && <Alert severity="error">{error}</Alert>}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Nome</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Papel</TableCell>
                            <TableCell>Tenant</TableCell>
                            <TableCell>Ações</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>{user.name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{user.role_name}</TableCell>
                                    <TableCell>{user.tenant_id || 'N/A'}</TableCell>
                                    <TableCell>
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
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} align="center">
                                    <Typography>Nenhum usuário encontrado.</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <UserModal
                open={isModalOpen}
                onClose={handleCloseModal}
                onUserCreated={handleUserCreate}
                onUserUpdated={handleUserUpdate}
                initialData={selectedUser}
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
