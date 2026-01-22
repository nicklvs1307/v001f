import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    Paper,
    List,
    ListItem,
    ListItemText,
    Checkbox,
    FormControlLabel,
    Button,
    Divider,
    CircularProgress,
    Alert,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    ListItemButton
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SaveIcon from '@mui/icons-material/Save';
import permissionService from '../services/permissionService';
import toast from 'react-hot-toast';

const RolesPage = () => {
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [selectedRole, setSelectedRole] = useState(null);
    const [selectedPermissionIds, setSelectedPermissionIds] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

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
            setRoles(rolesRes.data);
            setPermissions(permsRes.data);
            
            // Selecionar o primeiro cargo por padrão
            if (rolesRes.data.length > 0) {
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
        // Mapear permissões atuais do cargo para o Set
        const currentPermIds = new Set(role.permissoes.map(p => p.id));
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
            
            // Atualizar a lista local de roles com os novos dados retornados
            setRoles(prev => prev.map(r => r.id === response.data.id ? response.data : r));
            toast.success('Permissões atualizadas com sucesso!');
        } catch (error) {
            console.error('Failed to update permissions', error);
            toast.error('Erro ao salvar permissões.');
        } finally {
            setSaving(false);
        }
    };

    // Agrupar permissões por módulo
    const groupedPermissions = permissions.reduce((acc, perm) => {
        if (!acc[perm.module]) {
            acc[perm.module] = [];
        }
        acc[perm.module].push(perm);
        return acc;
    }, {});

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
                <Typography variant="h4" fontWeight="bold">Editor de Permissões Global</Typography>
                <Button 
                    variant="contained" 
                    startIcon={<SaveIcon />} 
                    onClick={handleSave}
                    disabled={saving || !selectedRole}
                >
                    {saving ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
            </Box>

            <Grid container spacing={3} sx={{ flexGrow: 1, overflow: 'hidden' }}>
                {/* Coluna da Esquerda: Cargos */}
                <Grid item xs={12} md={3} sx={{ height: '100%', overflowY: 'auto' }}>
                    <Paper elevation={3}>
                        <Typography variant="h6" sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
                            Cargos do Sistema
                        </Typography>
                        <List>
                            {roles.map((role) => (
                                <ListItemButton 
                                    key={role.id} 
                                    selected={selectedRole?.id === role.id}
                                    onClick={() => handleRoleSelect(role)}
                                >
                                    <ListItemText 
                                        primary={role.name} 
                                        secondary={role.description} 
                                        primaryTypographyProps={{ fontWeight: selectedRole?.id === role.id ? 'bold' : 'normal' }}
                                    />
                                </ListItemButton>
                            ))}
                        </List>
                    </Paper>
                </Grid>

                {/* Coluna da Direita: Permissões */}
                <Grid item xs={12} md={9} sx={{ height: '100%', overflowY: 'auto' }}>
                    <Paper elevation={3} sx={{ p: 3, minHeight: '100%' }}>
                        {!selectedRole ? (
                            <Typography variant="h6" color="text.secondary" align="center" sx={{ mt: 10 }}>
                                Selecione um cargo à esquerda para editar suas permissões.
                            </Typography>
                        ) : (
                            <Box>
                                <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                                    Permissões para: <span style={{ color: '#1976d2', fontWeight: 'bold' }}>{selectedRole.name}</span>
                                </Typography>
                                
                                {Object.keys(groupedPermissions).map((module) => (
                                    <Accordion key={module} defaultExpanded>
                                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                            <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
                                                {module.replace(/_/g, ' ')}
                                            </Typography>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <Grid container>
                                                {groupedPermissions[module].map((perm) => (
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
                                                                    <Typography variant="body1" fontWeight="medium">
                                                                        {perm.action.toUpperCase()}
                                                                    </Typography>
                                                                    <Typography variant="caption" color="text.secondary">
                                                                        {perm.description || `${perm.action} em ${perm.module}`}
                                                                    </Typography>
                                                                </Box>
                                                            }
                                                        />
                                                    </Grid>
                                                ))}
                                            </Grid>
                                        </AccordionDetails>
                                    </Accordion>
                                ))}
                            </Box>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default RolesPage;