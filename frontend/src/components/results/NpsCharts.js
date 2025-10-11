import React from 'react';
import { Grid, Paper, Typography } from '@mui/material';
import NpsTrendChart from './NpsTrendChart';
import CriteriaRadarChart from './CriteriaRadarChart';
import NpsByDayOfWeekChart from './NpsByDayOfWeekChart';

const NpsCharts = ({ npsTrend, npsByCriteria, npsByDayOfWeek, tenantId }) => {
    return (
        <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Análise de NPS</Typography>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <NpsTrendChart tenantId={tenantId} />
                </Grid>
                <Grid item xs={12} md={6}>
                    <CriteriaRadarChart data={npsByCriteria} />
                </Grid>
                <Grid item xs={12} md={6}>
                    <NpsByDayOfWeekChart data={npsByDayOfWeek} />
                </Grid>
            </Grid>
        </Paper>
    );
};

export default NpsCharts;