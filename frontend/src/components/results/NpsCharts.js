import React from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import NpsTrendChart from './NpsTrendChart';
import CriteriaBarChart from './CriteriaBarChart';
import NpsByDayOfWeekChart from './NpsByDayOfWeekChart';

const NpsCharts = ({ npsTrend, criteriaScores, npsByDayOfWeek }) => {
    const hasNpsTrendData = npsTrend && npsTrend.length > 0;
    const hasCriteriaData = criteriaScores && criteriaScores.length > 0;
    const hasDayOfWeekData = npsByDayOfWeek && npsByDayOfWeek.length > 0;

    if (!hasNpsTrendData && !hasCriteriaData && !hasDayOfWeekData) {
        return (
            <Paper sx={{ p: 3, textAlign: 'center', borderRadius: '16px', boxShadow: '0 4px 12px 0 rgba(0,0,0,0.05)' }}>
                <Typography variant="h6">Análise de NPS</Typography>
                <Typography color="text.secondary" sx={{ mt: 2 }}>
                    Não há dados suficientes para exibir a análise de NPS.
                </Typography>
            </Paper>
        );
    }

    return (
        <Paper sx={{ p: 3, borderRadius: '16px', boxShadow: '0 4px 12px 0 rgba(0,0,0,0.05)' }}>
            <Typography variant="h6" gutterBottom>Análise de NPS</Typography>
            <Grid container spacing={3}>
                {hasNpsTrendData && (
                    <Grid item xs={12}>
                        <NpsTrendChart data={npsTrend} />
                    </Grid>
                )}
                {hasCriteriaData && (
                    <Grid item xs={12} md={6}>
                        <CriteriaBarChart data={criteriaScores} />
                    </Grid>
                )}
                {hasDayOfWeekData && (
                    <Grid item xs={12} md={6}>
                        <NpsByDayOfWeekChart data={npsByDayOfWeek} />
                    </Grid>
                )}
            </Grid>
        </Paper>
    );
};

export default NpsCharts;