import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Button, IconButton, CircularProgress, Alert } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import superadminFranchisorService from '../services/superadminFranchisorService';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const FranchisorsPage = () => {
    const [franchisors, setFranchisors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const fetchFranchisors = async () => {
        try {
            setLoading(true);
            const response = await superadminFranchisorService.getFranchisors();
            setFranchisors(response.data);
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
                fetchFranchisors(); // Recarrega a lista
            } catch (err) {
                toast.error('Falha ao deletar franqueador.');
                console.error(err);
            }
        }
    };

    const columns = [
        { field: 'name', headerName: 'Nome', flex: 1 },
        { field: 'cnpj', headerName: 'CNPJ', flex: 1 },
        { field: 'email', headerName: 'Email', flex: 1 },
        { field: 'phone', headerName: 'Telefone', flex: 1 },
        {
            field: 'actions',
            headerName: 'Ações',
            sortable: false,
            filterable: false,
            width: 120,
            renderCell: (params) => (
                <Box>
                    <IconButton onClick={() => handleEdit(params.id)} color="primary">
                        <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(params.id)} color="secondary">
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
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" gutterBottom>
                    Gestão de Franqueadores
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/superadmin/franchisors/new')}
                >
                    Novo Franqueador
                </Button>
            </Box>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Paper sx={{ height: 600, width: '100%' }}>
                <DataGrid
                    rows={franchisors}
                    columns={columns}
                    pageSize={10}
                    rowsPerPageOptions={[10, 25, 50]}
                    disableSelectionOnClick
                    loading={loading}
                    components={{
                        Toolbar: GridToolbar,
                    }}
                />
            </Paper>
        </Box>
    );
};

export default FranchisorsPage;
