import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Box, Typography, Paper, useTheme } from '@mui/material';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <Paper elevation={3} sx={{ p: 2 }}>
                <Typography variant="body2">{`Critério: ${label}`}</Typography>
                <Typography variant="body2" sx={{ color: payload[0].payload.fill }}>
                    {`NPS: ${payload[0].value}`}
                </Typography>
            </Paper>
        );
    }
    return null;
};

const CriteriaBarChart = ({ data }) => {
    const theme = useTheme();

    if (!data || data.length === 0) {
        return (
            <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="text.secondary">Sem dados de NPS por critério.</Typography>
            </Box>
        );
    }

    const chartData = [...data].sort((a, b) => a.npsScore - b.npsScore);

    return (
        <Box sx={{ height: 400 }}>
            <Typography variant="h6" gutterBottom>NPS por Critério</Typography>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={chartData}
                    margin={{
                        top: 5,
                        right: 30,
                        left: -10,
                        bottom: 75,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis dataKey="criterion" type="category" angle={-45} textAnchor="end" height={100} tick={{ fill: theme.palette.text.secondary }} />
                    <YAxis type="number" domain={[-100, 100]} tick={{ fill: theme.palette.text.secondary }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="npsScore" name="NPS">
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.npsScore >= 0 ? theme.palette.success.main : theme.palette.error.main} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </Box>
    );
};

export default CriteriaBarChart;

