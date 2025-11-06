import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

const StatCard = ({ title, value, icon }) => {
    return (
        <Card sx={{ display: 'flex', alignItems: 'center', p: 2, borderRadius: '16px', boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)' }}>
            <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h6" color="text.secondary">{title}</Typography>
                <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
                    {value}
                </Typography>
            </Box>
            {icon && (
                <Box sx={{ fontSize: 60, color: 'primary.main' }}>
                    {icon}
                </Box>
            )}
        </Card>
    );
};

export default StatCard;
