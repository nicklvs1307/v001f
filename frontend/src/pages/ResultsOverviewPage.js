import React, { useState, useEffect, useContext, useCallback } from 'react';
import { 
    Container, 
    Typography, 
    Box, 
    CircularProgress, 
    Alert, 
    Grid,
    Paper,
    TextField,
    Button
} from '@mui/material';
import { subDays, format } from 'date-fns';
import resultService from '../services/resultService';
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

    const [startDate, setStartDate] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

    const fetchResults = useCallback(async () => {
        if (!tenantId) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            setError('');
            const params = { tenantId, startDate, endDate };
            const resultData = await resultService.getMainDashboard(params);
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
                        <TextField
                            label="Data de Início"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            size="small"
                        />
                        <TextField
                            label="Data de Fim"
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            size="small"
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
                        <KeyMetrics data={data.summary} />
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
