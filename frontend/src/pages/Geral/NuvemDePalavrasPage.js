
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    CircularProgress,
    TextField,
    Grid
} from '@mui/material';
import { WordCloud } from '@isoterik/react-word-cloud';
import dashboardService from '../../services/dashboardService';
import { startOfMonth, endOfMonth, format } from 'date-fns';

const NuvemDePalavrasPage = () => {
    const [words, setWords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
    
    const containerRef = useRef(null);
    const [size, setSize] = useState([500, 500]); // Inicializa com um tamanho padrão

    useEffect(() => {
        const currentContainer = containerRef.current;
        if (currentContainer) {
            // Define o tamanho inicial com base no contêiner
            setSize([currentContainer.offsetWidth, currentContainer.offsetHeight]);

            const observer = new ResizeObserver(() => {
                if (containerRef.current) {
                    setSize([containerRef.current.offsetWidth, containerRef.current.offsetHeight]);
                }
            });
            observer.observe(currentContainer);
            return () => observer.disconnect();
        }
    }, []);

    const fetchWordCloudData = useCallback(async () => {
        try {
            setLoading(true);
            const data = await dashboardService.getWordCloudData({ startDate, endDate });
            setWords(Array.isArray(data) ? data : []);
            setError(null);
        } catch (err) {
            setError('Falha ao carregar os dados da nuvem de palavras.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [startDate, endDate]);

    useEffect(() => {
        fetchWordCloudData();
    }, [fetchWordCloudData]);

    const wordCloudOptions = {
        rotations: 2,
        rotationAngles: [-90, 0],
        fontSizes: [20, 100],
        fontWeight: 'bold',
        padding: 1,
    };

    return (
        <Box>
            <Typography variant="h4" gutterBottom>Nuvem de Palavras</Typography>
            
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
                <CardContent ref={containerRef} sx={{ height: 500 }}>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                            <CircularProgress />
                        </Box>
                    ) : error ? (
                        <Typography color="error">{error}</Typography>
                    ) : words && words.length > 0 && size[0] > 0 && size[1] > 0 ? (
                        <WordCloud 
                            data={words} 
                            options={wordCloudOptions} 
                            size={size} 
                        />
                    ) : (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                            <Typography>Nenhuma palavra encontrada para o período selecionado.</Typography>
                        </Box>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
};

export default NuvemDePalavrasPage;
