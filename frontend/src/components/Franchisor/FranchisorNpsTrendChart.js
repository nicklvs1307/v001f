import React, { useState, useEffect } from 'react';
import {
    Grid,
    Paper,
    Typography,
    CircularProgress,
    Alert,
    useTheme
} from '@mui/material';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { getStartOfDayUTC, getEndOfDayUTC } from '../../utils/dateUtils';
import franchisorService from '../../services/franchisorService';

const FranchisorNpsTrendChart = ({ startDate, endDate }) => {
    const theme = useTheme();
    const [npsTrend, setNpsTrend] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let isActive = true;

        const fetchNpsTrend = async () => {
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
                params.period = 'day'; 
                const data = await franchisorService.getDashboard(params);
                if (isActive) {
                    setNpsTrend(data.npsTrend);
                }
            } catch (err) {
                if (isActive) {
                    setError(err.message || 'Falha ao carregar a tendência de NPS.');
                }
            } finally {
                if (isActive) {
                    setLoading(false);
                }
            }
        };

        fetchNpsTrend();

        return () => {
            isActive = false;
        };
    }, [startDate, endDate]);

    if (loading) {
        return (
            <Grid item xs={12} md={6}>
                <CircularProgress />
                <Alert severity="info">Carregando tendência de NPS...</Alert>
            </Grid>
        );
    }

    if (error) {
        return (
            <Grid item xs={12} md={6}>
                <Alert severity="error">{error}</Alert>
            </Grid>
        );
    }

    return (
        <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 2, height: { xs: 300, md: 400 } }}>
                <Typography variant="subtitle1" color="text.secondary" sx={{ borderBottom: `1px solid ${theme.palette.divider}`, pb: 1, mb: 1 }}>
                    Tendência de NPS (Todos os Franqueados)
                </Typography>
                <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={npsTrend}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="period" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="nps" name="NPS" stroke={theme.palette.primary.main} />
                    </LineChart>
                </ResponsiveContainer>
            </Paper>
        </Grid>
    );
};

export default FranchisorNpsTrendChart;
