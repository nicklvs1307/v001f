import React, { useEffect, useState, useCallback } from 'react';
import { Typography, Box, Select, MenuItem, FormControl, InputLabel, Paper, Grid, CircularProgress, OutlinedInput, Chip } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import surveyService from '../../services/surveyService';
import resultService from '../../services/resultService';
import { useAuth } from '../../context/AuthContext';
import { FaChartBar } from 'react-icons/fa';

const ChartContainer = ({ title, icon, children }) => (
    <Paper elevation={3} sx={{ p: 3, borderRadius: '16px', height: '100%', boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box sx={{ fontSize: 24, color: 'primary.main', mr: 1 }}>{icon}</Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{title}</Typography>
        </Box>
        {children}
    </Paper>
);

const ComparativoPesquisaPage = () => {
    const [surveys, setSurveys] = useState([]);
    const [selectedSurveyIds, setSelectedSurveyIds] = useState([]);
    const [comparisonData, setComparisonData] = useState(null);
    const [loadingSurveys, setLoadingSurveys] = useState(true);
    const [loadingComparison, setLoadingComparison] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        const fetchSurveys = async () => {
            try {
                const fetchedSurveys = await surveyService.getSurveysList();
                setSurveys(fetchedSurveys);
            } catch (error) {
                console.error("Error fetching surveys", error);
            } finally {
                setLoadingSurveys(false);
            }
        };

        fetchSurveys();
    }, []);

    const fetchComparisonData = useCallback(async () => {
        if (selectedSurveyIds.length === 0 || !user?.tenantId) {
            setComparisonData(null);
            return;
        }

        setLoadingComparison(true);
        try {
            const promises = selectedSurveyIds.map(surveyId => 
                resultService.getMainDashboard({ tenantId: user.tenantId, surveyId })
            );
            const results = await Promise.all(promises);
            
            const newComparisonData = selectedSurveyIds.reduce((acc, surveyId, index) => {
                acc[surveyId] = results[index];
                return acc;
            }, {});

            setComparisonData(newComparisonData);
        } catch (error) {
            console.error("Error fetching comparison data", error);
            setComparisonData(null);
        } finally {
            setLoadingComparison(false);
        }
    }, [selectedSurveyIds, user?.tenantId]);

    useEffect(() => {
        fetchComparisonData();
    }, [fetchComparisonData]);

    const handleSurveyChange = (event) => {
        const { target: { value } } = event;
        setSelectedSurveyIds(typeof value === 'string' ? value.split(',') : value);
    };

    const getChartData = () => {
        if (!comparisonData) return { nps: [], pnd: [] };

        const nps = selectedSurveyIds.map(id => {
            const survey = surveys.find(s => s.id === id);
            const data = comparisonData[id];
            return {
                name: survey ? survey.name : `Pesquisa ${id}`,
                NPS: data?.nps?.score ?? 0,
            };
        });

        const pnd = selectedSurveyIds.map(id => {
            const survey = surveys.find(s => s.id === id);
            const data = comparisonData[id];
            return {
                name: survey ? survey.name : `Pesquisa ${id}`,
                Promotores: data?.nps?.promoters ?? 0,
                Neutros: data?.nps?.passives ?? 0,
                Detratores: data?.nps?.detractors ?? 0,
            };
        });

        return { nps, pnd };
    };

    const { nps: npsComparisonData, pnd: promoterNeutroDetractorComparisonData } = getChartData();

    return (
        <Box sx={{ p: 3, backgroundColor: '#f4f6f8', minHeight: '100vh' }}>
            <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: '16px' }}>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
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
                                    {selected.map((id) => (
                                        <Chip key={id} label={surveys.find(s => s.id === id)?.name || `ID: ${id}`} />
                                    ))}
                                </Box>
                            )}
                        >
                            {surveys.map((survey) => (
                                <MenuItem key={survey.id} value={survey.id}>
                                    {survey.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                )}
            </Paper>

            {loadingComparison ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress size={60} /></Box>
            ) : !comparisonData ? (
                <Typography variant="h6" align="center" sx={{ mt: 4, color: 'text.secondary' }}>
                    Selecione duas ou mais pesquisas para iniciar a comparação.
                </Typography>
            ) : (
                <Grid container spacing={3} mt={1}>
                    <Grid item xs={12}>
                        <ChartContainer title="Comparativo de NPS" icon={<FaChartBar />}>
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart data={npsComparisonData}>
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
                                <BarChart data={promoterNeutroDetractorComparisonData}>
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
                </Grid>
            )}
        </Box>
    );
};

export default ComparativoPesquisaPage;