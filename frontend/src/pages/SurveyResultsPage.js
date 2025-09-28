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
    List, 
    ListItem, 
    ListItemText, 
    useTheme 
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
        console.log('Survey ID from useParams:', id);
        const fetchResults = async () => {
            try {
                console.log('Calling resultService.getSurveyResults with ID:', id);
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
                        {qr.answers && qr.answers.length > 0 ? (
                            qr.answers.map((answer, idx) => (
                                <ListItem key={idx} divider>
                                    <ListItemText primary={answer} />
                                </ListItem>
                            ))
                        ) : <Typography variant="body2">Nenhuma resposta de texto.</Typography>}
                    </List>
                );
            case 'rating_0_10':
            case 'rating_1_5':
                const ratingChartData = qr.allRatings
                    ? Object.entries(qr.allRatings.reduce((acc, rating) => {
                        acc[rating] = (acc[rating] || 0) + 1;
                        return acc;
                      }, {})).map(([value, count]) => ({ value: parseInt(value), count }))
                    : [];
                
                let promoters = 0;
                let neutrals = 0;
                let detractors = 0;

                if(qr.questionType === 'rating_0_10'){
                    qr.allRatings.forEach(rating => {
                        if (rating >= 9) promoters++;
                        else if (rating >= 7) neutrals++;
                        else detractors++;
                    });
                } else if (qr.questionType === 'rating_1_5') {
                    qr.allRatings.forEach(rating => {
                        if (rating === 5) promoters++;
                        else if (rating === 4) neutrals++;
                        else detractors++;
                    });
                }


                return (
                    <Box>
                        <Typography variant="h6">Avaliação Média: {qr.averageRating}</Typography>
                        {qr.questionType === 'rating_0_10' && <Typography variant="h6" sx={{ mt: 1 }}>NPS: {qr.nps}</Typography>}
                        <Grid container spacing={1} sx={{ mt: 2, mb: 2 }}>
                            <Grid item xs={4}><Typography variant="body2" color="success.main">Promotores: {promoters}</Typography></Grid>
                            <Grid item xs={4}><Typography variant="body2" color="warning.main">Neutros: {neutrals}</Typography></Grid>
                            <Grid item xs={4}><Typography variant="body2" color="error.main">Detratores: {detractors}</Typography></Grid>
                        </Grid>
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
                const pieData = Object.entries(qr.optionsCount).map(([name, value], idx) => ({ name, value, fill: chartColors[idx % chartColors.length] }));
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
                return <Typography>Tipo de questão não suportado para visualização.</Typography>;
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
                <Typography variant="h3" component="h1" gutterBottom>{results.surveyTitle}</Typography>
                <Typography variant="h6" color="text.secondary">{results.surveyDescription}</Typography>
                <Grid container spacing={2} sx={{ mt: 2 }}>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="body1"><strong>Total de Respostas:</strong> {results.totalResponsesCount}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Typography variant="body1"><strong>Data de Criação:</strong> {new Date(results.surveyCreatedAt).toLocaleDateString()}</Typography>
                    </Grid>
                </Grid>
            </Paper>

            {/* Cards de NPS Geral */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={3}>
                    <Card elevation={2}>
                        <CardContent>
                            <Typography variant="h6" color="primary" gutterBottom>NPS Geral</Typography>
                            <Typography variant="h4" component="div" fontWeight="bold">{results.overallNPS}</Typography>
                            <Typography variant="body2" color="text.secondary">Baseado em {results.npsTotalResponses} respostas</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card elevation={2}>
                        <CardContent>
                            <Typography variant="h6" color="success.main" gutterBottom>Promotores</Typography>
                            <Typography variant="h4" component="div" fontWeight="bold">{results.npsPromoters}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card elevation={2}>
                        <CardContent>
                            <Typography variant="h6" color="warning.main" gutterBottom>Neutros</Typography>
                            <Typography variant="h4" component="div" fontWeight="bold">{results.npsNeutrals}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Card elevation={2}>
                        <CardContent>
                            <Typography variant="h6" color="error.main" gutterBottom>Detratores</Typography>
                            <Typography variant="h4" component="div" fontWeight="bold">{results.npsDetractors}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* NPS por Critério */}
            {results.npsByCriterio && results.npsByCriterio.length > 0 && (
                <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
                    <Typography variant="h5" gutterBottom>NPS por Critério</Typography>
                    <Grid container spacing={2}>
                        {results.npsByCriterio.map((npsCrit, index) => (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                                <Card elevation={1}>
                                    <CardContent>
                                        <Typography variant="h6" color="primary">{npsCrit.criterio}</Typography>
                                        <Typography variant="h5" fontWeight="bold">{npsCrit.nps}</Typography>
                                        <Typography variant="body2" color="text.secondary">({npsCrit.promoters} Promotores, {npsCrit.neutrals} Neutros, {npsCrit.detractors} Detratores)</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Paper>
            )}

            {/* Gráfico de Radar (Aranha) */}
            {results.radarChartData && results.radarChartData.length > 0 && (
                <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
                    <Typography variant="h5" gutterBottom>Avaliação por Critério/Pergunta (Radar)</Typography>
                    <ResponsiveContainer width="100%" height={400}>
                        <RadarChart outerRadius={150} data={results.radarChartData}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="name" />
                            <PolarRadiusAxis angle={90} domain={[0, 5]} /> {/* Ajustar domain conforme a escala de rating */}
                            <Radar name="Média de Avaliação" dataKey="averageRating" stroke={theme.palette.primary.main} fill={theme.palette.primary.light} fillOpacity={0.6} />
                            <Tooltip />
                            <Legend />
                        </RadarChart>
                    </ResponsiveContainer>
                </Paper>
            )}

            {/* Distribuição Demográfica (Idade) */}
            {results.demographics && results.demographics.ageDistribution && Object.keys(results.demographics.ageDistribution).length > 0 && (
                <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
                    <Typography variant="h5" gutterBottom>Distribuição Demográfica (Idade)</Typography>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={Object.entries(results.demographics.ageDistribution).map(([ageGroup, count]) => ({ ageGroup, count }))}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="ageGroup" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="count" fill={theme.palette.info.main} />
                        </BarChart>
                    </ResponsiveContainer>
                </Paper>
            )}

            {/* Resultados por Pergunta */}
            <Typography variant="h4" component="h2" gutterBottom sx={{ mt: 4, mb: 2 }}>
                Detalhes por Pergunta
            </Typography>
            <Grid container spacing={4}>
                {results.questionsResults && results.questionsResults.map((qr, index) => (
                    <Grid item xs={12} md={6} key={qr.questionId}>
                        <Card elevation={2} sx={{ height: '100%' }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>{index + 1}. {qr.questionText}</Typography>
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