import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, CircularProgress, Paper, Grid, Alert, Chip
} from '@mui/material';
import reportService from '../services/reportService';

const SystemReportsPage = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSystemOverview();
  }, []);

  const fetchSystemOverview = async () => {
    setLoading(true);
    try {
      const response = await reportService.getSystemOverview();
      setReportData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Falha ao carregar o relatório de visão geral do sistema.');
    } finally {
      setLoading(false);
    }
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
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Relatório de Visão Geral do Sistema
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6">Total de Tenants</Typography>
              <Typography variant="h3" color="primary">{reportData.totalTenants}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6">Total de Usuários</Typography>
              <Typography variant="h3" color="primary">{reportData.totalUsers}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6">Total de Campanhas</Typography>
              <Typography variant="h3" color="primary">{reportData.totalCampaigns}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6">Status do Pool de Disparadores</Typography>
              <Box sx={{ mt: 1 }}>
                {reportData.senderPoolStatus.map((item, index) => (
                  <Chip
                    key={index}
                    label={`${item.status}: ${item.count}`}
                    color={item.status === 'active' ? 'success' : item.status === 'blocked' ? 'error' : 'default'}
                    sx={{ m: 0.5 }}
                  />
                ))}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default SystemReportsPage;
