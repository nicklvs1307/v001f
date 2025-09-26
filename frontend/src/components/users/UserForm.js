import React, { useState, useContext } from 'react';
import { 
    Box, 
    TextField, 
    Button, 
    Typography, 
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress
} from '@mui/material';
import useUserForm from '../../hooks/useUserForm';
import AuthContext from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext'; // Import useNotification

const UserForm = ({ initialData, onUserCreated, onUserUpdated, onClose }) => { // Removed onError prop
    const { user: currentUser } = useContext(AuthContext);
    const { formData, roles, tenants, loading: formLoading, error: formError, handleChange } = useUserForm(initialData); // Keep formError for now, useUserForm returns it
    const [loading, setLoading] = useState(false);
    const { showNotification } = useNotification(); // Get showNotification

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        try {
            const userData = { ...formData };
            if (!userData.password) {
                delete userData.password;
            }

            if (initialData) {
                await onUserUpdated(userData);
                showNotification('Usuário atualizado com sucesso!', 'success'); // Success notification
            } else {
                await onUserCreated(userData);
                showNotification('Usuário criado com sucesso!', 'success'); // Success notification
            }
            onClose();
        } catch (err) {
            showNotification(err.message || 'Falha na operação.', 'error'); // Use global notification
        } finally {
            setLoading(false);
        }
    };

    if (formLoading) {
        return <CircularProgress />;
    }

    if (formError) {
        return <Typography color="error">{formError}</Typography>;
    }

    return (
        <Box component="form" onSubmit={handleSubmit}>
            <Typography variant="h6">{initialData ? 'Editar Usuário' : 'Novo Usuário'}</Typography>
            <TextField
                margin="normal"
                required
                fullWidth
                id="name"
                label="Nome"
                name="name"
                autoFocus
                value={formData.name}
                onChange={handleChange}
            />
            <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                disabled={initialData ? true : false}
            />
            <TextField
                margin="normal"
                fullWidth
                id="password"
                label="Senha"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={initialData ? 'Deixe em branco para não alterar' : ''}
            />

            <FormControl fullWidth margin="normal" required>
                <InputLabel id="role-select-label">Papel</InputLabel>
                <Select
                    labelId="role-select-label"
                    id="role-select"
                    value={formData.roleId}
                    label="Papel"
                    name="roleId"
                    onChange={handleChange}
                >
                    {roles.map((role) => {
                        const canAssign =
                            currentUser.role === 'Super Admin' ||
                            (currentUser.role === 'Admin' && (role.name === 'Gerente' || role.name === 'Garçom'));

                        return canAssign && (
                            <MenuItem key={role.id} value={role.id}>{role.name}</MenuItem>
                        );
                    })}
                </Select>
            </FormControl>

            {currentUser.role === 'Super Admin' && (
                <FormControl fullWidth margin="normal" required>
                    <InputLabel id="tenant-select-label">Tenant</InputLabel>
                    <Select
                        labelId="tenant-select-label"
                        id="tenant-select"
                        value={formData.tenantId}
                        label="Tenant"
                        name="tenantId"
                        onChange={handleChange}
                    >
                        {tenants.map((tenant) => (
                            <MenuItem key={tenant.id} value={tenant.id}>{tenant.name}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            )}

            <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 2 }}
                disabled={loading}
            >
                {loading ? (initialData ? 'Salvando...' : 'Criando...') : (initialData ? 'Salvar Alterações' : 'Criar Usuário')}
            </Button>
        </Box>
    );
};

export default UserForm;
