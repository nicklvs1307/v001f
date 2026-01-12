import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography, Paper, CircularProgress, Alert } from '@mui/material';
import superadminFranchisorService from '../services/superadminFranchisorService';
import toast from 'react-hot-toast';

const FranchisorFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = Boolean(id);

    const [formData, setFormData] = useState({
        name: '',
        cnpj: '',
        email: '',
        phone: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isEditMode) {
            setLoading(true);
            superadminFranchisorService.getFranchisorById(id)
                .then(response => {
                    setFormData({
                        name: response.data.name || '',
                        cnpj: response.data.cnpj || '',
                        email: response.data.email || '',
                        phone: response.data.phone || '',
                    });
                })
                .catch(err => {
                    toast.error('Falha ao carregar dados do franqueador.');
                    setError('Não foi possível carregar os dados para edição.');
                })
                .finally(() => setLoading(false));
        }
    }, [id, isEditMode]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isEditMode) {
                await superadminFranchisorService.updateFranchisor(id, formData);
                toast.success('Franqueador atualizado com sucesso!');
            } else {
                await superadminFranchisorService.createFranchisor(formData);
                toast.success('Franqueador criado com sucesso!');
            }
            navigate('/superadmin/franchisors');
        } catch (err) {
            const message = err.response?.data?.message || (isEditMode ? 'Falha ao atualizar franqueador.' : 'Falha ao criar franqueador.');
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEditMode) {
        return <CircularProgress />;
    }

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                {isEditMode ? 'Editar Franqueador' : 'Novo Franqueador'}
            </Typography>
            <Paper sx={{ p: 3 }}>
                <form onSubmit={handleSubmit}>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                        <TextField
                            name="name"
                            label="Nome"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            fullWidth
                        />
                        <TextField
                            name="cnpj"
                            label="CNPJ"
                            value={formData.cnpj}
                            onChange={handleChange}
                            fullWidth
                        />
                        <TextField
                            name="email"
                            label="Email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            fullWidth
                        />
                        <TextField
                            name="phone"
                            label="Telefone"
                            value={formData.phone}
                            onChange={handleChange}
                            fullWidth
                        />
                    </Box>
                    {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                    <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                        <Button type="submit" variant="contained" disabled={loading}>
                            {loading ? <CircularProgress size={24} /> : (isEditMode ? 'Salvar Alterações' : 'Criar Franqueador')}
                        </Button>
                        <Button variant="outlined" onClick={() => navigate('/superadmin/franchisors')}>
                            Cancelar
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Box>
    );
};

export default FranchisorFormPage;
