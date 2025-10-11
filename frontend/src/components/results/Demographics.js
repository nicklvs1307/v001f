import React from 'react';
import { Grid, Paper, Typography, useTheme } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Demographics = ({ ageDistribution, genderDistribution }) => {
    const theme = useTheme();

    const ageData = ageDistribution ? Object.entries(ageDistribution).map(([ageGroup, count]) => ({ ageGroup, count: Number(count) || 0 })) : [];
    const genderData = genderDistribution ? Object.entries(genderDistribution).map(([name, value]) => ({ name, value: Number(value) || 0 })) : [];
    const totalGender = genderData.reduce((sum, entry) => sum + entry.value, 0);

    return (
        <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Demografia</Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>Distribuição por Idade</Typography>
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
                <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>Distribuição por Gênero</Typography>
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
                                label={({ name, percent }) => totalGender > 0 ? `${name}: ${(percent * 100).toFixed(0)}%` : name}
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
            </Grid>
        </Paper>
    );
};

export default Demographics;