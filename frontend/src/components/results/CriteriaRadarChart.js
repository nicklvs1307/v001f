import React from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Box, Typography, useTheme } from '@mui/material';

const CriteriaRadarChart = ({ data }) => {
    const theme = useTheme();

    if (!data || data.length === 0) {
        return null; // The parent component will handle the "no data" message for the section
    }
    
    const chartData = data
        .filter(item => item.criterion !== 'Recomendação')
        .map(item => ({
            subject: item.criterion,
            NPS: typeof item.npsScore === 'number' ? item.npsScore : 0,
            fullMark: 100,
        }));

    return (
        <Box sx={{ height: 400 }}>
            <Typography variant="subtitle1" gutterBottom>NPS por Critério</Typography>
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={30} domain={[-100, 100]} />
                    <Radar name="NPS" dataKey="NPS" stroke={theme.palette.primary.main} fill={theme.palette.primary.main} fillOpacity={0.6} />
                    <Tooltip />
                    <Legend />
                </RadarChart>
            </ResponsiveContainer>
        </Box>
    );
};

export default CriteriaRadarChart;
