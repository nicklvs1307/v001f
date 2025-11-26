import React, { useEffect, useState, useContext, useCallback } from 'react';
import { Typography, Box, Grid, Card, CardContent, Paper, TextField } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { subDays } from 'date-fns';
import PageLayout from '../../components/layout/PageLayout';
import dashboardService from '../../services/dashboardService';
import AuthContext from '../../context/AuthContext';
import { getStartOfDayUTC, getEndOfDayUTC } from '../../utils/dateUtils';

const PainelPage = () => {
    const { user } = useContext(AuthContext);
    const [summary, setSummary] = useState({ total: 0, promoters: 0, neutrals: 0, detractors: 0 });
    const [dailyData, setDailyData] = useState([]);
    const [weeklyData, setWeeklyData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState(subDays(new Date(), 30));
    const [endDate, setEndDate] = useState(new Date());

    const fetchData = useCallback(async () => {
        if (!user?.tenantId) return;
        try {
            setLoading(true);
            const params = { 
                tenantId: user.tenantId,
                startDate: getStartOfDayUTC(startDate),
                endDate: getEndOfDayUTC(endDate),
            };
            
            const [summaryData, dailyChartData, weeklyChartData] = await Promise.all([
                dashboardService.getSummary(params),
                dashboardService.getResponseChart(params),
                dashboardService.getWeeklyReport(params)
            ]);

            setSummary(summaryData);
            setDailyData(dailyChartData);

            const adaptedWeeklyData = weeklyChartData.days.map(day => ({
                day: day.dayOfWeek.substring(0, 3),
                value: day.count
            }));
            setWeeklyData(adaptedWeeklyData);

        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
        } finally {
            setLoading(false);
        }
    }, [user, startDate, endDate]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const StatCard = ({ title, value, color }) => (
        <Card sx={{ backgroundColor: color, color: 'white' }}>
            <CardContent>
                <Typography variant="h5" component="div">
                    {value}
                </Typography>
                <Typography variant="body2">
                    {title}
                </Typography>
            </CardContent>
        </Card>
    );

    return (
        <PageLayout 
            title="Painel de Respostas"
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
        >
            {loading ? (
                <Typography>Carregando...</Typography>
            ) : (
                <Grid container spacing={3}>
                    {/* Stat Cards */}
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard title="Total de Respostas" value={summary.totalResponses} color="primary.main" />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard title="Promotores" value={summary.promoters} color="success.main" />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard title="Neutros" value={summary.neutrals} color="warning.main" />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard title="Detratores" value={summary.detractors} color="error.main" />
                    </Grid>

                    {/* Daily Chart */}
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 2, height: 300 }}>
                            <Typography variant="h6" gutterBottom>
                                Respostas ao Longo do Dia
                            </Typography>
                            <ResponsiveContainer>
                                <BarChart data={dailyData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="hour" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="count" fill="#8884d8" name="Respostas" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Paper>
                    </Grid>

                    {/* Weekly Chart */}
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 2, height: 300 }}>
                            <Typography variant="h6" gutterBottom>
                                Respostas por Dia da Semana
                            </Typography>
                            <ResponsiveContainer>
                                <BarChart data={weeklyData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="day" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="value" fill="#82ca9d" name="Respostas" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Paper>
                    </Grid>
                </Grid>
            )}
        </PageLayout>
    );
};

export default PainelPage;