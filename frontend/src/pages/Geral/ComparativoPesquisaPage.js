import React, { useEffect, useState, useMemo } from 'react';
import { 
    Typography, 
    Box, 
    Select, 
    MenuItem, 
    FormControl, 
    InputLabel, 
    Paper, 
    Grid, 
    CircularProgress, 
    OutlinedInput, 
    Chip,
    Container,
    Card,
    CardContent,
    Alert
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import surveyService from '../../services/surveyService';
import { useAuth } from '../../context/AuthContext';
import { FaChartBar } from 'react-icons/fa';
import dashboardService from '../../services/dashboardService';

const ChartContainer = ({ title, icon, children }) => (
    <Card elevation={3} sx={{ p: 3, borderRadius: '16px', height: '100%', boxShadow: '0 4px 20px 0 rgba(0,0,0,0.1)', transition: 'transform 0.3s ease-in-out', '&:hover': { transform: 'translateY(-5px)' } }}>
        <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ fontSize: 24, color: 'primary.main', mr: 1 }}>{icon}</Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{title}</Typography>
            </Box>
            {children}
        </CardContent>
    </Card>
);

const ComparativoPesquisaPage = () => {
    const [surveys, setSurveys] = useState([]);
    const [selectedSurveyIds, setSelectedSurveyIds] = useState([]);
    const [comparisonData, setComparisonData] = useState(null);
    const [loadingSurveys, setLoadingSurveys] = useState(true);
    const [loadingComparison, setLoadingComparison] = useState(false);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        const fetchSurveys = async () => {
            setLoadingSurveys(true);
            try {
                const fetchedSurveys = await surveyService.getSurveysList();
                setSurveys(fetchedSurveys);
            } catch (error) {
                console.error("Error fetching surveys", error);
                setError("Não foi possível carregar a lista de pesquisas.");
            } finally {
                setLoadingSurveys(false);
            }
        };

        fetchSurveys();
    }, []);

    useEffect(() => {
        const fetchComparisonData = async () => {
            if (selectedSurveyIds.length < 2 || !user?.tenantId) {
                setComparisonData(null);
                return;
            }

            setLoadingComparison(true);
            setError(null);
            try {
                const promises = selectedSurveyIds.map(surveyId => 
                    dashboardService.getMainDashboard({ tenantId: user.tenantId, surveyId })
                );
                const results = await Promise.all(promises);
                
                const newComparisonData = selectedSurveyIds.reduce((acc, surveyId, index) => {
                    acc[surveyId] = results[index].overallResults; // Focus on overallResults
                    return acc;
                }, {});

                setComparisonData(newComparisonData);
            } catch (error) {
                console.error("Error fetching comparison data", error);
                setError("Não foi possível carregar os dados para comparação.");
                setComparisonData(null);
            } finally {
                setLoadingComparison(false);
            }
        };
        
        fetchComparisonData();
    }, [selectedSurveyIds, user?.tenantId]);

    const handleSurveyChange = (event) => {
        const { target: { value } } = event;
        setSelectedSurveyIds(typeof value === 'string' ? value.split(',') : value);
    };

    const chartData = useMemo(() => {
        if (!comparisonData) return { nps: [], pnd: [], criteria: [] };

        const nps = selectedSurveyIds.map(id => {
            const survey = surveys.find(s => s.id === id);
            const data = comparisonData[id];
            return {
                name: survey?.title || 'Pesquisa Sem Título',
                NPS: data?.overallNPS?.npsScore ?? 0,
            };
        });

        const pnd = selectedSurveyIds.map(id => {
            const survey = surveys.find(s => s.id === id);
            const data = comparisonData[id];
            return {
                name: survey?.title || 'Pesquisa Sem Título',
                Promotores: data?.overallNPS?.promoters ?? 0,
                Neutros: data?.overallNPS?.neutrals ?? 0,
                Detratores: data?.overallNPS?.detractors ?? 0,
            };
        });

        const criteriaMap = new Map();
        for (const surveyId of selectedSurveyIds) {
            const surveyData = comparisonData[surveyId];
            const survey = surveys.find(s => s.id === surveyId);
            if (surveyData && surveyData.scoresByCriteria) {
                for (const criterion of surveyData.scoresByCriteria) {
                    if (!criteriaMap.has(criterion.criterion)) {
                        criteriaMap.set(criterion.criterion, []);
                    }
                    const score = criterion.scoreType === 'NPS' ? criterion.npsScore : criterion.satisfactionRate;
                    criteriaMap.get(criterion.criterion).push({
                        name: survey?.title || 'Pesquisa Sem Título',
                        score: score || 0,
                    });
                }
            }
        }

        const criteria = Array.from(criteriaMap.entries())
            .map(([criterion, scores]) => ({ criterion, scores }))
            .filter(({ scores }) => scores.length > 0);

        return { nps, pnd, criteria };
    }, [comparisonData, selectedSurveyIds, surveys]);

    const renderContent = () => {
        if (loadingComparison) {
            return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress size={60} /></Box>;
        }

        if (!comparisonData) {
            return (
                <Typography variant="h6" align="center" sx={{ mt: 4, color: 'text.secondary' }}>
                    Selecione duas ou mais pesquisas para iniciar a comparação.
                </Typography>
            );
        }

        return (
            <Grid container spacing={3} mt={1}>
                <Grid item xs={12}>
                    <ChartContainer title="Comparativo de NPS" icon={<FaChartBar />}>
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={chartData.nps}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="NPS" fill="#8884d8" />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </Grid>
                <Grid item xs={12}>
                    <ChartContainer title="Promotores, Neutros e Detratores" icon={<FaChartBar />}>
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={chartData.pnd}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="Promotores" stackId="a" fill="#4CAF50" />
                                <Bar dataKey="Neutros" stackId="a" fill="#FFC107" />
                                <Bar dataKey="Detratores" stackId="a" fill="#F44336" />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </Grid>
                {chartData.criteria.map(({ criterion, scores }) => (
                    <Grid item xs={12} md={6} key={criterion}>
                        <ChartContainer title={`Comparativo - ${criterion}`} icon={<FaChartBar />}>
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart data={scores}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="score" name="Pontuação" fill="#82ca9d" />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </Grid>
                ))}
            </Grid>
        );
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Card sx={{ mb: 3, p: 2 }}>
                <CardContent>
                    <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                        Comparativo de Pesquisas
                    </Typography>
                    {loadingSurveys ? <CircularProgress /> : (
                        <FormControl fullWidth margin="normal">
                            <InputLabel id="select-surveys-label">Selecionar Pesquisas</InputLabel>
                            <Select
                                labelId="select-surveys-label"
                                multiple
                                value={selectedSurveyIds}
                                onChange={handleSurveyChange}
                                input={<OutlinedInput id="select-multiple-chip" label="Selecionar Pesquisas" />}
                                renderValue={(selected) => (
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {selected.map((id) => {
                                            const survey = surveys.find(s => s.id === id);
                                            return <Chip key={id} label={survey?.title || 'Pesquisa Sem Título'} color="primary" variant="outlined" />
                                        })}
                                    </Box>
                                )}
                            >
                                {surveys.map((survey) => (
                                    <MenuItem key={survey.id} value={survey.id}>
                                        {survey.title || 'Pesquisa Sem Título'}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}
                </CardContent>
            </Card>

            {error && <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>}
            
            {renderContent()}
        </Container>
    );
};

export default ComparativoPesquisaPage;