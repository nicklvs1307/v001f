import React from 'react';
import { Grid, Paper, Typography, Box, Skeleton } from '@mui/material';
import { 
    TrendingUp, 
    ThumbsUpDown, 
    SentimentVerySatisfied, 
    SentimentNeutral, 
    SentimentVeryDissatisfied, 
    PersonAdd, 
    ConfirmationNumber, 
    CheckCircle 
} from '@mui/icons-material';

const MetricCard = ({ title, value, icon, loading }) => {
    return (
        <Paper 
            elevation={2} 
            sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '100%',
                borderRadius: '16px',
                boxShadow: '0 4px 12px 0 rgba(0,0,0,0.05)'
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Typography variant="subtitle1" color="text.secondary">
                    {title}
                </Typography>
                <Box sx={{ color: 'primary.main' }}>
                    {icon}
                </Box>
            </Box>
            <Box>
                {loading ? (
                    <Skeleton variant="text" width="60%" height={40} />
                ) : (
                    <Typography variant="h4" component="div" fontWeight="bold">
                        {value ?? 0}
                    </Typography>
                )}
            </Box>
        </Paper>
    );
};

const KeyMetrics = ({ data, loading }) => {
    const metrics = [
        { title: "NPS Geral", value: data?.npsScore, icon: <TrendingUp /> },
        { title: "Total de Respostas", value: data?.totalResponses, icon: <ThumbsUpDown /> },
        { title: "Promotores", value: data?.promoters, icon: <SentimentVerySatisfied /> },
        { title: "Neutros", value: data?.neutrals, icon: <SentimentNeutral /> },
        { title: "Detratores", value: data?.detractors, icon: <SentimentVeryDissatisfied /> },
        { title: "Cadastros", value: data?.registrations, icon: <PersonAdd /> },
        { title: "Cupons Gerados", value: data?.couponsGenerated, icon: <ConfirmationNumber /> },
        { title: "Cupons Utilizados", value: data?.couponsUsed, icon: <CheckCircle /> },
    ];

    if (!data && !loading) {
        return null; // Don't render anything if there's no data and it's not loading
    }

    return (
        <Grid container spacing={3}>
            {metrics.map((metric, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                    <MetricCard {...metric} loading={loading} />
                </Grid>
            ))}
        </Grid>
    );
};

export default KeyMetrics;
