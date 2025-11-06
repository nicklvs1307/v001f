import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    Grid,
    Paper,
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
import StatCard from '../../components/common/StatCard';
import { FaChartLine, FaChartBar, FaChartPie, FaUsers } from 'react-icons/fa';

const CHART_COLORS = {
    primary: '#8884d8',
    secondary: '#82ca9d',
    accent: '#ffc658',
    pie: ['#0088FE', '#FFBB28', '#00C49F', '#FF8042'],
};

const ChartContainer = ({ title, icon, children }) => (
    <Paper elevation={3} sx={{ p: 3, borderRadius: '16px', height: '100%', boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box sx={{ fontSize: 24, color: 'primary.main', mr: 1 }}>{icon}</Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{title}</Typography>
        </Box>
        {children}
    </Paper>
);

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

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress size={60} /></Box>;
    }

    if (error) {
        return <Typography color="error" align="center" variant="h6">{error}</Typography>;
    }

    return (
        <Box sx={{ p: 3, backgroundColor: '#f4f6f8', minHeight: '100vh' }}>
            <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: '16px' }}>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    Resumo do Mês
                </Typography>
                <Grid container spacing={2} alignItems="center">
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
            </Paper>

            {summary && (
                <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
                        <ChartContainer title="NPS Diário e Acumulado" icon={<FaChartLine />}>
                            <ResponsiveContainer width="100%" height={400}>
                                <LineChart data={summary.dailyNps}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="nps" name="NPS Diário" stroke={CHART_COLORS.primary} />
                                    <Line type="monotone" dataKey="accumulatedNps" name="NPS Acumulado" stroke={CHART_COLORS.secondary} />
                                </LineChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <StatCard title="Total de Respostas" value={summary.totalResponses} icon={<FaUsers />} />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <ChartContainer title="Horário de Pico das Respostas" icon={<FaChartBar />}>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={summary.peakHours}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="hour" label={{ value: 'Hora do dia', position: 'insideBottom', offset: -5 }} />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="count" name="Respostas" fill={CHART_COLORS.accent} />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <ChartContainer title="Distribuição por Dia da Semana" icon={<FaChartBar />}>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={summary.weekdayDistribution}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="day" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="count" name="Respostas" fill={CHART_COLORS.secondary} />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </Grid>

                    <Grid item xs={12}>
                        <ChartContainer title="Proporção de Clientes" icon={<FaChartPie />}>
                            <ResponsiveContainer width="100%" height={250}>
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
                                        outerRadius={100}
                                        fill={CHART_COLORS.primary}
                                        label
                                    >
                                        {CHART_COLORS.pie.map((color, index) => (
                                            <Cell key={`cell-${index}`} fill={color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </Grid>
                </Grid>
            )}
        </Box>
    );
};

export default ResumoMesPage;