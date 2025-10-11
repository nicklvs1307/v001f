import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Paper, Typography, useTheme } from '@mui/material';

const NpsByDayOfWeekChart = ({ data }) => {
    const theme = useTheme();

    if (!data || data.length === 0) {
        return (
            <Paper sx={{ p: 2, height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography>Nenhum dado de NPS por dia da semana disponível.</Typography>
            </Paper>
        );
    }

    return (
        <Paper sx={{ p: 2, height: 300 }}>
            <Typography variant="h6" gutterBottom>NPS por Dia da Semana</Typography>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data.map(item => ({ ...item, nps: Number(item.nps) || 0 }))}
                    margin={{
                        top: 5,
                        right: 30,
                        left: -10,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis domain={[-100, 100]} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="nps" name="NPS" fill={theme.palette.primary.main} />
                </BarChart>
            </ResponsiveContainer>
        </Paper>
    );
};

export default NpsByDayOfWeekChart;