import React, { useEffect, useState } from 'react';
import { Typography, Box, Paper, Grid, CircularProgress } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import resultService from '../../services/resultService';
import { useAuth } from '../../context/AuthContext';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const SatisfacaoPage = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await resultService.getMainDashboard({ tenantId: user.tenantId });
                setData(response);
            } catch (error) {
                console.error("Error fetching data", error);
            } finally {
                setLoading(false);
            }
        };

        if (user && user.tenantId) {
            fetchData();
        }
    }, [user]);

    if (loading) {
        return <CircularProgress />;
    }

    if (!data) {
        return <Typography>Não foi possível carregar os dados.</Typography>;
    }

    const npsData = [
        { name: 'Promotores', value: data.nps.promoters },
        { name: 'Neutros', value: data.nps.passives },
        { name: 'Detratores', value: data.nps.detractors },
    ];

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Painel de Satisfação
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ p: 2 }}>
                        <Typography variant="h6" align="center">NPS Geral</Typography>
                        <Typography variant="h2" align="center">{data.nps.score}</Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={npsData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {npsData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default SatisfacaoPage;