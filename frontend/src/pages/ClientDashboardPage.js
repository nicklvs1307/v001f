import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  useTheme,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
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
                            <TableRow key={index} hover>
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
  const theme = useTheme();
  const [demographicsData, setDemographicsData] = useState(null);
  const [topVisitors, setTopVisitors] = useState([]);
  const [topRedeemers, setTopRedeemers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError('');
        
        const [demographics, visitors, redeemers] = await Promise.all([
            dashboardService.getClientDemographics(),
            dashboardService.getTopClientsByResponses({ limit: 10 }),
            dashboardService.getTopClientsByRedemptions({ limit: 10 })
        ]);
        
        setDemographicsData(demographics);
        setTopVisitors(visitors);
        setTopRedeemers(redeemers);

      } catch (err) {
        setError(err.message || 'Falha ao carregar o painel de clientes.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const COLORS = [theme.palette.primary.main, theme.palette.secondary.main, theme.palette.error.main, theme.palette.warning.main, theme.palette.info.main];

  const visitorsColumns = [
      { id: 'name', label: 'Cliente' },
      { id: 'phone', label: 'Telefone' },
      { id: 'responseCount', label: 'Respostas', align: 'right' },
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
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Painel de Clientes
      </Typography>

      {/* New Engagement Reports */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
            <ReportTable 
                title="Top 10 Clientes Mais Engajados (por Respostas)"
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
      
      {/* Demographics Charts */}
      {demographicsData && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
                <Paper elevation={3} sx={{ p: 2, height: 400 }}>
                    <Typography variant="h6" gutterBottom>Distribuição por Faixa Etária</Typography>
                    <ResponsiveContainer width="100%" height="90%">
                        <BarChart data={Object.entries(demographicsData.ageDistribution).map(([name, count]) => ({name, count}))} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend verticalAlign="top" />
                            <Bar dataKey="count" fill={theme.palette.primary.main} name="Clientes" />
                        </BarChart>
                    </ResponsiveContainer>
                </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
                <Paper elevation={3} sx={{ p: 2, height: 400 }}>
                    <Typography variant="h6" gutterBottom>Distribuição por Gênero</Typography>
                    <ResponsiveContainer width="100%" height="90%">
                        <PieChart>
                            <Pie
                                data={Object.entries(demographicsData.genderDistribution).map(([name, value]) => ({name, value}))}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={120}
                                fill="#8884d8"
                                dataKey="value"
                                nameKey="name"
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            >
                                {Object.entries(demographicsData.genderDistribution).map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </Paper>
            </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default ClientDashboardPage;
