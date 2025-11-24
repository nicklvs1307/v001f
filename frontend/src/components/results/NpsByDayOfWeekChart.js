import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Box, Typography, Paper, useTheme } from '@mui/material';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <Paper elevation={3} sx={{ p: 2 }}>
                <Typography variant="body2">{`Dia: ${label}`}</Typography>
                <Typography variant="body2" sx={{ color: payload[0].payload.fill }}>
                    {`NPS: ${payload[0].value}`}
                </Typography>
            </Paper>
        );
    }
    return null;
};

const NpsByDayOfWeekChart = ({ data }) => {
    const theme = useTheme();

    if (!data || data.length === 0) {
        return (
            <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="text.secondary">Sem dados de NPS por dia da semana.</Typography>
            </Box>
        );
    }
    
    const dayOrder = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    
    // Ensure NPS is a number and sort data for better visualization
    const chartData = data
        .map(item => ({ ...item, nps: Number(item.nps) || 0 }))
        .sort((a, b) => dayOrder.indexOf(a.dayOfWeek) - dayOrder.indexOf(b.dayOfWeek));

    return (
        <Box sx={{ height: 300 }}>
            <Typography variant="h6" gutterBottom>NPS por Dia da Semana</Typography>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={chartData}
                    margin={{
                        top: 5,
                        right: 30,
                        left: -10,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis dataKey="dayOfWeek" type="category" tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} />
                    <YAxis type="number" domain={[-100, 100]} tick={{ fill: theme.palette.text.secondary }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="nps" name="NPS">
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.nps >= 0 ? theme.palette.primary.main : theme.palette.error.main} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </Box>
    );
};

export default NpsByDayOfWeekChart;