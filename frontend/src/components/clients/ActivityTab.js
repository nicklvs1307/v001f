import React from 'react';
import { Paper, Grid, Typography, Box } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

const StatCard = ({ title, value, icon }) => (
    <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', height: '100%' }}>
        {icon}
        <Box sx={{ ml: 2 }}>
            <Typography variant="h6">{value}</Typography>
            <Typography variant="body2" color="text.secondary">{title}</Typography>
        </Box>
    </Paper>
);

const ActivityTab = ({ stats }) => {
    const { totalVisits, lastVisit, attendanceData } = stats;

    return (
        <Box sx={{ mt: 3 }}>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                    <StatCard title="Total de Visitas" value={totalVisits} />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <StatCard title="Última Visita" value={lastVisit ? format(new Date(lastVisit), 'dd/MM/yyyy') : 'N/A'} />
                </Grid>
                <Grid item xs={12}>
                    <Paper sx={{ p: 2, mt: 2 }}>
                        <Typography variant="h6" gutterBottom>Comparecimento Mensal</Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={attendanceData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="visits" fill="#4e73df" name="Visitas" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default ActivityTab;
