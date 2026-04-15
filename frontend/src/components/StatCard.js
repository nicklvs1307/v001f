import React from 'react';
import { Card, CardContent, Typography, Box, useTheme } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

const StatCard = ({ title, value, icon, color, trend, trendUp }) => {
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
        height: '100%',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: `0 10px 20px -10px ${color || theme.palette.primary.main}`,
        },
      }}
    >
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600, fontSize: '0.75rem', letterSpacing: 0.5 }}>
          {title}
        </Typography>
        <Typography variant="h4" component="div" fontWeight="bold" sx={{ color: color || theme.palette.text.primary, mt: 1 }}>
          {value}
        </Typography>
        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 0.5 }}>
            {trendUp ? (
              <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} />
            ) : (
              <TrendingDown sx={{ fontSize: 16, color: 'error.main' }} />
            )}
            <Typography variant="caption" sx={{ color: trendUp ? 'success.main' : 'error.main', fontWeight: 600 }}>
              {trend}
            </Typography>
          </Box>
        )}
      </Box>
      <Box
        sx={{
          p: 2,
          borderRadius: '50%',
          backgroundColor: color ? `${color}15` : theme.palette.action.hover,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: 56,
          minHeight: 56,
        }}
      >
        {icon}
      </Box>
    </Card>
  );
};

export default StatCard;
