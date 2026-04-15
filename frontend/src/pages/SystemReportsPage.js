import React, { useState, useEffect } from 'react';
import {
    Container, Typography, Box, CircularProgress, Paper, Grid, Alert, Chip, Button, TextField, InputAdornment
} from '@mui/material';
import { Search, Refresh, TrendingUp, People, Store, Campaign, Send } from '@mui/icons-material';
import reportService from '../services/reportService';

const SystemReportsPage = () => {
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

    useEffect(() => {
        fetchSystemOverview();
    }, []);

    const fetchSystemOverview = async () => {
        setLoading(true);
        try {
            const response = await reportService.getSystemOverview();
            setReportData(response.data);
            setLastUpdated(new Date());
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Falha ao carregar o relatório de visão geral do sistema.');
        } finally {
            setLoading(false);
        }
    };

    const StatBox = ({ icon, title, value, color, subtitle }) => (
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600, fontSize: '0.7rem', letterSpacing: 1 }}>
                        {title}
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 'bold', color: color || 'text.primary', my: 1 }}>
                        {value || 0}
                    </Typography>
                    {subtitle && (
                        <Typography variant="caption" color="text.secondary">
                            {subtitle}
                        </Typography>
                    )}
                </Box>
                <Box sx={{ 
                    p: 1.5, 
                    borderRadius: 2, 
                    bgcolor: `${color || '#1976d2'}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    {React.cloneElement(icon, { sx: { fontSize: 28, color: color || '#1976d2' } })}
                </Box>
            </Box>
        </Paper>
    );

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
                <Button startIcon={<Refresh />} onClick={fetchSystemOverview} sx={{ mt: 2 }}>
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
                            Relatório de Visão Geral do Sistema
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Métricas e estatísticas do sistema completo
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
                            onClick={fetchSystemOverview}
                        >
                            Atualizar
                        </Button>
                    </Box>
                </Box>

                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatBox 
                            icon={<Store />} 
                            title="Total de Tenants" 
                            value={reportData?.totalTenants || 0}
                            color="#1976d2"
                            subtitle="Restaurantes ativos"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatBox 
                            icon={<People />} 
                            title="Total de Usuários" 
                            value={reportData?.totalUsers || 0}
                            color="#2e7d32"
                            subtitle="usuários cadastrados"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatBox 
                            icon={<Campaign />} 
                            title="Total de Campanhas" 
                            value={reportData?.totalCampaigns || 0}
                            color="#ed6c02"
                            subtitle="campanhas criadas"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatBox 
                            icon={<Send />} 
                            title="Disparos Hoje" 
                            value={reportData?.sentToday || 0}
                            color="#9c27b0"
                            subtitle="mensagens enviadas"
                        />
                    </Grid>
                </Grid>

                <Grid container spacing={3} sx={{ mt: 2 }}>
                    <Grid item xs={12} md={6}>
                        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                Status do Pool de Disparadores
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {reportData?.senderPoolStatus?.map((item, index) => (
                                    <Chip
                                        key={index}
                                        label={`${item.status}: ${item.count}`}
                                        color={item.status === 'active' ? 'success' : item.status === 'blocked' ? 'error' : 'default'}
                                        variant={item.status === 'active' ? 'filled' : 'outlined'}
                                        sx={{ fontWeight: 500 }}
                                    />
                                )) || <Typography variant="body2" color="text.secondary">Nenhum dado disponível</Typography>}
                            </Box>
                        </Paper>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                Informações Adicionais
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid', borderColor: 'divider', pb: 1 }}>
                                    <Typography variant="body2" color="text.secondary">Total de Respostas</Typography>
                                    <Typography variant="body2" fontWeight={600}>{reportData?.totalResponses || 0}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid', borderColor: 'divider', pb: 1 }}>
                                    <Typography variant="body2" color="text.secondary">Clientes Ativos</Typography>
                                    <Typography variant="body2" fontWeight={600}>{reportData?.activeClients || 0}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid', borderColor: 'divider', pb: 1 }}>
                                    <Typography variant="body2" color="text.secondary">Pesquisas Ativas</Typography>
                                    <Typography variant="body2" fontWeight={600}>{reportData?.activeSurveys || 0}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" color="text.secondary">Taxa de Resposta Média</Typography>
                                    <Typography variant="body2" fontWeight={600}>{reportData?.averageResponseRate || 0}%</Typography>
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </Container>
    );
};

export default SystemReportsPage;
