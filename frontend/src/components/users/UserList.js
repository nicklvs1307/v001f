import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import useUsers from '../../hooks/useUsers';
import AuthContext from '../../context/AuthContext';
import ConfirmationDialog from '../layout/ConfirmationDialog';
import { 
    Box, 
    Typography, 
    CircularProgress, 
    Alert,
    Button,
    IconButton,
    TextField,
    InputAdornment,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import { useNotification } from '../../context/NotificationContext';

const UserList = () => {
    const { user: currentUser } = useContext(AuthContext);
    const { users, loading, error, deleteUser } = useUsers();
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const { showNotification } = useNotification();
    const [filter, setFilter] = useState('');
    const navigate = useNavigate();

    const handleOpenConfirm = (user) => {
        setSelectedUser(user);
        setIsConfirmOpen(true);
    };

    const handleCloseConfirm = () => {
        setSelectedUser(null);
        setIsConfirmOpen(false);
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

    const columns = [
        { field: 'name', headerName: 'Nome', flex: 1 },
        { field: 'email', headerName: 'Email', flex: 1 },
        { field: 'role_name', headerName: 'Papel', flex: 1 },
        { field: 'tenant_id', headerName: 'Tenant', flex: 1, valueGetter: (params) => params.row.tenant_id || 'N/A' },
        {
            field: 'actions',
            headerName: 'Ações',
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            flex: 1,
            renderCell: (params) => (
                <Box>
                    {(currentUser.role === 'Super Admin' || (currentUser.role === 'Admin' && params.row.tenant_id === currentUser.tenantId)) && (
                        <IconButton edge="end" aria-label="edit" onClick={() => navigate(`/dashboard/usuarios/edit/${params.row.id}`)}>
                            <EditIcon />
                        </IconButton>
                    )}
                    {(currentUser.role === 'Super Admin' || (currentUser.role === 'Admin' && params.row.tenant_id === currentUser.tenantId)) && currentUser.userId !== params.row.id && (
                        <IconButton edge="end" aria-label="delete" onClick={() => handleOpenConfirm(params.row)}>
                            <DeleteIcon />
                        </IconButton>
                    )}
                </Box>
            )
        }
    ];

    if (loading) {
        return <CircularProgress />;
    }

    return (
        <Box sx={{ mt: 4, height: 600, width: '100%' }}>
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
                    <Button variant="contained" onClick={() => navigate('/dashboard/usuarios/new')}>Adicionar Novo Usuário</Button>
                )}
            </Box>
            
            {error && <Alert severity="error">{error}</Alert>}
            
            <DataGrid
                rows={filteredUsers}
                columns={columns}
                pageSize={10}
                rowsPerPageOptions={[10]}
                autoHeight
                disableSelectionOnClick
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
