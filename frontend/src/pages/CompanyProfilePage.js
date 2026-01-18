import React, { useState, useEffect } from 'react';
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
    Card,
    CardContent,
    CardActions
} from '@mui/material';
import tenantService from '../services/tenantService';
import { useNotification } from '../context/NotificationContext';

const CompanyProfilePage = () => {
    const { showNotification } = useNotification();
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        phone: '',
        email: '',
        cnpj: '',
        description: '',
        reportPhone: '' // Novo campo para o telefone de relatórios
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        setLoading(true);
        tenantService.getMe()
            .then(response => {
                setFormData(prev => ({ ...prev, ...response.data }));
                setLoading(false);
            })
            .catch(err => {
                setError('Falha ao carregar os dados da empresa.');
                showNotification('Falha ao carregar os dados da empresa.', 'error');
                setLoading(false);
            });
    }, [showNotification]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            // Apenas os campos do formulário são enviados
            const dataToUpdate = {
                name: formData.name,
                address: formData.address,
                phone: formData.phone,
                email: formData.email,
                cnpj: formData.cnpj,
                description: formData.description,
                reportPhone: formData.reportPhone,
            };
            await tenantService.update(dataToUpdate);
            showNotification('Dados da empresa atualizados com sucesso!', 'success');
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Ocorreu um erro.';
            setError(errorMessage);
            showNotification(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg">
            <Box sx={{ my: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Configurações da Empresa
                </Typography>
                <Typography variant="body1" sx={{ mb: 4 }}>
                    Gerencie as informações da sua empresa, aparência do sistema e dados de contato.
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2 }}>Dados Gerais</Typography>
                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        name="name"
                                        label="Nome da Empresa"
                                        value={formData.name || ''}
                                        onChange={handleChange}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        name="cnpj"
                                        label="CNPJ"
                                        value={formData.cnpj || ''}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        name="email"
                                        label="Email da Empresa"
                                        type="email"
                                        value={formData.email || ''}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        name="phone"
                                        label="Telefone Principal"
                                        value={formData.phone || ''}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        name="address"
                                        label="Endereço"
                                        value={formData.address || ''}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        name="description"
                                        label="Descrição Curta"
                                        multiline
                                        rows={3}
                                        value={formData.description || ''}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                 <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        name="reportPhone"
                                        label="Telefone para Relatórios"
                                        helperText="Número que receberá os relatórios diários/semanais via WhatsApp."
                                        value={formData.reportPhone || ''}
                                        onChange={handleChange}
                                    />
                                </Grid>
                            </Grid>
                        </CardContent>
                        <CardActions sx={{ p: 2, justifyContent: 'flex-end' }}>
                            <Button type="submit" variant="contained" disabled={loading}>
                                {loading ? <CircularProgress size={24} /> : 'Salvar Alterações'}
                            </Button>
                        </CardActions>
                    </Card>
                </form>
            </Box>
        </Container>
    );
};

export default CompanyProfilePage;
