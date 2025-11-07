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
    useTheme
} from '@mui/material';
import { WordCloud } from '@isoterik/react-word-cloud';
import { ResponsiveContainer } from 'recharts';
import dashboardService from '../../services/dashboardService';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import useDebounce from '../../hooks/useDebounce';

const NuvemDePalavrasPage = () => {
    const [words, setWords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));

    const debouncedStartDate = useDebounce(startDate, 500);
    const debouncedEndDate = useDebounce(endDate, 500);

    const theme = useTheme();

    const fetchWordCloudData = useCallback(async () => {
        try {
            setLoading(true);
            const data = await dashboardService.getWordCloudData({ startDate: debouncedStartDate, endDate: debouncedEndDate });
            setWords(Array.isArray(data) ? data : []);
            setError(null);
        } catch (err) {
            setError('Falha ao carregar os dados da nuvem de palavras.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [debouncedStartDate, debouncedEndDate]);

    useEffect(() => {
        fetchWordCloudData();
    }, [fetchWordCloudData]);

    const wordCloudOptions = useMemo(() => ({
        colors: [theme.palette.primary.main, theme.palette.dark.main],
        rotations: 1,
        rotationAngles: [0, 0],
        fontWeight: 'bold',
        padding: 2,
        fontSizes: [20, 120],
    }), [theme]);

    return (
        <Container maxWidth="lg">
            <Box sx={{ my: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Nuvem de Palavras
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                    Visualize as palavras mais frequentes nos feedbacks dos seus clientes.
                </Typography>
            </Box>
            
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                    <TextField
                        label="Data de Início"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        label="Data de Fim"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                    />
                </Grid>
            </Grid>

            <Card>
                <CardContent sx={{ height: 500, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                            <CircularProgress />
                        </Box>
                    ) : error ? (
                        <Typography color="error">{error}</Typography>
                    ) : Array.isArray(words) && words.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <WordCloud 
                                words={words} 
                                options={wordCloudOptions}
                            />
                        </ResponsiveContainer>
                    ) : (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                            <Typography>Nenhuma palavra encontrada para o período selecionado.</Typography>
                        </Box>
                    )}
                </CardContent>
            </Card>
        </Container>
    );
};

export default NuvemDePalavrasPage;