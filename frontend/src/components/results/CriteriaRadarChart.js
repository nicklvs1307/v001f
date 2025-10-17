import React from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Box, Typography, useTheme } from '@mui/material';

const CriteriaRadarChart = ({ data }) => {
    const theme = useTheme();

    if (!data || data.length === 0) {
        return <Typography>Não há dados de NPS por critério para exibir.</Typography>;
    }
    
    // Transforma os dados para o formato do gráfico de radar, usando o NPS
    const chartData = data.map(item => ({
        subject: item.criterio,
        NPS: item.nps,
        fullMark: 100, // O NPS vai de -100 a 100
    }));

    return (
        <Box sx={{ height: 400 }}>
            <Typography variant="h6" gutterBottom>NPS por Critério</Typography>
            {chartData && chartData.length > 0 ? (
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
            ) : (
                <Alert severity="info">Não há dados de NPS por critério para exibir.</Alert>
            )}
        </Box>
    );
};

export default CriteriaRadarChart;
