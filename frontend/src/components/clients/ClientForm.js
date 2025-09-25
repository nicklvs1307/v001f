import React, { useState } from 'react';
import { 
    Box, 
    TextField, 
    Button, 
    Typography
} from '@mui/material';
import useClientForm from '../../hooks/useClientForm';

const ClientForm = ({ initialData, onClientCreated, onClientUpdated, onError, onClose }) => {
    const { formData, handleChange } = useClientForm(initialData);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        try {
            if (initialData) {
                await onClientUpdated(formData);
            } else {
                await onClientCreated(formData);
            }
            onClose();
        } catch (err) {
            onError(err.message || 'Falha na operação.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit}>
            <Typography variant="h6">{initialData ? 'Editar Cliente' : 'Novo Cliente'}</Typography>
            <TextField
                margin="normal"
                required
                fullWidth
                id="name"
                label="Nome do Cliente"
                name="name"
                autoFocus
                value={formData.name}
                onChange={handleChange}
            />
            <TextField
                margin="normal"
                fullWidth
                id="email"
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
            />
            <TextField
                margin="normal"
                fullWidth
                id="phone"
                label="Telefone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
            />
            <TextField
                margin="normal"
                fullWidth
                id="birthDate"
                label="Data de Nascimento"
                name="birthDate"
                type="date"
                InputLabelProps={{
                    shrink: true,
                }}
                value={formData.birthDate}
                onChange={handleChange}
            />
            <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 2 }}
                disabled={loading}
            >
                {loading ? (initialData ? 'Salvando...' : 'Criando...') : (initialData ? 'Salvar Alterações' : 'Criar Cliente')}
            </Button>
        </Box>
    );
};

export default ClientForm;
