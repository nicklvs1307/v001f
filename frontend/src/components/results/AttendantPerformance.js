import React from 'react';
import { Paper, Typography, Box, useTheme } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { Star } from '@mui/icons-material';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <Paper elevation={3} sx={{ p: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>{`Atendente: ${label}`}</Typography>
                <Typography variant="body2" sx={{ color: payload[0].fill }}>
                    {`NPS: ${data.currentNPS}`}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {`Respostas: ${data.responses}`}
                </Typography>
            </Paper>
        );
    }
    return null;
};


const AttendantPerformance = ({ performanceData }) => {
    const theme = useTheme();

    if (!performanceData || performanceData.length === 0) {
        return (
            <Paper sx={{ p: 3, textAlign: 'center', borderRadius: '16px', boxShadow: '0 8px 32px 0 rgba(0,0,0,0.1)', height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: 'center' }}>
                    <Star sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" gutterBottom component="div" sx={{ fontWeight: 'bold' }}>
                        Desempenho dos Atendentes
                    </Typography>
                </Box>
                <Typography color="text.secondary" sx={{ mt: 2 }}>
                    Não há dados de desempenho dos atendentes para exibir.
                </Typography>
            </Paper>
        );
    }

    const chartData = [...performanceData].sort((a, b) => (a.currentNPS || -101) - (b.currentNPS || -101));

    return (
        <Paper sx={{ p: 3, borderRadius: '16px', boxShadow: '0 8px 32px 0 rgba(0,0,0,0.1)', height: '100%', minHeight: 400 }}>
             <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Star sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" gutterBottom component="div" sx={{ fontWeight: 'bold' }}>
                    Desempenho dos Atendentes por NPS
                </Typography>
            </Box>
            <ResponsiveContainer width="100%" height={350}>
                <BarChart
                    layout="vertical"
                    data={chartData}
                    margin={{ top: 5, right: 30, left: 30, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis type="number" domain={[-100, 100]} tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} />
                    <YAxis type="category" dataKey="name" width={120} tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="currentNPS" name="NPS">
                        <LabelList dataKey="responses" position="insideRight" fill="#fff" fontSize={12} formatter={(value) => `${value} resp.`} />
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.currentNPS >= 50 ? theme.palette.success.main : entry.currentNPS >= 0 ? theme.palette.warning.main : theme.palette.error.main} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </Paper>
    );
};

export default AttendantPerformance;