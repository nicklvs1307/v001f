import React from 'react';
import { Grid, Paper, Typography, useTheme, Box } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Wc, Cake } from '@mui/icons-material';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <Paper elevation={3} sx={{ p: 2 }}>
                <Typography variant="body2">{`${label}: ${payload[0].value}`}</Typography>
            </Paper>
        );
    }
    return null;
};

const Demographics = ({ ageDistribution, genderDistribution }) => {
    const theme = useTheme();

    const ageData = ageDistribution ? Object.entries(ageDistribution).map(([ageGroup, count]) => ({ ageGroup, count: Number(count) || 0 })) : [];
    const genderData = genderDistribution ? Object.entries(genderDistribution).map(([name, value]) => ({ name, value: Number(value) || 0 })) : [];
    
    const hasAgeData = ageData.some(d => d.count > 0);
    const hasGenderData = genderData.some(d => d.value > 0);

    return (
        <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, borderRadius: '16px', boxShadow: '0 8px 32px 0 rgba(0,0,0,0.1)', height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Cake sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                            Distribuição por Idade
                        </Typography>
                    </Box>
                    {hasAgeData ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={ageData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#eee"/>
                                <XAxis type="number" tick={{ fill: theme.palette.text.secondary }} />
                                <YAxis dataKey="ageGroup" type="category" tick={{ fill: theme.palette.text.secondary }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="count" name="Pessoas" fill={theme.palette.info.main} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <Typography color="text.secondary">Não há dados de idade.</Typography>
                        </Box>
                    )}
                </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2, borderRadius: '16px', boxShadow: '0 8px 32px 0 rgba(0,0,0,0.1)', height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Wc sx={{ mr: 1, color: 'secondary.main' }} />
                        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                            Distribuição por Gênero
                        </Typography>
                    </Box>
                    {hasGenderData ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={genderData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                >
                                    {genderData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={theme.palette.gender[entry.name.toLowerCase()] || theme.palette.grey[500]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <Typography color="text.secondary">Não há dados de gênero.</Typography>
                        </Box>
                    )}
                </Paper>
            </Grid>
        </Grid>
    );
};

export default Demographics;