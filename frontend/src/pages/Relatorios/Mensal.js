import React, { useState, useEffect } from 'react';
import { Typography, Paper, Box, CircularProgress, TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '../../context/AuthContext';
import resultService from '../../services/resultService';
import Dashboard from '../../components/relatorios/Dashboard';

const RelatorioMensal = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const { tenantId } = user || {};

    useEffect(() => {
        const fetchMonthlyReport = async () => {
            if (!tenantId || !selectedDate) return;

            setLoading(true);
            try {
                const start = startOfMonth(selectedDate);
                const end = endOfMonth(selectedDate);

                const formattedStartDate = format(start, 'yyyy-MM-dd');
                const formattedEndDate = format(end, 'yyyy-MM-dd');

                const data = await resultService.getMainDashboard({
                    tenantId: tenantId,
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
    }, [selectedDate, tenantId]);

    return (
        <Paper sx={{ p: 3, borderRadius: 4, boxShadow: 3 }}>
            <Typography variant="h4" gutterBottom>Relatório Mensal</Typography>
            <Box mb={3}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                    <DatePicker
                        label="Selecione o Mês"
                        views={['year', 'month']}
                        value={selectedDate}
                        onChange={(newValue) => setSelectedDate(newValue)}
                        renderInput={(params) => <TextField {...params} helperText={null} />}
                    />
                </LocalizationProvider>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Dashboard data={reportData} />
            )}
        </Paper>
    );
};

export default RelatorioMensal;
