import React, { useState, useEffect, useContext } from 'react';
import { Container, Typography, Box, CircularProgress, Alert, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import resultService from '../services/resultService';
import AuthContext from '../context/AuthContext';

// I will create these components later
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

    useEffect(() => {
        const fetchResults = async () => {
            try {
                setLoading(true);
                setError('');
                const resultData = await resultService.getMainDashboard(tenantId);
                setData(resultData);
            } catch (err) {
                setError(err.message || 'Falha ao carregar os resultados.');
            } finally {
                setLoading(false);
            }
        };

        if (tenantId !== undefined) {
            fetchResults();
        }
    }, [tenantId]);

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
            <Box sx={{ mt: 8, textAlign: 'center' }}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    if (!data) {
        return (
            <Box sx={{ mt: 8, textAlign: 'center' }}>
                <Typography>Nenhum resultado encontrado.</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ flexGrow: 1, p: 3, backgroundColor: '#f4f6f8' }}>
            <Typography variant="h4" component="h1" sx={{ mb: 4, fontWeight: 'bold' }}>
                Dashboard de Resultados
            </Typography>
            <Grid container spacing={3}>
                {/* Key Metrics will go here */}
                <Grid item xs={12}>
                    <KeyMetrics data={data.summary} />
                </Grid>

                {/* NPS Charts will go here */}
                <Grid item xs={12} lg={8}>
                    <NpsCharts npsTrend={data.responseChart} npsByCriteria={data.npsCriteria} npsByDayOfWeek={data.npsByDayOfWeek} tenantId={tenantId} />
                </Grid>

                {/* Customer Feedback will go here */}
                <Grid item xs={12} lg={4}>
                    <CustomerFeedback latestComments={data.feedbacks} tenantId={tenantId} />
                </Grid>

                {/* Demographics will go here */}
                <Grid item xs={12} lg={6}>
                    <Demographics ageDistribution={data.demographics?.ageDistribution} genderDistribution={data.demographics?.genderDistribution} />
                </Grid>

                {/* Attendant Performance */} 
                <Grid item xs={12} lg={6}>
                    <AttendantPerformance topAttendants={data.ranking} bottomAttendants={data.bottomAttendants} />
                </Grid>

                {/* Latest Responses */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>Últimas Respostas</Typography>
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Data</TableCell>
                                        <TableCell>Cliente</TableCell>
                                        <TableCell>NPS</TableCell>
                                        <TableCell>Comentário</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {data.feedbacks && data.feedbacks.length > 0 ? (
                                        data.feedbacks.map((feedback, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{feedback.date}</TableCell>
                                                <TableCell>{feedback.client}</TableCell>
                                                <TableCell>{feedback.nps}</TableCell>
                                                <TableCell>{feedback.comment}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4}>Nenhuma resposta recente.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>

            </Grid>
        </Box>
    );
};

export default ResultsOverviewPage;