import React, { useEffect, useState, useMemo } from 'react';
import {
    Typography,
    Box,
    Grid,
    CircularProgress,
    TextField,
    Paper,
    Container,
    Card,
    CardContent,
    Alert
} from '@mui/material';
import dashboardService from '../../services/dashboardService';
import { useAuth } from '../../context/AuthContext';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { startOfMonth, endOfMonth } from 'date-fns';
import { getStartOfDayUTC, getEndOfDayUTC, getNowInLocalTimezone } from '../../utils/dateUtils';
import ChartCard from '../../components/charts/ChartCard';
import KeyMetrics from '../../components/results/KeyMetrics'; // Assuming this component will be created

const NPS_COLORS = ['#4CAF50', '#FFC107', '#F44336']; // Promoters, Neutrals, Detractors
const CSAT_COLORS = ['#2196F3', '#FFC107', '#F44336']; // Satisfied, Neutral, Unsatisfied

const SatisfacaoPage = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const [startDate, setStartDate] = useState(startOfMonth(getNowInLocalTimezone()));
    const [endDate, setEndDate] = useState(endOfMonth(getNowInLocalTimezone()));
    const [error, setError] = useState(null);
    useEffect(() => {
        const fetchData = async () => {
            if (!user?.tenantId) {
                setLoading(false);
                return;
            }
            setLoading(true);
            setError(null);
            try {
                const response = await dashboardService.getMainDashboard({
                    tenantId: user.tenantId,
                    startDate: getStartOfDayUTC(startDate),
                    endDate: getEndOfDayUTC(endDate)
                });
                setData(response.overallResults); // Focus on the overallResults object
            } catch (err) {
                console.error("Error fetching data", err);
                setError("Não foi possível carregar os dados. Tente novamente mais tarde.");
                setData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user, startDate, endDate]);

    const { npsData, csatData, hasData } = useMemo(() => {
        if (!data) return { npsData: [], csatData: [], hasData: false };

        const nps = data.overallNPS;
        const csat = data.overallCSAT;

        const npsData = nps ? [
            { name: 'Promotores', value: nps.promoters || 0 },
            { name: 'Neutros', value: nps.neutrals || 0 },
            { name: 'Detratores', value: nps.detractors || 0 },
        ] : [];

        const csatData = csat ? [
            { name: 'Satisfeitos', value: csat.satisfied || 0 },
            { name: 'Neutros', value: csat.neutral || 0 },
            { name: 'Insatisfeitos', value: csat.unsatisfied || 0 },
        ] : [];

        const hasNpsData = npsData.some(item => item.value > 0);
        const hasCsatData = csatData.some(item => item.value > 0);
        const hasCriteriaData = data.scoresByCriteria?.some(c => c.total > 0);

        return { npsData, csatData, hasData: hasNpsData || hasCsatData || hasCriteriaData };
    }, [data]);

    const keyMetrics = useMemo(() => {
        if (!data) return [];
        return [
            { title: 'NPS Geral', value: data.overallNPS?.npsScore?.toFixed(1) ?? 'N/A', change: null },
            { title: 'CSAT Geral (%)', value: data.overallCSAT?.satisfactionRate?.toFixed(1) ?? 'N/A', change: null },
            { title: 'Total de Respostas', value: data.overallNPS?.total + data.overallCSAT?.total || 'N/A', change: null },
        ];
    }, [data]);

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

        if (!hasData) {
            return (
                <Typography variant="h6" align="center" sx={{ mt: 4, color: 'text.secondary' }}>
                    Não há dados de satisfação para o período selecionado.
                </Typography>
            );
        }

        return (
            <Grid container spacing={3}>
                {npsData.some(item => item.value > 0) && (
                    <Grid item xs={12} md={6}>
                        <ChartCard
                            title="NPS Geral"
                            score={data.overallNPS?.npsScore?.toFixed(1) ?? 0}
                            data={npsData}
                            colors={NPS_COLORS}
                            loading={loading}
                        />
                    </Grid>
                )}
                {csatData.some(item => item.value > 0) && (
                    <Grid item xs={12} md={6}>
                        <ChartCard
                            title="CSAT Geral"
                            score={`${data.overallCSAT?.satisfactionRate?.toFixed(1) ?? 0}%`}
                            data={csatData}
                            colors={CSAT_COLORS}
                            loading={loading}
                        />
                    </Grid>
                )}
                {data.scoresByCriteria && data.scoresByCriteria.map((criterion, index) => {
                    if (criterion.total === 0) return null;

                    const chartData = criterion.scoreType === 'NPS' ? [
                        { name: 'Promotores', value: criterion.promoters || 0 },
                        { name: 'Neutros', value: criterion.neutrals || 0 },
                        { name: 'Detratores', value: criterion.detractors || 0 },
                    ] : [
                        { name: 'Satisfeitos', value: criterion.satisfied || 0 },
                        { name: 'Neutros', value: criterion.neutral || 0 },
                        { name: 'Insatisfeitos', value: criterion.unsatisfied || 0 },
                    ];

                    const score = criterion.scoreType === 'NPS' 
                        ? criterion.npsScore?.toFixed(1) ?? 0 
                        : `${criterion.satisfactionRate?.toFixed(1) ?? 0}%`;

                    return (
                        <Grid item xs={12} md={6} key={index}>
                            <ChartCard
                                title={criterion.criterion}
                                score={score}
                                data={chartData}
                                colors={criterion.scoreType === 'NPS' ? NPS_COLORS : CSAT_COLORS}
                                loading={loading}
                            />
                        </Grid>
                    );
                })}
            </Grid>
        );
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Card sx={{ mb: 3, p: 2 }}>
                <CardContent>
                    <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                        Painel de Satisfação do Cliente
                    </Typography>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={4}>
                            <DatePicker
                                label="Data de Início"
                                value={startDate}
                                onChange={(newValue) => setStartDate(newValue)}
                                inputFormat="dd/MM/yyyy"
                                renderInput={(params) => <TextField {...params} fullWidth />}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <DatePicker
                                label="Data de Fim"
                                value={endDate}
                                onChange={(newValue) => setEndDate(newValue)}
                                inputFormat="dd/MM/yyyy"
                                renderInput={(params) => <TextField {...params} fullWidth />}
                            />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {data && <KeyMetrics metrics={keyMetrics} />}

            <Paper elevation={0} sx={{ p: 3, mt: 3, borderRadius: '16px', backgroundColor: 'transparent' }}>
                {renderContent()}
            </Paper>
        </Container>
    );
};

export default SatisfacaoPage;
