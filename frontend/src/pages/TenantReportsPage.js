import React, { useState, useEffect, useMemo } from 'react';
import {
    Container, Typography, Box, CircularProgress, Paper, Alert, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, TextField, InputAdornment, Grid, Chip, Button
} from '@mui/material';
import { Search, Refresh, TrendingUp, TrendingDown } from '@mui/icons-material';
import reportService from '../services/reportService';

const TenantReportsPage = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [lastUpdated, setLastUpdated] = useState(null);

    useEffect(() => {
        fetchTenantReports();
    }, []);

    const fetchTenantReports = async () => {
        setLoading(true);
        try {
            const response = await reportService.getTenantReports();
            setReports(response.data || []);
            setLastUpdated(new Date());
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Falha ao carregar os relatórios de tenants.');
        } finally {
            setLoading(false);
        }
    };

    const filteredReports = useMemo(() => {
        if (!searchTerm) return reports;
        return reports.filter(r => 
            r.tenantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.tenantId?.includes(searchTerm)
        );
    }, [reports, searchTerm]);

    const getResponseRateColor = (rate) => {
        if (rate >= 70) return 'success';
        if (rate >= 40) return 'warning';
        return 'error';
    };

    if (loading) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Container>
        );
    }

    if (error) {
        return (
            <Container>
                <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>
                <Button startIcon={<Refresh />} onClick={fetchTenantReports} sx={{ mt: 2 }}>
                    Tentar novamente
                </Button>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg">
            <Box sx={{ my: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
                    <Box>
                        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
                            Relatórios por Restaurante
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Estatísticas detalhadas de cada tenant
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {lastUpdated && (
                            <Typography variant="caption" color="text.secondary">
                                Última atualização: {lastUpdated.toLocaleTimeString('pt-BR')}
                            </Typography>
                        )}
                        <Button 
                            variant="outlined" 
                            startIcon={<Refresh />}
                            onClick={fetchTenantReports}
                        >
                            Atualizar
                        </Button>
                    </Box>
                </Box>

                <Paper elevation={3} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Buscar por nome do restaurante..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Box sx={{ display: 'flex', gap: 2, justifyContent: { md: 'flex-end' } }}>
                                <Chip label={`${filteredReports.length} restaurantes`} color="primary" variant="outlined" />
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>

                <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ bgcolor: 'primary.main' }}>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Restaurante</TableCell>
                                    <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Clientes Ativos</TableCell>
                                    <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Campanhas Ativas</TableCell>
                                    <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Total Pesquisas</TableCell>
                                    <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Taxa de Resposta</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredReports.length > 0 ? (
                                    filteredReports.map((report) => (
                                        <TableRow key={report.tenantId} hover>
                                            <TableCell component="th" scope="row">
                                                <Typography fontWeight={500}>{report.tenantName}</Typography>
                                                <Typography variant="caption" color="text.secondary">{report.tenantId}</Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                                                    <PeopleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                                    {report.activeClients}
                                                </Box>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                                                    <CampaignIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                                    {report.activeCampaigns}
                                                </Box>
                                            </TableCell>
                                            <TableCell align="right">{report.totalSurveys}</TableCell>
                                            <TableCell align="right">
                                                <Chip 
                                                    icon={report.averageResponseRate >= 50 ? <TrendingUp /> : <TrendingDown />}
                                                    label={`${report.averageResponseRate}%`}
                                                    color={getResponseRateColor(report.averageResponseRate)}
                                                    size="small"
                                                    variant={report.averageResponseRate >= 50 ? 'filled' : 'outlined'}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                            <Typography variant="body1" color="text.secondary">
                                                Nenhum relatório de restaurante encontrado.
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </Box>
        </Container>
    );
};

const PeopleIcon = (props) => (
    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', ...props.sx }}>
        <svg {...props} viewBox="0 0 24 24" width={props.fontSize || 24} height={props.fontSize || 24}>
            <path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
    </Box>
);

const CampaignIcon = (props) => (
    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', ...props.sx }}>
        <svg {...props} viewBox="0 0 24 24" width={props.fontSize || 24} height={props.fontSize || 24}>
            <path fill="currentColor" d="M18 11v2h4v-2h-4zm-2 6.61c.96.71 2.21 1.65 3.2 2.39.4-.53.8-1.07 1.2-1.6-.99-.74-2.24-1.68-3.2-2.4-.4.54-.8 1.08-1.2 1.61zM20.4 5.6c-.4-.53-.8-1.07-1.2-1.6-.99.74-2.24 1.68-3.2 2.4.4.53.8 1.07 1.2 1.6.96-.72 2.21-1.65 3.2-2.4zM4 9c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h1v4h2v-4h1l5 3V6L8 9H4zm11.5 3c0-1.33-.58-2.53-1.5-3.35v6.69c.92-.81 1.5-2.01 1.5-3.34z"/>
        </svg>
    </Box>
);

export default TenantReportsPage;
