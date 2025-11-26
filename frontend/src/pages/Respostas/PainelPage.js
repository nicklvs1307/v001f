import React, { useEffect, useState, useContext, useCallback } from 'react';
import { Typography, Box, Grid, Paper } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { subDays } from 'date-fns';
import PageLayout from '../../components/layout/PageLayout';
import KeyMetrics from '../../components/results/KeyMetrics';
import dashboardService from '../../services/dashboardService';
import AuthContext from '../../context/AuthContext';
import { getStartOfDayUTC, getEndOfDayUTC } from '../../utils/dateUtils';

const PainelPage = () => {
    const { user } = useContext(AuthContext);
    const [summary, setSummary] = useState({});
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

    const metrics = [
        { title: 'Total de Respostas', value: summary.totalResponses || 0 },
        { title: 'Promotores', value: summary.promoters || 0 },
        { title: 'Neutros', value: summary.neutrals || 0 },
        { title: 'Detratores', value: summary.detractors || 0 },
    ];

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
                    <Grid item xs={12}>
                        <KeyMetrics metrics={metrics} />
                    </Grid>

                    {/* Daily Chart */}
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3, borderRadius: '16px', boxShadow: '0 4px 12px 0 rgba(0,0,0,0.05)', height: 300 }}>
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
                        <Paper sx={{ p: 3, borderRadius: '16px', boxShadow: '0 4px 12px 0 rgba(0,0,0,0.05)', height: 300 }}>
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