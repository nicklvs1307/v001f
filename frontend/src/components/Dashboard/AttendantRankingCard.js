import React from 'react';
import { Paper, Typography, Icon } from '@mui/material';

const AttendantRankingCard = ({ attendant, rank, icon, color, metric, unit }) => (
  <Paper elevation={3} sx={{ p: 2, textAlign: 'center', height: '100%', borderBottom: `4px solid ${color}` }}>
    <Icon component={icon} sx={{ fontSize: 40, color: color }} />
    <Typography variant="h6" fontWeight="bold">{rank}° Lugar</Typography>
    <Typography variant="body1">{attendant.name}</Typography>
    <Typography variant="h5" color="text.primary" fontWeight="medium">
      {metric.toFixed(0)} <Typography component="span" variant="caption">{unit}</Typography>
    </Typography>
  </Paper>
);

export default AttendantRankingCard;
