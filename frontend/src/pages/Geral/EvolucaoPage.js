import React, { useEffect, useState, useMemo } from 'react';
import { 
    Typography, 
    Box, 
    Container, 
    Grid, 
    Paper, 
    Button, 
    ButtonGroup, 
    Card, 
    CardContent,
    CircularProgress,
    Alert
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import dashboardService from '../../services/dashboardService';
import { useAuth } from '../../context/AuthContext';

const ChartCard = ({ title, children }) => (
    <Card elevation={3} sx={{ p: 2, borderRadius: '16px', height: '100%', boxShadow: '0 4px 20px 0 rgba(0,0,0,0.1)' }}>
        <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                {title}
            </Typography>
            <Box sx={{ height: 300 }}>
                {children}
            </Box>
        </CardContent>
    </Card>
);

const EvolucaoPage = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [period, setPeriod] = useState('day'); // 'day', 'week', 'month'
    const { user } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            if (!user?.tenantId) return;
            setLoading(true);
            setError(null);
            try {
                const evolutionData = await dashboardService.getEvolutionDashboard({
                    tenantId: user.tenantId,
                    period,
                });
                setData(evolutionData);
            } catch (err) {
                console.error("Error fetching evolution data", err);
                setError("Não foi possível carregar os dados de evolução.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user, period]);

    const renderChart = (dataKey, color, name) => (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey={dataKey} stroke={color} name={name} activeDot={{ r: 8 }} />
            </LineChart>
        </ResponsiveContainer>
    );

    const renderContent = () => {
        if (loading) {
            return (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                    <CircularProgress size={60} />
                </Box>
            );
        }

        if (error) {
            return <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>;
        }

        if (data.length === 0) {
            return (
                <Typography variant="h6" align="center" sx={{ mt: 4, color: 'text.secondary' }}>
                    Não há dados de evolução para o período selecionado.
                </Typography>
            );
        }

        return (
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <ChartCard title="Evolução do NPS">
                        {renderChart('nps', '#8884d8', 'NPS')}
                    </ChartCard>
                </Grid>
                <Grid item xs={12} md={6}>
                    <ChartCard title="Evolução da Satisfação (CSAT)">
                        {renderChart('satisfaction', '#82ca9d', 'Satisfação (%)')}
                    </ChartCard>
                </Grid>
                <Grid item xs={12} md={6}>
                    <ChartCard title="Evolução de Respostas">
                        {renderChart('responses', '#ffc658', 'Respostas')}
                    </ChartCard>
                </Grid>
                <Grid item xs={12} md={6}>
                    <ChartCard title="Evolução de Cadastros">
                        {renderChart('registrations', '#ff8042', 'Cadastros')}
                    </ChartCard>
                </Grid>
            </Grid>
        );
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Card sx={{ mb: 3, p: 2 }}>
                <CardContent>
                    <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                        Evolução dos Indicadores
                    </Typography>
                    <Typography variant="subtitle1" gutterBottom>
                        Acompanhe a evolução dos seus principais indicadores ao longo do tempo.
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                        <ButtonGroup variant="outlined" aria-label="Período">
                            <Button onClick={() => setPeriod('day')} variant={period === 'day' ? 'contained' : 'outlined'}>Diário</Button>
                            <Button onClick={() => setPeriod('week')} variant={period === 'week' ? 'contained' : 'outlined'}>Semanal</Button>
                            <Button onClick={() => setPeriod('month')} variant={period === 'month' ? 'contained' : 'outlined'}>Mensal</Button>
                        </ButtonGroup>
                    </Box>
                </CardContent>
            </Card>
            
            {renderContent()}
        </Container>
    );
};

export default EvolucaoPage;