import React from 'react';
import { Card, CardContent, CardHeader, Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import InsightsIcon from '@mui/icons-material/Insights';

const RadarChartComponent = ({ data }) => {
  const theme = useTheme();

  if (!data || data.length === 0) {
    return null; // Don't render the card if there's no data
  }

  // Recharts Radar chart expects a 'fullMark' for scaling. We can set it to the max possible score (e.g., 10 for NPS, 5 for CSAT).
  // Let's dynamically find the max average rating to set a sensible scale.
  const maxRating = Math.max(...data.map(item => item.averageRating), 5);


  return (
    <Card elevation={3}>
      <CardHeader title="Análise por Critério" subheader="Média de avaliação para cada critério da pesquisa" avatar={<InsightsIcon />} />
      <CardContent>
        <Box sx={{ height: 400, width: '100%' }}>
          <ResponsiveContainer>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
              <PolarGrid />
              <PolarAngleAxis dataKey="name" />
              <PolarRadiusAxis angle={30} domain={[0, maxRating]} />
              <Radar name="Média" dataKey="averageRating" stroke={theme.palette.primary.main} fill={theme.palette.primary.main} fillOpacity={0.6} />
              <Tooltip />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default RadarChartComponent;
