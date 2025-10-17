
import React, { useState, useEffect } from 'react';
import {
    Container, Typography, Box, CircularProgress, Alert, Grid, Card, CardContent, Avatar, Button,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, Snackbar, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import clientService from '../services/clientService';
import recompensaService from '../services/recompensaService';
import cupomService from '../services/cupomService';
import MessageIcon from '@mui/icons-material/Message';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';

const BirthdayClientsPage = () => {
    const [birthdayClients, setBirthdayClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedClient, setSelectedClient] = useState(null);
    const [isMessageModalOpen, setMessageModalOpen] = useState(false);
    const [isCouponModalOpen, setCouponModalOpen] = useState(false);
    const [isMessageAllModalOpen, setMessageAllModalOpen] = useState(false);
    const [isCouponAllModalOpen, setCouponAllModalOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [recompensas, setRecompensas] = useState([]);
    const [selectedRecompensa, setSelectedRecompensa] = useState('');
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        const fetchBirthdayClients = async () => {
            try {
                setLoading(true);
                setError('');
                const data = await clientService.getBirthdayClients();
                setBirthdayClients(data);
            } catch (err) {
                setError(err.message || 'Falha ao carregar a lista de aniversariantes.');
            } finally {
                setLoading(false);
            }
        };

        fetchBirthdayClients();
    }, []);

    const fetchRecompensas = async () => {
        try {
            const response = await recompensaService.getAll();
            setRecompensas(response.data);
        } catch (error) {
            setNotification({ open: true, message: 'Falha ao carregar as recompensas.', severity: 'error' });
        }
    };

    const handleOpenMessageModal = (client) => {
        setSelectedClient(client);
        setMessageModalOpen(true);
    };

    const handleCloseMessageModal = () => {
        setSelectedClient(null);
        setMessageModalOpen(false);
        setMessage('');
    };

    const handleSendMessage = async () => {
        if (!message.trim()) {
            setNotification({ open: true, message: 'A mensagem não pode estar vazia.', severity: 'warning' });
            return;
        }
        try {
            await clientService.sendMessage(selectedClient.id, message);
            setNotification({ open: true, message: 'Mensagem enviada com sucesso!', severity: 'success' });
            handleCloseMessageModal();
        } catch (error) {
            setNotification({ open: true, message: 'Falha ao enviar a mensagem.', severity: 'error' });
        }
    };

    const handleOpenCouponModal = (client) => {
        setSelectedClient(client);
        fetchRecompensas();
        setCouponModalOpen(true);
    };

    const handleCloseCouponModal = () => {
        setSelectedClient(null);
        setCouponModalOpen(false);
        setSelectedRecompensa('');
    };

    const handleGenerateCoupon = async () => {
        if (!selectedRecompensa) {
            setNotification({ open: true, message: 'Selecione uma recompensa.', severity: 'warning' });
            return;
        }

        try {
            const cupomData = {
                recompensaId: selectedRecompensa,
                clienteId: selectedClient.id,
                dataValidade: new Date(new Date().setDate(new Date().getDate() + 30)), // 30 dias de validade
            };

            const cupom = await cupomService.generateCupom(cupomData);

            const recompensa = recompensas.find(r => r.id === selectedRecompensa);

            const message = `Feliz aniversário, ${selectedClient.name}! Você ganhou um cupom de ${recompensa.name}: ${cupom.codigo}`;

            await clientService.sendMessage(selectedClient.id, message);

            setNotification({ open: true, message: 'Cupom enviado com sucesso!', severity: 'success' });
            handleCloseCouponModal();
        } catch (error) {
            setNotification({ open: true, message: 'Falha ao gerar ou enviar o cupom.', severity: 'error' });
        }
    };

    const handleOpenMessageAllModal = () => {
        setMessageAllModalOpen(true);
    };

    const handleCloseMessageAllModal = () => {
        setMessageAllModalOpen(false);
        setMessage('');
    };

    const handleSendMessageToAll = async () => {
        if (!message.trim()) {
            setNotification({ open: true, message: 'A mensagem não pode estar vazia.', severity: 'warning' });
            return;
        }

        try {
            for (const client of birthdayClients) {
                await clientService.sendMessage(client.id, message);
            }
            setNotification({ open: true, message: 'Mensagens enviadas para todos com sucesso!', severity: 'success' });
            handleCloseMessageAllModal();
        } catch (error) {
            setNotification({ open: true, message: 'Falha ao enviar mensagens para todos.', severity: 'error' });
        }
    };

    const handleOpenCouponAllModal = () => {
        fetchRecompensas();
        setCouponAllModalOpen(true);
    };

    const handleCloseCouponAllModal = () => {
        setCouponAllModalOpen(false);
        setSelectedRecompensa('');
    };

    const handleSendCouponToAll = async () => {
        if (!selectedRecompensa) {
            setNotification({ open: true, message: 'Selecione uma recompensa.', severity: 'warning' });
            return;
        }

        try {
            const recompensa = recompensas.find(r => r.id === selectedRecompensa);

            for (const client of birthdayClients) {
                const cupomData = {
                    recompensaId: selectedRecompensa,
                    clienteId: client.id,
                    dataValidade: new Date(new Date().setDate(new Date().getDate() + 30)), // 30 dias de validade
                };
                const cupom = await cupomService.generateCupom(cupomData);
                const message = `Feliz aniversário, ${client.name}! Você ganhou um cupom de ${recompensa.name}: ${cupom.codigo}`;
                await clientService.sendMessage(client.id, message);
            }

            setNotification({ open: true, message: 'Cupons enviados para todos com sucesso!', severity: 'success' });
            handleCloseCouponAllModal();
        } catch (error) {
            setNotification({ open: true, message: 'Falha ao enviar cupons para todos.', severity: 'error' });
        }
    };


    const handleCloseNotification = () => {
        setNotification({ ...notification, open: false });
    };

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
                <CircularProgress />
                <Typography>Carregando aniversariantes...</Typography>
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Aniversariantes do Mês
                </Typography>
                <Box>
                    <Button variant="outlined" sx={{ mr: 1 }} onClick={handleOpenMessageAllModal}>Enviar Mensagem para Todos</Button>
                    <Button variant="contained" onClick={handleOpenCouponAllModal}>Enviar Cupom para Todos</Button>
                </Box>
            </Box>

            <Grid container spacing={3} sx={{ mt: 3 }}>
                {birthdayClients.length > 0 ? (
                    birthdayClients.map((client) => (
                        <Grid item xs={12} sm={6} md={4} key={client.id}>
                            <Card>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                                            {client.name.charAt(0)}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="h6">{client.name}</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Aniversário: {new Date(client.birthDate).toLocaleDateString('pt-BR', { month: 'long', day: 'numeric' })}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Email: {client.email || 'N/A'}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Telefone: {client.phone || 'N/A'}
                                    </Typography>
                                    <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                                        <Button variant="outlined" size="small" startIcon={<MessageIcon />} onClick={() => handleOpenMessageModal(client)}>
                                            Enviar Mensagem
                                        </Button>
                                        <Button variant="contained" size="small" startIcon={<ConfirmationNumberIcon />} onClick={() => handleOpenCouponModal(client)}>
                                            Enviar Cupom
                                        </Button>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))
                ) : (
                    <Grid item xs={12}>
                        <Typography variant="body1" sx={{ textAlign: 'center', py: 2 }}>
                            Nenhum aniversariante encontrado para este mês.
                        </Typography>
                    </Grid>
                )}
            </Grid>

            {/* Modal de Envio de Mensagem */}
            <Dialog open={isMessageModalOpen} onClose={handleCloseMessageModal}>
                <DialogTitle>Enviar Mensagem para {selectedClient?.name}</DialogTitle>
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
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseMessageModal}>Cancelar</Button>
                    <Button onClick={handleSendMessage}>Enviar</Button>
                </DialogActions>
            </Dialog>

            {/* Modal de Envio de Cupom */}
            <Dialog open={isCouponModalOpen} onClose={handleCloseCouponModal}>
                <DialogTitle>Enviar Cupom para {selectedClient?.name}</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth margin="dense">
                        <InputLabel>Recompensa</InputLabel>
                        <Select
                            value={selectedRecompensa}
                            onChange={(e) => setSelectedRecompensa(e.target.value)}
                            label="Recompensa"
                        >
                            {recompensas.map((recompensa) => (
                                <MenuItem key={recompensa.id} value={recompensa.id}>
                                    {recompensa.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseCouponModal}>Cancelar</Button>
                    <Button onClick={handleGenerateCoupon}>Enviar Cupom</Button>
                </DialogActions>
            </Dialog>

            {/* Modal de Envio de Mensagem para todos*/}
            <Dialog open={isMessageAllModalOpen} onClose={handleCloseMessageAllModal}>
                <DialogTitle>Enviar Mensagem para Todos</DialogTitle>
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
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseMessageAllModal}>Cancelar</Button>
                    <Button onClick={handleSendMessageToAll}>Enviar para Todos</Button>
                </DialogActions>
            </Dialog>

            {/* Modal de Envio de Cupom para todos*/}
            <Dialog open={isCouponAllModalOpen} onClose={handleCloseCouponAllModal}>
                <DialogTitle>Enviar Cupom para Todos</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth margin="dense">
                        <InputLabel>Recompensa</InputLabel>
                        <Select
                            value={selectedRecompensa}
                            onChange={(e) => setSelectedRecompensa(e.target.value)}
                            label="Recompensa"
                        >
                            {recompensas.map((recompensa) => (
                                <MenuItem key={recompensa.id} value={recompensa.id}>
                                    {recompensa.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseCouponAllModal}>Cancelar</Button>
                    <Button onClick={handleSendCouponToAll}>Enviar Cupom para Todos</Button>
                </DialogActions>
            </Dialog>

            {/* Notificação */}
            <Snackbar
                open={notification.open}
                autoHideDuration={6000}
                onClose={handleCloseNotification}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
                    {notification.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default BirthdayClientsPage;

