import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
    Container, 
    Typography, 
    Box, 
    CircularProgress, 
    Alert, 
    Grid,
    Paper,
    TextField,
    useTheme
} from '@mui/material';
import { format } from 'date-fns';
import { getNowInLocalTimezone } from '../../utils/dateUtils';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import dashboardService from '../../services/dashboardService';
import { useAuth } from '../../context/AuthContext';
import RelatorioDiarioDashboard from '../../components/relatorios/Dashboard';
import MetricCard from '../../components/common/MetricCard';
import { TrendingUp, BarChart as BarChartIcon, People, Star, CheckCircle } from '@mui/icons-material';

const RelatorioDiario = () => {
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useAuth();
    const tenantId = user?.tenantId;
    const location = useLocation();
    const navigate = useNavigate();
    const theme = useTheme();

    const [selectedDate, setSelectedDate] = useState(getNowInLocalTimezone());

    const fetchResults = useCallback(async () => {
        if (!tenantId) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            setError('');
            const params = { tenantId };
            if (selectedDate) {
                params.date = selectedDate.toISOString();
            }
            const resultData = await dashboardService.getDailyReport(params);
            setReportData(resultData);
        } catch (err) {
            setError(err.message || 'Falha ao carregar os resultados.');
        }
        finally {
            setLoading(false);
        }
    }, [tenantId, selectedDate]);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const dateParam = queryParams.get('date');
        if (dateParam) {
            setSelectedDate(new Date(`${dateParam}T00:00:00`));
        }
    }, [location.search]);

    useEffect(() => {
        fetchResults();
    }, [fetchResults]);
    
    const handleDateChange = (newValue) => {
        setSelectedDate(newValue);
        const formattedDate = format(newValue, 'yyyy-MM-dd');
        navigate(`?date=${formattedDate}`);
    };

    if (loading) {
        return (
            <Container sx={{ mt: 8, textAlign: 'center' }}>
                <CircularProgress />
                <Typography>Carregando relatório...</Typography>
            </Container>
        );
    }

    if (error) {
        return (
            <Container sx={{ mt: 8, textAlign: 'center' }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }
    
    if (!reportData) {
        return (
            <Container sx={{ mt: 8, textAlign: 'center' }}>
                <Typography>Nenhum resultado encontrado para esta pesquisa.</Typography>
            </Container>
        );
    }

    const { summary, clientStatusCounts, ...chartData } = reportData;

    return (
            <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
                <Paper elevation={2} sx={{ p: { xs: 2, md: 3 }, mb: 4, backgroundColor: theme.palette.primary.main, color: 'white' }}>
                    <Grid container spacing={2} justifyContent="space-between" alignItems="center">
                        <Grid item>
                            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">Relatório Diário</Typography>
                            <Typography variant="h6" sx={{ opacity: 0.9 }}>{`Dados referentes a ${format(selectedDate, 'dd/MM/yyyy', { locale: ptBR })}`}</Typography>
                        </Grid>
                        <Grid item>
                            <DatePicker
                                label="Selecione a Data"
                                value={selectedDate}
                                onChange={handleDateChange}
                                renderInput={(params) => <TextField {...params} sx={{ 
                                    bgcolor: 'white', 
                                    borderRadius: 1,
                                    '& .MuiInputBase-input': { color: 'black' },
                                    '& .MuiSvgIcon-root': { color: 'black' } 
                                }} />}
                            />
                        </Grid>
                    </Grid>
                </Paper>

                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <MetricCard title="NPS Geral" value={summary?.nps?.score?.toFixed(1) ?? 0} icon={<TrendingUp fontSize="large" />} color={theme.palette.primary.dark} />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <MetricCard title="CSAT Geral" value={`${summary?.csat?.satisfactionRate?.toFixed(1) ?? '0.0'}%`} icon={<Star fontSize="large" />} color={theme.palette.secondary.main} />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <MetricCard title="Total de Respostas" value={summary?.totalResponses ?? 0} icon={<BarChartIcon fontSize="large" />} />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <MetricCard title="Respostas com Cadastro" value={clientStatusCounts?.withClient ?? 0} icon={<CheckCircle fontSize="large" />} />
                    </Grid>
                </Grid>
                
                <RelatorioDiarioDashboard data={chartData} />

            </Container>
    );
};