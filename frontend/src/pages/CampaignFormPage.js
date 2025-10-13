import React, { useEffect, useReducer } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TextField, Button, Container, Typography, Box, Paper, CircularProgress, Alert } from '@mui/material';
import campanhaService from '../services/campanhaService';
import recompensaService from '../services/recompensaService';
import roletaService from '../services/roletaService';
import ClientSegmentSelector from '../components/campaigns/ClientSegmentSelector';
import RewardSelector from '../components/campaigns/RewardSelector';

const initialState = {
    campaign: { nome: '', mensagem: '', criterioSelecao: 'todos', recompensaId: null, roletaId: null },
    recompensas: [],
    roletas: [],
    loading: true,
    error: '',
};

function campaignFormReducer(state, action) {
    switch (action.type) {
        case 'FETCH_START':
            return { ...state, loading: true, error: '' };
        case 'FETCH_SUCCESS':
            return {
                ...state,
                loading: false,
                recompensas: action.payload.recompensas,
                roletas: action.payload.roletas,
                campaign: action.payload.campaign || state.campaign,
            };
        case 'FETCH_ERROR':
            return { ...state, loading: false, error: action.payload };
        case 'FIELD_CHANGE':
            return {
                ...state,
                campaign: { ...state.campaign, [action.payload.field]: action.payload.value },
            };
        case 'SET_CAMPAIGN':
            return { ...state, campaign: action.payload };
        default:
            return state;
    }
}

const CampaignFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [state, dispatch] = useReducer(campaignFormReducer, initialState);
    const { campaign, recompensas, roletas, loading, error } = state;

    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            dispatch({ type: 'FETCH_START' });
            try {
                const [recompensasData, roletasData] = await Promise.all([
                    recompensaService.getAllRecompensas(),
                    roletaService.getAllRoletas(),
                ]);

                let campaignData = null;
                if (id) {
                    campaignData = await campanhaService.getById(id);
                }

                if (isMounted) {
                    dispatch({ 
                        type: 'FETCH_SUCCESS', 
                        payload: { 
                            recompensas: recompensasData, 
                            roletas: roletasData, 
                            campaign: campaignData 
                        }
                    });
                }
            } catch (err) {
                if (isMounted) {
                    dispatch({ type: 'FETCH_ERROR', payload: 'Falha ao carregar dados de suporte para a campanha.' });
                }
            }
        };
        fetchData();

        return () => {
            isMounted = false;
        };
    }, [id]);

    const handleFieldChange = (field) => (event) => {
        dispatch({ type: 'FIELD_CHANGE', payload: { field, value: event.target.value } });
    };

    const handleSegmentChange = (value) => {
        dispatch({ type: 'FIELD_CHANGE', payload: { field: 'criterioSelecao', value } });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (id) {
                await campanhaService.update(id, campaign);
            } else {
                await campanhaService.create(campaign);
            }
            navigate('/cupons/campanhas');
        } catch (err) {
            dispatch({ type: 'FETCH_ERROR', payload: err.response?.data?.message || 'Erro ao salvar campanha.' });
        }
    };

    if (loading) {
        return <CircularProgress />;
    }

    return (
        <Container maxWidth="md">
            <Paper sx={{ p: 4, mt: 4 }}>
                <Typography variant="h4" gutterBottom>{id ? 'Editar Campanha' : 'Nova Campanha'}</Typography>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Nome da Campanha"
                        value={campaign.nome}
                        onChange={handleFieldChange('nome')}
                        required
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Mensagem (incluindo o link do cupom)"
                        multiline
                        rows={4}
                        value={campaign.mensagem}
                        onChange={handleFieldChange('mensagem')}
                        required
                    />
                    
                    <ClientSegmentSelector 
                        selectedValue={campaign.criterioSelecao}
                        onChange={handleSegmentChange}
                    />

                    <RewardSelector 
                        campaign={campaign}
                        recompensas={recompensas}
                        roletas={roletas}
                        dispatch={dispatch}
                    />

                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button type="submit" variant="contained">Salvar</Button>
                        <Button variant="outlined" onClick={() => navigate('/cupons/campanhas')} sx={{ ml: 2 }}>
                            Cancelar
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Container>
    );
};

export default CampaignFormPage;
