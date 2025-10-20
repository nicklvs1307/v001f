import React from 'react';
import { Grid, Paper, Typography } from '@mui/material';
import NpsTrendChart from './NpsTrendChart';
import CriteriaRadarChart from './CriteriaRadarChart';
import NpsByDayOfWeekChart from './NpsByDayOfWeekChart';

const NpsCharts = ({ npsTrend, criteriaScores, npsByDayOfWeek }) => {
    return (
        <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Análise de NPS</Typography>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <NpsTrendChart data={npsTrend} />
                </Grid>
                <Grid item xs={12} md={6}>
                    <CriteriaRadarChart data={criteriaScores} />
                </Grid>
                <Grid item xs={12} md={6}>
                    <NpsByDayOfWeekChart data={npsByDayOfWeek} />
                </Grid>
            </Grid>
        </Paper>
    );
};

export default NpsCharts;