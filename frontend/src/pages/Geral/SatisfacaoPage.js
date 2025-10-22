import React, { useEffect, useState } from 'react';
import { Typography, Box, Paper, Grid, CircularProgress } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import resultService from '../../services/resultService';
import { useAuth } from '../../context/AuthContext';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
const NPS_COLORS = ['#4CAF50', '#FFC107', '#F44336']; // Promoters, Neutrals, Detractors
const CSAT_COLORS = ['#4CAF50', '#FFC107', '#F44336']; // Satisfied, Neutral, Unsatisfied

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

    const npsData = data.nps ? [
        { name: 'Promotores', value: data.nps.promoters },
        { name: 'Neutros', value: data.nps.passives },
        { name: 'Detratores', value: data.nps.detractors },
    ] : [];

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Painel de Satisfação
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ p: 2 }}>
                        <Typography variant="h6" align="center">NPS Geral</Typography>
                        <Typography variant="h2" align="center">{data.nps?.score || 0}</Typography>
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
                                        <Cell key={`cell-${index}`} fill={NPS_COLORS[index % NPS_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {data.criteriaScores && data.criteriaScores.map((criterion, index) => (
                    <Grid item xs={12} md={6} key={index}>
                        <Paper elevation={3} sx={{ p: 2 }}>
                            <Typography variant="h6" align="center">{criterion.criterion}</Typography>
                            {criterion.scoreType === 'NPS' && (
                                <>
                                    <Typography variant="h2" align="center">{criterion.score || 0}</Typography>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={[
                                                    { name: 'Promotores', value: criterion.promoters },
                                                    { name: 'Neutros', value: criterion.neutrals },
                                                    { name: 'Detratores', value: criterion.detractors },
                                                ]}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {[
                                                    { name: 'Promotores', value: criterion.promoters },
                                                    { name: 'Neutros', value: criterion.neutrals },
                                                    { name: 'Detratores', value: criterion.detractors },
                                                ].map((entry, idx) => (
                                                    <Cell key={`cell-${idx}`} fill={NPS_COLORS[idx % NPS_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </>
                            )}
                            {criterion.scoreType === 'CSAT' && (
                                <>
                                    <Typography variant="h2" align="center">{criterion.satisfactionRate || 0}%</Typography>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={[
                                                    { name: 'Satisfeitos', value: criterion.satisfied },
                                                    { name: 'Neutros', value: criterion.neutral },
                                                    { name: 'Insatisfeitos', value: criterion.unsatisfied },
                                                ]}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {[
                                                    { name: 'Satisfeitos', value: criterion.satisfied },
                                                    { name: 'Neutros', value: criterion.neutral },
                                                    { name: 'Insatisfeitos', value: criterion.unsatisfied },
                                                ].map((entry, idx) => (
                                                    <Cell key={`cell-${idx}`} fill={CSAT_COLORS[idx % CSAT_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </>
                            )}
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default SatisfacaoPage;