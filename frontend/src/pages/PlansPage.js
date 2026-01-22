import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    CardActions,
    Button,
    TextField,
    Switch,
    FormControlLabel,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Chip,
    Divider,
    IconButton,
    InputAdornment
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import planService from '../../services/planService';
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
            setPlans(response.data);
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

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" fontWeight="bold">Planos e Assinaturas</Typography>
                <Button 
                    variant="contained" 
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    Novo Plano
                </Button>
            </Box>

            <Grid container spacing={3}>
                {plans.map((plan) => (
                    <Grid item xs={12} md={4} key={plan.id}>
                        <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                            {!plan.active && (
                                <Box sx={{ position: 'absolute', top: 10, right: 10 }}>
                                    <Chip label="Inativo" color="error" size="small" />
                                </Box>
                            )}
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Typography variant="h5" component="div" fontWeight="bold" gutterBottom>
                                    {plan.name}
                                </Typography>
                                <Typography variant="h4" color="primary.main" fontWeight="bold" sx={{ mb: 2 }}>
                                    R$ {plan.price}
                                    <Typography variant="caption" color="text.secondary">/mês</Typography>
                                </Typography>
                                <Typography variant="body2" color="text.secondary" paragraph>
                                    {plan.description}
                                </Typography>
                                <Divider sx={{ my: 2 }} />
                                <Box>
                                    <Typography variant="subtitle2" gutterBottom>Limites:</Typography>
                                    <Typography variant="body2">• {plan.features.maxUsers} Usuários</Typography>
                                    <Typography variant="body2">• {plan.features.maxCampaignsPerMonth} Campanhas/mês</Typography>
                                    
                                    <Typography variant="subtitle2" sx={{ mt: 2 }} gutterBottom>Funcionalidades:</Typography>
                                    {plan.features.canUseRoulette && (
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <CheckCircleIcon color="success" fontSize="small" /> <Typography variant="body2">Roleta de Prêmios</Typography>
                                        </Box>
                                    )}
                                    {plan.features.canUseWhatsappAutomation && (
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <CheckCircleIcon color="success" fontSize="small" /> <Typography variant="body2">Automação WhatsApp</Typography>
                                        </Box>
                                    )}
                                    {plan.features.canUseFranchisor && (
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <CheckCircleIcon color="success" fontSize="small" /> <Typography variant="body2">Multi-lojas (Franquia)</Typography>
                                        </Box>
                                    )}
                                </Box>
                            </CardContent>
                            <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                                <IconButton onClick={() => handleOpenDialog(plan)} color="primary">
                                    <EditIcon />
                                </IconButton>
                                <IconButton onClick={() => handleDelete(plan.id)} color="error">
                                    <DeleteIcon />
                                </IconButton>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Dialog de Edição/Criação */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>{currentPlan ? 'Editar Plano' : 'Novo Plano'}</DialogTitle>
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
                        control={<Switch checked={formData.features.canRemoveBranding} onChange={() => handleFeatureChange('canRemoveBranding')} />}
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
