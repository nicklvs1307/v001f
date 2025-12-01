import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import dashboardService from '../services/dashboardService';

const ReportTable = ({ title, icon, data, columns }) => (
    <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            {icon}
            <Typography variant="h6" component="h2" sx={{ ml: 1 }}>{title}</Typography>
        </Box>
        <TableContainer>
            <Table stickyHeader size="small">
                <TableHead>
                    <TableRow>
                        {columns.map((col) => (
                            <TableCell key={col.id} align={col.align || 'left'}>{col.label}</TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data && data.length > 0 ? (
                        data.map((row, index) => (
                            <TableRow key={index}>
                                {columns.map((col) => (
                                    <TableCell key={col.id} align={col.align || 'left'}>
                                        {col.render ? col.render(row) : row[col.id]}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={columns.length} align="center">
                                Nenhum dado disponível.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    </Paper>
);


const ClientDashboardPage = () => {
  const [topVisitors, setTopVisitors] = useState([]);
  const [topRedeemers, setTopRedeemers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError('');
        const [visitorsData, redeemersData] = await Promise.all([
            dashboardService.getTopClientsByResponses({ limit: 10 }),
            dashboardService.getTopClientsByRedemptions({ limit: 10 })
        ]);
        setTopVisitors(visitorsData);
        setTopRedeemers(redeemersData);
      } catch (err) {
        setError(err.message || 'Falha ao carregar o painel de clientes.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const visitorsColumns = [
      { id: 'name', label: 'Cliente' },
      { id: 'phone', label: 'Telefone' },
      { id: 'responseCount', label: 'Visitas', align: 'right' },
  ];

  const redeemersColumns = [
      { id: 'name', label: 'Cliente', render: (row) => row.client?.name },
      { id: 'phone', label: 'Telefone', render: (row) => row.client?.phone },
      { id: 'redemptionCount', label: 'Resgates', align: 'right' },
  ];

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography>Carregando painel de clientes...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        Painel de Clientes
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
            <ReportTable 
                title="Top 10 Clientes Mais Engajados"
                icon={<PeopleIcon color="primary" />}
                data={topVisitors}
                columns={visitorsColumns}
            />
        </Grid>
        <Grid item xs={12} md={6}>
            <ReportTable 
                title="Top 10 Clientes que Mais Resgatam"
                icon={<EmojiEventsIcon color="secondary" />}
                data={topRedeemers}
                columns={redeemersColumns}
            />
        </Grid>
      </Grid>
    </Container>
  );
};

export default ClientDashboardPage;
