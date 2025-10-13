import React, { useState, useEffect } from 'react';
import { WordCloud } from '@isoterik/react-word-cloud';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import resultService from '../../services/resultService';

const WordCloudChart = ({ tenantId }) => {
    const [words, setWords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const wordData = await resultService.getWordCloudData(tenantId);
                if (wordData.length === 0) {
                    setError('Não há dados suficientes para gerar a nuvem de palavras.');
                } else {
                    setWords(wordData);
                }
            } catch (err) {
                setError('Não foi possível carregar os dados da nuvem de palavras.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        if (tenantId !== undefined) {
            fetchData();
        }
    }, [tenantId]);

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}><CircularProgress /></Box>;
    }

    if (error) {
        return <Alert severity="info">{error}</Alert>;
    }

    const options = {
        rotations: 2,
        rotationAngles: [-90, 0],
        fontSizes: [20, 60],
        padding: 1,
    };

    return (
        <Box sx={{ height: 300, width: '100%' }}>
            <Typography variant="h6" gutterBottom>Nuvem de Palavras dos Comentários</Typography>
            <WordCloud words={words} options={options} />
        </Box>
    );
};

export default WordCloudChart;
