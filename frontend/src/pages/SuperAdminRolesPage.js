import React, { useState, useEffect, useMemo } from 'react';
import {
    Box, Typography, Grid, Paper, List, ListItem, ListItemText,
    Checkbox, FormControlLabel, Button, Divider, CircularProgress, Alert,
    Accordion, AccordionSummary, AccordionDetails, ListItemButton, TextField,
    InputAdornment, Chip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import permissionService from '../services/permissionService';
import toast from 'react-hot-toast';

const RolesPage = () => {
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [selectedRole, setSelectedRole] = useState(null);
    const [selectedPermissionIds, setSelectedPermissionIds] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [rolesRes, permsRes] = await Promise.all([
                permissionService.getAllSystemRoles(),
                permissionService.getAllPermissions()
            ]);
            setRoles(rolesRes.data || []);
            setPermissions(permsRes.data || []);
            
            if (rolesRes.data && rolesRes.data.length > 0) {
                handleRoleSelect(rolesRes.data[0]);
            }
        } catch (error) {
            console.error('Failed to fetch data', error);
            toast.error('Erro ao carregar dados de permissões.');
        } finally {
            setLoading(false);
        }
    };

    const handleRoleSelect = (role) => {
        setSelectedRole(role);
        const currentPermIds = new Set(role.permissoes?.map(p => p.id) || []);
        setSelectedPermissionIds(currentPermIds);
    };

    const handlePermissionToggle = (permId) => {
        const newSelected = new Set(selectedPermissionIds);
        if (newSelected.has(permId)) {
            newSelected.delete(permId);
        } else {
            newSelected.add(permId);
        }
        setSelectedPermissionIds(newSelected);
    };

    const handleSave = async () => {
        if (!selectedRole) return;

        try {
            setSaving(true);
            const response = await permissionService.updateRolePermissions(selectedRole.id, Array.from(selectedPermissionIds));
            setRoles(prev => prev.map(r => r.id === response.data.id ? response.data : r));
            toast.success('Permissões atualizadas com sucesso!');
        } catch (error) {
            console.error('Failed to update permissions', error);
            toast.error('Erro ao salvar permissões.');
        } finally {
            setSaving(false);
        }
    };

    const handleSelectAllInModule = (module, check) => {
        const modulePerms = permissions.filter(p => p.module === module);
        const newSelected = new Set(selectedPermissionIds);
        
        modulePerms.forEach(perm => {
            if (check) {
                newSelected.add(perm.id);
            } else {
                newSelected.delete(perm.id);
            }
        });
        
        setSelectedPermissionIds(newSelected);
    };

    const groupedPermissions = useMemo(() => {
        return permissions.reduce((acc, perm) => {
            if (!acc[perm.module]) {
                acc[perm.module] = [];
            }
            acc[perm.module].push(perm);
            return acc;
        }, {});
    }, [permissions]);

    const filteredGroupedPermissions = useMemo(() => {
        if (!searchTerm) return groupedPermissions;
        
        const filtered = {};
        Object.keys(groupedPermissions).forEach(module => {
            const matchingPerms = groupedPermissions[module].filter(perm => 
                perm.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                perm.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                perm.module.toLowerCase().includes(searchTerm.toLowerCase())
            );
            if (matchingPerms.length > 0) {
                filtered[module] = matchingPerms;
            }
        });
        return filtered;
    }, [groupedPermissions, searchTerm]);

    const getModulePermissionsCount = (module) => {
        return groupedPermissions[module]?.length || 0;
    };

    const getModuleSelectedCount = (module) => {
        const modulePerms = groupedPermissions[module]?.map(p => p.id) || [];
        return modulePerms.filter(id => selectedPermissionIds.has(id)).length;
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3, height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold">Editor de Permissões Global</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Gerencie permissões por cargo do sistema
                    </Typography>
                </Box>
                <Button 
                    variant="contained" 
                    startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />} 
                    onClick={handleSave}
                    disabled={saving || !selectedRole}
                    size="large"
                >
                    {saving ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
            </Box>

            <Grid container spacing={3} sx={{ flexGrow: 1, overflow: 'hidden' }}>
                <Grid item xs={12} md={3} sx={{ height: '100%', overflowY: 'auto' }}>
                    <Paper elevation={3} sx={{ borderRadius: 2 }}>
                        <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white', borderRadius: '12px 12px 0 0' }}>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                Cargos do Sistema
                            </Typography>
                        </Box>
                        <List>
                            {roles.map((role) => (
                                <ListItemButton 
                                    key={role.id} 
                                    selected={selectedRole?.id === role.id}
                                    onClick={() => handleRoleSelect(role)}
                                    sx={{ 
                                        borderRadius: 1,
                                        mx: 1,
                                        mb: 0.5,
                                        '&.Mui-selected': {
                                            bgcolor: 'primary.light',
                                            '&:hover': { bgcolor: 'primary.light' }
                                        }
                                    }}
                                >
                                    <ListItemText 
                                        primary={role.name} 
                                        secondary={role.description || `${role.permissoes?.length || 0} permissões`}
                                        primaryTypographyProps={{ fontWeight: selectedRole?.id === role.id ? 600 : 400 }}
                                    />
                                    <Chip 
                                        label={role.permissoes?.length || 0} 
                                        size="small" 
                                        color={selectedRole?.id === role.id ? "primary" : "default"}
                                    />
                                </ListItemButton>
                            ))}
                        </List>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={9} sx={{ height: '100%', overflowY: 'auto' }}>
                    <Paper elevation={3} sx={{ p: 3, minHeight: '100%', borderRadius: 2 }}>
                        {!selectedRole ? (
                            <Typography variant="h6" color="text.secondary" align="center" sx={{ mt: 10 }}>
                                Selecione um cargo à esquerda para editar suas permissões.
                            </Typography>
                        ) : (
                            <Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                                        Permissões para: <span style={{ color: '#1976d2' }}>{selectedRole.name}</span>
                                    </Typography>
                                    <TextField
                                        size="small"
                                        placeholder="Buscar permissões..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SearchIcon color="action" />
                                                </InputAdornment>
                                            ),
                                        }}
                                        sx={{ width: 250 }}
                                    />
                                </Box>
                                
                                {Object.keys(filteredGroupedPermissions).length === 0 ? (
                                    <Alert severity="info">Nenhuma permissão encontrada para o termo pesquisado.</Alert>
                                ) : (
                                    Object.keys(filteredGroupedPermissions).map((module) => (
                                        <Accordion key={module} defaultExpanded sx={{ mb: 1, borderRadius: 2, overflow: 'hidden' }}>
                                            <AccordionSummary 
                                                expandIcon={<ExpandMoreIcon />}
                                                sx={{ bgcolor: 'background.default' }}
                                            >
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                                                    <Typography variant="h6" sx={{ textTransform: 'capitalize', fontWeight: 600 }}>
                                                        {module.replace(/_/g, ' ')}
                                                    </Typography>
                                                    <Chip 
                                                        label={`${getModuleSelectedCount(module)}/${getModulePermissionsCount(module)}`} 
                                                        size="small" 
                                                        color="primary"
                                                        variant="outlined"
                                                    />
                                                    <Box sx={{ ml: 'auto', mr: 2 }}>
                                                        <Button 
                                                            size="small"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleSelectAllInModule(module, true);
                                                            }}
                                                        >
                                                            Selecionar Todos
                                                        </Button>
                                                        <Button 
                                                            size="small"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleSelectAllInModule(module, false);
                                                            }}
                                                        >
                                                            Limpar
                                                        </Button>
                                                    </Box>
                                                </Box>
                                            </AccordionSummary>
                                            <AccordionDetails>
                                                <Grid container>
                                                    {filteredGroupedPermissions[module].map((perm) => (
                                                        <Grid item xs={12} sm={6} md={4} key={perm.id}>
                                                            <FormControlLabel
                                                                control={
                                                                    <Checkbox 
                                                                        checked={selectedPermissionIds.has(perm.id)} 
                                                                        onChange={() => handlePermissionToggle(perm.id)}
                                                                    />
                                                                }
                                                                label={
                                                                    <Box>
                                                                        <Typography variant="body2" fontWeight="500">
                                                                            {perm.action.toUpperCase()}
                                                                        </Typography>
                                                                        <Typography variant="caption" color="text.secondary">
                                                                            {perm.description || `${perm.action} em ${perm.module}`}
                                                                        </Typography>
                                                                    </Box>
                                                                }
                                                                sx={{ 
                                                                    p: 1, 
                                                                    borderRadius: 1,
                                                                    bgcolor: selectedPermissionIds.has(perm.id) ? 'primary.light' : 'transparent',
                                                                    width: '100%'
                                                                }}
                                                            />
                                                        </Grid>
                                                    ))}
                                                </Grid>
                                            </AccordionDetails>
                                        </Accordion>
                                    ))
                                )}
                            </Box>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default RolesPage;
