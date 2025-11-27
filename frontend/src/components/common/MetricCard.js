import React from 'react';
import { Paper, Box, Typography } from '@mui/material';

const MetricCard = ({ title, value, icon, color }) => (
    <Paper elevation={3} sx={{ p: 2, display: 'flex', alignItems: 'center', height: '100%' }}>
        <Box sx={{ mr: 2, color: color || 'text.secondary' }}>{icon}</Box>
        <Box>
            <Typography variant="h4" component="div" fontWeight="bold">{value}</Typography>
            <Typography variant="body1" color="text.secondary">{title}</Typography>
        </Box>
    </Paper>
);

export default MetricCard;
