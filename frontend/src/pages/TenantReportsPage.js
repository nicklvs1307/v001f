import React, { useState, useEffect, useMemo } from 'react';
import {
    Container, Typography, Box, CircularProgress, Paper, Alert, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, TextField, InputAdornment, Grid, Chip, Button
} from '@mui/material';
import { Search as SearchIcon, Refresh as RefreshIcon, TrendingUp, TrendingDown, Person, Campaign } from '@mui/icons-material';
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
                <Button startIcon={<RefreshIcon />} onClick={fetchTenantReports} sx={{ mt: 2 }}>
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
                            startIcon={<RefreshIcon />}
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
                                                    <Person sx={{ fontSize: 16, color: 'text.secondary' }} />
                                                    {report.activeClients}
                                                </Box>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                                                    <Campaign sx={{ fontSize: 16, color: 'text.secondary' }} />
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

export default TenantReportsPage;
