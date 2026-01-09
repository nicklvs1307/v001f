import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, useTheme, CircularProgress, Alert, Typography } from '@mui/material';
import MetricCard from '../Dashboard/DashboardSummaryMetricCard';
import { getStartOfDayUTC, getEndOfDayUTC } from '../../utils/dateUtils';
import franchisorService from '../../services/franchisorService';

const FranchisorSummaryMetrics = ({ startDate, endDate }) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let isActive = true;

        const fetchSummaryData = async () => {
            try {
                setLoading(true);
                setError('');
                const params = {};
                if (startDate) {
                    params.startDate = getStartOfDayUTC(startDate);
                }
                if (endDate) {
                    params.endDate = getEndOfDayUTC(endDate);
                }
                const data = await franchisorService.getDashboard(params);
                if (isActive) {
                    setSummary(data);
                }
            } catch (err) {
                if (isActive) {
                    setError(err.message || 'Falha ao carregar o resumo dos dados.');
                }
            } finally {
                if (isActive) {
                    setLoading(false);
                }
            }
        };

        fetchSummaryData();

        return () => {
            isActive = false;
        };
    }, [startDate, endDate]);

    if (loading) {
        return (
            <Grid container spacing={2} sx={{ mb: 4, justifyContent: 'center' }}>
                <Grid item>
                    <CircularProgress />
                    <Typography>Carregando métricas...</Typography>
                </Grid>
            </Grid>
        );
    }

    if (error) {
        return (
            <Grid item xs={12}>
                <Alert severity="error">{error}</Alert>
            </Grid>
        );
    }

    if (!summary || Object.keys(summary).length === 0 || summary.message) {
        return (
            <Grid item xs={12}>
                <Alert severity="info">{summary?.message || 'Nenhum dado de resumo encontrado para o período selecionado.'}</Alert>
            </Grid>
        );
    }
    
    return (
        <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6} lg={3}>
                <MetricCard
                    title="NPS Geral"
                    value={summary?.nps?.npsScore?.toFixed(0)}
                    color={theme.palette.primary.main}
                />
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
                <MetricCard
                    title="Média de Satisfação"
                    value={summary?.csat?.averageScore?.toFixed(1)}
                    color={theme.palette.secondary.main}
                />
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
                <MetricCard
                    title="Total de Respostas"
                    value={summary?.totalResponses}
                    color={theme.palette.info.main}
                />
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
                <MetricCard
                    title="Promotores (NPS)"
                    value={summary?.nps?.promoters}
                    percentage={summary?.nps?.total > 0 ? ((summary?.nps?.promoters / summary?.nps?.total) * 100).toFixed(1) : 0}
                    color={theme.palette.success.main}
                />
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
                <MetricCard
                    title="Detratores (NPS)"
                    value={summary?.nps?.detractors}
                    percentage={summary?.nps?.total > 0 ? ((summary?.nps?.detractors / summary?.nps?.total) * 100).toFixed(1) : 0}
                    color={theme.palette.error.main}
                />
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
                <MetricCard
                    title="Neutros (NPS)"
                    value={summary?.nps?.neutrals}
                    percentage={summary?.nps?.total > 0 ? ((summary?.nps?.neutrals / summary?.nps?.total) * 100).toFixed(1) : 0}
                    color={theme.palette.secondary.main}
                />
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
                <MetricCard
                    title="Satisfeitos (CSAT)"
                    value={summary?.csat?.satisfied}
                    percentage={summary?.csat?.total > 0 ? ((summary?.csat?.satisfied / summary?.csat?.total) * 100).toFixed(1) : 0}
                    color={theme.palette.success.main}
                />
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
                <MetricCard
                    title="Insatisfeitos (CSAT)"
                    value={summary?.csat?.unsatisfied}
                    percentage={summary?.csat?.total > 0 ? ((summary?.csat?.unsatisfied / summary?.csat?.total) * 100).toFixed(1) : 0}
                    color={theme.palette.error.main}
                />
            </Grid>
        </Grid>
    );
};

export default FranchisorSummaryMetrics;
