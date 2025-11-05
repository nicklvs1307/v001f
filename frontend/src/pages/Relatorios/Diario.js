import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom'; // Import useLocation
import { Typography, Paper, Box, Grid, CircularProgress, TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import resultService from '../../services/resultService';
import Dashboard from '../../components/relatorios/Dashboard';

const RelatorioDiario = () => {
    // Set initial date to null, so we can see if it comes from URL
    const [selectedDate, setSelectedDate] = useState(new Date()); 
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();
    const location = useLocation();

    // This effect runs only once on component mount to set the initial date.
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const dateParam = queryParams.get('date');
        if (dateParam) {
            // Add T00:00:00 to prevent timezone issues where it might become the previous day
            setSelectedDate(new Date(`${dateParam}T00:00:00`));
        }
    }, [location.search]); // Depend on location.search

    // This effect runs whenever selectedDate or user changes.
    useEffect(() => {
        const fetchDailyReport = async () => {
            // Ensure we don't run the fetch if the date hasn't been set yet
            if (!user || !user.tenantId || !selectedDate) return;

            console.log('Fetching report for date:', selectedDate);
            setLoading(true);
            try {
                const formattedDate = format(selectedDate, 'yyyy-MM-dd');
                const data = await resultService.getMainDashboard({
                    tenantId: user.tenantId,
                    startDate: formattedDate,
                    endDate: formattedDate,
                });
                console.log('Report data from API:', data);
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