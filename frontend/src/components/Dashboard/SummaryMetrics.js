import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Grid,
    useTheme,
    CircularProgress,
    Alert,
    Typography,
    Paper,
    Box,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import BarChartIcon from '@mui/icons-material/BarChart';
import StarIcon from '@mui/icons-material/Star';
import ChatIcon from '@mui/icons-material/Chat';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import PeopleIcon from '@mui/icons-material/People';
import { getStartOfDayUTC, getEndOfDayUTC } from '../../utils/dateUtils';
import dashboardService from '../../services/dashboardService';

const kpiConfig = [
    {
        key: 'nps',
        title: 'NPS Geral',
        icon: BarChartIcon,
        iconBg: '#eff6ff',
        iconColor: '#3b82f6',
        getValue: (s) => s?.nps?.npsScore?.toFixed(0),
        getTrend: null,
        navigateTo: null,
    },
    {
        key: 'csat',
        title: 'Satisfação (CSAT)',
        icon: StarIcon,
        iconBg: '#f0fdf4',
        iconColor: '#22c55e',
        getValue: (s) => s?.csat?.averageScore?.toFixed(1),
        getTrend: null,
        navigateTo: null,
    },
    {
        key: 'responses',
        title: 'Total de Respostas',
        icon: ChatIcon,
        iconBg: '#fef3c7',
        iconColor: '#f59e0b',
        getValue: (s) => s?.totalResponses,
        getTrend: null,
        navigateTo: '/dashboard/respostas/gestao?npsClassification=all',
    },
    {
        key: 'promoters',
        title: 'Promotores',
        icon: TrendingUpIcon,
        iconBg: '#dcfce7',
        iconColor: '#16a34a',
        getValue: (s) => s?.nps?.promoters,
        getPercent: (s) => s?.nps?.total > 0 ? ((s?.nps?.promoters / s?.nps?.total) * 100).toFixed(1) : '0',
        navigateTo: '/dashboard/respostas/gestao?npsClassification=promoters',
    },
    {
        key: 'coupons',
        title: 'Cupons Utilizados',
        icon: ConfirmationNumberIcon,
        iconBg: '#fce7f3',
        iconColor: '#ec4899',
        getValue: (s) => s?.couponsUsed,
        getPercent: (s) => s?.couponsUsedConversion,
        navigateTo: null,
    },
];

const cardStyles = (iconBg, hasClick) => ({
    background: 'white',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #e2e8f0',
    transition: 'all 0.2s ease',
    cursor: hasClick ? 'pointer' : 'default',
    height: '100%',
    '&:hover': {
        transform: hasClick ? 'translateY(-2px)' : 'none',
        boxShadow: hasClick ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
    },
});

const SummaryMetrics = ({ startDate, endDate, handleCardClick }) => {
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
                if (startDate) params.startDate = getStartOfDayUTC(startDate);
                if (endDate) params.endDate = getEndOfDayUTC(endDate);
                const data = await dashboardService.getSummary(params);
                if (isActive) setSummary(data);
            } catch (err) {
                if (isActive) setError(err.message || 'Falha ao carregar o resumo dos dados.');
            } finally {
                if (isActive) setLoading(false);
            }
        };

        fetchSummaryData();
        return () => { isActive = false; };
    }, [startDate, endDate]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>;
    }

    if (!summary) {
        return <Alert severity="info" sx={{ mb: 3 }}>Nenhum dado de resumo encontrado para o período selecionado.</Alert>;
    }

    return (
        <Grid container spacing={3} sx={{ mb: 4 }}>
            {kpiConfig.map((kpi) => {
                const Icon = kpi.icon;
                const value = kpi.getValue(summary);
                const percent = kpi.getPercent ? kpi.getPercent(summary) : null;
                const hasClick = !!kpi.navigateTo || kpi.key === 'responses';

                return (
                    <Grid item xs={12} sm={6} md={2.4} key={kpi.key}>
                        <Paper
                            elevation={0}
                            sx={cardStyles(kpi.iconBg, hasClick)}
                            onClick={() => {
                                if (kpi.navigateTo) navigate(kpi.navigateTo);
                                if (kpi.key === 'responses') navigate(kpi.navigateTo);
                            }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                                <Typography variant="body2" color="text.secondary" fontWeight={600} textTransform="uppercase" sx={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}>
                                    {kpi.title}
                                </Typography>
                                <Box sx={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: '10px',
                                    backgroundColor: kpi.iconBg,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                    <Icon sx={{ fontSize: 20, color: kpi.iconColor }} />
                                </Box>
                            </Box>
                            <Typography variant="h4" component="div" fontWeight={700} color="text.primary" sx={{ lineHeight: 1.2 }}>
                                {value}
                            </Typography>
                            {percent !== null && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        {percent}% do total
                                    </Typography>
                                </Box>
                            )}
                        </Paper>
                    </Grid>
                );
            })}
        </Grid>
    );
};

export default SummaryMetrics;
