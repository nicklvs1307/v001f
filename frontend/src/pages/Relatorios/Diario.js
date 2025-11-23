import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
    Container, 
    Typography, 
    Box, 
    CircularProgress, 
    Alert, 
    Grid,
    Paper,
    TextField
} from '@mui/material';
import { format } from 'date-fns';
import { getStartOfDayUTC, getEndOfDayUTC, getNowInLocalTimezone } from '../../utils/dateUtils';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { ptBR } from 'date-fns/locale';
import dashboardService from '../../services/dashboardService';
import { useAuth } from '../../context/AuthContext';

import KeyMetrics from '../../components/results/KeyMetrics';
import NpsCharts from '../../components/results/NpsCharts';
import CustomerFeedback from '../../components/results/CustomerFeedback';
import Demographics from '../../components/results/Demographics';
import AttendantPerformance from '../../components/results/AttendantPerformance';

const RelatorioDiario = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useAuth();
    const tenantId = user?.tenantId;
    const location = useLocation();
    const navigate = useNavigate();

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
                params.startDate = getStartOfDayUTC(selectedDate);
                params.endDate = getEndOfDayUTC(selectedDate);
            }
            const resultData = await dashboardService.getMainDashboard(params);
            setData(resultData);
        } catch (err) {
            setError(err.message || 'Falha ao carregar os resultados.');
        } finally {
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
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress size={60} />
                <Typography sx={{ ml: 2 }}>Carregando relatório...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    const keyMetricsData = data && data.summary ? [
        { title: 'NPS Geral', value: data.summary.nps?.score?.toFixed(1) ?? 'N/A' },
        { title: 'CSAT Geral (%)', value: data.summary.csat?.satisfactionRate?.toFixed(1) ?? 'N/A' },
        { title: 'Total de Respostas', value: data.summary.totalResponses ?? 0 },
        { title: 'Total de Cadastros', value: data.summary.registrations ?? 0 },
        { title: 'Cupons Gerados', value: data.summary.couponsGenerated ?? 0 },
        { title: 'Cupons Utilizados', value: data.summary.couponsUsed ?? 0 },
    ] : [];

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
            <Box sx={{ flexGrow: 1, p: 3, backgroundColor: '#f4f6f8' }}>
                <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: '16px' }}>
                    <Grid container spacing={2} justifyContent="space-between" alignItems="center">
                        <Grid item>
                            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                Relatório Diário
                            </Typography>
                        </Grid>
                        <Grid item sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                <DatePicker
                                    label="Selecione a Data"
                                    value={selectedDate}
                                    onChange={handleDateChange}
                                    renderInput={(params) => <TextField {...params} />}
                                />
                        </Grid>
                    </Grid>
                </Paper>
                
                {!data ? (
                    <Typography variant="h6" align="center" sx={{ mt: 4 }}>
                        Não há dados para o período selecionado.
                    </Typography>
                ) : (
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <KeyMetrics metrics={keyMetricsData} />
                        </Grid>

                        <Grid item xs={12} lg={8}>
                            <NpsCharts 
                                npsTrend={data.npsTrend} 
                                criteriaScores={data.criteriaScores} 
                                npsByDayOfWeek={data.npsByDayOfWeek} 
                            />
                        </Grid>

                        <Grid item xs={12} lg={4}>
                            <CustomerFeedback latestComments={data.feedbacks} />
                        </Grid>

                        <Grid item xs={12}>
                            <Demographics 
                                ageDistribution={data.demographics?.ageDistribution} 
                                genderDistribution={data.demographics?.genderDistribution} 
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <AttendantPerformance performanceData={data.attendantsPerformance} />
                        </Grid>
                    </Grid>
                )}
            </Box>
        </LocalizationProvider>
    );
};

export default RelatorioDiario;