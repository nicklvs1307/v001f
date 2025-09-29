import React, { useState, useEffect, useContext } from 'react';
import {
  Container, Typography, Box, TextField, Button, CircularProgress,
  MenuItem, Snackbar, Alert, Paper, FormControl, InputLabel, Select
} from '@mui/material';
import AuthContext from '../context/AuthContext';
import whatsappConfigService from '../services/whatsappConfigService';
import tenantService from '../services/tenantService';

// Componente para a visão do Super Administrador
const SuperAdminView = () => {
    const [tenants, setTenants] = useState([]);
    const [selectedTenant, setSelectedTenant] = useState('');
    const [config, setConfig] = useState({ url: '', apiKey: '' });
    const [loadingTenants, setLoadingTenants] = useState(true);
    const [loadingConfig, setLoadingConfig] = useState(false);
    const [saving, setSaving] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    useEffect(() => {
        tenantService.getAllTenants()
            .then(response => setTenants(response || []))
            .catch(() => {
                setSnackbarMessage('Falha ao buscar tenants.');
                setSnackbarSeverity('error');
                setSnackbarOpen(true);
            })
            .finally(() => setLoadingTenants(false));
    }, []);

    useEffect(() => {
        if (selectedTenant) {
            setLoadingConfig(true);
            whatsappConfigService.getTenantConfig(selectedTenant)
                .then(response => setConfig(response.data || { url: '', apiKey: '' }))
                .catch(() => {
                    setSnackbarMessage('Falha ao buscar a configuração do WhatsApp.');
                    setSnackbarSeverity('error');
                    setSnackbarOpen(true);
                    setConfig({ url: '', apiKey: '' });
                })
                .finally(() => setLoadingConfig(false));
        }
    }, [selectedTenant]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSaving(true);
        whatsappConfigService.saveTenantConfig(selectedTenant, config)
            .then(() => {
                setSnackbarMessage('Configuração salva com sucesso!');
                setSnackbarSeverity('success');
            })
            .catch(() => {
                setSnackbarMessage('Falha ao salvar a configuração.');
                setSnackbarSeverity('error');
            })
            .finally(() => {
                setSaving(false);
                setSnackbarOpen(true);
            });
    };

    return (
        <>
            <Paper sx={{ p: 3, mt: 3 }}>
                <Typography variant="h5" gutterBottom>
                    Configurar API do WhatsApp para um Tenant
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                    Selecione um tenant e configure os dados da sua instância da Evolution API.
                </Typography>
                {loadingTenants ? <CircularProgress /> : (
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Tenant</InputLabel>
                        <Select value={selectedTenant} label="Tenant" onChange={e => setSelectedTenant(e.target.value)}>
                            {tenants.map(tenant => <MenuItem key={tenant.id} value={tenant.id}>{tenant.name}</MenuItem>)}
                        </Select>
                    </FormControl>
                )}
                {selectedTenant && (loadingConfig ? <CircularProgress sx={{ mt: 2 }}/> : (
                    <form onSubmit={handleSubmit}>
                        <Box sx={{ mt: 3 }}>
                            <TextField fullWidth label="URL da Instância da API" name="url" value={config.url} onChange={e => setConfig({...config, url: e.target.value})} margin="normal" required />
                            <TextField fullWidth label="Chave de API (API Key)" name="apiKey" value={config.apiKey} onChange={e => setConfig({...config, apiKey: e.target.value})} margin="normal" required />
                            <Button type="submit" variant="contained" color="primary" disabled={saving} sx={{ mt: 2 }}>
                                {saving ? <CircularProgress size={24} /> : 'Salvar'}
                            </Button>
                        </Box>
                    </form>
                ))}
            </Paper>
            <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)}>
                <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </>
    );
};

const WhatsappConfigPage = () => {
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Container>
        );
    }

    // Esta página agora é apenas para o Super Admin
    if (user?.role !== 'Super Admin') {
        return (
            <Container>
                <Alert severity="error" sx={{ mt: 3 }}>Acesso não autorizado.</Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="md">
            <Typography variant="h4" gutterBottom sx={{ mt: 3 }}>
                Configurações do WhatsApp (Super Admin)
            </Typography>
            <SuperAdminView />
        </Container>
    );
};

export default WhatsappConfigPage;
