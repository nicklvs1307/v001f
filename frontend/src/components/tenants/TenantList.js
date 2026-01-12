import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import tenantService from 'services/tenantService';
import superadminService from 'services/superadminService';
import AuthContext from 'context/AuthContext';
import { useNotification } from 'context/NotificationContext';
import { formatDateForDisplay } from 'utils/dateUtils';
import { 
    Box, 
    Typography, 
    CircularProgress, 
    Button,
    IconButton, 
    Dialog, 
    DialogActions, 
    DialogContent, 
    DialogContentText, 
    DialogTitle,
    Paper
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit'; 
import DeleteIcon from '@mui/icons-material/Delete';
import LoginIcon from '@mui/icons-material/Login';

const TenantList = () => {
    const [tenants, setTenants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false); 
    const [selectedTenant, setSelectedTenant] = useState(null); 
    const { showNotification } = useNotification();
    const navigate = useNavigate();
    const { setToken } = useContext(AuthContext);

    const handleOpenDeleteConfirm = (tenant) => {
        setSelectedTenant(tenant);
        setOpenDeleteConfirm(true);
    };
    const handleCloseDeleteConfirm = () => {
        setSelectedTenant(null);
        setOpenDeleteConfirm(false);
    };

    const fetchTenants = async () => {
        try {
            setLoading(true);
            const response = await tenantService.getAllTenants();
            setTenants(response.data);
        } catch (err) {
            showNotification(err.message || 'Falha ao buscar tenants.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTenants();
    }, []);

    const handleTenantDeleted = async () => {
        try {
            await tenantService.deleteTenant(selectedTenant.id);
            setTenants((prevTenants) => 
                prevTenants.filter((tenant) => tenant.id !== selectedTenant.id)
            );
            handleCloseDeleteConfirm();
            showNotification('Restaurante deletado com sucesso!', 'success');
        } catch (err) {
            showNotification(err.message || 'Falha ao deletar restaurante.', 'error');
        }
    };

    const handleLoginAsTenant = async (tenantId) => {
        try {
            const response = await superadminService.loginAsTenant(tenantId);
            const { token, user } = response.data;

            // Save the original superadmin token
            localStorage.setItem('superadmin_token', localStorage.getItem('token'));

            // Set the new tenant admin token
            setToken(token);

            // Redirect to the tenant's dashboard
            navigate('/dashboard');
        } catch (err) {
            showNotification(err.message || 'Falha ao fazer login como tenant.', 'error');
        }
    };

    const columns = [
        { field: 'name', headerName: 'Nome', flex: 1 },
        { field: 'email', headerName: 'Email', flex: 1 },
        { field: 'phone', headerName: 'Telefone', flex: 1 },
        { field: 'cnpj', headerName: 'CNPJ', flex: 1 },
        {
            field: 'createdAt',
            headerName: 'Criado em',
            flex: 1,
            valueFormatter: (params) => formatDateForDisplay(params.value, 'dd/MM/yyyy')
        },
        {
            field: 'actions',
            headerName: 'Ações',
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            flex: 1,
            renderCell: (params) => (
                <Box>
                    <IconButton edge="end" aria-label="login" onClick={() => handleLoginAsTenant(params.row.id)}>
                        <LoginIcon />
                    </IconButton>
                    <IconButton edge="end" aria-label="edit" onClick={() => navigate(`/superadmin/tenants/edit/${params.row.id}`)}>
                        <EditIcon />
                    </IconButton>
                    <IconButton edge="end" aria-label="delete" onClick={() => handleOpenDeleteConfirm(params.row)}>
                        <DeleteIcon />
                    </IconButton>
                </Box>
            )
        }
    ];

    if (loading) {
        return <CircularProgress />;
    }

    return (
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    Gerenciamento de Restaurantes
                </Typography>
                <Button variant="contained" onClick={() => navigate('/superadmin/tenants/new')}>
                    Adicionar Novo
                </Button>
            </Box>
            <Box sx={{ height: 'auto', width: '100%' }}>
                <DataGrid
                    rows={tenants}
                    columns={columns}
                    pageSize={10}
                    rowsPerPageOptions={[10, 25, 50]}
                    autoHeight
                    disableSelectionOnClick
                    slots={{ toolbar: GridToolbar }}
                    slotProps={{
                        toolbar: {
                          showQuickFilter: true,
                          quickFilterProps: { debounceMs: 500 },
                        },
                    }}
                    sx={{
                        '& .MuiDataGrid-root': {
                            border: 'none',
                        },
                        '& .MuiDataGrid-cell': {
                            borderBottom: 'none',
                        },
                        '& .MuiDataGrid-columnHeaders': {
                            backgroundColor: (theme) => theme.palette.background.paper,
                            color: (theme) => theme.palette.text.secondary,
                            borderBottom: '1px solid #e0e0e0',
                        },
                        '& .MuiDataGrid-virtualScroller': {
                            backgroundColor: (theme) => theme.palette.background.default,
                        },
                        '& .MuiDataGrid-footerContainer': {
                            borderTop: '1px solid #e0e0e0',
                        },
                        '& .MuiDataGrid-toolbarContainer .MuiButton-root': {
                            color: (theme) => theme.palette.text.primary,
                        },
                    }}
                />
            </Box>

            <Dialog
                open={openDeleteConfirm}
                onClose={handleCloseDeleteConfirm}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Confirmar Deleção"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Tem certeza que deseja deletar o restaurante "{selectedTenant?.name}"? Esta ação é irreversível.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteConfirm}>Cancelar</Button>
                    <Button onClick={handleTenantDeleted} autoFocus color="error">
                        Deletar
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
};

export default TenantList;
