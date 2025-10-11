import React from 'react';
import { Grid, Card, CardContent, Typography, Box } from '@mui/material';
import { ArrowUpward, ArrowDownward, TrendingFlat } from '@mui/icons-material';

const MetricCard = ({ title, value, change, positive }) => {
    const ChangeIcon = change > 0 ? ArrowUpward : (change < 0 ? ArrowDownward : TrendingFlat);
    const changeColor = change > 0 ? 'success.main' : (change < 0 ? 'error.main' : 'text.secondary');

    return (
        <Card sx={{ height: '100%' }}>
            <CardContent>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                    {title}
                </Typography>
                <Typography variant="h4" component="div" fontWeight="bold">
                    {value}
                </Typography>
                {change !== undefined && (
                    <Box sx={{ display: 'flex', alignItems: 'center', color: changeColor }}>
                        <ChangeIcon sx={{ fontSize: '1rem', mr: 0.5 }} />
                        <Typography variant="body2" component="span">
                            {change}%
                        </Typography>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

const KeyMetrics = ({ data }) => {
    if (!data) {
        return null;
    }

    return (
        <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
                <MetricCard title="NPS Geral" value={data.npsScore} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <MetricCard title="Total de Respostas" value={data.totalResponses} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <MetricCard title="Promotores" value={data.promoters} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <MetricCard title="Neutros" value={data.neutrals} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <MetricCard title="Detratores" value={data.detractors} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <MetricCard title="Cadastros" value={data.registrations} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <MetricCard title="Cupons Gerados" value={data.couponsGenerated} />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <MetricCard title="Cupons Utilizados" value={data.couponsUsed} />
            </Grid>
        </Grid>
    );
};

export default KeyMetrics;
