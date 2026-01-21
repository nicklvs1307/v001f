import React from 'react';
import { Paper, Typography } from '@mui/material';

const GenericMetricCard = ({ title, value, unit = '' }) => (
  <Paper elevation={3} sx={{ p: 2, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
    <Typography variant="subtitle1" color="text.secondary">{title}</Typography>
    <Typography variant="h4" fontWeight="bold">
      {value}
      {unit && <Typography component="span" variant="h6" color="text.secondary" sx={{ ml: 0.5 }}>{unit}</Typography>}
    </Typography>
  </Paper>
);

export default GenericMetricCard;
