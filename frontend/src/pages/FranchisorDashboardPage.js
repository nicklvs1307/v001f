import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import useAuth
import {
    Box,
    Typography,
    Paper,
    Grid,
    Button,
    CircularProgress,
    Alert,
    Card,
    CardContent,
    Avatar,
    Chip,
    Divider,
    IconButton,
    Tooltip
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import StoreIcon from '@mui/icons-material/Store';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LoginIcon from '@mui/icons-material/Login';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import superadminFranchisorService from '../services/superadminFranchisorService';
import superadminService from '../services/superadminService';
import toast from 'react-hot-toast';

const FranchisorDashboardPage = () => {
    const { id: paramId } = useParams(); // Renomear para evitar confusão
    const navigate = useNavigate();
    const { user } = useAuth(); // Pegar usuário logado
    const [franchisor, setFranchisor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Determinar qual ID usar: parâmetro da URL (Super Admin) ou ID do usuário logado (Franqueador)
    const franchisorId = paramId || user?.franchisorId;
    const isSuperAdmin = !!paramId; // Se tem ID na URL, assumimos que é navegação de admin

    useEffect(() => {
        const fetchFranchisorDetails = async () => {
            if (!franchisorId) return;

            try {
                setLoading(true);
                const response = await superadminFranchisorService.getFranchisorById(franchisorId);
                setFranchisor(response.data);
            } catch (err) {
                console.error(err);
                setError('Falha ao carregar os detalhes da franqueadora.');
            } finally {
                setLoading(false);
            }
        };

        fetchFranchisorDetails();
    }, [franchisorId]);

    const handleLoginAsTenant = async (tenantId) => {
        try {
            const response = await superadminService.loginAsTenant(tenantId);
            const { token, user } = response.data;
            
            // Salvar token original
            localStorage.setItem('superadmin_token', localStorage.getItem('token'));
            
            // Setar novo token
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            toast.success(`Logado como ${user.tenant.name}`);
            
            // Forçar reload para atualizar contexto
            window.location.href = '/dashboard';
        } catch (error) {
            console.error('Login as tenant failed:', error);
            toast.error('Falha ao acessar o painel do restaurante.');
        }
    };

    const columns = [
        { 
            field: 'name', 
            headerName: 'Nome do Restaurante', 
            flex: 1,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar 
                        src={params.row.logoUrl} 
                        alt={params.row.name}
                        sx={{ width: 30, height: 30, mr: 1, bgcolor: 'primary.main' }}
                    >
                        <StoreIcon fontSize="small" />
                    </Avatar>
                    {params.value}
                </Box>
            )
        },
        { field: 'city', headerName: 'Cidade', width: 150 },
        { field: 'state', headerName: 'UF', width: 80 },
        { 
            field: 'status', 
            headerName: 'Status', 
            width: 120,
            renderCell: (params) => (
                <Chip 
                    label={params.value || 'Ativo'} 
                    color={params.value === 'inactive' ? 'error' : 'success'} 
                    size="small" 
                    variant="outlined"
                />
            )
        },
        {
            field: 'actions',
            headerName: 'Ações',
            sortable: false,
            width: 200,
            renderCell: (params) => (
                <Box>
                    <Tooltip title="Acessar Painel">
                        <IconButton onClick={() => handleLoginAsTenant(params.id)} color="primary">
                            <LoginIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Editar Configurações">
                        <IconButton onClick={() => navigate(`/superadmin/tenants/edit/${params.id}`)} color="default">
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            ),
        },
    ];

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">{error}</Alert>
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/superadmin/franchisors')} sx={{ mt: 2 }}>
                    Voltar
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {isSuperAdmin && (
                        <IconButton onClick={() => navigate('/superadmin/franchisors')} sx={{ mr: 2 }}>
                            <ArrowBackIcon />
                        </IconButton>
                    )}
                    <Box>
                        <Typography variant="h4" fontWeight="bold">
                            {franchisor?.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            CNPJ: {franchisor?.cnpj || 'N/A'} | Email: {franchisor?.email || 'N/A'}
                        </Typography>
                    </Box>
                </Box>
                <Button 
                    variant="contained" 
                    startIcon={<AddIcon />}
                    onClick={() => navigate(isSuperAdmin 
                        ? `/superadmin/tenants/new?franchisorId=${franchisorId}` 
                        : `/franchisor/franchisees/new` // Rota específica para o franqueador criar tenant
                    )}
                >
                    Adicionar Restaurante
                </Button>
            </Box>

            {/* KPI Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={4}>
                    <Card elevation={2}>
                        <CardContent>
                            <Typography color="text.secondary" gutterBottom>
                                Total de Restaurantes
                            </Typography>
                            <Typography variant="h3" color="primary.main" fontWeight="bold">
                                {franchisor?.tenants?.length || 0}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card elevation={2}>
                        <CardContent>
                            <Typography color="text.secondary" gutterBottom>
                                Restaurantes Ativos
                            </Typography>
                            <Typography variant="h3" color="success.main" fontWeight="bold">
                                {franchisor?.tenants?.length || 0} {/* Placeholder logic */}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card elevation={2}>
                        <CardContent>
                            <Typography color="text.secondary" gutterBottom>
                                Total de Usuários
                            </Typography>
                            <Typography variant="h3" color="secondary.main" fontWeight="bold">
                                - {/* Placeholder for future Aggregation */}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Tenants List */}
            <Paper elevation={2} sx={{ height: 500, width: '100%', p: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                    <StoreIcon sx={{ mr: 1 }} /> Restaurantes Vinculados
                </Typography>
                <DataGrid
                    rows={franchisor?.tenants || []}
                    columns={columns}
                    pageSize={10}
                    rowsPerPageOptions={[10, 25]}
                    disableSelectionOnClick
                    components={{
                        Toolbar: GridToolbar,
                    }}
                    localeText={{
                        noRowsLabel: 'Nenhum restaurante vinculado a esta franquia.',
                    }}
                />
            </Paper>
        </Box>
    );
};

export default FranchisorDashboardPage;