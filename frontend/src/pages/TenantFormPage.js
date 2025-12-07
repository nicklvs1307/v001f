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
    Alert
} from '@mui/material';
import tenantService from '../../services/tenantService';
import { useNotification } from '../../context/NotificationContext';

const TenantFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        phone: '',
        email: '',
        cnpj: '',
        description: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (id) {
            setLoading(true);
            tenantService.getTenantById(id)
                .then(response => {
                    setFormData(response.data);
                    setLoading(false);
                })
                .catch(err => {
                    setError('Failed to fetch tenant data.');
                    setLoading(false);
                });
        }
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
                await tenantService.updateTenant(id, formData);
                showNotification('Tenant updated successfully!', 'success');
            } else {
                await tenantService.createTenant(formData);
                showNotification('Tenant created successfully!', 'success');
            }
            navigate('/dashboard/tenants');
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'An error occurred.';
            setError(errorMessage);
            showNotification(errorMessage, 'error');
            setLoading(false);
        }
    };

    if (loading && id) {
        return <CircularProgress />;
    }

    return (
        <Container maxWidth="md">
            <Paper sx={{ p: 4, mt: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    {id ? 'Edit Tenant' : 'Create Tenant'}
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
                        name="address"
                        label="Address"
                        value={formData.address}
                        onChange={handleChange}
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        name="phone"
                        label="Phone"
                        value={formData.phone}
                        onChange={handleChange}
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        name="email"
                        label="Email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        name="cnpj"
                        label="CNPJ"
                        value={formData.cnpj}
                        onChange={handleChange}
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        name="description"
                        label="Description"
                        multiline
                        rows={4}
                        value={formData.description}
                        onChange={handleChange}
                    />
                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button onClick={() => navigate('/dashboard/tenants')} sx={{ mr: 2 }}>
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

export default TenantFormPage;
