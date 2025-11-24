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
import dashboardService from '../../services/dashboardService';
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

const ConversionChart = ({ startDate, endDate, handleCardClick }) => {
    const theme = useTheme();
    const [conversionData, setConversionData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let isActive = true;

        const fetchConversionData = async () => {
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
                const data = await dashboardService.getConversionChart(params);
                if (isActive) {
                    setConversionData(data);
                }
            } catch (err) {
                if (isActive) {
                    setError(err.message || 'Falha ao carregar o gráfico de conversão.');
                }
            } finally {
                if (isActive) {
                    setLoading(false);
                }
            }
        };

        fetchConversionData();

        return () => {
            isActive = false;
        };
    }, [startDate, endDate]);

    if (loading) {
        return (
            <Grid item xs={12}>
                <CircularProgress />
                <Alert severity="info">Carregando gráfico de conversão...</Alert>
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
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Paper elevation={2} sx={{ p: 2, height: { xs: 300, md: 400 } }}>
                    <Typography variant="subtitle1" color="text.secondary" sx={{ borderBottom: `1px solid ${theme.palette.divider}`, pb: 1, mb: 1 }}>
                        Gráfico de Conversão
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary" mb={2}>
                        Análise da conversão em cada etapa, desde as respostas coletadas até os cupons utilizados.
                    </Typography>
                    <ResponsiveContainer width="100%" height={280}>
                        <LineChart
                            data={conversionData}
                            onClick={(e) => {
                                if (e && e.activePayload && e.activePayload.length > 0) {
                                    handleCardClick(e.activePayload[0].payload.name);
                                }
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="value" stroke={theme.palette.success.main} activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </Paper>
            </Grid>
        </Grid>
    );
};

export default ConversionChart;
