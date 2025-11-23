import React from 'react';
import { Grid, Card, CardContent, Typography, Box, useTheme } from '@mui/material';
import {
    ThumbsUpDown,
    SentimentSatisfiedAlt,
    QuestionAnswer,
    PersonAdd,
    ConfirmationNumber,
    LocalActivity,
} from '@mui/icons-material';

const getIcon = (title) => {
    switch (title) {
        case 'NPS Geral':
            return <ThumbsUpDown fontSize="large" />;
        case 'CSAT Geral (%)':
            return <SentimentSatisfiedAlt fontSize="large" />;
        case 'Total de Respostas':
            return <QuestionAnswer fontSize="large" />;
        case 'Total de Cadastros':
            return <PersonAdd fontSize="large" />;
        case 'Cupons Gerados':
            return <ConfirmationNumber fontSize="large" />;
        case 'Cupons Utilizados':
            return <LocalActivity fontSize="large" />;
        default:
            return null;
    }
};

const KeyMetrics = ({ metrics = [] }) => {
    const theme = useTheme();
    const colors = [
        theme.palette.primary.main,
        theme.palette.secondary.main,
        theme.palette.info.main,
        theme.palette.success.main,
        theme.palette.warning.main,
        theme.palette.error.main,
    ];

    return (
        <Grid container spacing={3}>
            {metrics.map((metric, index) => (
                <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
                    <Card sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        height: '100%',
                        borderRadius: '16px',
                        boxShadow: '0 8px 32px 0 rgba(0,0,0,0.1)',
                        transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                        '&:hover': {
                            transform: 'translateY(-8px)',
                            boxShadow: '0 12px 40px -4px rgba(0,0,0,0.2)'
                        }
                    }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Box sx={{
                                color: colors[index % colors.length],
                                mb: 1,
                            }}>
                                {getIcon(metric.title)}
                            </Box>
                            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                                {metric.value}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                                {metric.title}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
};

export default KeyMetrics;