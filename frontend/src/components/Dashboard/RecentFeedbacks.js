import React, { useState, useEffect } from 'react';
import {
    Grid,
    Paper,
    Typography,
    Box,
    List,
    ListItem,
    ListItemText,
    CircularProgress,
    Alert,
    useTheme
} from '@mui/material';
import { formatDateForDisplay, getStartOfDayUTC, getEndOfDayUTC } from '../../utils/dateUtils';
import dashboardService from '../../services/dashboardService';
import { keyframes } from '@mui/system';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const RecentFeedbacks = ({ startDate, endDate, handleFeedbackClick }) => {
    const theme = useTheme();
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let isActive = true;

        const fetchFeedbacks = async () => {
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
                const data = await dashboardService.getFeedbacks(params);
                if (isActive) {
                    setFeedbacks(data.rows || []);
                }
            } catch (err) {
                if (isActive) {
                    setError(err.message || 'Falha ao carregar os feedbacks recentes.');
                }
            } finally {
                if (isActive) {
                    setLoading(false);
                }
            }
        };

        fetchFeedbacks();

        return () => {
            isActive = false;
        };
    }, [startDate, endDate]);

    if (loading) {
        return (
            <Grid item xs={12} md={6}>
                <CircularProgress />
                <Alert severity="info">Carregando feedbacks recentes...</Alert>
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
            <Paper elevation={2} sx={{ p: 2, height: { xs: 300, md: 400 }, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="subtitle1" color="text.secondary" sx={{ borderBottom: `1px solid ${theme.palette.divider}`, pb: 1, mb: 1 }}>
                    Feedbacks Recentes
                </Typography>
                <List sx={{ flexGrow: 1, overflowY: 'auto' }}>
                    {feedbacks.map((feedback, index) => (
                        <ListItem
                            key={index}
                            divider
                            button
                            onClick={() => handleFeedbackClick(feedback.respondentSessionId)}
                        >
                            <ListItemText
                                primary={
                                    <Box>
                                        <Typography component="span" variant="body2" color="text.secondary" mr={1}>
                                            {formatDateForDisplay(feedback.date)}
                                        </Typography>
                                        {feedback.client && (
                                            <Typography component="span" variant="body2" fontWeight="bold">
                                                {feedback.client}
                                            </Typography>
                                        )}
                                    </Box>
                                }
                                secondary={
                                    <Box sx={{ mt: 0.5 }}>
                                        <Typography component="span" variant="caption" sx={{ backgroundColor: theme.palette.primary.main, color: 'white', p: '2px 8px', borderRadius: '12px', mr: 1 }}>
                                            Nota: {feedback.rating}
                                        </Typography>
                                        {feedback.comment && (
                                            <Typography component="span" variant="body2" color="text.primary">
                                                {feedback.comment}
                                            </Typography>
                                        )}
                                    </Box>
                                }
                            />
                        </ListItem>
                    ))}
                </List>
            </Paper>
        </Grid>
    );
};

export default RecentFeedbacks;
