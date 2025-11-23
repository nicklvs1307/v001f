import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Box, Typography, Paper, useTheme } from '@mui/material';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <Paper elevation={3} sx={{ p: 2 }}>
                <Typography variant="body2">{`Período: ${label}`}</Typography>
                <Typography variant="body2" sx={{ color: payload[0].color }}>
                    {`${payload[0].name}: ${payload[0].value}`}
                </Typography>
            </Paper>
        );
    }
    return null;
};

const NpsTrendChart = ({ data }) => {
    const theme = useTheme();

    if (!data || data.length === 0) {
        return (
            <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="text.secondary">Sem dados para a tendência de NPS.</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ height: 300 }}>
            <Typography variant="h6" gutterBottom>Evolução do NPS</Typography>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{
                        top: 5,
                        right: 30,
                        left: -10,
                        bottom: 5,
                    }}
                >
                    <defs>
                        <linearGradient id="colorNps" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.8}/>
                            <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis dataKey="period" tick={{ fill: theme.palette.text.secondary }} />
                    <YAxis domain={[-100, 100]} tick={{ fill: theme.palette.text.secondary }}/>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area type="monotone" dataKey="nps" name="NPS" stroke={theme.palette.primary.main} fillOpacity={1} fill="url(#colorNps)" strokeWidth={2} />
                </AreaChart>
            </ResponsiveContainer>
        </Box>
    );
};

export default NpsTrendChart;
