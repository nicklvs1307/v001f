import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    CircularProgress,
    TextField
} from '@mui/material';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import dashboardService from '../../services/dashboardService';
import { startOfMonth, endOfMonth, format } from 'date-fns';

const ResumoMesPage = () => {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));

    const fetchSummary = useCallback(async () => {
        try {
            setLoading(true);
            const data = await dashboardService.getMonthSummary({ startDate, endDate });
            setSummary(data);
            setError(null);
        } catch (err) {
            setError('Falha ao carregar o resumo do mês.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [startDate, endDate]);

    useEffect(() => {
        fetchSummary();
    }, [fetchSummary]);

    const PIE_COLORS = ['#0088FE', '#FFBB28'];

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /></Box>;
    }

    if (error) {
        return <Typography color="error">{error}</Typography>;
    }

    return (
        <Box>
            <Typography variant="h4" gutterBottom>Resumo do Mês</Typography>
            
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                    <TextField
                        label="Data de Início"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        label="Data de Fim"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                    />
                </Grid>
            </Grid>

            {summary && (
                <Grid container spacing={3}>
                    {/* Daily NPS Distribution */}
                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6">NPS Diário e Acumulado</Typography>
                                <ResponsiveContainer width="100%" height={400}>
                                    <LineChart data={summary.dailyNps}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="nps" name="NPS Diário" stroke="#8884d8" />
                                        <Line type="monotone" dataKey="accumulatedNps" name="NPS Acumulado" stroke="#82ca9d" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Peak Hours */}
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6">Horário de Pico das Respostas</Typography>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={summary.peakHours}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="hour" label={{ value: 'Hora do dia', position: 'insideBottom', offset: -5 }} />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="count" name="Respostas" fill="#8884d8" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Weekday Distribution */}
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6">Distribuição por Dia da Semana</Typography>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={summary.weekdayDistribution}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="day" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="count" name="Respostas" fill="#82ca9d" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Total Responses */}
                    <Grid item xs={12} sm={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6">Total de Respostas no Período</Typography>
                                <Typography variant="h3">{summary.totalResponses}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Client Proportion */}
                    <Grid item xs={12} sm={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6">Proporção de Clientes</Typography>
                                <ResponsiveContainer width="100%" height={200}>
                                    <PieChart>
                                        <Pie
                                            data={[
                                                { name: 'Com Cadastro', value: summary.clientProportion.registered },
                                                { name: 'Sem Cadastro', value: summary.clientProportion.unregistered }
                                            ]}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={80}
                                            fill="#8884d8"
                                            label
                                        >
                                            <Cell key={`cell-0`} fill={PIE_COLORS[0]} />
                                            <Cell key={`cell-1`} fill={PIE_COLORS[1]} />
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}
        </Box>
    );
};

export default ResumoMesPage;