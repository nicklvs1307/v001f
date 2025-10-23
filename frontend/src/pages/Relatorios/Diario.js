import React, { useState, useEffect } from 'react';
import { Typography, Paper, Box, Grid, CircularProgress, TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import resultService from '../../services/resultService';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Dashboard from '../../components/relatorios/Dashboard';



const RelatorioDiario = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        const fetchDailyReport = async () => {
            if (!user || !user.tenantId || !selectedDate) return;

            setLoading(true);
            try {
                const formattedDate = format(selectedDate, 'yyyy-MM-dd');
                const data = await resultService.getMainDashboard({
                    tenantId: user.tenantId,
                    startDate: formattedDate,
                    endDate: formattedDate,
                });
                setReportData(data);
            } catch (error) {
                console.error("Erro ao buscar relatório diário:", error);
                setReportData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchDailyReport();
    }, [selectedDate, user]);



    return (
        <Paper sx={{ p: 2 }}>
            <Typography variant="h4" gutterBottom>Relatório Diário</Typography>
            <Box mb={3}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                        label="Selecione a Data"
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

export default RelatorioDiario;
