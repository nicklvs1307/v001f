import React from 'react';
import { Grid, Paper, Typography, useTheme, Box } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { PeopleAlt } from '@mui/icons-material';

const Demographics = ({ ageDistribution, genderDistribution }) => {
    const theme = useTheme();

    const ageData = ageDistribution ? Object.entries(ageDistribution).map(([ageGroup, count]) => ({ ageGroup, count: Number(count) || 0 })) : [];
    const genderData = genderDistribution ? Object.entries(genderDistribution).map(([name, value]) => ({ name, value: Number(value) || 0 })) : [];
    
    const hasAgeData = ageData.some(d => d.count > 0);
    const hasGenderData = genderData.some(d => d.value > 0);

    if (!hasAgeData && !hasGenderData) {
        return (
            <Paper sx={{ p: 3, textAlign: 'center', borderRadius: '16px', boxShadow: '0 4px 12px 0 rgba(0,0,0,0.05)', height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: 'center' }}>
                    <PeopleAlt sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6" gutterBottom component="div" sx={{ fontWeight: 'bold' }}>
                        Demografia
                    </Typography>
                </Box>
                <Typography color="text.secondary" sx={{ mt: 2 }}>
                    Não há dados demográficos para exibir.
                </Typography>
            </Paper>
        );
    }

    return (
        <Paper sx={{ p: 3, borderRadius: '16px', boxShadow: '0 4px 12px 0 rgba(0,0,0,0.05)', height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PeopleAlt sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" gutterBottom component="div" sx={{ fontWeight: 'bold' }}>
                    Demografia
                </Typography>
            </Box>
            <Grid container spacing={3}>
                {hasAgeData && (
                    <Grid item xs={12} md={hasGenderData ? 6 : 12}>
                        <Typography variant="subtitle1" gutterBottom align="center">Distribuição por Idade</Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={ageData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="ageGroup" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="count" fill={theme.palette.info.main} name="Pessoas" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Grid>
                )}
                {hasGenderData && (
                    <Grid item xs={12} md={hasAgeData ? 6 : 12}>
                        <Typography variant="subtitle1" gutterBottom align="center">Distribuição por Gênero</Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={genderData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                >
                                    {genderData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={theme.palette.gender[entry.name.toLowerCase()] || theme.palette.grey[500]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </Grid>
                )}
            </Grid>
        </Paper>
    );
};

export default Demographics;