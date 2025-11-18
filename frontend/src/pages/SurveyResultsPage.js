import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import surveyService from '../services/surveyService';
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
    CardHeader,
    List, 
    ListItem, 
    ListItemText, 
    useTheme,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
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
    PieChart, 
    Pie, 
    Cell, 
    RadarChart, 
    PolarGrid, 
    PolarAngleAxis, 
    PolarRadiusAxis, 
    Radar 
} from 'recharts';

import PollIcon from '@mui/icons-material/Poll';
import ThumbsUpDownIcon from '@mui/icons-material/ThumbsUpDown';
import StarIcon from '@mui/icons-material/Star';
import PeopleIcon from '@mui/icons-material/People';
import CakeIcon from '@mui/icons-material/Cake';
import WcIcon from '@mui/icons-material/Wc';
import WordCloudComponent from '../components/results/WordCloud';
import RadarChartComponent from '../components/results/RadarChart';
import QuestionResult from '../components/results/QuestionResult';

const MetricCard = ({ title, value, icon, color }) => (
    <Paper elevation={3} sx={{ p: 2, display: 'flex', alignItems: 'center', height: '100%' }}>
        <Box sx={{ mr: 2, color: color || 'text.secondary' }}>{icon}</Box>
        <Box>
            <Typography variant="h4" component="div" fontWeight="bold">{value}</Typography>
            <Typography variant="body1" color="text.secondary">{title}</Typography>
        </Box>
    </Paper>
);

const SurveyResultsPage = () => {
    const { id } = useParams();
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const theme = useTheme();

    const chartColors = [
        theme.palette.primary.main,
        theme.palette.success.main,
        theme.palette.info.main,
        theme.palette.warning.main,
        theme.palette.secondary.main,
        theme.palette.error.main,
    ];

    useEffect(() => {
        const fetchResults = async () => {
            try {
                setLoading(true);
                const data = await surveyService.getSurveyResults(id);
                setResults(data);
            } catch (err) {
                setError(err.message || 'Falha ao carregar os resultados da pesquisa.');
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [id]);

    if (loading) {
        return (
            <Container sx={{ mt: 8, textAlign: 'center' }}>
                <CircularProgress />
                <Typography>Carregando resultados...</Typography>
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

    if (!results) {
        return (
            <Container sx={{ mt: 8, textAlign: 'center' }}>
                <Typography>Nenhum resultado encontrado para esta pesquisa.</Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={2} sx={{ p: { xs: 2, md: 4 }, mb: 4, backgroundColor: theme.palette.primary.main, color: 'white' }}>
                <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">{results.surveyTitle}</Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>{results.surveyDescription}</Typography>
            </Paper>

            {/* Overall Metrics */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={4}>
                    <MetricCard title="Total de Respostas" value={results.totalResponsesCount} icon={<PollIcon fontSize="large" />} />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <MetricCard title="NPS Geral" value={results.overallNPS?.npsScore || 0} icon={<ThumbsUpDownIcon fontSize="large" />} color={theme.palette.primary.main} />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <MetricCard title="Média de Satisfação" value={results.overallCSAT?.averageScore || 0} icon={<StarIcon fontSize="large" />} color={theme.palette.secondary.main} />
                </Grid>
            </Grid>

            {/* Scores by Criteria */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {results.scoresByCriteria?.filter(c => c.scoreType === 'NPS').length > 0 && (
                    <Grid item xs={12} md={6}>
                        <Card elevation={3}>
                            <CardHeader title="NPS por Critério" avatar={<ThumbsUpDownIcon />} />
                            <CardContent>
                                <TableContainer>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Critério</TableCell>
                                                <TableCell align="right">NPS</TableCell>
                                                <TableCell align="right">Respostas</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {results.scoresByCriteria.filter(c => c.scoreType === 'NPS').map((row) => (
                                                <TableRow key={row.criterion}>
                                                    <TableCell>{row.criterion}</TableCell>
                                                    <TableCell align="right">{row.npsScore}</TableCell>
                                                    <TableCell align="right">{row.total}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </CardContent>
                        </Card>
                    </Grid>
                )}
                {results.scoresByCriteria?.filter(c => c.scoreType === 'CSAT').length > 0 && (
                    <Grid item xs={12} md={6}>
                        <Card elevation={3}>
                            <CardHeader title="Satisfação por Critério" avatar={<StarIcon />} />
                            <CardContent>
                                <TableContainer>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Critério</TableCell>
                                                <TableCell align="right">Média</TableCell>
                                                <TableCell align="right">Respostas</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {results.scoresByCriteria.filter(c => c.scoreType === 'CSAT').map((row) => (
                                                <TableRow key={row.criterion}>
                                                    <TableCell>{row.criterion}</TableCell>
                                                    <TableCell align="right">{row.averageScore}</TableCell>
                                                    <TableCell align="right">{row.total}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </CardContent>
                        </Card>
                    </Grid>
                )}
            </Grid>
            
            {/* Demographics */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {results.demographics?.ageDistribution && (
                    <Grid item xs={12} md={6}>
                        <Card elevation={3}>
                            <CardHeader title="Distribuição por Idade" avatar={<CakeIcon />} />
                            <CardContent sx={{ height: 400 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={Object.entries(results.demographics.ageDistribution).map(([name, value]) => ({ name, value }))}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="value" fill={theme.palette.info.main} name="Clientes" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </Grid>
                )}
                {results.demographics?.genderDistribution && (
                     <Grid item xs={12} md={6}>
                        <Card elevation={3}>
                            <CardHeader title="Distribuição por Gênero" avatar={<WcIcon />} />
                            <CardContent sx={{ height: 400 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={Object.entries(results.demographics.genderDistribution).map(([name, value]) => ({ name, value }))} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} label>
                                            {Object.entries(results.demographics.genderDistribution).map(([name, value], index) => (
                                                <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </Grid>
                )}
            </Grid>

            {/* Word Cloud & Radar Chart */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={6}>
                    <WordCloudComponent data={results.wordCloudData} />
                </Grid>
                <Grid item xs={12} md={6}>
                    <RadarChartComponent data={results.radarChartData} />
                </Grid>
            </Grid>

            {/* --- Análise por Pergunta --- */}
            <Typography variant="h4" component="h2" gutterBottom sx={{ mt: 4, mb: 2 }}>
                Análise por Pergunta
            </Typography>
            <Grid container spacing={3}>
                {results.questionsResults && results.questionsResults.map((question) => (
                    <Grid item xs={12} md={6} lg={4} key={question.id}>
                        <QuestionResult question={question} chartColors={chartColors} />
                    </Grid>
                ))}
            </Grid>
            
        </Container>
    );
};

export default SurveyResultsPage;