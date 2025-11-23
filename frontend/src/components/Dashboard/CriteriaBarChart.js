import React from 'react';
import { Paper, Typography, useTheme } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CriteriaBarChart = ({ data }) => {
    const theme = useTheme();

    // Transform data for stacked bar chart
    const chartData = data.map(item => ({
        name: item.criterion,
        Promotores: item.promoters,
        Neutros: item.neutrals,
        Detratores: item.detractors,
    }));

    return (
        <Paper elevation={2} sx={{ p: 2, height: { xs: 300, md: 400 }, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="subtitle1" color="text.secondary" sx={{ borderBottom: `1px solid ${theme.palette.divider}`, pb: 1, mb: 2 }}>
                Scores por Critério
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    layout="vertical"
                    data={chartData}
                    margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Promotores" stackId="a" fill={theme.palette.success.main} />
                    <Bar dataKey="Neutros" stackId="a" fill={theme.palette.warning.main} />
                    <Bar dataKey="Detratores" stackId="a" fill={theme.palette.error.main} />
                </BarChart>
            </ResponsiveContainer>
        </Paper>
    );
};

export default CriteriaBarChart;
