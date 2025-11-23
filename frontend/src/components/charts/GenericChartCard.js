import React from 'react';
import { Paper, Typography, Box, CircularProgress } from '@mui/material';

const GenericChartCard = ({ title, subTitle, loading, children }) => {
    return (
        <Paper 
            elevation={2} 
            sx={{ 
                p: 2, 
                display: 'flex', 
                flexDirection: 'column', 
                height: { xs: 300, md: 400 },
                borderRadius: '12px',
            }}
        >
            <Typography variant="subtitle1" color="text.secondary" sx={{ borderBottom: `1px solid #eee`, pb: 1, mb: 1 }}>
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
