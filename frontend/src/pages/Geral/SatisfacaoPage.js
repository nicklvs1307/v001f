import React, { useEffect, useState } from 'react';
import { Typography, Box, Grid, CircularProgress, TextField, Paper } from '@mui/material';
import resultService from '../../services/resultService';
import { useAuth } from '../../context/AuthContext';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import ChartCard from '../../components/charts/ChartCard';

const NPS_COLORS = ['#4CAF50', '#FFC107', '#F44336']; // Promoters, Neutrals, Detractors
const CSAT_COLORS = ['#2196F3', '#FFC107', '#F44336']; // Satisfied, Neutral, Unsatisfied

const SatisfacaoPage = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await resultService.getMainDashboard({ tenantId: user.tenantId, startDate, endDate });
                setData(response);
            } catch (error) {
                console.error("Error fetching data", error);
                setData(null); // Clear data on error
            } finally {
                setLoading(false);
            }
        };

        if (user && user.tenantId) {
            fetchData();
        }
    }, [user, startDate, endDate]);

    const renderCustomizedLabel = ({ percent }) => {
        return `${(percent * 100).toFixed(0)}%`;
    };

    const npsData = data?.nps ? [
        { name: 'Promotores', value: data.nps.promoters },
        { name: 'Neutros', value: data.nps.passives },
        { name: 'Detratores', value: data.nps.detractors },
    ] : [];

    return (
        <Box sx={{ p: 3, backgroundColor: '#f4f6f8', minHeight: '100vh' }}>
            <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: '16px' }}>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    Painel de Satisfação
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

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                    <CircularProgress size={60} />
                </Box>
            ) : !data ? (
                <Typography variant="h6" align="center" sx={{ mt: 4 }}>
                    Não foi possível carregar os dados. Tente novamente mais tarde.
                </Typography>
            ) : (
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <ChartCard
                            title="NPS Geral"
                            score={data.nps?.score || 0}
                            data={npsData}
                            colors={NPS_COLORS}
                            loading={loading}
                            renderCustomizedLabel={renderCustomizedLabel}
                        />
                    </Grid>

                    {data.criteriaScores && data.criteriaScores.map((criterion, index) => {
                        const chartData = criterion.scoreType === 'NPS' ? [
                            { name: 'Promotores', value: criterion.promoters },
                            { name: 'Neutros', value: criterion.neutrals },
                            { name: 'Detratores', value: criterion.detractors },
                        ] : [
                            { name: 'Satisfeitos', value: criterion.satisfied },
                            { name: 'Neutros', value: criterion.neutral },
                            { name: 'Insatisfeitos', value: criterion.unsatisfied },
                        ];

                        const score = criterion.scoreType === 'NPS' ? criterion.score || 0 : `${criterion.satisfactionRate || 0}%`;

                        return (
                            <Grid item xs={12} md={6} key={index}>
                                <ChartCard
                                    title={criterion.criterion}
                                    score={score}
                                    data={chartData}
                                    colors={criterion.scoreType === 'NPS' ? NPS_COLORS : CSAT_COLORS}
                                    loading={loading}
                                    renderCustomizedLabel={renderCustomizedLabel}
                                />
                            </Grid>
                        );
                    })}
                </Grid>
            )}
        </Box>
    );
};

export default SatisfacaoPage;