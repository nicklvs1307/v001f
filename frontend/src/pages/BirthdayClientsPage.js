import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, CircularProgress, Alert, List, ListItem, ListItemText, Paper } from '@mui/material';
import clientService from '../services/clientService'; // Importar o serviço de cliente

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

            <Paper elevation={2} sx={{ mt: 3, p: 2 }}>
                {birthdayClients.length > 0 ? (
                    <List>
                        {birthdayClients.map((client) => (
                            <ListItem key={client.id} divider>
                                <ListItemText
                                    primary={client.name}
                                    secondary={`Email: ${client.email || 'N/A'} | Telefone: ${client.phone || 'N/A'} | Aniversário: ${new Date(client.birthDate).toLocaleDateString('pt-BR', { month: 'long', day: 'numeric' })}`}
                                />
                            </ListItem>
                        ))}
                    </List>
                ) : (
                    <Typography variant="body1" sx={{ textAlign: 'center', py: 2 }}>
                        Nenhum aniversariante encontrado para este mês.
                    </Typography>
                )}
            </Paper>
        </Container>
    );
};

export default BirthdayClientsPage;
