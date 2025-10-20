
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
import DetailsModal from '../components/Dashboard/DetailsModal'; // Importar o modal

import AttendantDetailsModal from '../components/Dashboard/AttendantDetailsModal'; // Importar o modal de atendente

const DashboardPage = () => {
    const { user } = useContext(AuthContext);
    const theme = useTheme();

    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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

    const handleCardClick = async (category) => {
        setModalTitle(`Detalhes de ${category}`);
        setModalOpen(true);
        setModalLoading(true);
        try {
            const data = await dashboardService.getDetails(category);
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
            const data = await dashboardService.getAttendantDetails(attendantId);
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

    const MetricCard = ({ title, value, percentage, arrow, bgColor, borderColor, children, onClick }) => (
        <Paper elevation={2} sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '100%',
            borderLeft: `4px solid ${borderColor || theme.palette.primary.main}`,
            backgroundColor: bgColor || 'white',
            cursor: onClick ? 'pointer' : 'default',
            '&:hover': {
                backgroundColor: onClick ? theme.palette.action.hover : 'white',
            }
        }}
        onClick={onClick}
        >
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
    const { summary, responseChart = [], attendantsPerformance = [], criteriaScores = [], feedbacks = [], conversionChart = [] } = dashboardData || {};

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Dashboard de Análise
            </Typography>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Card NPS Score */}
                <Grid item xs={12} md={6} lg={3}>
                    <Paper elevation={2} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="h6" color="text.secondary" sx={{ borderBottom: `1px solid ${theme.palette.divider}`, pb: 1, mb: 1 }}>
                            NPS Geral
                        </Typography>
                        <Typography variant="h3" component="div" fontWeight="bold" textAlign="center" color="primary" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {summary?.nps?.score}
                        </Typography>
                    </Paper>
                </Grid>

                {/* Card CSAT Score */}
                <Grid item xs={12} md={6} lg={3}>
                    <Paper elevation={2} sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="h6" color="text.secondary" sx={{ borderBottom: `1px solid ${theme.palette.divider}`, pb: 1, mb: 1 }}>
                            Média de Satisfação
                        </Typography>
                        <Typography variant="h3" component="div" fontWeight="bold" textAlign="center" color="secondary.main" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {summary?.csat?.averageScore}
                        </Typography>
                    </Paper>
                </Grid>

                {/* Promotores */}
                <Grid item xs={12} md={6} lg={3}>
                    <MetricCard
                        title="Promotores (NPS)"
                        value={summary?.nps?.promoters}
                        percentage={summary?.nps?.total > 0 ? ((summary?.nps?.promoters / summary?.nps?.total) * 100).toFixed(1) : 0}
                        borderColor={theme.palette.success.main}
                        onClick={() => handleCardClick('Promotores')}
                    />
                </Grid>

                {/* Detratores */}
                <Grid item xs={12} md={6} lg={3}>
                    <MetricCard
                        title="Detratores (NPS)"
                        value={summary?.nps?.detractors}
                        percentage={summary?.nps?.total > 0 ? ((summary?.nps?.detractors / summary?.nps?.total) * 100).toFixed(1) : 0}
                        borderColor={theme.palette.error.main}
                        onClick={() => handleCardClick('Detratores')}
                    />
                </Grid>

                {/* Satisfeitos (CSAT) */}
                <Grid item xs={12} md={6} lg={3}>
                    <MetricCard
                        title="Satisfeitos (CSAT)"
                        value={summary?.csat?.satisfied}
                        percentage={summary?.csat?.total > 0 ? ((summary?.csat?.satisfied / summary?.csat?.total) * 100).toFixed(1) : 0}
                        borderColor={theme.palette.success.main}
                        onClick={() => handleCardClick('Satisfeitos')}
                    />
                </Grid>

                {/* Insatisfeitos (CSAT) */}
                <Grid item xs={12} md={6} lg={3}>
                    <MetricCard
                        title="Insatisfeitos (CSAT)"
                        value={summary?.csat?.unsatisfied}
                        percentage={summary?.csat?.total > 0 ? ((summary?.csat?.unsatisfied / summary?.csat?.total) * 100).toFixed(1) : 0}
                        borderColor={theme.palette.error.main}
                        onClick={() => handleCardClick('Insatisfeitos')}
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
                        onClick={() => handleCardClick('Cadastros')}
                    >
                        <Typography variant="caption" color="text.secondary">conversão</Typography>
                    </MetricCard>
                </Grid>
                <Grid item xs={12} md={6} lg={3}>
                    <MetricCard
                        title="Ambresários no Mês"
                        value={summary?.ambassadorsMonth}
                        borderColor={theme.palette.secondary.main}
                        onClick={() => handleCardClick('Ambresários no Mês')}
                    />
                </Grid>
                <Grid item xs={12} md={6} lg={3}>
                    <MetricCard
                        title="Cupons Gerados"
                        value={summary?.couponsGenerated}
                        borderColor={theme.palette.primary.main}
                        onClick={() => handleCardClick('Cupons Gerados')}
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
                        onClick={() => handleCardClick('Cupons Utilizados')}
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

                {/* Performance dos Atendentes */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={2} sx={{ p: 2, height: 400, display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="h6" color="text.secondary" sx={{ borderBottom: `1px solid ${theme.palette.divider}`, pb: 1, mb: 1 }}>
                            Performance dos Atendentes
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
                                        <TableCell>Atendente</TableCell>
                                        <TableCell>Respostas</TableCell>
                                        <TableCell>NPS</TableCell>
                                        <TableCell>Média CSAT</TableCell>
                                        <TableCell>Meta NPS</TableCell>
                                        <TableCell>Meta CSAT</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {attendantsPerformance && attendantsPerformance.map((row, index) => (
                                        <TableRow
                                            key={index}
                                            hover
                                            onClick={() => handleAttendantClick(row.id)}
                                            sx={{ cursor: 'pointer' }}
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
                            <Typography variant="body2">1 - 5 de {attendantsPerformance?.length || 0}</Typography>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* NPS por Critério */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={2} sx={{ p: 2, height: 400, display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="h6" color="text.secondary" sx={{ borderBottom: `1px solid ${theme.palette.divider}`, pb: 1, mb: 1 }}>
                            NPS por Critério
                        </Typography>
                        <TableContainer sx={{ flexGrow: 1, overflowY: 'auto' }}>
                            <Table size="small" stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Critério</TableCell>
                                        <TableCell>NPS</TableCell>
                                        <TableCell>Promotores</TableCell>
                                        <TableCell>Neutros</TableCell>
                                        <TableCell>Detratores</TableCell>
                                        <TableCell>Total</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {criteriaScores && criteriaScores.filter(c => c.scoreType === 'NPS').map((row, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{row.criterion}</TableCell>
                                            <TableCell>{row.score}</TableCell>
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

                {/* Satisfação por Critério */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={2} sx={{ p: 2, height: 400, display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="h6" color="text.secondary" sx={{ borderBottom: `1px solid ${theme.palette.divider}`, pb: 1, mb: 1 }}>
                            Satisfação por Critério
                        </Typography>
                        <TableContainer sx={{ flexGrow: 1, overflowY: 'auto' }}>
                            <Table size="small" stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Critério</TableCell>
                                        <TableCell>Média</TableCell>
                                        <TableCell>Satisfeitos</TableCell>
                                        <TableCell>Neutros</TableCell>
                                        <TableCell>Insatisfeitos</TableCell>
                                        <TableCell>Total</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {criteriaScores && criteriaScores.filter(c => c.scoreType === 'CSAT').map((row, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{row.criterion}</TableCell>
                                            <TableCell>{row.average}</TableCell>
                                            <TableCell>{row.satisfied}</TableCell>
                                            <TableCell>{row.neutral}</TableCell>
                                            <TableCell>{row.unsatisfied}</TableCell>
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
        </Container>
    );
};

export default DashboardPage;
