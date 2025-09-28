import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import clientService from '../services/clientService';
import { Container, Typography, Box, CircularProgress, Alert, Paper, Grid, Avatar, Tabs, Tab } from '@mui/material';
import { Person, Receipt, BarChart, Cake, Phone, Email } from '@mui/icons-material';
import { format } from 'date-fns';

import ActivityTab from '../components/clients/ActivityTab';
import CouponsTab from '../components/clients/CouponsTab';

const ClientDetailsPage = () => {
    const { id } = useParams();
    const [client, setClient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tabValue, setTabValue] = useState(0);

    useEffect(() => {
        const fetchClientDetails = async () => {
            try {
                setLoading(true);
                const data = await clientService.getClientDetails(id);
                setClient(data);
                setError(null);
            } catch (err) {
                setError(err.message || 'Falha ao buscar detalhes do cliente.');
            } finally {
                setLoading(false);
            }
        };

        fetchClientDetails();
    }, [id]);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    if (loading) {
        return <Container sx={{ mt: 4, textAlign: 'center' }}><CircularProgress /></Container>;
    }

    if (error) {
        return <Container sx={{ mt: 4 }}><Alert severity="error">{error}</Alert></Container>;
    }

    if (!client) {
        return <Container sx={{ mt: 4 }}><Alert severity="info">Cliente não encontrado.</Alert></Container>;
    }

    const { name, email, phone, birthDate, stats } = client;
    const { totalVisits, lastVisit, activeCoupons, usedCoupons, attendanceData } = stats;

    return (
        <Container sx={{ mt: 4 }}>
            <Paper sx={{ p: 3, mb: 4 }}>
                <Grid container spacing={3} alignItems="center">
                    <Grid item>
                        <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: '2.5rem' }}>
                            {name.charAt(0).toUpperCase()}
                        </Avatar>
                    </Grid>
                    <Grid item>
                        <Typography variant="h4" component="h1">{name}</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, color: 'text.secondary' }}>
                            {phone && <><Phone sx={{ mr: 1 }} /> <Typography variant="body1" sx={{ mr: 3 }}>{phone}</Typography></>}
                            {email && <><Email sx={{ mr: 1 }} /> <Typography variant="body1">{email}</Typography></>}
                        </Box>
                        {birthDate && 
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, color: 'text.secondary' }}>
                                <Cake sx={{ mr: 1 }} />
                                <Typography variant="body1">{format(new Date(birthDate), 'dd/MM/yyyy')}</Typography>
                            </Box>
                        }
                    </Grid>
                </Grid>
            </Paper>

            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="client details tabs">
                    <Tab icon={<BarChart />} label="Atividade" />
                    <Tab icon={<Receipt />} label={`Cupons Ativos (${activeCoupons.length})`} />
                    <Tab icon={<Receipt />} label={`Cupons Usados (${usedCoupons.length})`} />
                </Tabs>
            </Box>

            {tabValue === 0 && <ActivityTab stats={stats} />}
            {tabValue === 1 && <CouponsTab coupons={activeCoupons} />}
            {tabValue === 2 && <CouponsTab coupons={usedCoupons} isUsed={true} />}

        </Container>
    );
};

export default ClientDetailsPage;
