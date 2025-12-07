import React, { useState, useEffect } from 'react';
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
    MenuItem
} from '@mui/material';
import useUsers from '../../hooks/useUsers';
import tenantService from '../../services/tenantService';
import roleService from '../../services/roleService';
import { useNotification } from '../../context/NotificationContext';

const UserFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const { createUser, updateUser } = useUsers();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role_id: '',
        tenant_id: ''
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
                    tenantService.getAllTenants(),
                    roleService.getAllRoles()
                ]);
                setTenants(tenantsRes.data);
                setRoles(rolesRes.data);

                if (id) {
                    // This is a simplified version. In a real app, you'd fetch the user data.
                    // For now, we'll just pre-fill if data is passed via state or another mechanism.
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
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            if (id) {
                await updateUser(id, formData);
                showNotification('User updated successfully!', 'success');
            } else {
                await createUser(formData);
                showNotification('User created successfully!', 'success');
            }
            navigate('/dashboard/usuarios');
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
                    {id ? 'Edit User' : 'Create User'}
                </Typography>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        margin="normal"
                        name="name"
                        label="Name"
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
                        label="Password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        required={!id}
                    />
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Role</InputLabel>
                        <Select
                            name="role_id"
                            value={formData.role_id}
                            onChange={handleChange}
                            required
                        >
                            {roles.map(role => (
                                <MenuItem key={role.id} value={role.id}>{role.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Tenant</InputLabel>
                        <Select
                            name="tenant_id"
                            value={formData.tenant_id}
                            onChange={handleChange}
                        >
                            <MenuItem value=""><em>None</em></MenuItem>
                            {tenants.map(tenant => (
                                <MenuItem key={tenant.id} value={tenant.id}>{tenant.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button onClick={() => navigate('/dashboard/usuarios')} sx={{ mr: 2 }}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="contained" disabled={loading}>
                            {loading ? <CircularProgress size={24} /> : (id ? 'Update' : 'Create')}
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Container>
    );
};

export default UserFormPage;
