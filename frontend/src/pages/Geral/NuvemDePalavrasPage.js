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
    InputLabel,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    InputAdornment,
    Button
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import WordCloud from 'react-wordcloud';
import { ResponsiveContainer } from 'recharts';
import dashboardService from '../../services/dashboardService';
import surveyService from '../../services/surveyService';
import { startOfMonth, endOfMonth } from 'date-fns';
import { getNowInLocalTimezone, formatDateForDisplay } from '../../utils/dateUtils';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import useDebounce from '../../hooks/useDebounce';

const NuvemDePalavrasPage = () => {
    const [words, setWords] = useState([]);
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [startDate, setStartDate] = useState(startOfMonth(getNowInLocalTimezone()));
    const [endDate, setEndDate] = useState(endOfMonth(getNowInLocalTimezone()));
    const [surveys, setSurveys] = useState([]);
    const [selectedSurveyId, setSelectedSurveyId] = useState('');
    const [wordFilter, setWordFilter] = useState('');
    const [manualFilter, setManualFilter] = useState('');

    const debouncedStartDate = useDebounce(startDate, 500);
    const debouncedEndDate = useDebounce(endDate, 500);
    const debouncedManualFilter = useDebounce(manualFilter, 500);

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

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const params = { 
                startDate: debouncedStartDate ? debouncedStartDate.toISOString() : null, 
                endDate: debouncedEndDate ? debouncedEndDate.toISOString() : null,
                surveyId: selectedSurveyId || null
            };
            const [wordCloudData, feedbackData] = await Promise.all([
                dashboardService.getWordCloudData(params),
                dashboardService.getAllFeedbacks(params)
            ]);

            setWords(Array.isArray(wordCloudData) ? wordCloudData : []);
            setFeedbacks(Array.isArray(feedbackData) ? feedbackData : []);
            setError(null);
        } catch (err) {
            setError('Falha ao carregar os dados.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [debouncedStartDate, debouncedEndDate, selectedSurveyId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const wordCloudOptions = useMemo(() => ({
        colors: [theme.palette.primary.main, theme.palette.secondary.main, theme.palette.dark.main],
        rotations: 1,
        rotationAngles: [0, 0],
        fontWeight: 'bold',
        padding: 2,
        fontSizes: [20, 120],
        fontFamily: theme.typography.fontFamily,
        scale: 'sqrt',
        spiral: 'rectangular',
        deterministic: true,
    }), [theme]);
    
    const callbacks = useMemo(() => ({
        onWordClick: (word) => {
            setWordFilter(word.text);
            setManualFilter(word.text);
        },
    }), []);

    const filteredFeedbacks = useMemo(() => {
        const filterText = (wordFilter || debouncedManualFilter).toLowerCase();
        if (!filterText) return feedbacks;
        return feedbacks.filter(f => f.comment && f.comment.toLowerCase().includes(filterText));
    }, [feedbacks, wordFilter, debouncedManualFilter]);

    const hasWords = Array.isArray(words) && words.length > 0;

    const clearFilter = () => {
        setWordFilter('');
        setManualFilter('');
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Card sx={{ mb: 3, p: 2 }}>
                <CardContent>
                    <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                        Nuvem de Palavras e Feedbacks
                    </Typography>
                    <Typography variant="subtitle1" gutterBottom>
                        Visualize as palavras mais frequentes e os feedbacks dos seus clientes. Clique em uma palavra para filtrar a tabela.
                    </Typography>
                    <Grid container spacing={2} sx={{ mt: 2 }}>
                        <Grid item xs={12} sm={4}>
                            <DatePicker
                                label="Data de Início"
                                value={startDate}
                                onChange={(newValue) => setStartDate(newValue)}
                                inputFormat="dd/MM/yyyy"
                                renderInput={(params) => <TextField {...params} fullWidth />}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <DatePicker
                                label="Data de Fim"
                                value={endDate}
                                onChange={(newValue) => setEndDate(newValue)}
                                inputFormat="dd/MM/yyyy"
                                renderInput={(params) => <TextField {...params} fullWidth />}
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
                            words={words.slice(0, 75)} 
                            options={wordCloudOptions}
                            callbacks={callbacks}
                        />
                    ) : (
                        <Typography>Nenhuma palavra encontrada para o período selecionado.</Typography>
                    )}
                </CardContent>
            </Card>

            <Paper sx={{ mt: 3, p: 2 }}>
                <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
                    <Typography variant="h6">Tabela de Feedbacks</Typography>
                    <Box>
                        <TextField 
                            variant="outlined"
                            size="small"
                            placeholder="Filtrar comentários..."
                            value={manualFilter}
                            onChange={(e) => {
                                setManualFilter(e.target.value);
                                setWordFilter(''); // clear word cloud selection when typing manually
                            }}
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>
                            }}
                        />
                        <Button onClick={clearFilter} sx={{ml: 1}}>Limpar</Button>
                    </Box>
                </Box>
                <TableContainer component={Paper}>
                    <Table stickyHeader size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Data</TableCell>
                                <TableCell>Cliente</TableCell>
                                <TableCell>Comentário</TableCell>
                                <TableCell>NPS</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center"><CircularProgress /></TableCell>
                                </TableRow>
                            ) : filteredFeedbacks.map((fb, index) => (
                                <TableRow key={index}>
                                    <TableCell>{fb.date ? formatDateForDisplay(fb.date, 'dd/MM/yy HH:mm') : 'N/A'}</TableCell>
                                    <TableCell>{fb.client}</TableCell>
                                    <TableCell>{fb.comment}</TableCell>
                                    <TableCell>{fb.rating}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Container>
    );
};

export default NuvemDePalavrasPage;