import React from 'react';
import { Card, CardContent, Typography, Box, useTheme } from '@mui/material';

const StatCard = ({ title, value, icon, color }) => {
  const theme = useTheme();

  return (
    <Card
      elevation={3}
      sx={{
        display: 'flex',
        alignItems: 'center',
        p: 3,
        borderRadius: 2,
        backgroundColor: 'white',
        transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: `0 10px 20px -10px ${color || theme.palette.primary.main}`,
        },
      }}
    >
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="subtitle1" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 'bold' }}>
          {title}
        </Typography>
        <Typography variant="h3" component="div" fontWeight="bold" sx={{ color: color || theme.palette.text.primary }}>
          {value}
        </Typography>
      </Box>
      <Box
        sx={{
          p: 2,
          borderRadius: '50%',
          backgroundColor: color ? `${color}20` : theme.palette.action.hover,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </Box>
    </Card>
  );
};

export default StatCard;
