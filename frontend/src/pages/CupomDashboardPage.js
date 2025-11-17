import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import cupomService from '../services/cupomService';
import { formatDateForDisplay } from '../utils/dateUtils';

const MetricCard = ({ title, value, color }) => (
  <Paper elevation={3} sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%', borderTop: `4px solid ${color}` }}>
    <Typography variant="subtitle2" color="text.secondary" textTransform="uppercase">
      {title}
    </Typography>
    <Typography variant="h4" component="div" fontWeight="bold" sx={{ mt: 1 }}>
      {value}
    </Typography>
  </Paper>
);

const CupomDashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const theme = useTheme();

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const data = await cupomService.getCuponsSummary();
        setSummary(data);
      } catch (err) {
        setError(err.message || 'Erro ao carregar o resumo de cupons.');
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography>Carregando painel de cupons...</Typography>
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

  if (!summary) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <Typography>Nenhum dado de cupom encontrado.</Typography>
      </Container>
    );
  }

  const { totalCupons, activeCupons, usedCupons, expiredCupons, expiringSoonCupons, cuponsByType, dailyGenerated, recentCupons } = summary;

  const pieChartData = [
    { name: 'Ativos', value: activeCupons },
    { name: 'Utilizados', value: usedCupons },
    { name: 'Expirados', value: expiredCupons },
  ];

  const PIE_COLORS = [theme.palette.success.main, theme.palette.warning.main, theme.palette.error.main];

  const formattedDailyData = dailyGenerated.map(item => ({
    date: formatDateForDisplay(item.date, 'dd/MM'),
    count: Number(item.count),
  }));

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Painel de Cupons
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4} lg>
          <MetricCard title="Total de Cupons" value={totalCupons} color={theme.palette.primary.main} />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg>
          <MetricCard title="Cupons Ativos" value={activeCupons} color={theme.palette.success.main} />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg>
          <MetricCard title="Cupons Utilizados" value={usedCupons} color={theme.palette.warning.main} />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg>
          <MetricCard title="Cupons Vencidos" value={expiredCupons} color={theme.palette.error.main} />
        </Grid>
        <Grid item xs={12} sm={6} md={4} lg>
          <MetricCard title="Vencendo em 7 Dias" value={expiringSoonCupons} color={theme.palette.info.main} />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Paper elevation={3} sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" color="text.secondary" sx={{ pb: 1, mb: 1 }}>
              Cupons Gerados nos Últimos 30 Dias
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={formattedDailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke={theme.palette.primary.main} strokeWidth={2} name="Cupons Gerados" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Paper elevation={3} sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" color="text.secondary" sx={{ pb: 1, mb: 1 }}>
              Distribuição de Status
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} lg={7}>
          <Paper elevation={3} sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" color="text.secondary" sx={{ pb: 1, mb: 1 }}>
              Cupons por Tipo de Recompensa
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={cuponsByType}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill={theme.palette.secondary.main} name="Quantidade" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} lg={5}>
          <Paper elevation={3} sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" color="text.secondary" sx={{ pb: 1, mb: 1 }}>
              Últimos 10 Cupons Gerados
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Cliente</TableCell>
                    <TableCell>Recompensa</TableCell>
                    <TableCell>Data</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentCupons.map((cupom) => (
                    <TableRow key={cupom.id}>
                      <TableCell>{cupom.client?.name || 'N/A'}</TableCell>
                      <TableCell>{cupom.recompensa?.name || 'N/A'}</TableCell>
                      <TableCell>{formatDateForDisplay(cupom.createdAt, 'dd/MM/yy HH:mm')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CupomDashboardPage;
