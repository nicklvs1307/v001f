
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
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { ptBR } from 'date-fns/locale';
import { formatDateForDisplay, getStartOfDayUTC, getEndOfDayUTC } from '../utils/dateUtils';

import dashboardService from '../services/dashboardService';
import DetailsModal from '../components/Dashboard/DetailsModal';
import AttendantDetailsModal from '../components/Dashboard/AttendantDetailsModal';
import ChartCard from '../components/charts/ChartCard';

import { keyframes } from '@mui/system';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const DashboardPage = () => {
    const { user } = useContext(AuthContext);
    const theme = useTheme();

    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    // State for the details modal
    const [modalOpen, setModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalData, setModalData] = useState([]);
    const [modalLoading, setModalLoading] = useState(false);
    const [modalError, setModalError] = useState('');

    // State for the attendant details modal
    const [attendantModalOpen, setAttendantModalOpen] = useState(false);
    const [attendantModalData, setAttendantModalData] = useState(null);
    const [attendantModalLoading, setAttendantModalLoading] = useState(false);
    const [attendantModalError, setAttendantModalError] = useState('');
    const [attendantSearch, setAttendantSearch] = useState('');

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                setError('');
                const params = {};
                if (startDate) {
                    params.startDate = getStartOfDayUTC(startDate);
                }
                if (endDate) {
                    params.endDate = getEndOfDayUTC(endDate);
                }
                const data = await dashboardService.getMainDashboard(params);
                setDashboardData(data);
            } catch (err) {
                setError(err.message || 'Falha ao carregar os dados do dashboard.');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [startDate, endDate]);

    const handleCardClick = async (category, title) => {
        setModalTitle(title || `Detalhes de ${category}`);
        setModalOpen(true);
        setModalLoading(true);
        try {
            const params = {};
            if (startDate) {
                params.startDate = getStartOfDayUTC(startDate);
            }
            if (endDate) {
                params.endDate = getEndOfDayUTC(endDate);
            }
            const data = await dashboardService.getDetails(category, params);
            setModalData(data);
        } catch (err) {
            setModalError(err.message || 'Falha ao carregar os detalhes.');
        } finally {
            setModalLoading(false);
        }
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setModalTitle('');
        setModalData([]);
        setModalError('');
    };

    const handleAttendantClick = async (attendantId) => {
        setAttendantModalOpen(true);
        setAttendantModalLoading(true);
        try {
            const params = {};
            if (startDate) {
                params.startDate = getStartOfDayUTC(startDate);
            }
            if (endDate) {
                params.endDate = getEndOfDayUTC(endDate);
            }
            const data = await dashboardService.getAttendantDetails(attendantId, params);
            setAttendantModalData(data);
        } catch (err) {
            setAttendantModalError(err.message || 'Falha ao carregar os detalhes do atendente.');
        } finally {
            setAttendantModalLoading(false);
        }
    };

    const handleFeedbackClick = async (sessionId) => {
        setModalTitle('Detalhes da Resposta');
        setModalOpen(true);
        setModalLoading(true);
        try {
            const data = await dashboardService.getResponseDetails(sessionId);
            setModalData(data);
        } catch (err) {
            setModalError(err.message || 'Falha ao carregar os detalhes da resposta.');
        } finally {
            setModalLoading(false);
        }
    };

    const handleCloseAttendantModal = () => {
        setAttendantModalOpen(false);
        setAttendantModalData(null);
        setAttendantModalError('');
    };

    const MetricCard = ({ title, value, percentage, arrow, color, children, onClick }) => (
        <Paper elevation={2} sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '100%',
            borderLeft: `4px solid ${color || theme.palette.primary.main}`,
            backgroundColor: 'white',
            cursor: onClick ? 'pointer' : 'default',
            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
            '&:hover': {
                transform: onClick ? 'scale(1.02)' : 'none',
                boxShadow: onClick ? theme.shadows[4] : theme.shadows[2],
            }
        }}
        onClick={onClick}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" color="text.secondary" textTransform="uppercase">
                    {title}
                </Typography>
                {children}
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mt: 1 }}>
                <Typography variant="h6" component="div" fontWeight="bold">
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

    const { summary, responseChart, surveysRespondedChart, attendantsPerformance = [], feedbacks = [], conversionChart, overallResults, npsTrend } = dashboardData || { summary: {}, responseChart: [], surveysRespondedChart: [], attendantsPerformance: [], feedbacks: [], conversionChart: [], overallResults: {}, npsTrend: [] };
    const handleSearchChange = (event) => {
        setAttendantSearch(event.target.value);
    };

    const filteredAttendants = dashboardData?.attendantsPerformance?.filter((attendant) =>
        attendant.name.toLowerCase().includes(attendantSearch.toLowerCase())
    ) || [];
    if (!dashboardData) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
                <Typography>Nenhum dado de dashboard encontrado.</Typography>
            </Container>
        );
    }



    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Dashboard de Análise
                </Typography>
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <DatePicker
                                label="Data de Início"
                                value={startDate}
                                onChange={(newValue) => setStartDate(newValue)}
                                renderInput={(params) => <TextField {...params} />}
                            />
                            <DatePicker
                                label="Data de Fim"
                                value={endDate}
                                onChange={(newValue) => setEndDate(newValue)}
                                renderInput={(params) => <TextField {...params} />}
                            />
                        </Box>
                    </LocalizationProvider>
            </Box>

            <Grid container spacing={2} sx={{ mb: 4 }}>
                {/* Card NPS Score */}
                <Grid item xs={12} md={6} lg={3} sx={{ animation: `${fadeIn} 0.5s ease-out` }}>
                    <MetricCard
                        title="NPS Geral"
                        value={summary?.nps?.score?.toFixed(0)}
                        color={theme.palette.primary.main}
                        onClick={() => handleCardClick('nps-geral', 'Detalhes de NPS Geral')}
                    />
                </Grid>

                {/* Card CSAT Score */}
                <Grid item xs={12} md={6} lg={3} sx={{ animation: `${fadeIn} 0.5s ease-out` }}>
                    <MetricCard
                        title="Média de Satisfação"
                        value={summary?.csat?.averageScore?.toFixed(1)}
                        color={theme.palette.secondary.main}
                        onClick={() => handleCardClick('csat-geral', 'Detalhes de Média de Satisfação')}
                    />
                </Grid>

                {/* Total de Respostas */}
                <Grid item xs={12} md={6} lg={3} sx={{ animation: `${fadeIn} 0.5s ease-out` }}>
                    <MetricCard
                        title="Total de Respostas"
                        value={summary?.totalResponses}
                        color={theme.palette.info.main}
                        onClick={() => handleCardClick('total-respostas', 'Detalhes de Total de Respostas')}
                    />
                </Grid>

                {/* Promotores */}
                <Grid item xs={12} md={6} lg={3} sx={{ animation: `${fadeIn} 0.5s ease-out` }}>
                    <MetricCard
                        title="Promotores (NPS)"
                        value={summary?.nps?.promoters}
                        percentage={summary?.nps?.total > 0 ? ((summary?.nps?.promoters / summary?.nps?.total) * 100).toFixed(1) : 0}
                        color={theme.palette.success.main}
                        onClick={() => handleCardClick('promotores', 'Detalhes de Promotores (NPS)')}
                    />
                </Grid>

                {/* Detratores */}
                <Grid item xs={12} md={6} lg={3} sx={{ animation: `${fadeIn} 0.5s ease-out` }}>
                    <MetricCard
                        title="Detratores (NPS)"
                        value={summary?.nps?.detractors}
                        percentage={summary?.nps?.total > 0 ? ((summary?.nps?.detractors / summary?.nps?.total) * 100).toFixed(1) : 0}
                        color={theme.palette.error.main}
                        onClick={() => handleCardClick('detratores', 'Detalhes de Detratores (NPS)')}
                    />
                </Grid>

                {/* Neutros */}
                <Grid item xs={12} md={6} lg={3} sx={{ animation: `${fadeIn} 0.5s ease-out` }}>
                    <MetricCard
                        title="Neutros (NPS)"
                        value={summary?.nps?.neutrals}
                        percentage={summary?.nps?.total > 0 ? ((summary?.nps?.neutrals / summary?.nps?.total) * 100).toFixed(1) : 0}
                        color={theme.palette.secondary.main}
                        onClick={() => handleCardClick('neutros', 'Detalhes de Neutros (NPS)')}
                    />
                </Grid>

                {/* Satisfeitos (CSAT) */}
                <Grid item xs={12} md={6} lg={3} sx={{ animation: `${fadeIn} 0.5s ease-out` }}>
                    <MetricCard
                        title="Satisfeitos (CSAT)"
                        value={summary?.csat?.satisfied}
                        percentage={summary?.csat?.total > 0 ? ((summary?.csat?.satisfied / summary?.csat?.total) * 100).toFixed(1) : 0}
                        color={theme.palette.success.main}
                        onClick={() => handleCardClick('satisfeitos', 'Detalhes de Satisfeitos (CSAT)')}
                    />
                </Grid>

                {/* Insatisfeitos (CSAT) */}
                <Grid item xs={12} md={6} lg={3} sx={{ animation: `${fadeIn} 0.5s ease-out` }}>
                    <MetricCard
                        title="Insatisfeitos (CSAT)"
                        value={summary?.csat?.unsatisfied}
                        percentage={summary?.csat?.total > 0 ? ((summary?.csat?.unsatisfied / summary?.csat?.total) * 100).toFixed(1) : 0}
                        color={theme.palette.error.main}
                        onClick={() => handleCardClick('insatisfeitos', 'Detalhes de Insatisfeitos (CSAT)')}
                    />
                </Grid>

                {/* Outras Métricas */}
                <Grid item xs={12} md={6} lg={3} sx={{ animation: `${fadeIn} 0.5s ease-out` }}>
                    <MetricCard
                        title="Cadastros"
                        value={summary?.registrations}
                        percentage={summary?.registrationsConversion}
                        arrow="up"
                        onClick={() => handleCardClick('cadastros', 'Detalhes de Cadastros')}
                    >
                        <Typography variant="caption" color="text.secondary">conversão</Typography>
                    </MetricCard>
                </Grid>
                <Grid item xs={12} md={6} lg={3} sx={{ animation: `${fadeIn} 0.5s ease-out` }}>
                    <MetricCard
                        title="Aniversariantes do Mês"
                        value={summary?.ambassadorsMonth}
                        onClick={() => handleCardClick('aniversariantes', 'Detalhes de Aniversariantes do Mês')}
                    />
                </Grid>
                <Grid item xs={12} md={6} lg={3} sx={{ animation: `${fadeIn} 0.5s ease-out` }}>
                    <MetricCard
                        title="Cupons Gerados"
                        value={summary?.couponsGenerated}
                        onClick={() => handleCardClick('cupons-gerados', 'Detalhes de Cupons Gerados')}
                    >
                        <Typography variant="caption" color="text.secondary">{summary?.couponsGeneratedPeriod}</Typography>
                    </MetricCard>
                </Grid>
                <Grid item xs={12} md={6} lg={3} sx={{ animation: `${fadeIn} 0.5s ease-out` }}>
                    <MetricCard
                        title="Cupons Utilizados"
                        value={summary?.couponsUsed}
                        percentage={summary?.couponsUsedConversion}
                        arrow="down"
                        onClick={() => handleCardClick('cupons-utilizados', 'Detalhes de Cupons Utilizados')}
                    >
                        <Typography variant="caption" color="text.secondary">conversão</Typography>
                    </MetricCard>
                </Grid>
            </Grid>

            <DetailsModal
                open={modalOpen}
                handleClose={handleCloseModal}
                title={modalTitle}
                data={modalData}
                loading={modalLoading}
                error={modalError}
            />

            <AttendantDetailsModal
                open={attendantModalOpen}
                handleClose={handleCloseAttendantModal}
                data={attendantModalData}
                loading={attendantModalLoading}
                error={attendantModalError}
            />


            <Grid container spacing={2} sx={{ mb: 4 }}>
                {/* Gráfico de Respostas por Período */}
                <Grid item xs={12} md={6} sx={{ animation: `${fadeIn} 0.5s ease-out` }}>
                    <Paper elevation={2} sx={{ p: 2, height: { xs: 300, md: 400 } }}>
                        <Typography variant="subtitle1" color="text.secondary" sx={{ borderBottom: `1px solid ${theme.palette.divider}`, pb: 1, mb: 1 }}>
                            Respostas por Período
                        </Typography>
                        <Typography variant="subtitle2" color="text.secondary" mb={2}>
                            Total de perguntas respondidas por período.
                        </Typography>
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={responseChart}>
                                <defs>
                                    <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="Respostas" fill="url(#colorUv)" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* Gráfico de Pesquisas Respondidas por Período */}
                <Grid item xs={12} md={6} sx={{ animation: `${fadeIn} 0.5s ease-out` }}>
                    <Paper elevation={2} sx={{ p: 2, height: { xs: 300, md: 400 } }}>
                        <Typography variant="subtitle1" color="text.secondary" sx={{ borderBottom: `1px solid ${theme.palette.divider}`, pb: 1, mb: 1 }}>
                            Pesquisas Respondidas por Período
                        </Typography>
                        <Typography variant="subtitle2" color="text.secondary" mb={2}>
                            Número de clientes únicos que responderam por período.
                        </Typography>
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={surveysRespondedChart}>
                                <defs>
                                    <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={theme.palette.secondary.main} stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor={theme.palette.secondary.main} stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="Pesquisas Respondidas" fill="url(#colorPv)" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* Performance dos Atendentes */}
                <Grid item xs={12} md={6} sx={{ animation: `${fadeIn} 0.5s ease-out` }}>
                    <Paper elevation={2} sx={{ p: 2, height: { xs: 300, md: 400 }, display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="subtitle1" color="text.secondary" sx={{ borderBottom: `1px solid ${theme.palette.divider}`, pb: 1, mb: 1 }}>
                            Performance dos Atendentes
                        </Typography>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Pesquisar"
                            size="small"
                            sx={{ mb: 2 }}
                            value={attendantSearch}
                            onChange={handleSearchChange}
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
                                        <TableCell>Atendente</TableCell>
                                        <TableCell>Respostas</TableCell>
                                        <TableCell>NPS</TableCell>
                                        <TableCell>Média CSAT</TableCell>
                                        <TableCell>Meta NPS</TableCell>
                                        <TableCell>Meta CSAT</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredAttendants.map((row, index) => (
                                        <TableRow
                                            key={index}
                                            hover
                                            onClick={() => handleAttendantClick(row.id)}
                                            sx={{
                                                cursor: 'pointer',
                                                backgroundColor: index % 2 === 0 ? theme.palette.action.hover : 'inherit',
                                            }}
                                        >
                                            <TableCell>{row.name}</TableCell>
                                            <TableCell>{row.responses}</TableCell>
                                            <TableCell>{row.currentNPS}</TableCell>
                                            <TableCell>{row.currentCSAT}</TableCell>
                                            <TableCell>{row.npsGoal}</TableCell>
                                            <TableCell>{row.csatGoal}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                            <Typography variant="body2">Itens por página: 5</Typography>
                            <Typography variant="body2">1 - 5 de {filteredAttendants.length}</Typography>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            <Grid container spacing={2} sx={{ mb: 4 }}>
                {/* Feedbacks Recentes */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={2} sx={{ p: 2, height: { xs: 300, md: 400 }, display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="subtitle1" color="text.secondary" sx={{ borderBottom: `1px solid ${theme.palette.divider}`, pb: 1, mb: 1 }}>
                            Feedbacks Recentes
                        </Typography>
                        <List sx={{ flexGrow: 1, overflowY: 'auto' }}>
                            {feedbacks.map((feedback, index) => (
                                <ListItem
                                    key={index}
                                    divider
                                    button
                                    onClick={() => handleFeedbackClick(feedback.respondentSessionId)}
                                >
                                    <ListItemText
                                        primary={
                                            <Box>
                                                <Typography component="span" variant="body2" color="text.secondary" mr={1}>
                                                    {formatDateForDisplay(feedback.date)}
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
                                                    Nota: {feedback.rating}
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

                {/* Gráfico de Tendência de NPS */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={2} sx={{ p: 2, height: { xs: 300, md: 400 } }}>
                        <Typography variant="subtitle1" color="text.secondary" sx={{ borderBottom: `1px solid ${theme.palette.divider}`, pb: 1, mb: 1 }}>
                            Tendência de NPS
                        </Typography>
                        <ResponsiveContainer width="100%" height={280}>
                            <LineChart data={npsTrend}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="period" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="nps" name="NPS" stroke={theme.palette.primary.main} />
                            </LineChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
            </Grid>



            {/* Gráfico de Conversão */}
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Paper elevation={2} sx={{ p: 2, height: { xs: 300, md: 400 } }}>
                        <Typography variant="subtitle1" color="text.secondary" sx={{ borderBottom: `1px solid ${theme.palette.divider}`, pb: 1, mb: 1 }}>
                            Gráfico de Conversão
                        </Typography>
                        <Typography variant="subtitle2" color="text.secondary" mb={2}>
                            Análise da conversão em cada etapa, desde as respostas coletadas até os cupons utilizados.
                        </Typography>
                        <ResponsiveContainer width="100%" height={280}>
                            <LineChart
                                data={conversionChart}
                                onClick={(e) => {
                                    if (e && e.activePayload && e.activePayload.length > 0) {
                                        handleCardClick(e.activePayload[0].payload.name);
                                    }
                                }}
                            >
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

            {/* Scores por Critério */}
            <Grid container spacing={2} sx={{ mt: 4 }}>
                <Grid item xs={12}>
                    <Typography variant="h5" component="h2" gutterBottom>
                        Scores por Critério
                    </Typography>
                </Grid>
                {overallResults?.scoresByCriteria?.map((criterion, index) => {
                    if (criterion.total === 0) return null;

                    const chartData = criterion.scoreType === 'NPS' ? [
                        { name: 'Promotores', value: criterion.promoters || 0 },
                        { name: 'Neutros', value: criterion.neutrals || 0 },
                        { name: 'Detratores', value: criterion.detractors || 0 },
                    ] : [
                        { name: 'Satisfeitos', value: criterion.satisfied || 0 },
                        { name: 'Neutros', value: criterion.neutral || 0 },
                        { name: 'Insatisfeitos', value: criterion.unsatisfied || 0 },
                    ];

                    const score = criterion.scoreType === 'NPS'
                        ? criterion.npsScore?.toFixed(1) ?? 0
                        : `${criterion.satisfactionRate?.toFixed(1) ?? 0}%`;

                    return (
                        <Grid item xs={12} md={6} key={index}>
                            <ChartCard
                                title={criterion.criterion}
                                score={score}
                                data={chartData}
                                colors={criterion.scoreType === 'NPS' ? ['#4CAF50', '#FFC107', '#F44336'] : ['#2196F3', '#FFC107', '#F44336']}
                                loading={loading}
                            />
                        </Grid>
                    );
                })}
            </Grid>
        </Container>
    );
};

export default DashboardPage;
