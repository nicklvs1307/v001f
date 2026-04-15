import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Grid, Card, CardContent, CardActions, Button, TextField, Switch,
    FormControlLabel, Dialog, DialogTitle, DialogContent, DialogActions, Chip, Divider,
    IconButton, InputAdornment
} from '@mui/material';
import { Edit as EditIcon, Add as AddIcon, Delete as DeleteIcon, CheckCircle as CheckCircleIcon, Star, AttachMoney } from '@mui/icons-material';
import planService from '../services/planService';
import toast from 'react-hot-toast';

const PlansPage = () => {
    const [plans, setPlans] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [currentPlan, setCurrentPlan] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        description: '',
        features: {
            maxUsers: 5,
            maxCampaignsPerMonth: 10,
            canUseRoulette: false,
            canUseWhatsappAutomation: false,
            canUseFranchisor: false,
            canRemoveBranding: false
        },
        active: true
    });

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            const response = await planService.getAllPlans();
            setPlans(response.data || []);
        } catch (error) {
            console.error('Failed to fetch plans', error);
            toast.error('Erro ao carregar planos.');
        }
    };

    const handleOpenDialog = (plan = null) => {
        if (plan) {
            setCurrentPlan(plan);
            setFormData({
                name: plan.name,
                price: plan.price,
                description: plan.description,
                features: plan.features || {},
                active: plan.active
            });
        } else {
            setCurrentPlan(null);
            setFormData({
                name: '',
                price: '',
                description: '',
                features: {
                    maxUsers: 5,
                    maxCampaignsPerMonth: 10,
                    canUseRoulette: false,
                    canUseWhatsappAutomation: false,
                    canUseFranchisor: false,
                    canRemoveBranding: false
                },
                active: true
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setCurrentPlan(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFeatureChange = (featureName) => {
        setFormData(prev => ({
            ...prev,
            features: {
                ...prev.features,
                [featureName]: !prev.features[featureName]
            }
        }));
    };

    const handleLimitChange = (featureName, value) => {
        setFormData(prev => ({
            ...prev,
            features: {
                ...prev.features,
                [featureName]: parseInt(value) || 0
            }
        }));
    };

    const handleSubmit = async () => {
        try {
            if (currentPlan) {
                await planService.updatePlan(currentPlan.id, formData);
                toast.success('Plano atualizado com sucesso!');
            } else {
                await planService.createPlan(formData);
                toast.success('Plano criado com sucesso!');
            }
            fetchPlans();
            handleCloseDialog();
        } catch (error) {
            console.error('Error saving plan', error);
            toast.error('Erro ao salvar plano.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja remover este plano?')) {
            try {
                await planService.deletePlan(id);
                toast.success('Plano removido.');
                fetchPlans();
            } catch (error) {
                toast.error('Erro ao remover plano.');
            }
        }
    };

    const sortedPlans = [...plans].sort((a, b) => {
        if (a.active !== b.active) return a.active ? -1 : 1;
        return parseFloat(a.price) - parseFloat(b.price);
    });

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold">Planos e Assinaturas</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Gerencie os planos disponíveis para os restaurantes
                    </Typography>
                </Box>
                <Button 
                    variant="contained" 
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    Novo Plano
                </Button>
            </Box>

            <Grid container spacing={3}>
                {sortedPlans.map((plan) => (
                    <Grid item xs={12} md={4} key={plan.id}>
                        <Card 
                            elevation={plan.active ? 4 : 1} 
                            sx={{ 
                                height: '100%', 
                                display: 'flex', 
                                flexDirection: 'column', 
                                position: 'relative',
                                border: plan.active ? '2px solid' : '1px solid',
                                borderColor: plan.active ? 'primary.main' : 'divider',
                                opacity: plan.active ? 1 : 0.7,
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: 6
                                }
                            }}
                        >
                            {!plan.active && (
                                <Box sx={{ 
                                    position: 'absolute', 
                                    top: 10, 
                                    right: 10,
                                    zIndex: 1
                                }}>
                                    <Chip label="Inativo" color="error" size="small" />
                                </Box>
                            )}
                            
                            <Box sx={{ 
                                bgcolor: plan.active ? 'primary.main' : 'grey.400',
                                p: 2,
                                borderRadius: '12px 12px 0 0'
                            }}>
                                <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>
                                    {plan.name}
                                </Typography>
                            </Box>
                            
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Box sx={{ textAlign: 'center', mb: 2 }}>
                                    <Typography variant="h3" color="primary.main" fontWeight="bold">
                                        R$ {plan.price}
                                        <Typography variant="caption" color="text.secondary" component="span">/mês</Typography>
                                    </Typography>
                                </Box>
                                
                                <Typography variant="body2" color="text.secondary" paragraph sx={{ textAlign: 'center', minHeight: 40 }}>
                                    {plan.description}
                                </Typography>
                                
                                <Divider sx={{ my: 2 }} />
                                
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                                        Limites:
                                    </Typography>
                                    <Typography variant="body2">• {plan.features?.maxUsers || 0} Usuários</Typography>
                                    <Typography variant="body2">• {plan.features?.maxCampaignsPerMonth || 0} Campanhas/mês</Typography>
                                </Box>
                                
                                <Box>
                                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                                        Funcionalidades:
                                    </Typography>
                                    {plan.features?.canUseRoulette && (
                                        <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                                            <CheckCircleIcon color="success" fontSize="small" /> 
                                            <Typography variant="body2">Roleta de Prêmios</Typography>
                                        </Box>
                                    )}
                                    {plan.features?.canUseWhatsappAutomation && (
                                        <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                                            <CheckCircleIcon color="success" fontSize="small" /> 
                                            <Typography variant="body2">Automação WhatsApp</Typography>
                                        </Box>
                                    )}
                                    {plan.features?.canUseFranchisor && (
                                        <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                                            <CheckCircleIcon color="success" fontSize="small" /> 
                                            <Typography variant="body2">Módulo Franquia</Typography>
                                        </Box>
                                    )}
                                    {plan.features?.canRemoveBranding && (
                                        <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                                            <CheckCircleIcon color="success" fontSize="small" /> 
                                            <Typography variant="body2">Remover Marca</Typography>
                                        </Box>
                                    )}
                                </Box>
                            </CardContent>
                            <CardActions sx={{ justifyContent: 'center', p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                                <IconButton onClick={() => handleOpenDialog(plan)} color="primary" title="Editar">
                                    <EditIcon />
                                </IconButton>
                                <IconButton onClick={() => handleDelete(plan.id)} color="error" title="Deletar">
                                    <DeleteIcon />
                                </IconButton>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold' }}>
                    {currentPlan ? 'Editar Plano' : 'Novo Plano'}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        name="name"
                        label="Nome do Plano"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={formData.name}
                        onChange={handleChange}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        name="price"
                        label="Preço Mensal (R$)"
                        type="number"
                        fullWidth
                        variant="outlined"
                        value={formData.price}
                        onChange={handleChange}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        name="description"
                        label="Descrição Curta"
                        type="text"
                        fullWidth
                        multiline
                        rows={2}
                        variant="outlined"
                        value={formData.description}
                        onChange={handleChange}
                        sx={{ mb: 3 }}
                    />

                    <Divider sx={{ mb: 2 }}><Typography variant="caption">LIMITES</Typography></Divider>
                    
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <TextField
                                label="Máx. Usuários"
                                type="number"
                                fullWidth
                                value={formData.features.maxUsers}
                                onChange={(e) => handleLimitChange('maxUsers', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label="Campanhas/Mês"
                                type="number"
                                fullWidth
                                value={formData.features.maxCampaignsPerMonth}
                                onChange={(e) => handleLimitChange('maxCampaignsPerMonth', e.target.value)}
                            />
                        </Grid>
                    </Grid>

                    <Divider sx={{ my: 2 }}><Typography variant="caption">FUNCIONALIDADES</Typography></Divider>

                    <FormControlLabel
                        control={<Switch checked={formData.features.canUseRoulette} onChange={() => handleFeatureChange('canUseRoulette')} />}
                        label="Roleta de Prêmios"
                    />
                    <FormControlLabel
                        control={<Switch checked={formData.features.canUseWhatsappAutomation} onChange={() => handleFeatureChange('canUseWhatsappAutomation')} />}
                        label="Automação WhatsApp"
                    />
                    <FormControlLabel
                        control={<Switch checked={formData.features.canUseFranchisor} onChange={() => handleFeatureChange('canUseFranchisor')} />}
                        label="Módulo Franquia"
                    />
                    <FormControlLabel
                        control={<Switch checked={formData.features.canRemoveBranding} onChange={() => handleFeatureChange('canRemoveBranding')} />} />
                        label="Remover Marca Feedeliza"
                    />
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <FormControlLabel
                        control={<Switch checked={formData.active} onChange={(e) => setFormData(prev => ({...prev, active: e.target.checked}))} />}
                        label="Plano Ativo (Visível)"
                    />

                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancelar</Button>
                    <Button onClick={handleSubmit} variant="contained">Salvar</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default PlansPage;
