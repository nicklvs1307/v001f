import React, { useState, useEffect } from 'react';
import { Typography, Paper, Box, Grid, CircularProgress, TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import resultService from '../../services/resultService';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const RelatorioSemanal = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        const fetchWeeklyReport = async () => {
            if (!user || !user.tenantId || !selectedDate) return;

            setLoading(true);
            try {
                const start = startOfWeek(selectedDate, { weekStartsOn: 0 }); // Domingo como início da semana
                const end = endOfWeek(selectedDate, { weekStartsOn: 0 });

                const formattedStartDate = format(start, 'yyyy-MM-dd');
                const formattedEndDate = format(end, 'yyyy-MM-dd');

                const data = await resultService.getMainDashboard({
                    tenantId: user.tenantId,
                    startDate: formattedStartDate,
                    endDate: formattedEndDate,
                });
                setReportData(data);
            } catch (error) {
                console.error("Erro ao buscar relatório semanal:", error);
                setReportData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchWeeklyReport();
    }, [selectedDate, user]);

    const npsData = reportData?.nps ? [
        { name: 'Promotores', value: reportData.nps.promoters },
        { name: 'Neutros', value: reportData.nps.passives },
        { name: 'Detratores', value: reportData.nps.detractors },
    ] : [];

    return (
        <Paper sx={{ p: 2 }}>
            <Typography variant="h4" gutterBottom>Relatório Semanal</Typography>
            <Box mb={3}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                        label="Selecione uma data na semana"
                        value={selectedDate}
                        onChange={(newValue) => setSelectedDate(newValue)}
                        renderInput={(params) => <TextField {...params} />}
                    />
                </LocalizationProvider>
            </Box>

            {loading ? (
                <CircularProgress />
            ) : reportData ? (
                <Grid container spacing={3}>
                    {/* NPS Geral */}
                    <Grid item xs={12} md={6}>
                        <Paper elevation={1} sx={{ p: 2 }}>
                            <Typography variant="h6" align="center">NPS da Semana</Typography>
                            <Typography variant="h3" align="center">{reportData.nps?.score || 'N/A'}</Typography>
                            <ResponsiveContainer width="100%" height={200}>
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

                    {/* Total de Respostas */}
                    <Grid item xs={12} md={6}>
                        <Paper elevation={1} sx={{ p: 2 }}>
                            <Typography variant="h6" align="center">Total de Respostas</Typography>
                            <Typography variant="h3" align="center">{reportData.totalResponses || 'N/A'}</Typography>
                        </Paper>
                    </Grid>

                    {/* Satisfação por Critério */}
                    {reportData.criteria && reportData.criteria.map((criterion, index) => (
                        <Grid item xs={12} md={6} key={index}>
                            <Paper elevation={1} sx={{ p: 2 }}>
                                <Typography variant="h6" align="center">Satisfação - {criterion.name}</Typography>
                                <ResponsiveContainer width="100%" height={200}>
                                    <PieChart>
                                        <Pie
                                            data={[
                                                { name: 'Promotores', value: criterion.satisfaction.promoters },
                                                { name: 'Neutros', value: criterion.satisfaction.passives },
                                                { name: 'Detratores', value: criterion.satisfaction.detractors },
                                            ]}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {[
                                                { name: 'Promotores', value: criterion.satisfaction.promoters },
                                                { name: 'Neutros', value: criterion.satisfaction.passives },
                                                { name: 'Detratores', value: criterion.satisfaction.detractors },
                                            ].map((entry, idx) => (
                                                <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Paper>
                        </Grid>
                    ))}

                    {/* Adicionar mais seções conforme a disponibilidade de dados do backend */}
                </Grid>
            ) : (
                <Typography>Nenhum dado disponível para a semana selecionada.</Typography>
            )}
        </Paper>
    );
};

export default RelatorioSemanal;
