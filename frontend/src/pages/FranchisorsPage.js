import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Button, IconButton, CircularProgress, Alert, Grid, TextField, InputAdornment, Chip } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SearchIcon from '@mui/icons-material/Search';
import superadminFranchisorService from '../services/superadminFranchisorService';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const FranchisorsPage = () => {
    const [franchisors, setFranchisors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const navigate = useNavigate();

    const fetchFranchisors = async () => {
        try {
            setLoading(true);
            const response = await superadminFranchisorService.getFranchisors();
            setFranchisors(response.data || []);
            setError(null);
        } catch (err) {
            setError('Falha ao carregar franqueadores.');
            toast.error('Falha ao carregar franqueadores.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFranchisors();
    }, []);

    const handleEdit = (id) => {
        navigate(`/superadmin/franchisors/edit/${id}`);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja deletar este franqueador? Esta ação não pode ser desfeita.')) {
            try {
                await superadminFranchisorService.deleteFranchisor(id);
                toast.success('Franqueador deletado com sucesso!');
                fetchFranchisors();
            } catch (err) {
                toast.error('Falha ao deletar franqueador.');
                console.error(err);
            }
        }
    };

    const getStatusChip = (active) => {
        if (active === false) {
            return <Chip label="Inativo" color="error" size="small" />;
        }
        return <Chip label="Ativo" color="success" size="small" />;
    };

    const filteredFranchisors = franchisors.filter(f => {
        const matchesSearch = !searchTerm || 
            f.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            f.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            f.cnpj?.includes(searchTerm);
        
        const matchesStatus = statusFilter === 'all' || 
            (statusFilter === 'active' && f.active !== false) ||
            (statusFilter === 'inactive' && f.active === false);
        
        return matchesSearch && matchesStatus;
    });

    const columns = [
        { 
            field: 'name', 
            headerName: 'Nome', 
            flex: 1,
            minWidth: 180
        },
        { 
            field: 'cnpj', 
            headerName: 'CNPJ', 
            width: 150 
        },
        { 
            field: 'email', 
            headerName: 'Email', 
            flex: 1,
            minWidth: 200 
        },
        { 
            field: 'phone', 
            headerName: 'Telefone', 
            width: 140 
        },
        {
            field: 'active',
            headerName: 'Status',
            width: 100,
            renderCell: (params) => getStatusChip(params.value)
        },
        {
            field: 'tenantsCount',
            headerName: 'Lojas',
            width: 80,
            valueGetter: (value, row) => row.tenants?.length || 0
        },
        {
            field: 'actions',
            headerName: 'Ações',
            sortable: false,
            filterable: false,
            width: 150,
            renderCell: (params) => (
                <Box>
                    <IconButton 
                        onClick={() => navigate(`/superadmin/franchisors/${params.id}`)} 
                        color="primary" 
                        title="Dashboard"
                        size="small"
                    >
                        <DashboardIcon />
                    </IconButton>
                    <IconButton 
                        onClick={() => handleEdit(params.id)} 
                        color="primary" 
                        title="Editar"
                        size="small"
                    >
                        <EditIcon />
                    </IconButton>
                    <IconButton 
                        onClick={() => handleDelete(params.id)} 
                        color="error" 
                        title="Deletar"
                        size="small"
                    >
                        <DeleteIcon />
                    </IconButton>
                </Box>
            ),
        },
    ];

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        Gestão de Franqueadores
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Gerencie franqueadores e suas unidades
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/superadmin/franchisors/new')}
                >
                    Novo Franqueador
                </Button>
            </Box>

            <Paper elevation={3} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={5}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Buscar por nome, CNPJ ou email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon color="action" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField
                            select
                            fullWidth
                            size="small"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            SelectProps={{ native: true }}
                        >
                            <option value="all">Todos os status</option>
                            <option value="active">Ativos</option>
                            <option value="inactive">Inativos</option>
                        </TextField>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Typography variant="body2" color="text.secondary" align="right">
                            {filteredFranchisors.length} resultado(s)
                        </Typography>
                    </Grid>
                </Grid>
            </Paper>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            
            <Paper elevation={3} sx={{ height: 600, borderRadius: 2 }}>
                <DataGrid
                    rows={filteredFranchisors}
                    columns={columns}
                    pageSize={10}
                    rowsPerPageOptions={[10, 25, 50]}
                    disableSelectionOnClick
                    loading={loading}
                    components={{
                        Toolbar: GridToolbar,
                    }}
                    componentsProps={{
                        toolbar: {
                            showQuickFilter: true,
                            quickFilterProps: { debounceMs: 500 },
                        },
                    }}
                    sx={{
                        border: 'none',
                        '& .MuiDataGrid-cell': {
                            borderBottom: 'none',
                        },
                        '& .MuiDataGrid-columnHeaders': {
                            backgroundColor: 'primary.main',
                            color: 'white',
                            borderBottom: 'none',
                        },
                        '& .MuiDataGrid-footerContainer': {
                            borderTop: '1px solid #e0e0e0',
                        },
                    }}
                />
            </Paper>
        </Box>
    );
};

export default FranchisorsPage;
