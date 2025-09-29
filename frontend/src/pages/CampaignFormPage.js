import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TextField, Button, Container, Typography, Box, Paper, MenuItem, CircularProgress, Alert } from '@mui/material';
import campanhaService from '../services/campanhaService';
import recompensaService from '../services/recompensaService';
import roletaService from '../services/roletaService';
import ClientSegmentSelector from '../components/campaigns/ClientSegmentSelector';

const CampaignFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [campaign, setCampaign] = useState({ nome: '', mensagem: '', criterioSelecao: 'todos', recompensaId: null, roletaId: null });
    const [recompensas, setRecompensas] = useState([]);
    const [roletas, setRoletas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [recompensasData, roletasData] = await Promise.all([
                    recompensaService.getAll(),
                    roletaService.getAll(),
                ]);
                setRecompensas(recompensasData);
                setRoletas(roletasData);

                if (id) {
                    const campaignData = await campanhaService.getById(id);
                    setCampaign(campaignData);
                }
            } catch (err) {
                setError('Falha ao carregar dados de suporte para a campanha.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...campaign };
            if (id) {
                await campanhaService.update(id, payload);
            } else {
                await campanhaService.create(payload);
            }
            navigate('/cupons/campanhas');
        } catch (err) {
            setError(err.response?.data?.message || 'Erro ao salvar campanha.');
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
                        onChange={(e) => setCampaign({ ...campaign, nome: e.target.value })}
                        required
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Mensagem (incluindo o link do cupom)"
                        multiline
                        rows={4}
                        value={campaign.mensagem}
                        onChange={(e) => setCampaign({ ...campaign, mensagem: e.target.value })}
                        required
                    />
                    
                    <ClientSegmentSelector 
                        selectedValue={campaign.criterioSelecao}
                        onChange={(value) => setCampaign({ ...campaign, criterioSelecao: value })}
                    />

                    <TextField
                        select
                        fullWidth
                        margin="normal"
                        label="Recompensa (Opcional)"
                        value={campaign.recompensaId || ''}
                        onChange={(e) => setCampaign({ ...campaign, recompensaId: e.target.value, roletaId: null })}
                    >
                        <MenuItem value=""><em>Nenhuma</em></MenuItem>
                        {recompensas.map(r => <MenuItem key={r.id} value={r.id}>{r.nome}</MenuItem>)}
                    </TextField>

                    <TextField
                        select
                        fullWidth
                        margin="normal"
                        label="Roleta (Opcional)"
                        value={campaign.roletaId || ''}
                        onChange={(e) => setCampaign({ ...campaign, roletaId: e.target.value, recompensaId: null })}
                    >
                        <MenuItem value=""><em>Nenhuma</em></MenuItem>
                        {roletas.map(r => <MenuItem key={r.id} value={r.id}>{r.nome}</MenuItem>)}
                    </TextField>

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