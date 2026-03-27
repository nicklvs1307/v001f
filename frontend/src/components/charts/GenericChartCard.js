import React from 'react';
import { Paper, Typography, Box, CircularProgress } from '@mui/material';

const GenericChartCard = ({ title, subTitle, loading, children }) => {
    return (
        <Paper 
            elevation={0} 
            sx={{ 
                p: 2, 
                display: 'flex', 
                flexDirection: 'column', 
                height: { xs: 300, md: 400 },
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
            }}
        >
            <Typography variant="subtitle1" fontWeight={600} color="text.primary" sx={{ pb: 1, mb: 1 }}>
                {title}
            </Typography>
            {subTitle && (
                <Typography variant="subtitle2" color="text.secondary" mb={2}>
                    {subTitle}
                </Typography>
            )}
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Box sx={{ flexGrow: 1, '& .recharts-responsive-container': { height: '100% !important' } }}>
                    {children}
                </Box>
            )}
        </Paper>
    );
};

export default GenericChartCard;
