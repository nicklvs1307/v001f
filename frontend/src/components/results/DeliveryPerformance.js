import React from 'react';
import { Card, CardContent, Typography, Grid, Box } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#EA1D2C'];

const DeliveryPerformance = ({ data }) => {
    if (!data || !data.totalOrders) {
        return null;
    }

    const { totalOrders, byPlatform, surveyStatus } = data;

    // Preparar dados para o gráfico de status
    const statusData = Object.keys(surveyStatus).map(status => ({
        name: status,
        count: surveyStatus[status]
    }));

    return (
        <Card sx={{ height: '100%', borderRadius: '16px', boxShadow: 3 }}>
            <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                    Performance de Delivery & Automação
                </Typography>

                <Grid container spacing={3}>
                    {/* KPIs */}
                    <Grid item xs={12} md={4}>
                        <Box sx={{ mb: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 2, textAlign: 'center' }}>
                            <Typography variant="subtitle2" color="text.secondary">Total de Pedidos</Typography>
                            <Typography variant="h4" color="primary">{totalOrders}</Typography>
                        </Box>
                        <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 2, textAlign: 'center' }}>
                            <Typography variant="subtitle2" color="text.secondary">Pesquisas Enviadas</Typography>
                            <Typography variant="h4" color="success.main">{surveyStatus['SENT'] || 0}</Typography>
                        </Box>
                    </Grid>

                    {/* Gráfico por Plataforma */}
                    <Grid item xs={12} md={4} sx={{ height: 200 }}>
                        <Typography variant="subtitle2" align="center">Pedidos por Plataforma</Typography>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={byPlatform}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={40}
                                    outerRadius={70}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {byPlatform.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </Grid>

                    {/* Gráfico de Status de Envio */}
                    <Grid item xs={12} md={4} sx={{ height: 200 }}>
                        <Typography variant="subtitle2" align="center">Status de Envio</Typography>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={statusData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" tick={{fontSize: 10}} />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="count" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};

export default DeliveryPerformance;
