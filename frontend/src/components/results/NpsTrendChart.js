import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import resultService from '../../services/resultService';

const NpsTrendChart = ({ tenantId }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const trendData = await resultService.getNpsTrend(tenantId);
                setData(trendData);
            } catch (err) {
                setError('Não foi possível carregar o gráfico de tendência de NPS.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        if (tenantId !== undefined) {
            fetchData();
        }
    }, [tenantId]);

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}><CircularProgress /></Box>;
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    return (
        <Box sx={{ height: 300 }}>
            <Typography variant="h6" gutterBottom>Evolução do NPS (Diário)</Typography>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={data}
                    margin={{
                        top: 5,
                        right: 30,
                        left: -10,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis domain={[-100, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="nps" name="NPS" stroke="#8884d8" activeDot={{ r: 8 }} />
                </LineChart>
            </ResponsiveContainer>
        </Box>
    );
};

export default NpsTrendChart;
