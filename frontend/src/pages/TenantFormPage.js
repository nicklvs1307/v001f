import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
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
import tenantService from 'services/tenantService';
import { useNotification } from 'context/NotificationContext';

const TenantFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const franchisorId = searchParams.get('franchisorId');
    const { showNotification } = useNotification();
    const isEditMode = Boolean(id);
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        phone: '',
        email: '',
        cnpj: '',
        description: '',
        adminName: '',
        adminEmail: '',
        adminPassword: '',
        franchisorId: franchisorId || '', // Inicializar com o parâmetro da URL
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isEditMode) {
            setLoading(true);
            tenantService.getTenantById(id)
                .then(response => {
                    setFormData(prev => ({ ...prev, ...response.data }));
                    setLoading(false);
                })
                .catch(err => {
                    setError('Failed to fetch tenant data.');
                    setLoading(false);
                });
        }
    }, [id, isEditMode]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            if (isEditMode) {
                // Em modo de edição, não enviamos os dados do admin
                const { adminName, adminEmail, adminPassword, ...tenantData } = formData;
                await tenantService.updateTenant(id, tenantData);
                showNotification('Tenant updated successfully!', 'success');
            } else {
                await tenantService.createTenant(formData);
                showNotification('Tenant created successfully!', 'success');
            }
            navigate('/superadmin/tenants'); // Navegar para a lista de tenants do superadmin
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'An error occurred.';
            setError(errorMessage);
            showNotification(errorMessage, 'error');
            setLoading(false);
        }
    };

    if (loading && isEditMode) {
        return <CircularProgress />;
    }

    return (
        <Container maxWidth="md">
            <Paper sx={{ p: 4, mt: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    {isEditMode ? 'Edit Tenant' : 'Create Tenant'}
                </Typography>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <form onSubmit={handleSubmit}>
                    <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Dados da Empresa</Typography>
                    <TextField
                        fullWidth
                        margin="normal"
                        name="name"
                        label="Nome da Empresa"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        name="address"
                        label="Endereço"
                        value={formData.address}
                        onChange={handleChange}
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        name="phone"
                        label="Telefone"
                        value={formData.phone}
                        onChange={handleChange}
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        name="email"
                        label="Email da Empresa"
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
                        label="Descrição"
                        multiline
                        rows={4}
                        value={formData.description}
                        onChange={handleChange}
                    />

                    {!isEditMode && (
                        <>
                            <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>Administrador Principal</Typography>
                            <TextField
                                fullWidth
                                margin="normal"
                                name="adminName"
                                label="Nome do Administrador"
                                value={formData.adminName}
                                onChange={handleChange}
                                required
                            />
                            <TextField
                                fullWidth
                                margin="normal"
                                name="adminEmail"
                                label="Email do Administrador"
                                type="email"
                                value={formData.adminEmail}
                                onChange={handleChange}
                                required
                            />
                            <TextField
                                fullWidth
                                margin="normal"
                                name="adminPassword"
                                label="Senha do Administrador"
                                type="password"
                                value={formData.adminPassword}
                                onChange={handleChange}
                                required
                            />
                        </>
                    )}

                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button onClick={() => navigate('/superadmin/tenants')} sx={{ mr: 2 }}>
                            Cancelar
                        </Button>
                        <Button type="submit" variant="contained" disabled={loading}>
                            {loading ? <CircularProgress size={24} /> : (isEditMode ? 'Salvar Alterações' : 'Criar')}
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Container>
    );
};

export default TenantFormPage;
