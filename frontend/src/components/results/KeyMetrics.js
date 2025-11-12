import React from 'react';
import { Grid, Card, CardContent, Typography, Box } from '@mui/material';
import { ArrowUpward, ArrowDownward } from '@mui/icons-material';

const KeyMetrics = ({ metrics = [] }) => {
    return (
        <Grid container spacing={3} sx={{ mb: 3 }}>
            {metrics.map((metric, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card sx={{ 
                        height: '100%', 
                        borderRadius: '16px', 
                        boxShadow: '0 4px 20px 0 rgba(0,0,0,0.1)',
                        transition: 'transform 0.3s ease-in-out',
                        '&:hover': {
                            transform: 'translateY(-5px)'
                        }
                    }}>
                        <CardContent>
                            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                                {metric.title}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography variant="h4" component="span" sx={{ fontWeight: 'bold' }}>
                                    {metric.value}
                                </Typography>
                                {metric.change && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', ml: 1, color: metric.change > 0 ? 'success.main' : 'error.main' }}>
                                        {metric.change > 0 ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />}
                                        <Typography variant="body2" component="span">
                                            {Math.abs(metric.change)}%
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
};

export default KeyMetrics;