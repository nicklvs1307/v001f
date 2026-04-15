import React, { useState, useEffect } from 'react';
import {
    Box, Container, Typography, Paper, Button, Avatar, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Chip, Snackbar, Alert, CircularProgress, Grid
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Person as PersonIcon } from '@mui/icons-material';
import userManagementService from '../services/userManagementService';
import { useNavigate } from 'react-router-dom';

const SuperAdminUsersPage = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [saving, setSaving] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await userManagementService.getSuperAdminUsers();
            setUsers(response.data || []);
        } catch (error) {
            setSnackbar({ open: true, message: 'Erro ao carregar usuários', severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (user = null) => {
        if (user) {
            setEditingUser(user);
            setFormData({ name: user.name, email: user.email, password: '' });
        } else {
            setEditingUser(null);
            setFormData({ name: '', email: '', password: '' });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingUser(null);
        setFormData({ name: '', email: '', password: '' });
    };

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSave = async () => {
        if (!formData.name || !formData.email) {
            setSnackbar({ open: true, message: 'Preencha todos os campos obrigatórios', severity: 'error' });
            return;
        }
        if (!editingUser && !formData.password) {
            setSnackbar({ open: true, message: 'Senha é obrigatória para novos usuários', severity: 'error' });
            return;
        }

        setSaving(true);
        try {
            if (editingUser) {
                await userManagementService.updateSuperAdminUser(editingUser.id, formData);
                setSnackbar({ open: true, message: 'Usuário atualizado com sucesso!', severity: 'success' });
            } else {
                await userManagementService.createSuperAdminUser(formData);
                setSnackbar({ open: true, message: 'Usuário criado com sucesso!', severity: 'success' });
            }
            handleCloseDialog();
            fetchUsers();
        } catch (error) {
            setSnackbar({ open: true, message: error.response?.data?.message || 'Erro ao salvar usuário', severity: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handleOpenDeleteDialog = (user) => {
        setUserToDelete(user);
        setDeleteDialogOpen(true);
    };

    const handleCloseDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setUserToDelete(null);
    };

    const handleDelete = async () => {
        if (!userToDelete) return;
        
        try {
            await userManagementService.deleteSuperAdminUser(userToDelete.id);
            setSnackbar({ open: true, message: 'Usuário deletado com sucesso!', severity: 'success' });
            handleCloseDeleteDialog();
            fetchUsers();
        } catch (error) {
            setSnackbar({ open: true, message: error.response?.data?.message || 'Erro ao deletar usuário', severity: 'error' });
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        Gerenciamento de Super Admins
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Gerencie contas de administradores do sistema
                    </Typography>
                </Box>
                <Button 
                    variant="contained" 
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    Novo Super Admin
                </Button>
            </Box>

            <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'primary.main' }}>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Usuário</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Email</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Criado em</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Ações</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {users.length > 0 ? (
                                users.map((user) => (
                                    <TableRow key={user.id} hover>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Avatar sx={{ bgcolor: 'primary.main' }}>
                                                    <PersonIcon />
                                                </Avatar>
                                                <Typography variant="body1" fontWeight="medium">
                                                    {user.name}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : '-'}
                                        </TableCell>
                                        <TableCell>
                                            <IconButton 
                                                color="primary" 
                                                onClick={() => handleOpenDialog(user)}
                                                title="Editar"
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton 
                                                color="error" 
                                                onClick={() => handleOpenDeleteDialog(user)}
                                                title="Deletar"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                                        <Typography variant="body1" color="text.secondary">
                                            Nenhum Super Admin encontrado
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingUser ? 'Editar Super Admin' : 'Novo Super Admin'}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Nome Completo"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        sx={{ mt: 2, mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        label={editingUser ? 'Nova Senha (opcional)' : 'Senha'}
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        helperText={editingUser ? 'Deixe em branco para manter a senha atual' : 'Mínimo 6 caracteres'}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancelar</Button>
                    <Button 
                        variant="contained" 
                        onClick={handleSave} 
                        disabled={saving}
                    >
                        {saving ? <CircularProgress size={20} /> : 'Salvar'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
                <DialogTitle>Confirmar Deleção</DialogTitle>
                <DialogContent>
                    <Typography>
                        Tem certeza que deseja deletar o usuário <strong>{userToDelete?.name}</strong>?
                        Esta ação não pode ser desfeita.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog}>Cancelar</Button>
                    <Button variant="contained" color="error" onClick={handleDelete}>
                        Deletar
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar 
                open={snackbar.open} 
                autoHideDuration={6000} 
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default SuperAdminUsersPage;
