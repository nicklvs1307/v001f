import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Typography, Paper, Box, CircularProgress, TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatDateForDisplay, getStartOfDayUTC, getEndOfDayUTC } from '../../utils/dateUtils';
import { useAuth } from '../../context/AuthContext';
import resultService from '../../services/resultService';
import Dashboard from '../../components/relatorios/Dashboard';

const RelatorioDiario = () => {
    const [selectedDate, setSelectedDate] = useState(new Date()); 
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();
    const tenantId = user?.tenantId;
    const location = useLocation();

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const dateParam = queryParams.get('date');
        if (dateParam) {
            setSelectedDate(new Date(`${dateParam}T00:00:00`));
        }
    }, [location.search]);

    useEffect(() => {
        const fetchDailyReport = async () => {
            if (!tenantId || !selectedDate) return;

            setLoading(true);
            try {
                const startDateUTC = getStartOfDayUTC(selectedDate);
                const endDateUTC = getEndOfDayUTC(selectedDate);
                const data = await resultService.getMainDashboard({
                    tenantId: tenantId,
                    startDate: startDateUTC,
                    endDate: endDateUTC,
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
    }, [selectedDate, tenantId]);

    return (
        <Paper sx={{ p: 3, borderRadius: 4, boxShadow: 3 }}>
            <Typography variant="h4" gutterBottom>Relatório Diário</Typography>
            <Box mb={3}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                    <DatePicker
                        label="Selecione a Data"
                        value={selectedDate}
                        onChange={(newValue) => setSelectedDate(newValue)}
                        inputFormat="dd/MM/yyyy"
                        renderInput={(params) => <TextField {...params} />}
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

export default RelatorioDiario;