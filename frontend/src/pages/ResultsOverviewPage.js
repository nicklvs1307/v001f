import React, { useState, useEffect, useContext } from 'react';
import {
    Container,
    Box,
    Typography,
    CircularProgress,
    Alert,
    Paper,
    Grid,
    Card,
    CardContent,
    List,
    ListItem,
    ListItemText,
    useTheme,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from '@mui/material';
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
    Line,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import resultService from '../services/resultService';
import AuthContext from '../context/AuthContext';
import NpsTrendChart from '../components/results/NpsTrendChart';
import CriteriaRadarChart from '../components/results/CriteriaRadarChart';
import WordCloudChart from '../components/results/WordCloudChart';

const ResultsOverviewPage = () => {
    const [overallResults, setOverallResults] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const theme = useTheme();
    const { user } = useContext(AuthContext);
    const tenantId = user?.role === 'Super Admin' ? null : user?.tenantId;

    useEffect(() => {
        console.log('ResultsOverviewPage - tenantId:', tenantId); // Log para depuração
        const fetchOverallResults = async () => {
            try {
                setLoading(true);
                setError('');
                const data = await resultService.getOverallResults(tenantId);
                console.log('ResultsOverviewPage - overallResults data:', data); // Log para depuração
                setOverallResults(data);
            } catch (err) {
                setError(err.message || 'Falha ao carregar a visão geral dos resultados.');
            } finally {
                setLoading(false);
            }
        };

        if (tenantId !== undefined) {
            fetchOverallResults();
        }
    }, [tenantId]);

    if (loading) {
        return (
            <Container sx={{ mt: 8, textAlign: 'center' }}>
                <CircularProgress />
                <Typography>Carregando visão geral dos resultados...</Typography>
            </Container>
        );
    }

    if (error) {
        return (
            <Container sx={{ mt: 8, textAlign: 'center' }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    if (!overallResults) {
        return (
            <Container sx={{ mt: 8, textAlign: 'center' }}>
                <Typography>Nenhum resultado geral encontrado.</Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Visão Geral dos Resultados
            </Typography>

            {/* Cards de NPS Geral */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={3}>
                    <Card elevation={2}>
                        <CardContent>
                            <Typography variant="h6" color="primary" gutterBottom>NPS Geral</Typography>
                            <Typography variant="h4" component="div" fontWeight="bold">{overallResults?.overallNPS}</Typography>
                            <Typography variant="body2" color="text.secondary">Baseado em {overallResults?.npsTotalResponses} respostas</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card elevation={2}>
                        <CardContent>
                            <Typography variant="h6" color="success.main" gutterBottom>Promotores</Typography>
                            <Typography variant="h4" component="div" fontWeight="bold">{overallResults?.npsPromoters}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card elevation={2}>
                        <CardContent>
                            <Typography variant="h6" color="warning.main" gutterBottom>Neutros</Typography>
                            <Typography variant="h4" component="div" fontWeight="bold">{overallResults?.npsNeutrals}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card elevation={2}>
                        <CardContent>
                            <Typography variant="h6" color="error.main" gutterBottom>Detratores</Typography>
                            <Typography variant="h4" component="div" fontWeight="bold">{overallResults?.npsDetractors}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Gráfico de Tendência de NPS */}
            <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
                <NpsTrendChart tenantId={tenantId} />
            </Paper>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Gráfico de Radar (Aranha) - NPS por Critério */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
                        <Typography variant="h6" gutterBottom>NPS por Critério</Typography>
                        {overallResults.npsByCriterio && overallResults.npsByCriterio.length > 0 ? (
                            <CriteriaRadarChart data={overallResults.npsByCriterio} />
                        ) : (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '90%' }}>
                                <Typography>Dados de NPS por critério indisponíveis.</Typography>
                            </Box>
                        )}
                    </Paper>
                </Grid>

                {/* Nuvem de Palavras */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
                        <Typography variant="h6" gutterBottom>Nuvem de Palavras</Typography>
                        <WordCloudChart tenantId={tenantId} />
                    </Paper>
                </Grid>
            </Grid>

            {/* NPS por Critério (Agregado) - Tabela */}
            {overallResults.npsByCriterio && overallResults.npsByCriterio.length > 0 && (
                <Paper elevation={3} sx={{ p: 3, my: 4 }}>
                    <Typography variant="h5" gutterBottom>Detalhes por Critério</Typography>
                    <Grid container spacing={2}>
                        {overallResults.npsByCriterio.map((npsCrit, index) => (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                                <Card elevation={1}>
                                    <CardContent>
                                        <Typography variant="h6" color="primary">{npsCrit.criterio}</Typography>
                                        <Typography variant="h5" fontWeight="bold">{npsCrit.nps}</Typography>
                                        <Typography variant="body2" color="text.secondary">({npsCrit.promoters}P, {npsCrit.neutrals}N, {npsCrit.detractors}D)</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Paper>
            )}

            <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Distribuição Demográfica (Idade) */}
                {overallResults.demographics && overallResults.demographics.ageDistribution && Object.keys(overallResults.demographics.ageDistribution).length > 0 && (
                    <Grid item xs={12} md={6}>
                        <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
                            <Typography variant="h5" gutterBottom>Distribuição por Idade</Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={Object.entries(overallResults.demographics.ageDistribution).map(([ageGroup, count]) => ({ ageGroup, count }))}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="ageGroup" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="count" fill={theme.palette.info.main} />
                                </BarChart>
                            </ResponsiveContainer>
                        </Paper>
                    </Grid>
                )}

                {/* Distribuição por Gênero */}
                {overallResults.demographics && overallResults.demographics.genderDistribution && Object.keys(overallResults.demographics.genderDistribution).length > 0 && (
                    <Grid item xs={12} md={6}>
                        <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
                            <Typography variant="h6" gutterBottom>Distribuição por Gênero</Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={Object.entries(overallResults.demographics.genderDistribution).map(([name, value]) => ({ name, value }))}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {Object.entries(overallResults.demographics.genderDistribution).map(([name, value], index) => (
                                            <Cell key={`cell-${index}`} fill={theme.palette.gender[name.toLowerCase()] || theme.palette.grey[500]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </Paper>
                    </Grid>
                )}
            </Grid>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Top 5 Atendentes */}
                {overallResults.topAttendants && overallResults.topAttendants.length > 0 && (
                    <Grid item xs={12} md={6}>
                        <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
                            <Typography variant="h6" gutterBottom>Top 5 Atendentes (por Respostas)</Typography>
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Atendente</TableCell>
                                            <TableCell align="right">Respostas</TableCell>
                                            <TableCell align="right">NPS</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {overallResults.topAttendants.map((attendant, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{attendant.name}</TableCell>
                                                <TableCell align="right">{attendant.responses}</TableCell>
                                                <TableCell align="right">{attendant.currentNPS}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    </Grid>
                )}

                {/* Bottom 5 Atendentes */}
                {overallResults.bottomAttendants && overallResults.bottomAttendants.length > 0 && (
                    <Grid item xs={12} md={6}>
                        <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
                            <Typography variant="h6" gutterBottom>Bottom 5 Atendentes (por Respostas)</Typography>
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Atendente</TableCell>
                                            <TableCell align="right">Respostas</TableCell>
                                            <TableCell align="right">NPS</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {overallResults.bottomAttendants.map((attendant, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{attendant.name}</TableCell>
                                                <TableCell align="right">{attendant.responses}</TableCell>
                                                <TableCell align="right">{attendant.currentNPS}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    </Grid>
                )}
            </Grid>

            {/* Tendência de Respostas ao Longo do Tempo */}
            {overallResults.responseChartData && overallResults.responseChartData.length > 0 && (
                <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
                    <Typography variant="h5" gutterBottom>Tendência de Respostas (Últimos 7 Dias)</Typography>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={overallResults.responseChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="Respostas" stroke={theme.palette.primary.main} activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </Paper>
            )}

        </Container>
    );
};

export default ResultsOverviewPage;