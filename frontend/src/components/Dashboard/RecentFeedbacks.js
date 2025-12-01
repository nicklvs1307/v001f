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
    useTheme,
    Tooltip
} from '@mui/material';
import { formatDateForDisplay, getStartOfDayUTC, getEndOfDayUTC } from '../../utils/dateUtils';
import dashboardService from '../../services/dashboardService';
import StarIcon from '@mui/icons-material/Star';
import CommentIcon from '@mui/icons-material/Comment';

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
                const params = { page: 1, limit: 10 }; // Limitar aos 10 mais recentes
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
                 <Paper elevation={2} sx={{ p: 2, height: { xs: 300, md: 400 }, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <CircularProgress />
                </Paper>
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
                    {feedbacks.length > 0 ? feedbacks.map((feedback) => {
                        const npsResponse = feedback.responses.find(r => r.questionType === 'rating_0_10');
                        const suggestionResponse = feedback.responses.find(r => r.questionType === 'free_text' && r.answer);

                        return (
                            <ListItem
                                key={feedback.sessionId}
                                divider
                                button
                                onClick={() => handleFeedbackClick(feedback.sessionId)}
                            >
                                <ListItemText
                                    primary={
                                        <Box display="flex" justifyContent="space-between" alignItems="center">
                                            <Typography component="span" variant="body2" fontWeight="bold">
                                                {feedback.client?.name || 'Anônimo'}
                                            </Typography>
                                            <Typography component="span" variant="caption" color="text.secondary">
                                                {formatDateForDisplay(feedback.createdAt)}
                                            </Typography>
                                        </Box>
                                    }
                                    secondary={
                                        <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                                            {npsResponse && (
                                                <Tooltip title={npsResponse.question}>
                                                    <Box display="flex" alignItems="center">
                                                        <StarIcon sx={{ color: theme.palette.warning.main, mr: 1, fontSize: '1rem' }} />
                                                        <Typography component="span" variant="body2" color="text.primary">
                                                            NPS: <strong>{npsResponse.answer}</strong>
                                                        </Typography>
                                                    </Box>
                                                </Tooltip>
                                            )}
                                            {suggestionResponse && (
                                                <Tooltip title={suggestionResponse.question}>
                                                    <Box display="flex" alignItems="center">
                                                        <CommentIcon sx={{ color: theme.palette.info.main, mr: 1, fontSize: '1rem' }} />
                                                        <Typography component="span" variant="body2" color="text.primary" noWrap>
                                                            {suggestionResponse.answer}
                                                        </Typography>
                                                    </Box>
                                                </Tooltip>
                                            )}
                                        </Box>
                                    }
                                />
                            </ListItem>
                        );
                    }) : (
                        <ListItem>
                            <ListItemText primary="Nenhum feedback recente para o período selecionado." />
                        </ListItem>
                    )}
                </List>
            </Paper>
        </Grid>
    );
};

export default RecentFeedbacks;