import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import resultService from '../services/resultService';
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
import { WordCloud } from '@isoterik/react-word-cloud';
import PollIcon from '@mui/icons-material/Poll';
import ThumbsUpDownIcon from '@mui/icons-material/ThumbsUpDown';
import StarIcon from '@mui/icons-material/Star';
import PeopleIcon from '@mui/icons-material/People';
import CakeIcon from '@mui/icons-material/Cake';
import WcIcon from '@mui/icons-material/Wc';

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

    const wordCloudOptions = {
        colors: [theme.palette.primary.main, theme.palette.secondary.main, theme.palette.info.main, theme.palette.success.main],
        fontSizes: [20, 60],
        enableTooltip: true,
        rotationAngles: [0, 0],
        padding: 1,
    };

    useEffect(() => {
        const fetchResults = async () => {
            try {
                setLoading(true);
                const data = await resultService.getSurveyResults(id);
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

    const renderQuestionResult = (qr, index) => {
        switch (qr.questionType) {
            case 'free_text':
                return (
                    <List dense>
                        {qr.results.responses && qr.results.responses.length > 0 ? (
                            qr.results.responses.map((answer, idx) => (
                                <ListItem key={idx} divider>
                                    <ListItemText primary={answer.text} secondary={`Respondido por: ${answer.clientName || 'Anônimo'}`} />
                                </ListItem>
                            ))
                        ) : <Typography variant="body2">Nenhuma resposta de texto.</Typography>}
                    </List>
                );
            case 'rating_0_10':
            case 'rating_1_5':
                const safeRatings = Array.isArray(qr.results.allRatings) ? qr.results.allRatings : [];
                const ratingCounts = safeRatings.reduce((acc, rating) => {
                    const key = String(rating);
                    acc[key] = (acc[key] || 0) + 1;
                    return acc;
                }, {});
                const ratingChartData = Object.entries(ratingCounts).map(([value, count]) => ({
                    value: value,
                    count: Number(count) || 0,
                }));

                return (
                    <Box>
                        <Typography variant="h6">Avaliação Média: {qr.results.averageRating}</Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={ratingChartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="value" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="count" fill={theme.palette.primary.main} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Box>
                );
            case 'multiple_choice':
            case 'checkbox':
                const pieData = qr.results ? Object.entries(qr.results).map(([name, value], idx) => ({ name, value: Number(value) || 0, fill: chartColors[idx % chartColors.length] })) : [];
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                );
            default:
                return (
                    <Box>
                        <Typography color="error">Tipo de questão não suportado para visualização: {qr.questionType}</Typography>
                        <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                            Dados recebidos:
                            {JSON.stringify(qr, null, 2)}
                        </Typography>
                    </Box>
                );
        }
    };

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

            {/* Word Cloud */}
            {results.wordCloudData && results.wordCloudData.length > 0 && (
                <Card elevation={3} sx={{ mb: 4 }}>
                    <CardHeader title="Nuvem de Palavras" avatar={<WcIcon />} />
                    <CardContent>
                        <Box sx={{ height: 400, width: '100%' }}>
                            <WordCloud data={results.wordCloudData} options={wordCloudOptions} />
                        </Box>
                    </CardContent>
                </Card>
            )}

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

            {/* Detailed Question Results */}
            <Typography variant="h4" component="h2" gutterBottom sx={{ mt: 4, mb: 2 }}>
                Detalhes por Pergunta
            </Typography>
            <Grid container spacing={4}>
                {results.questionsResults && results.questionsResults.map((qr, index) => (
                    <Grid item xs={12} md={6} key={qr.questionId}>
                        <Card elevation={2} sx={{ height: '100%' }}>
                            <CardHeader title={`${index + 1}. ${qr.questionText}`} />
                            <CardContent>
                                {renderQuestionResult(qr, index)}
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
};

export default SurveyResultsPage;