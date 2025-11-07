import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Box, Typography } from '@mui/material';

const NpsTrendChart = ({ data }) => {
    if (!data || data.length === 0) {
        return null; // The parent component will handle the "no data" message for the section
    }

    return (
        <Box sx={{ height: 300 }}>
            <Typography variant="subtitle1" gutterBottom>Evolução do NPS (Diário)</Typography>
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
