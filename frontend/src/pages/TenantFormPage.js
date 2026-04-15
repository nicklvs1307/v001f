import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
    Container, Typography, Box, Paper, TextField, Button, 
    CircularProgress, Alert, Grid, Divider, Switch, FormControlLabel,
    InputAdornment, IconButton
} from '@mui/material';
import { Visibility, VisibilityOff, Save, ArrowBack, Business, Person } from '@mui/icons-material';
import tenantService from 'services/tenantService';
import { useNotification } from 'context/NotificationContext';

const TenantFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const franchisorId = searchParams.get('franchisorId');
    const { showNotification } = useNotification();
    const isEditMode = Boolean(id);
    
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [changePassword, setChangePassword] = useState(false);
    
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        phone: '',
        email: '',
        cnpj: '',
        description: '',
        website: '',
        segment: '',
        planId: '',
        active: true,
        franchisorId: franchisorId || '',
        gmb_link: '',
        adminName: '',
        adminEmail: '',
        adminPassword: '',
        newAdminPassword: ''
    });

    useEffect(() => {
        if (isEditMode) {
            fetchTenantData();
        }
    }, [id, isEditMode]);

    const fetchTenantData = async () => {
        setFetching(true);
        try {
            const response = await tenantService.getTenantById(id);
            const data = response.data;
            setFormData(prev => ({
                ...prev,
                name: data.name || '',
                address: data.address || '',
                phone: data.phone || '',
                email: data.email || '',
                cnpj: data.cnpj || '',
                description: data.description || '',
                website: data.website || '',
                segment: data.segment || '',
                planId: data.planId || '',
                active: data.active !== false,
                franchisorId: data.franchisorId || '',
                gmb_link: data.gmb_link || '',
                adminName: data.adminName || '',
                adminEmail: data.adminEmail || ''
            }));
        } catch (err) {
            setError('Erro ao buscar dados do tenant');
            showNotification('Erro ao buscar dados do tenant', 'error');
        } finally {
            setFetching(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, checked, type } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? checked : value 
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            if (isEditMode) {
                const tenantData = { ...formData };
                if (!changePassword) {
                    delete tenantData.newAdminPassword;
                }
                await tenantService.updateTenant(id, tenantData);
                showNotification('Tenant atualizado com sucesso!', 'success');
            } else {
                await tenantService.createTenant(formData);
                showNotification('Tenant criado com sucesso!', 'success');
            }
            navigate('/superadmin/tenants');
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Erro ao salvar tenant';
            setError(errorMessage);
            showNotification(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg">
            <Box sx={{ mb: 3 }}>
                <Button 
                    startIcon={<ArrowBack />} 
                    onClick={() => navigate('/superadmin/tenants')}
                >
                    Voltar para Lista
                </Button>
            </Box>
            
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Business sx={{ mr: 2, color: 'primary.main', fontSize: 32 }} />
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        {isEditMode ? 'Editar Restaurante' : 'Novo Restaurante'}
                    </Typography>
                </Box>
                
                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
                
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Divider sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    DADOS DA EMPRESA
                                </Typography>
                            </Divider>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Nome da Empresa"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="CNPJ"
                                name="cnpj"
                                value={formData.cnpj}
                                onChange={handleChange}
                                placeholder="00.000.000/0001-00"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Telefone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="(00) 00000-0000"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Website"
                                name="website"
                                value={formData.website}
                                onChange={handleChange}
                                placeholder="https://"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Segmento"
                                name="segment"
                                value={formData.segment}
                                onChange={handleChange}
                                placeholder="Restaurante, Lanchonete, etc"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Endereço"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Descrição"
                                name="description"
                                multiline
                                rows={3}
                                value={formData.description}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Link Google Business"
                                name="gmb_link"
                                value={formData.gmb_link}
                                onChange={handleChange}
                                helperText="Link para redirecionar o cliente após ganhar um prêmio"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Switch 
                                        checked={formData.active} 
                                        onChange={handleChange}
                                        name="active"
                                    />
                                }
                                label="Ativo"
                            />
                        </Grid>
                        
                        <Grid item xs={12}>
                            <Divider sx={{ my: 2 }}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    ADMINISTRADOR PRINCIPAL
                                </Typography>
                            </Divider>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Nome do Administrador"
                                name="adminName"
                                value={formData.adminName}
                                onChange={handleChange}
                                required={!isEditMode}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Email do Administrador"
                                name="adminEmail"
                                type="email"
                                value={formData.adminEmail}
                                onChange={handleChange}
                                required={!isEditMode}
                            />
                        </Grid>
                        
                        {!isEditMode ? (
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Senha do Administrador"
                                    name="adminPassword"
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.adminPassword}
                                    onChange={handleChange}
                                    required
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            </Grid>
                        ) : (
                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={
                                        <Switch 
                                            checked={changePassword} 
                                            onChange={(e) => setChangePassword(e.target.checked)}
                                        />
                                    }
                                    label="Alterar Senha do Administrador"
                                />
                                {changePassword && (
                                    <Grid container spacing={2} sx={{ mt: 1 }}>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                fullWidth
                                                label="Nova Senha"
                                                name="newAdminPassword"
                                                type={showPassword ? 'text' : 'password'}
                                                value={formData.newAdminPassword}
                                                onChange={handleChange}
                                                InputProps={{
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                                            </IconButton>
                                                        </InputAdornment>
                                                    )
                                                }}
                                            />
                                        </Grid>
                                    </Grid>
                                )}
                            </Grid>
                        )}
                        
                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
                                <Button 
                                    variant="outlined" 
                                    onClick={() => navigate('/superadmin/tenants')}
                                >
                                    Cancelar
                                </Button>
                                <Button 
                                    type="submit" 
                                    variant="contained" 
                                    startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                                    disabled={loading}
                                    size="large"
                                >
                                    {isEditMode ? 'Salvar Alterações' : 'Criar Restaurante'}
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Container>
    );
};

export default TenantFormPage;
