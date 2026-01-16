import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    Grid,
    Paper,
    CircularProgress,
    TextField,
    Alert,
    useTheme,
    alpha
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
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { getNowInLocalTimezone } from '../../utils/dateUtils';
import { useAuth } from '../../context/AuthContext';
import { ptBR } from 'date-fns/locale';
import { FaChartLine, FaChartBar, FaChartPie, FaUsers } from 'react-icons/fa';

const StatCard = ({ title, value, icon }) => {
    const theme = useTheme();
    return (
        <Paper 
            elevation={2}
            sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
                borderRadius: '16px',
                background: `linear-gradient(145deg, ${theme.palette.background.paper}, ${alpha(theme.palette.grey[100], 0.5)})`,
                boxShadow: `0 4px 20px ${alpha(theme.palette.grey[500], 0.1)}`,
            }}
        >
            <Box sx={{ fontSize: 32, color: 'primary.main', mb: 1 }}>{icon}</Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{value}</Typography>
            <Typography variant="subtitle1" color="text.secondary">{title}</Typography>
        </Paper>
    );
};

const ChartContainer = ({ title, icon, children }) => (
    <Paper elevation={2} sx={{ p: 3, borderRadius: '16px', height: '100%', background: (theme) => `linear-gradient(145deg, ${theme.palette.background.paper}, ${alpha(theme.palette.grey[100], 0.5)})`, boxShadow: (theme) => `0 4px 20px ${alpha(theme.palette.grey[500], 0.1)}` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box sx={{ fontSize: 24, color: 'primary.main', mr: 1 }}>{icon}</Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{title}</Typography>
        </Box>
        {children}
    </Paper>
);

const ResumoMesPage = () => {
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useAuth();
    const tenantId = user?.tenantId;

    const [selectedDate, setSelectedDate] = useState(getNowInLocalTimezone());

    const fetchResults = useCallback(async () => {
        if (!tenantId) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const params = { tenantId, date: selectedDate.toISOString() };
            const data = await dashboardService.getReport('mensal', params);
            setReportData(data);
            setError('');
        } catch (err) {
            setError('Falha ao carregar o resumo do mês.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [tenantId, selectedDate]);

    useEffect(() => {
        fetchResults();
    }, [fetchResults]);

    const summary = reportData?.summary;

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress size={60} /></Box>;
    }

    if (error) {
        return <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>;
    }
    
    const renderDateValue = (date) => {
        if (!date) return '';
        return format(date, 'MM/yyyy', { locale: ptBR });
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
            <Box sx={{ p: 3, backgroundColor: (theme) => theme.palette.background.default, minHeight: '100vh' }}>
                <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(10px)' }}>
                     <Grid container spacing={2} justifyContent="space-between" alignItems="center">
                        <Grid item>
                            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                Resumo do Mês
                            </Typography>
                        </Grid>
                        <Grid item>
                            <DatePicker
                                label="Selecione o Mês"
                                value={selectedDate}
                                onChange={(newValue) => setSelectedDate(newValue)}
                                renderInput={(params) => <TextField {...params} />}
                                views={['year', 'month']}
                                openTo="month"
                            />
                        </Grid>
                    </Grid>
                </Paper>

                {summary ? (
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
                                        <Line type="monotone" dataKey="nps" name="NPS Diário" stroke="#8884d8" />
                                        <Line type="monotone" dataKey="accumulatedNps" name="NPS Acumulado" stroke="#82ca9d" />
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
                                        <Bar dataKey="count" name="Respostas" fill="#ffc658" />
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
                                        <Bar dataKey="count" name="Respostas" fill="#82ca9d" />
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
                                            label
                                        >
                                            <Cell fill="#0088FE" />
                                            <Cell fill="#FFBB28" />
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        </Grid>
                    </Grid>
                ) : <Alert severity="info">Não há dados de resumo disponíveis para o período selecionado.</Alert>}
            </Box>
        </LocalizationProvider>
    );
};

export default ResumoMesPage;
