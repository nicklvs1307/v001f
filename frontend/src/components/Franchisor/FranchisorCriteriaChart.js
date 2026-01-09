import React, { useState, useEffect } from 'react';
import { Grid, CircularProgress, Alert } from '@mui/material';
import franchisorService from '../../services/franchisorService';
import { getStartOfDayUTC, getEndOfDayUTC } from '../../utils/dateUtils';
import CriteriaBarChart from '../Dashboard/CriteriaBarChart';

const FranchisorCriteriaChart = ({ startDate, endDate }) => {
    const [criteriaScores, setCriteriaScores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let isActive = true;

        const fetchCriteriaScores = async () => {
            try {
                setLoading(true);
                setError('');
                const params = {};
                if (startDate) {
                    params.startDate = getStartOfDayUTC(startDate);
                }
                if (endDate) {
                    params.endDate = getEndOfDayUTC(endDate);
                }
                const data = await franchisorService.getDashboard(params);

                if (isActive) {
                    const npsCriteria = data.criteriaScores.filter(item => item.scoreType === 'NPS');
                    setCriteriaScores(npsCriteria);
                }
            } catch (err) {
                if (isActive) {
                    setError(err.message || 'Falha ao carregar os dados de critérios.');
                }
            } finally {
                if (isActive) {
                    setLoading(false);
                }
            }
        };

        fetchCriteriaScores();

        return () => {
            isActive = false;
        };
    }, [startDate, endDate]);

    if (loading) {
        return (
            <Grid item xs={12} md={6}>
                <CircularProgress />
                <Alert severity="info">Carregando scores de critérios...</Alert>
            </Grid>
        );
    }

    if (error) {
        return (
            <Grid item xs={12} md={6}>
                <Alert severity="error">{error}</Alert>
            </Grid>
        );
    }

    return (
        <Grid item xs={12} md={6}>
            <CriteriaBarChart data={criteriaScores} />
        </Grid>
    );
};

export default FranchisorCriteriaChart;
