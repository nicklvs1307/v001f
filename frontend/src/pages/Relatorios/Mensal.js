import React, { useState, useEffect, useContext, useCallback } from 'react';
import { 
    Container, 
    Typography, 
    Box, 
    CircularProgress, 
    Alert, 
    Grid,
    Paper,
    TextField
} from '@mui/material';
import { startOfMonth, endOfMonth } from 'date-fns';
import { getStartOfDayUTC, getEndOfDayUTC, getNowInLocalTimezone } from '../../utils/dateUtils';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { ptBR } from 'date-fns/locale';
import dashboardService from '../../services/dashboardService';
import { useAuth } from '../../context/AuthContext';
import Dashboard from '../../components/relatorios/Dashboard';

const RelatorioMensal = () => {
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useAuth();
    const tenantId = user?.tenantId;

    const [selectedDate, setSelectedDate] = useState(getNowInLocalTimezone());

    const fetchResults = useCallback(async () => {
        if (!tenantId) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            setError('');
            const start = startOfMonth(selectedDate);
            const end = endOfMonth(selectedDate);
            const params = { 
                tenantId,
                startDate: getStartOfDayUTC(start),
                endDate: getEndOfDayUTC(end)
            };
            const resultData = await dashboardService.getMainDashboard(params);
            setReportData(resultData);
        } catch (err) {
            setError(err.message || 'Falha ao carregar os resultados.');
        } finally {
            setLoading(false);
        }
    }, [tenantId, selectedDate]);

    useEffect(() => {
        fetchResults();
    }, [fetchResults]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress size={60} />
                <Typography sx={{ ml: 2 }}>Carregando relatório...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
            <Box sx={{ flexGrow: 1, p: 3, backgroundColor: '#f4f6f8' }}>
                <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: '16px' }}>
                    <Grid container spacing={2} justifyContent="space-between" alignItems="center">
                        <Grid item>
                            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                Relatório Mensal
                            </Typography>
                        </Grid>
                        <Grid item sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            <DatePicker
                                label="Selecione o Mês"
                                views={['year', 'month']}
                                value={selectedDate}
                                onChange={(newValue) => setSelectedDate(newValue)}
                                renderInput={(params) => <TextField {...params} helperText={null} />}
                            />
                        </Grid>
                    </Grid>
                </Paper>
                
                <Dashboard data={reportData} />

            </Box>
        </LocalizationProvider>
    );
};

export default RelatorioMensal;
