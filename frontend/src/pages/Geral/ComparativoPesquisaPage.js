import React, { useEffect, useState } from 'react';
import { Typography, Box, Select, MenuItem, FormControl, InputLabel, Paper, Grid, CircularProgress, OutlinedInput } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import surveyService from '../../services/surveyService';
import resultService from '../../services/resultService';
import { useAuth } from '../../context/AuthContext';

const ComparativoPesquisaPage = () => {
    const [surveys, setSurveys] = useState([]);
    const [selectedSurveyIds, setSelectedSurveyIds] = useState([]);
    const [comparisonData, setComparisonData] = useState({});
    const [loading, setLoading] = useState(true);
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
                setLoading(false);
            }
        };

        fetchSurveys();
    }, []);

    useEffect(() => {
        const fetchComparisonData = async () => {
            if (selectedSurveyIds.length > 0 && user && user.tenantId) {
                setLoadingComparison(true);
                const newComparisonData = {};
                for (const surveyId of selectedSurveyIds) {
                    try {
                        const response = await resultService.getMainDashboard({ tenantId: user.tenantId, surveyId });
                        newComparisonData[surveyId] = response;
                    } catch (error) {
                        console.error(`Error fetching data for survey ${surveyId}`, error);
                    }
                }
                setComparisonData(newComparisonData);
                setLoadingComparison(false);
            }
        };

        fetchComparisonData();
    }, [selectedSurveyIds, user]);

    const handleSurveyChange = (event) => {
        setSelectedSurveyIds(event.target.value);
    };

    if (loading) {
        return <CircularProgress />;
    }

    const npsComparisonData = selectedSurveyIds.map(id => {
        const survey = surveys.find(s => s.id === id);
        const data = comparisonData[id];
        return {
            name: survey ? survey.name : `Pesquisa ${id}`,
            NPS: data ? data.nps.score : 0,
        };
    });

    const promoterNeutroDetractorComparisonData = selectedSurveyIds.map(id => {
        const survey = surveys.find(s => s.id === id);
        const data = comparisonData[id];
        return {
            name: survey ? survey.name : `Pesquisa ${id}`,
            Promotores: data ? data.nps.promoters : 0,
            Neutros: data ? data.nps.passives : 0,
            Detratores: data ? data.nps.detractors : 0,
        };
    });

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Comparativo de Pesquisas
            </Typography>
            <FormControl fullWidth margin="normal">
                <InputLabel id="select-surveys-label">Selecionar Pesquisas</InputLabel>
                <Select
                    labelId="select-surveys-label"
                    multiple
                    value={selectedSurveyIds}
                    onChange={handleSurveyChange}
                    input={<OutlinedInput label="Selecionar Pesquisas" />}
                    renderValue={(selected) => selected.map(id => surveys.find(s => s.id === id)?.name || `Pesquisa ${id}`).join(', ')}
                >
                    {surveys.map((survey) => (
                        <MenuItem key={survey.id} value={survey.id}>
                            {survey.name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            {loadingComparison ? (
                <CircularProgress />
            ) : selectedSurveyIds.length > 0 && npsComparisonData.length > 0 ? (
                <Grid container spacing={3} mt={3}>
                    <Grid item xs={12}>
                        <Paper elevation={3} sx={{ p: 2 }}>
                            <Typography variant="h6" align="center">Comparativo de NPS</Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart
                                    data={npsComparisonData}
                                    margin={{
                                        top: 5, right: 30, left: 20, bottom: 5,
                                    }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="NPS" fill="#8884d8" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Paper>
                    </Grid>
                    <Grid item xs={12}>
                        <Paper elevation={3} sx={{ p: 2 }}>
                            <Typography variant="h6" align="center">Promotores, Neutros e Detratores</Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart
                                    data={promoterNeutroDetractorComparisonData}
                                    margin={{
                                        top: 5, right: 30, left: 20, bottom: 5,
                                    }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="Promotores" fill="#4CAF50" />
                                    <Bar dataKey="Neutros" fill="#FFC107" />
                                    <Bar dataKey="Detratores" fill="#F44336" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Paper>
                    </Grid>
                </Grid>
            ) : (
                <Typography variant="body1" mt={3}>Selecione pesquisas para comparar.</Typography>
            )}
        </Box>
    );
};

export default ComparativoPesquisaPage;