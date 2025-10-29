import React, { useState, useEffect, useContext, useCallback } from 'react';
import { 
    Container, 
    Typography, 
    Box, 
    CircularProgress, 
    Alert, 
    Grid, 
    Card, 
    CardContent,
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

    // State for date range filter
    const [startDate, setStartDate] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

    const fetchResults = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const params = { tenantId };
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;
            
            console.time('getMainDashboard API call');
            const resultData = await resultService.getMainDashboard(params);
            console.timeEnd('getMainDashboard API call');

            console.log('Dashboard data from API:', resultData);
            setData(resultData);
        } catch (err) {
            setError(err.message || 'Falha ao carregar os resultados.');
        } finally {
            setLoading(false);
        }
    }, [tenantId, startDate, endDate]);

    useEffect(() => {
        if (tenantId !== undefined) {
            fetchResults();
        }
    }, [fetchResults, tenantId]);

    const handleFilter = () => {
        fetchResults();
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Carregando dashboard...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    if (!data) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Typography>Nenhum resultado encontrado.</Typography>
            </Container>
        );
    }

    return (
        <Box sx={{ flexGrow: 1, p: 3, backgroundColor: '#f4f6f8' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                    Dashboard de Resultados
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
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
                    <Button variant="contained" onClick={handleFilter}>
                        Filtrar
                    </Button>
                </Box>
            </Box>
            
            <Grid container spacing={3}>
                {/* Key Metrics */}
                <Grid item xs={12}>
                    <KeyMetrics data={data.summary} />
                </Grid>

                {/* NPS Charts */}
                <Grid item xs={12} lg={8}>
                    <NpsCharts 
                        npsTrend={data.npsTrend} 
                        criteriaScores={data.criteriaScores} 
                        npsByDayOfWeek={data.npsByDayOfWeek} 
                    />
                </Grid>

                {/* Customer Feedback */}
                <Grid item xs={12} lg={4}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <CustomerFeedback latestComments={data.feedbacks} />
                        </CardContent>
                    </Card>
                </Grid>

                {/* Demographics */}
                <Grid item xs={12} lg={6}>
                     <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Demographics 
                                ageDistribution={data.demographics?.ageDistribution} 
                                genderDistribution={data.demographics?.genderDistribution} 
                            />
                        </CardContent>
                    </Card>
                </Grid>

                {/* Attendant Performance */} 
                <Grid item xs={12} lg={6}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <AttendantPerformance performanceData={data.attendantsPerformance} />
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default ResultsOverviewPage;
