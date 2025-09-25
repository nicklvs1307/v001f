import React, { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, CircularProgress, Alert
} from '@mui/material';
import clientService from '../../services/clientService';

const SendMessageModal = ({ open, onClose, client }) => {
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSendMessage = async () => {
        if (!message) {
            setError('A mensagem não pode estar vazia.');
            return;
        }
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            await clientService.sendMessage(client.id, message);
            setSuccess('Mensagem enviada com sucesso!');
            setTimeout(() => {
                handleClose();
            }, 2000); // Fecha o modal após 2 segundos
        } catch (err) {
            setError(err.message || 'Falha ao enviar a mensagem.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setMessage('');
        setError('');
        setSuccess('');
        onClose();
    };

    if (!client) return null;

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
            <DialogTitle>Enviar WhatsApp para {client.name}</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    label="Mensagem"
                    type="text"
                    fullWidth
                    variant="outlined"
                    multiline
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Digite sua mensagem aqui..."
                />
                {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="secondary">Cancelar</Button>
                <Button onClick={handleSendMessage} color="primary" variant="contained" disabled={loading}>
                    {loading ? <CircularProgress size={24} /> : 'Enviar'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default SendMessageModal;
