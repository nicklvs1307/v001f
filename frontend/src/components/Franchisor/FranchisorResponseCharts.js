import React, { useState, useEffect } from 'react';
import {
    Grid,
    Paper,
    Typography,
    useTheme,
    CircularProgress,
    Alert
} from '@mui/material';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import franchisorService from '../../services/franchisorService';
import { getStartOfDayUTC, getEndOfDayUTC } from '../../utils/dateUtils';
import { keyframes } from '@mui/system';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const FranchisorResponseCharts = ({ startDate, endDate }) => {
    const theme = useTheme();
    const [chartsData, setChartsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let isActive = true;

        const fetchChartData = async () => {
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
                    setChartsData({
                        responseChart: data.responseChart,
                        surveysRespondedChart: data.surveysRespondedChart
                    });
                }
            } catch (err) {
                if (isActive) {
                    setError(err.message || 'Falha ao carregar os dados dos gráficos.');
                }
            } finally {
                if (isActive) {
                    setLoading(false);
                }
            }
        };

        fetchChartData();

        return () => {
            isActive = false;
        };
    }, [startDate, endDate]);

    if (loading) {
        return (
            <Grid item xs={12}>
                <CircularProgress />
                <Alert severity="info">Carregando gráficos de respostas...</Alert>
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

    return (
        <>
            {/* Gráfico de Respostas por Período */}
            <Grid item xs={12} md={6} sx={{ animation: `${fadeIn} 0.5s ease-out` }}>
                <Paper elevation={2} sx={{ p: 2, height: { xs: 300, md: 400 } }}>
                    <Typography variant="subtitle1" color="text.secondary" sx={{ borderBottom: `1px solid ${theme.palette.divider}`, pb: 1, mb: 1 }}>
                        Respostas por Período
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary" mb={2}>
                        Total de perguntas respondidas por período.
                    </Typography>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={chartsData?.responseChart}>
                            <defs>
                                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="Respostas" fill="url(#colorUv)" />
                        </BarChart>
                    </ResponsiveContainer>
                </Paper>
            </Grid>

            {/* Gráfico de Pesquisas Respondidas por Período */}
            <Grid item xs={12} md={6} sx={{ animation: `${fadeIn} 0.5s ease-out` }}>
                <Paper elevation={2} sx={{ p: 2, height: { xs: 300, md: 400 } }}>
                    <Typography variant="subtitle1" color="text.secondary" sx={{ borderBottom: `1px solid ${theme.palette.divider}`, pb: 1, mb: 1 }}>
                        Pesquisas Respondidas por Período
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary" mb={2}>
                        Número de clientes únicos que responderam por período.
                    </Typography>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={chartsData?.surveysRespondedChart}>
                            <defs>
                                <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={theme.palette.secondary.main} stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor={theme.palette.secondary.main} stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="Pesquisas Respondidas" fill="url(#colorPv)" />
                        </BarChart>
                    </ResponsiveContainer>
                </Paper>
            </Grid>
        </>
    );
};

export default FranchisorResponseCharts;
