import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Box, Typography, useTheme } from '@mui/material';

const CriteriaBarChart = ({ data }) => {
    const theme = useTheme();

    if (!data || data.length === 0) {
        return null;
    }

    // Ordena os dados para melhor visualização
    const chartData = [...data].sort((a, b) => a.npsScore - b.npsScore);

    return (
        <Box sx={{ height: 400 }}>
            <Typography variant="subtitle1" gutterBottom>NPS por Critério</Typography>
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
                    <XAxis type="number" domain={[-100, 100]} />
                    <YAxis dataKey="criterion" type="category" width={80} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="npsScore" name="NPS" fill={theme.palette.primary.main} />
                </BarChart>
            </ResponsiveContainer>
        </Box>
    );
};

export default CriteriaBarChart;
