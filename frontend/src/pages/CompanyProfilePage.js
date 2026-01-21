import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    TextField,
    Button,
    CircularProgress,
    Alert,
    Grid,
    Card,
    CardContent,
    CardActions,
    Avatar,
    Input
} from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import tenantService from '../services/tenantService';
import { useNotification } from '../context/NotificationContext';

const CompanyProfilePage = () => {
    const { showNotification } = useNotification();
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        address: '',
        phone: '',
        email: '',
        cnpj: '',
        description: '',
        reportPhone: '',
        logoUrl: ''
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        setLoading(true);
        tenantService.getMe()
            .then(response => {
                setFormData(prev => ({ ...prev, ...response.data }));
                if (response.data.logoUrl) {
                    // Adjust URL if it's relative and doesn't start with http
                    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
                    const baseUrl = apiUrl.replace('/api', '');
                    const logoSrc = response.data.logoUrl.startsWith('http') 
                        ? response.data.logoUrl 
                        : `${baseUrl}${response.data.logoUrl}`;
                    setPreview(logoSrc);
                }
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

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
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

            if (selectedFile && formData.id) {
                await tenantService.uploadLogo(formData.id, selectedFile);
            }

            showNotification('Dados da empresa atualizados com sucesso!', 'success');
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Ocorreu um erro.';
            setError(errorMessage);
            showNotification(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    if (loading && !formData.id) {
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
                    <Grid container spacing={3}>
                        {/* Column for Logo */}
                        <Grid item xs={12} md={4}>
                            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
                                <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                                    <Typography variant="h6" sx={{ mb: 3 }}>Logotipo</Typography>
                                    <Box
                                        sx={{
                                            width: 200,
                                            height: 200,
                                            border: '2px dashed #ccc',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            overflow: 'hidden',
                                            mb: 2,
                                            backgroundColor: '#f9f9f9'
                                        }}
                                    >
                                        {preview ? (
                                            <img src={preview} alt="Logo Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <Typography variant="body2" color="textSecondary">Sem Logo</Typography>
                                        )}
                                    </Box>
                                    <label htmlFor="logo-upload">
                                        <Input
                                            accept="image/*"
                                            id="logo-upload"
                                            type="file"
                                            onChange={handleFileChange}
                                            style={{ display: 'none' }}
                                        />
                                        <Button
                                            variant="outlined"
                                            component="span"
                                            startIcon={<CloudUploadIcon />}
                                            fullWidth
                                        >
                                            Carregar Nova Logo
                                        </Button>
                                    </label>
                                    <Typography variant="caption" color="textSecondary" sx={{ mt: 1, textAlign: 'center' }}>
                                        Recomendado: 500x500px, PNG ou JPG.
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Column for Form Fields */}
                        <Grid item xs={12} md={8}>
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
                        </Grid>
                    </Grid>
                </form>
            </Box>
        </Container>
    );
};

export default CompanyProfilePage;
