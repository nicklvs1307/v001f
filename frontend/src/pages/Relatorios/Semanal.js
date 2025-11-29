import React from 'react';
import { 
    Container, 
    Typography, 
    Box, 
    CircularProgress, 
    Alert, 
    Grid,
    Paper,
    TextField,
    useTheme
} from '@mui/material';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import useReportData from '../../hooks/useReportData';
import RelatorioDashboard from '../../components/relatorios/Dashboard';
import MetricCard from '../../components/common/MetricCard';
import { TrendingUp, BarChart as BarChartIcon, People, Star, CheckCircle } from '@mui/icons-material';

const RelatorioSemanal = () => {
    const theme = useTheme();
    const { reportData, loading, error, selectedDate, handleDateChange } = useReportData('semanal');
    
    const renderWeekDisplay = (date) => {
        if (!date) return '';
        const start = startOfWeek(date, { weekStartsOn: 1 });
        const end = endOfWeek(date, { weekStartsOn: 1 });
        return `${format(start, 'dd/MM')} - ${format(end, 'dd/MM/yyyy')}`;
    };

    if (loading) {
        return (
            <Container sx={{ mt: 8, textAlign: 'center' }}>
                <CircularProgress />
                <Typography>Carregando relatório...</Typography>
            </Container>
        );
    }

    if (error) {
        return (
            <Container sx={{ mt: 8, textAlign: 'center' }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }
    
    if (!reportData) {
        return (
            <Container sx={{ mt: 8, textAlign: 'center' }}>
                <Typography>Nenhum resultado encontrado para esta pesquisa.</Typography>
            </Container>
        );
    }

    const { summary, clientStatusCounts, ...chartData } = reportData;

    return (
            <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
                <Paper elevation={2} sx={{ p: { xs: 2, md: 3 }, mb: 4, backgroundColor: theme.palette.primary.main, color: 'white' }}>
                    <Grid container spacing={2} justifyContent="space-between" alignItems="center">
                        <Grid item>
                            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">Relatório Semanal</Typography>
                            <Typography variant="h6" sx={{ opacity: 0.9 }}>{`Semana de ${renderWeekDisplay(selectedDate)}`}</Typography>
                        </Grid>
                        <Grid item>
                            <DatePicker
                                label="Selecione a Semana"
                                value={selectedDate}
                                onChange={handleDateChange}
                                renderInput={(params) => <TextField {...params} 
                                    value={renderWeekDisplay(selectedDate)} 
                                    sx={{ 
                                        bgcolor: 'white', 
                                        borderRadius: 1,
                                        '& .MuiInputBase-input': { color: 'black' },
                                        '& .MuiSvgIcon-root': { color: 'black' } 
                                }} />}
                            />
                        </Grid>
                    </Grid>
                </Paper>

                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <MetricCard title="NPS na Semana" value={summary?.nps?.score?.toFixed(1) ?? 0} icon={<TrendingUp fontSize="large" />} color={theme.palette.primary.dark} />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <MetricCard title="CSAT na Semana" value={`${summary?.csat?.satisfactionRate?.toFixed(1) ?? '0.0'}%`} icon={<Star fontSize="large" />} color={theme.palette.secondary.main} />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <MetricCard title="Total de Respostas" value={summary?.totalResponses ?? 0} icon={<BarChartIcon fontSize="large" />} />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <MetricCard title="Respostas com Cadastro" value={clientStatusCounts?.withClient ?? 0} icon={<CheckCircle fontSize="large" />} />
                    </Grid>
                </Grid>
                
                <RelatorioDashboard data={chartData} reportType="semanal" />

            </Container>
    );
};

export default RelatorioSemanal;