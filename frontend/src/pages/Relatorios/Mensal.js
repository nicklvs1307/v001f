import React, { useState, useEffect } from 'react';
import { Typography, Paper, Box, Grid, CircularProgress, TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import resultService from '../../services/resultService';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Dashboard from '../../components/relatorios/Dashboard';



const RelatorioMensal = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        const fetchMonthlyReport = async () => {
            if (!user || !user.tenantId || !selectedDate) return;

            setLoading(true);
            try {
                const start = startOfMonth(selectedDate);
                const end = endOfMonth(selectedDate);

                const formattedStartDate = format(start, 'yyyy-MM-dd');
                const formattedEndDate = format(end, 'yyyy-MM-dd');

                const data = await resultService.getMainDashboard({
                    tenantId: user.tenantId,
                    startDate: formattedStartDate,
                    endDate: formattedEndDate,
                });
                setReportData(data);
            } catch (error) {
                console.error("Erro ao buscar relatório mensal:", error);
                setReportData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchMonthlyReport();
    }, [selectedDate, user]);



    return (
        <Paper sx={{ p: 2 }}>
            <Typography variant="h4" gutterBottom>Relatório Mensal</Typography>
            <Box mb={3}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                        label="Selecione o Mês"
                        views={['month', 'year']}
                        value={selectedDate}
                        onChange={(newValue) => setSelectedDate(newValue)}
                        renderInput={(params) => <TextField {...params} />}
                    />
                </LocalizationProvider>
            </Box>

            {loading ? (
                <CircularProgress />
            ) : (
                <Dashboard data={reportData} />
            )}
        </Paper>
    );
};

export default RelatorioMensal;
