
import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, CircularProgress, Alert, Grid, Card, CardContent, Avatar, Button } from '@mui/material';
import clientService from '../services/clientService'; // Importar o serviço de cliente
import MessageIcon from '@mui/icons-material/Message';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';

const BirthdayClientsPage = () => {
    const [birthdayClients, setBirthdayClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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
            <Typography variant="h4" component="h1" gutterBottom>
                Aniversariantes do Mês
            </Typography>

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
                                        <Button variant="outlined" size="small" startIcon={<MessageIcon />}>
                                            Enviar Mensagem
                                        </Button>
                                        <Button variant="contained" size="small" startIcon={<ConfirmationNumberIcon />}>
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
        </Container>
    );
};

export default BirthdayClientsPage;

