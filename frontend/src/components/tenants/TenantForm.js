import React, { useState, useEffect } from 'react';
import { 
    Box, 
    TextField, 
    Button, 
    Typography 
} from '@mui/material';
import tenantService from '../../services/tenantService';
import { useNotification } from '../../context/NotificationContext'; // Import useNotification

const TenantForm = ({ initialData, onTenantCreated, onTenantUpdated, onClose }) => { // Removed onError prop
    const [name, setName] = useState(initialData ? initialData.name : '');
    const [address, setAddress] = useState(initialData ? initialData.address : '');
    const [phone, setPhone] = useState(initialData ? initialData.phone : '');
    const [email, setEmail] = useState(initialData ? initialData.email : '');
    const [cnpj, setCnpj] = useState(initialData ? initialData.cnpj : '');
    const [description, setDescription] = useState(initialData ? initialData.description : '');
    const [loading, setLoading] = useState(false);
    const { showNotification } = useNotification(); // Get showNotification

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setAddress(initialData.address);
            setPhone(initialData.phone);
            setEmail(initialData.email);
            setCnpj(initialData.cnpj);
            setDescription(initialData.description);
        }
    }, [initialData]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        try {
            const tenantData = { name, address, phone, email, cnpj, description };
            if (initialData) {
                // Modo de Edição
                const updatedTenant = await tenantService.updateTenant(initialData.id, tenantData);
                onTenantUpdated(updatedTenant); 
                showNotification('Restaurante atualizado com sucesso!', 'success'); // Success notification
            } else {
                // Modo de Criação
                const newTenant = await tenantService.createTenant(tenantData);
                onTenantCreated(newTenant.tenant); 
                showNotification('Restaurante criado com sucesso!', 'success'); // Success notification
            }
            onClose(); // Fecha o modal após sucesso
        } catch (err) {
            showNotification(err.message || 'Falha na operação.', 'error'); // Use global notification
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit}>
            <Typography variant="h6">{initialData ? 'Editar Restaurante' : 'Novo Restaurante'}</Typography>
            <TextField
                margin="normal"
                required
                fullWidth
                id="name"
                label="Nome do Restaurante"
                name="name"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
            <TextField
                margin="normal"
                fullWidth
                id="address"
                label="Endereço"
                name="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
            />
            <TextField
                margin="normal"
                fullWidth
                id="phone"
                label="Telefone"
                name="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
            />
            <TextField
                margin="normal"
                fullWidth
                id="email"
                label="Email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
                margin="normal"
                fullWidth
                id="cnpj"
                label="CNPJ"
                name="cnpj"
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value)}
            />
            <TextField
                margin="normal"
                fullWidth
                id="description"
                label="Descrição"
                name="description"
                multiline
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            />
            <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 2 }}
                disabled={loading}
            >
                {loading ? (initialData ? 'Salvando...' : 'Criando...') : (initialData ? 'Salvar Alterações' : 'Criar Restaurante')}
            </Button>
        </Box>
    );
};

export default TenantForm;
