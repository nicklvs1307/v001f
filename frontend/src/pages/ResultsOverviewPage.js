import React, { useState, useEffect, useContext, useCallback } from 'react';
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
import { subDays } from 'date-fns';
import { getStartOfDayUTC, getEndOfDayUTC } from '../utils/dateUtils';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dashboardService from '../services/dashboardService';
import AuthContext from '../context/AuthContext';

import KeyMetrics from '../components/results/KeyMetrics';
import NpsCharts from '../components/results/NpsCharts';
import CustomerFeedback from '../components/results/CustomerFeedback';
import Demographics from '../components/results/Demographics';
import AttendantPerformance from '../components/results/AttendantPerformance';

const ResultsOverviewPage = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useContext(AuthContext);
    const tenantId = user?.role === 'Super Admin' ? null : user?.tenantId;

    const [startDate, setStartDate] = useState(subDays(new Date(), 30));
    const [endDate, setEndDate] = useState(new Date());

    const fetchResults = useCallback(async () => {
        if (!tenantId) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            setError('');
            const params = { tenantId };
            if (startDate) {
                params.startDate = getStartOfDayUTC(startDate);
            }
            if (endDate) {
                params.endDate = getEndOfDayUTC(endDate);
            }
            const resultData = await dashboardService.getMainDashboard(params);
            setData(resultData);
        } catch (err) {
            setError(err.message || 'Falha ao carregar os resultados.');
        } finally {
            setLoading(false);
        }
    }, [tenantId, startDate, endDate]);

    useEffect(() => {
        fetchResults();
    }, [fetchResults]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress size={60} />
                <Typography sx={{ ml: 2 }}>Carregando dashboard...</Typography>
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
        { title: 'Total de Cadastros', value: data.summary.totalUsers ?? 0 },
        { title: 'Cupons Gerados', value: data.summary.couponsGenerated ?? 0 },
        { title: 'Cupons Utilizados', value: data.summary.couponsUsed ?? 0 },
    ] : [];

    return (
        <Box sx={{ flexGrow: 1, p: 3, backgroundColor: '#f4f6f8' }}>
            <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: '16px' }}>
                <Grid container spacing={2} justifyContent="space-between" alignItems="center">
                    <Grid item>
                        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                            Dashboard de Resultados
                        </Typography>
                    </Grid>
                    <Grid item sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <DatePicker
                            label="Data de Início"
                            value={startDate}
                            onChange={(newValue) => setStartDate(newValue)}
                        />
                        <DatePicker
                            label="Data de Fim"
                            value={endDate}
                            onChange={(newValue) => setEndDate(newValue)}
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

                    <Grid item xs={12} lg={6}>
                        <Demographics 
                            ageDistribution={data.demographics?.ageDistribution} 
                            genderDistribution={data.demographics?.genderDistribution} 
                        />
                    </Grid>

                    <Grid item xs={12} lg={6}>
                        <AttendantPerformance performanceData={data.attendantsPerformance} />
                    </Grid>
                </Grid>
            )}
        </Box>
    );
};

export default ResultsOverviewPage;
