import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
    Box,
    Typography,
    Card,
    CardContent,
    CircularProgress,
    TextField,
    Grid,
    Container,
    useTheme,
    Select,
    MenuItem,
    FormControl,
    InputLabel
} from '@mui/material';
import { WordCloud } from '@isoterik/react-word-cloud';
import { ResponsiveContainer } from 'recharts';
import dashboardService from '../../services/dashboardService';
import surveyService from '../../services/surveyService';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import useDebounce from '../../hooks/useDebounce';

const NuvemDePalavrasPage = () => {
    const [words, setWords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [startDate, setStartDate] = useState(startOfMonth(new Date()));
    const [endDate, setEndDate] = useState(endOfMonth(new Date()));
    const [surveys, setSurveys] = useState([]);
    const [selectedSurveyId, setSelectedSurveyId] = useState('');

    const debouncedStartDate = useDebounce(startDate, 500);
    const debouncedEndDate = useDebounce(endDate, 500);

    const theme = useTheme();

    useEffect(() => {
        const fetchSurveys = async () => {
            try {
                const fetchedSurveys = await surveyService.getSurveysList();
                setSurveys(fetchedSurveys);
            } catch (error) {
                console.error("Error fetching surveys", error);
            }
        };

        fetchSurveys();
    }, []);

    const fetchWordCloudData = useCallback(async () => {
        try {
            setLoading(true);
            const params = { 
                startDate: debouncedStartDate ? debouncedStartDate.toISOString() : null, 
                endDate: debouncedEndDate ? debouncedEndDate.toISOString() : null,
                surveyId: selectedSurveyId || null
            };
            const data = await dashboardService.getWordCloudData(params);
            setWords(Array.isArray(data) ? data : []);
            setError(null);
        } catch (err) {
            setError('Falha ao carregar os dados da nuvem de palavras.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [debouncedStartDate, debouncedEndDate, selectedSurveyId]);

    useEffect(() => {
        fetchWordCloudData();
    }, [fetchWordCloudData]);

    const wordCloudOptions = useMemo(() => ({
        colors: [theme.palette.primary.main, theme.palette.secondary.main, theme.palette.dark.main],
        rotations: 3,
        rotationAngles: [-45, 0, 45],
        fontWeight: 'bold',
        padding: 2,
        fontSizes: [20, 120],
        fontFamily: theme.typography.fontFamily,
        scale: 'sqrt',
        spiral: 'archimedean',
        enableOptimizations: true,
    }), [theme]);

    const processedWords = useMemo(() => {
        if (!words || words.length === 0) {
            return [];
        }
        // If all words have the same frequency, the scaling function in the library fails.
        // We add a small differentiator to the most frequent word to prevent this.
        const values = words.map(w => w.value);
        const min = Math.min(...values);
        const max = Math.max(...values);

        if (min === max) {
            const newWords = [...words];
            newWords[0] = { ...newWords[0], value: newWords[0].value + 1 };
            return newWords;
        }
        return words;
    }, [words]);

    const hasWords = Array.isArray(processedWords) && processedWords.length > 0;

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Card sx={{ mb: 3, p: 2 }}>
                <CardContent>
                    <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                        Nuvem de Palavras
                    </Typography>
                    <Typography variant="subtitle1" gutterBottom>
                        Visualize as palavras mais frequentes nos feedbacks dos seus clientes.
                    </Typography>
                    <Grid container spacing={2} sx={{ mt: 2 }}>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                label="Data de Início"
                                type="date"
                                value={startDate ? format(startDate, 'yyyy-MM-dd') : ''}
                                onChange={(e) => {
                                    const date = e.target.value ? new Date(e.target.value + 'T00:00:00') : null;
                                    if (date && !isNaN(date.getTime())) {
                                        setStartDate(date);
                                    }
                                }}
                                InputLabelProps={{ shrink: true }}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                label="Data de Fim"
                                type="date"
                                value={endDate ? format(endDate, 'yyyy-MM-dd') : ''}
                                onChange={(e) => {
                                    const date = e.target.value ? new Date(e.target.value + 'T00:00:00') : null;
                                    if (date && !isNaN(date.getTime())) {
                                        setEndDate(date);
                                    }
                                }}
                                InputLabelProps={{ shrink: true }}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <FormControl fullWidth>
                                <InputLabel id="survey-select-label">Filtrar por Pesquisa</InputLabel>
                                <Select
                                    labelId="survey-select-label"
                                    value={selectedSurveyId}
                                    label="Filtrar por Pesquisa"
                                    onChange={(e) => setSelectedSurveyId(e.target.value)}
                                >
                                    <MenuItem value="">
                                        <em>Todas as Pesquisas</em>
                                    </MenuItem>
                                    {surveys.map((survey) => (
                                        <MenuItem key={survey.id} value={survey.id}>
                                            {survey.title || 'Pesquisa Sem Título'}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <Card>
                <CardContent sx={{ 
                    height: 600, 
                    ...(!hasWords && {
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                    })
                }}>
                    {loading ? (
                        <CircularProgress />
                    ) : error ? (
                        <Typography color="error">{error}</Typography>
                    ) : hasWords ? (
                        <WordCloud 
                            words={processedWords.slice(0, 75)} 
                            options={wordCloudOptions}
                        />
                    ) : (
                        <Typography>Nenhuma palavra encontrada para o período selecionado.</Typography>
                    )}
                </CardContent>
            </Card>
        </Container>
    );
};

export default NuvemDePalavrasPage;