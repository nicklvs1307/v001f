import React from 'react';
import {
    Container,
    Typography,
    CircularProgress,
    Alert,
    Grid,
    Paper,
    TextField,
    useTheme,
    Button,
    Box,
    Divider,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip
} from '@mui/material';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import useReportData from '../../hooks/useReportData';
import RelatorioDashboard from '../../components/relatorios/RelatorioDashboard';
import MetricCard from '../../components/common/MetricCard';
import { TrendingUp, BarChart as BarChartIcon, Star, CheckCircle, Print } from '@mui/icons-material';

const reportConfig = {
    diario: {
        title: 'Relatório Diário',
        getSubtitle: (date) => `Dados referentes a ${format(date, 'dd/MM/yyyy', { locale: ptBR })}`,
        datePickerLabel: 'Selecione a Data',
        datePickerViews: ['year', 'month', 'day'],
        renderDateValue: (date) => format(date, 'dd/MM/yyyy'),
        npsTitle: 'NPS Geral',
        csatTitle: 'CSAT Geral',
        trendTitle: 'Tendência do NPS (Diário)',
    },
    semanal: {
        title: 'Relatório Semanal',
        getSubtitle: (date) => {
            if (!date) return '';
            const start = startOfWeek(date, { weekStartsOn: 1 });
            const end = endOfWeek(date, { weekStartsOn: 1 });
            return `Semana de ${format(start, 'dd/MM')} - ${format(end, 'dd/MM/yyyy')}`;
        },
        datePickerLabel: 'Selecione a Semana',
        datePickerViews: ['year', 'month', 'day'],
        renderDateValue: (date) => {
            if (!date) return '';
            const start = startOfWeek(date, { weekStartsOn: 1 });
            const end = endOfWeek(date, { weekStartsOn: 1 });
            return `${format(start, 'dd/MM')} - ${format(end, 'dd/MM')}`;
        },
        npsTitle: 'NPS na Semana',
        csatTitle: 'CSAT na Semana',
        trendTitle: 'Tendência do NPS (Semanal)',
    },
    mensal: {
        title: 'Relatório Mensal',
        getSubtitle: (date) => {
            const monthName = date ? format(date, 'MMMM', { locale: ptBR }) : '';
            const capitalizedMonthName = monthName.charAt(0).toUpperCase() + monthName.slice(1);
            return `Mês de ${capitalizedMonthName}`;
        },
        datePickerLabel: 'Selecione o Mês',
        datePickerViews: ['year', 'month'],
        renderDateValue: (date) => format(date, 'MMMM/yyyy', { locale: ptBR }),
        npsTitle: 'NPS no Mês',
        csatTitle: 'CSAT no Mês',
        trendTitle: 'Tendência do NPS (Mensal)',
    },
};

const ReportPage = ({ reportType }) => {
    const theme = useTheme();
    const { reportData, loading, error, selectedDate, handleDateChange } = useReportData(reportType);

    const config = reportConfig[reportType];

    const handlePrint = () => {
        window.print();
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
                        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">{config.title}</Typography>
                        <Typography variant="h6" sx={{ opacity: 0.9 }}>{config.getSubtitle(selectedDate)}</Typography>
                    </Grid>
                    <Grid item sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Button 
                            variant="contained" 
                            startIcon={<Print />} 
                            onClick={handlePrint}
                            sx={{ 
                                bgcolor: 'white', 
                                color: theme.palette.primary.main, 
                                fontWeight: 'bold',
                                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' } 
                            }}
                        >
                            Imprimir
                        </Button>
                        <DatePicker
                            label={config.datePickerLabel}
                            value={selectedDate}
                            onChange={handleDateChange}
                            views={config.datePickerViews}
                            openTo={config.datePickerViews.length > 1 ? 'month' : 'month'}
                            renderInput={(params) => <TextField {...params} 
                                value={config.renderDateValue(selectedDate)}
                                sx={{ 
                                    bgcolor: 'white', 
                                    borderRadius: 1,
                                    minWidth: 200,
                                    '& .MuiInputBase-input': { color: 'black' },
                                    '& .MuiSvgIcon-root': { color: 'black' } 
                            }} />}
                        />
                    </Grid>
                </Grid>
            </Paper>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <MetricCard title={config.npsTitle} value={summary?.nps?.score?.toFixed(1) ?? 0} icon={<TrendingUp fontSize="large" />} color={theme.palette.primary.dark} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <MetricCard title={config.csatTitle} value={`${summary?.csat?.satisfactionRate?.toFixed(1) ?? '0.0'}%`} icon={<Star fontSize="large" />} color={theme.palette.secondary.main} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <MetricCard title="Total de Respostas" value={summary?.totalResponses ?? 0} icon={<BarChartIcon fontSize="large" />} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <MetricCard title="Respostas com Cadastro" value={clientStatusCounts?.withClient ?? 0} icon={<CheckCircle fontSize="large" />} />
                </Grid>
            </Grid>

            {reportData.surveySummaries && reportData.surveySummaries.length > 0 && (
                <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
                    <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 2 }}>
                        Desempenho por Pesquisa
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Pesquisa</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Total Respostas</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Promotores (🟢)</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Neutros (🟡)</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Detratores (🔴)</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>NPS</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {reportData.surveySummaries.map((s) => (
                                    <TableRow key={s.surveyId}>
                                        <TableCell>{s.surveyTitle}</TableCell>
                                        <TableCell align="center">{s.totalResponses}</TableCell>
                                        <TableCell align="center" sx={{ color: 'success.main', fontWeight: 'bold' }}>{s.nps.promoters}</TableCell>
                                        <TableCell align="center" sx={{ color: 'warning.main', fontWeight: 'bold' }}>{s.nps.neutrals}</TableCell>
                                        <TableCell align="center" sx={{ color: 'error.main', fontWeight: 'bold' }}>{s.nps.detractors}</TableCell>
                                        <TableCell align="center">
                                            <Chip 
                                                label={s.nps.npsScore.toFixed(1)} 
                                                size="small"
                                                color={s.nps.npsScore >= 70 ? 'success' : s.nps.npsScore >= 50 ? 'primary' : s.nps.npsScore >= 0 ? 'warning' : 'error'}
                                                sx={{ fontWeight: 'bold' }}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            )}
            
            <RelatorioDashboard data={chartData} reportType={reportType} trendTitle={config.trendTitle} />

        </Container>
    );
};

export default ReportPage;
