import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    Paper,
    TextField,
    Button,
    CircularProgress,
    Alert,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Checkbox,
    FormControlLabel
} from '@mui/material';
import useUsers from 'hooks/useUsers';
import franchisorService from '../services/franchisorService';
import roleService from 'services/roleService';
import { useNotification } from 'context/NotificationContext';
import AuthContext from '../context/AuthContext';

const FranchisorUserFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const { createUser, updateUser } = useUsers();
    const { user } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        roleId: '',
        tenantId: '',
        isFranchisorUser: false
    });
    const [tenants, setTenants] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [tenantsRes, rolesRes] = await Promise.all([
                    franchisorService.getFranchisees(),
                    roleService.getAllRoles()
                ]);
                setTenants(tenantsRes.data);
                setRoles(rolesRes.data.filter(r => r.name !== 'Super Admin')); // Franchisor can't create Super Admin

                if (id) {
                    // Fetch and pre-fill user data for editing
                }
            } catch (err) {
                setError('Failed to fetch required data.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleChange = (e) => {
        const { name, value, checked, type } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? checked : value,
            ...(name === 'isFranchisorUser' && checked && { tenantId: '' })
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const dataToSend = { ...formData };
            if (formData.isFranchisorUser) {
                dataToSend.franchisorId = user.franchisorId;
                delete dataToSend.tenantId;
            }
            delete dataToSend.isFranchisorUser;

            if (id) {
                await updateUser(id, dataToSend);
                showNotification('User updated successfully!', 'success');
            } else {
                await createUser(dataToSend);
                showNotification('User created successfully!', 'success');
            }
            navigate('/franchisor/users');
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'An error occurred.';
            setError(errorMessage);
            showNotification(errorMessage, 'error');
            setLoading(false);
        }
    };

    if (loading) {
        return <CircularProgress />;
    }

    return (
        <Container maxWidth="md">
            <Paper sx={{ p: 4, mt: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    {id ? 'Editar Usuário' : 'Criar Usuário'}
                </Typography>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        margin="normal"
                        name="name"
                        label="Nome"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        name="email"
                        label="Email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        name="password"
                        label="Senha"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        required={!id}
                    />
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Papel</InputLabel>
                        <Select
                            name="roleId"
                            value={formData.roleId}
                            onChange={handleChange}
                            required
                        >
                            {roles.map(role => (
                                <MenuItem key={role.id} value={role.id}>{role.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={formData.isFranchisorUser}
                                onChange={handleChange}
                                name="isFranchisorUser"
                            />
                        }
                        label="Este usuário é um administrador da franqueadora"
                    />
                    <FormControl fullWidth margin="normal" disabled={formData.isFranchisorUser}>
                        <InputLabel>Franqueado (Tenant)</InputLabel>
                        <Select
                            name="tenantId"
                            value={formData.tenantId}
                            onChange={handleChange}
                            required={!formData.isFranchisorUser}
                        >
                            <MenuItem value=""><em>Selecione um franqueado</em></MenuItem>
                            {tenants.map(tenant => (
                                <MenuItem key={tenant.id} value={tenant.id}>{tenant.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button onClick={() => navigate('/franchisor/users')} sx={{ mr: 2 }}>
                            Cancelar
                        </Button>
                        <Button type="submit" variant="contained" disabled={loading}>
                            {loading ? <CircularProgress size={24} /> : (id ? 'Atualizar' : 'Criar')}
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Container>
    );
};

export default FranchisorUserFormPage;
