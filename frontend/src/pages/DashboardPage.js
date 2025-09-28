import React, { useContext, useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    Grid,
    List,
    ListItem,
    ListItemText,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    InputAdornment,
    IconButton,
    useTheme,
    CircularProgress,
    Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import AuthContext from '../context/AuthContext';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line
} from 'recharts';
import dashboardService from '../services/dashboardService'; // Importar o serviço

const DashboardPage = () => {
    const { user } = useContext(AuthContext);
    const theme = useTheme();

    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                setError('');
                const data = await dashboardService.getMainDashboard();
                setDashboardData(data);
            } catch (err) {
                setError(err.message || 'Falha ao carregar os dados do dashboard.');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const MetricCard = ({ title, value, percentage, arrow, bgColor, borderColor, children }) => (
        <Paper elevation={2} sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '100%',
            borderLeft: `4px solid ${borderColor || theme.palette.primary.main}`,
            backgroundColor: bgColor || 'white',
        }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" color="text.secondary" textTransform="uppercase">
                    {title}
                </Typography>
                {children}
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mt: 1 }}>
                <Typography variant="h5" component="div" fontWeight="bold">
                    {value} {arrow === 'up' && <ArrowUpwardIcon color="success" fontSize="small" />}
                    {arrow === 'down' && <ArrowDownwardIcon color="error" fontSize="small" />}
                </Typography>
                {percentage && (
                    <Typography variant="body2" color="text.secondary">
                        {percentage}%
                    </Typography>
                )}
            </Box>
        </Paper>
    );

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
                <CircularProgress />
                <Typography>Carregando dashboard...</Typography>
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    if (!dashboardData) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
                <Typography>Nenhum dado de dashboard encontrado.</Typography>
            </Container>
        );
    }
    const { summary, responseChart = [], ranking = [], npsCriteria = [], feedbacks = [], conversionChart = [] } = dashboardData || {};

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Dashboard de Análise NPS
            </Typography>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Card NPS Score */}
                <Grid item xs={12} md={6} lg={3}>
                    <Paper elevation={2} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="h6" color="text.secondary" sx={{ borderBottom: `1px solid ${theme.palette.divider}`, pb: 1, mb: 1 }}>
                            NPS
                        </Typography>
                        <Typography variant="h3" component="div" fontWeight="bold" textAlign="center" color="primary" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {summary?.npsScore}
                        </Typography>
                    </Paper>
                </Grid>

                {/* Promotores */}
                <Grid item xs={12} md={6} lg={3}>
                    <MetricCard
                        title="Promotores"
                        value={summary?.promoters}
                        percentage={summary?.promotersPercentage}
                        borderColor={theme.palette.success.main}
                    />
                </Grid>

                {/* Neutros */}
                <Grid item xs={12} md={6} lg={3}>
                    <MetricCard
                        title="Neutros"
                        value={summary?.neutrals}
                        percentage={summary?.neutralsPercentage}
                        borderColor={theme.palette.warning.main}
                    />
                </Grid>

                {/* Detratores */}
                <Grid item xs={12} md={6} lg={3}>
                    <MetricCard
                        title="Detratores"
                        value={summary?.detractors}
                        percentage={summary?.detractorsPercentage}
                        borderColor={theme.palette.error.main}
                    />
                </Grid>

                {/* Outras Métricas */}
                <Grid item xs={12} md={6} lg={3}>
                    <MetricCard
                        title="Cadastros"
                        value={summary?.registrations}
                        percentage={summary?.registrationsConversion}
                        arrow="up"
                        borderColor={theme.palette.info.main}
                    >
                        <Typography variant="caption" color="text.secondary">conversão</Typography>
                    </MetricCard>
                </Grid>
                <Grid item xs={12} md={6} lg={3}>
                    <MetricCard
                        title="Ambresários no Mês"
                        value={summary?.ambassadorsMonth}
                        borderColor={theme.palette.secondary.main}
                    />
                </Grid>
                <Grid item xs={12} md={6} lg={3}>
                    <MetricCard
                        title="Cupons Gerados"
                        value={summary?.couponsGenerated}
                        borderColor={theme.palette.primary.main}
                    >
                        <Typography variant="caption" color="text.secondary">{summary?.couponsGeneratedPeriod}</Typography>
                    </MetricCard>
                </Grid>
                <Grid item xs={12} md={6} lg={3}>
                    <MetricCard
                        title="Cupons Utilizados"
                        value={summary?.couponsUsed}
                        percentage={summary?.couponsUsedConversion}
                        arrow="down"
                        borderColor={theme.palette.error.main}
                    >
                        <Typography variant="caption" color="text.secondary">conversão</Typography>
                    </MetricCard>
                </Grid>
            </Grid>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Gráfico de Respostas dos Últimos 7 dias */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={2} sx={{ p: 2, height: 400 }}>
                        <Typography variant="h6" color="text.secondary" sx={{ borderBottom: `1px solid ${theme.palette.divider}`, pb: 1, mb: 1 }}>
                            Últimos 7 dias
                        </Typography>
                        <Typography variant="subtitle2" color="text.secondary" mb={2}>
                            Respostas dos últimos 7 dias.
                        </Typography>
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={responseChart}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="Respostas" fill={theme.palette.primary.main} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* Ranking Atendentes */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={2} sx={{ p: 2, height: 400, display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="h6" color="text.secondary" sx={{ borderBottom: `1px solid ${theme.palette.divider}`, pb: 1, mb: 1 }}>
                            Ranking Atendentes
                        </Typography>
                        <Typography variant="subtitle2" color="text.secondary" mb={2}>
                            Últimas 200 respostas
                        </Typography>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Pesquisar"
                            size="small"
                            sx={{ mb: 2 }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <TableContainer sx={{ flexGrow: 1, overflowY: 'auto' }}>
                            <Table size="small" stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Ranking</TableCell>
                                        <TableCell>NOME</TableCell>
                                        <TableCell>RESPOSTAS</TableCell>
                                        <TableCell>META NPS</TableCell>
                                        <TableCell>NPS ATUAL</TableCell>
                                        <TableCell>META RESPOSTAS</TableCell>
                                        <TableCell>META CADASTROS</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {ranking && ranking.map((row, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{index + 1}°</TableCell>
                                            <TableCell>{row.name}</TableCell>
                                            <TableCell>{row.responses}</TableCell>
                                            <TableCell>{row.npsGoal}</TableCell>
                                            <TableCell>{row.currentNPS}</TableCell>
                                            <TableCell>{row.responsesGoal}</TableCell>
                                            <TableCell>{row.registrationsGoal}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        {/* Paginação - Mocked */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                            <Typography variant="body2">Itens por página: 5</Typography>
                            <Typography variant="body2">1 - 5 de {ranking?.length || 0}</Typography>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* NPS dos Critérios */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={2} sx={{ p: 2, height: 400, display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="h6" color="text.secondary" sx={{ borderBottom: `1px solid ${theme.palette.divider}`, pb: 1, mb: 1 }}>
                            NPS dos Critérios
                        </Typography>
                        <Typography variant="subtitle2" color="text.secondary" mb={2}>
                            Últimas 200 respostas
                        </Typography>
                        <TableContainer sx={{ flexGrow: 1, overflowY: 'auto' }}>
                            <Table size="small" stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>QUESTÃO</TableCell>
                                        <TableCell>NPS</TableCell>
                                        <TableCell>PROMOTORES</TableCell>
                                        <TableCell>NEUTROS</TableCell>
                                        <TableCell>DETRATORES</TableCell>
                                        <TableCell>TOTAL</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {npsCriteria && npsCriteria.map((row, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{row.question}</TableCell>
                                            <TableCell>{row.nps}</TableCell>
                                            <TableCell>{row.promoters}</TableCell>
                                            <TableCell>{row.neutrals}</TableCell>
                                            <TableCell>{row.detractors}</TableCell>
                                            <TableCell>{row.total}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>

                {/* Feedbacks Recentes */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={2} sx={{ p: 2, height: 400, display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="h6" color="text.secondary" sx={{ borderBottom: `1px solid ${theme.palette.divider}`, pb: 1, mb: 1 }}>
                            Feedbacks Recentes
                        </Typography>
                        <List sx={{ flexGrow: 1, overflowY: 'auto' }}>
                            {feedbacks.map((feedback, index) => (
                                <ListItem key={index} divider>
                                    <ListItemText
                                        primary={
                                            <Box>
                                                <Typography component="span" variant="body2" color="text.secondary" mr={1}>
                                                    {feedback.date}
                                                </Typography>
                                                {feedback.client && (
                                                    <Typography component="span" variant="body2" fontWeight="bold">
                                                        {feedback.client}
                                                    </Typography>
                                                )}
                                            </Box>
                                        }
                                        secondary={
                                            <Box sx={{ mt: 0.5 }}>
                                                <Typography component="span" variant="caption" sx={{ backgroundColor: theme.palette.primary.main, color: 'white', p: '2px 8px', borderRadius: '12px', mr: 1 }}>
                                                    {feedback.nps}
                                                </Typography>
                                                {feedback.comment && (
                                                    <Typography component="span" variant="body2" color="text.primary">
                                                        {feedback.comment}
                                                    </Typography>
                                                )}
                                            </Box>
                                        }
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Paper>
                </Grid>
            </Grid>

            {/* Gráfico de Conversão */}
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Paper elevation={2} sx={{ p: 2, height: 400 }}>
                        <Typography variant="h6" color="text.secondary" sx={{ borderBottom: `1px solid ${theme.palette.divider}`, pb: 1, mb: 1 }}>
                            Gráfico de Conversão
                        </Typography>
                        <Typography variant="subtitle2" color="text.secondary" mb={2}>
                            Análise da conversão em cada etapa, desde as respostas coletadas até os cupons utilizados.
                        </Typography>
                        <ResponsiveContainer width="100%" height={280}>
                            <LineChart data={conversionChart}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="value" stroke={theme.palette.success.main} activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default DashboardPage;
