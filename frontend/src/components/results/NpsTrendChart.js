import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Box, Typography, Paper } from '@mui/material';

const NpsTrendChart = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <Paper sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                <Typography>Não há dados de tendência de NPS para exibir.</Typography>
            </Paper>
        );
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
