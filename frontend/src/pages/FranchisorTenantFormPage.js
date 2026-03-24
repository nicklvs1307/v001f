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
    Grid,
    Divider
} from '@mui/material';
import tenantService from '../services/tenantService';
import toast from 'react-hot-toast';

const FranchisorTenantFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        phone: '',
        email: '',
        cnpj: '',
        description: '',
        adminName: '',
        adminEmail: '',
        adminPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const isEditMode = !!id;

    useEffect(() => {
        if (id) {
            const fetchTenant = async () => {
                setLoading(true);
                try {
                    const response = await tenantService.getTenantById(id);
                    setFormData({
                        ...response.data,
                        adminName: '', // Não carregamos senha ou dados sensíveis do admin para edição simples aqui
                        adminEmail: '',
                        adminPassword: ''
                    });
                } catch (err) {
                    setError('Falha ao carregar dados do franqueado.');
                    toast.error('Falha ao carregar dados do franqueado.');
                } finally {
                    setLoading(false);
                }
            };
            fetchTenant();
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
            if (isEditMode) {
                // Na edição, o backend pode não exigir adminName/Email/Password se não forem enviados
                await tenantService.updateTenant(id, formData);
                toast.success('Franqueado atualizado com sucesso!');
            } else {
                await tenantService.createTenant(formData);
                toast.success('Franqueado criado com sucesso!');
            }
            navigate('/franchisor/franchisees');
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Ocorreu um erro ao salvar.';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEditMode) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Paper sx={{ p: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
                    {isEditMode ? 'Editar Restaurante' : 'Novo Restaurante'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                    Preencha os dados da unidade e do administrador responsável.
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                <form onSubmit={handleSubmit}>
                    <Typography variant="h6" gutterBottom color="primary">
                        Dados da Unidade
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                margin="normal"
                                name="name"
                                label="Nome do Restaurante"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                margin="normal"
                                name="cnpj"
                                label="CNPJ"
                                value={formData.cnpj}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                margin="normal"
                                name="email"
                                label="Email de Contato"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                margin="normal"
                                name="phone"
                                label="Telefone"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                margin="normal"
                                name="address"
                                label="Endereço Completo"
                                value={formData.address}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                margin="normal"
                                name="description"
                                label="Descrição / Notas"
                                multiline
                                rows={2}
                                value={formData.description}
                                onChange={handleChange}
                            />
                        </Grid>
                    </Grid>

                    {!isEditMode && (
                        <>
                            <Divider sx={{ my: 4 }} />
                            <Typography variant="h6" gutterBottom color="primary">
                                Dados do Administrador da Unidade
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        margin="normal"
                                        name="adminName"
                                        label="Nome Completo do Admin"
                                        value={formData.adminName}
                                        onChange={handleChange}
                                        required={!isEditMode}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        margin="normal"
                                        name="adminEmail"
                                        label="E-mail de Acesso"
                                        type="email"
                                        value={formData.adminEmail}
                                        onChange={handleChange}
                                        required={!isEditMode}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        margin="normal"
                                        name="adminPassword"
                                        label="Senha de Acesso"
                                        type="password"
                                        value={formData.adminPassword}
                                        onChange={handleChange}
                                        required={!isEditMode}
                                    />
                                </Grid>
                            </Grid>
                        </>
                    )}

                    <Box sx={{ mt: 5, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button variant="outlined" onClick={() => navigate('/franchisor/franchisees')}>
                            Cancelar
                        </Button>
                        <Button type="submit" variant="contained" size="large" disabled={loading}>
                            {loading ? <CircularProgress size={24} /> : (isEditMode ? 'Salvar Alterações' : 'Criar Unidade')}
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Container>
    );
};

export default FranchisorTenantFormPage;
