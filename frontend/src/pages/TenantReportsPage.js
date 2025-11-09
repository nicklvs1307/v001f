import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, CircularProgress, Paper, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import reportService from '../services/reportService';

const TenantReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTenantReports();
  }, []);

  const fetchTenantReports = async () => {
    setLoading(true);
    try {
      const response = await reportService.getTenantReports();
      setReports(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Falha ao carregar os relatórios de tenants.');
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
          Relatórios por Restaurante
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Restaurante</TableCell>
                <TableCell align="right">Clientes Ativos</TableCell>
                <TableCell align="right">Campanhas Ativas</TableCell>
                <TableCell align="right">Total de Pesquisas</TableCell>
                <TableCell align="right">Taxa Média de Resposta</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reports.length > 0 ? (
                reports.map((report) => (
                  <TableRow key={report.tenantId}>
                    <TableCell component="th" scope="row">{report.tenantName}</TableCell>
                    <TableCell align="right">{report.activeClients}</TableCell>
                    <TableCell align="right">{report.activeCampaigns}</TableCell>
                    <TableCell align="right">{report.totalSurveys}</TableCell>
                    <TableCell align="right">{report.averageResponseRate}%</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">Nenhum relatório de restaurante encontrado.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Container>
  );
};

export default TenantReportsPage;
