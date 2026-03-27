import React, { useState, useEffect } from 'react';
import {
    Grid,
    Paper,
    Typography,
    Box,
    List,
    ListItemButton,
    ListItemText,
    CircularProgress,
    Alert,
    useTheme,
    Tooltip,
    Chip,
} from '@mui/material';
import { formatDateForDisplay, getStartOfDayUTC, getEndOfDayUTC } from '../../utils/dateUtils';
import dashboardService from '../../services/dashboardService';
import CommentIcon from '@mui/icons-material/Comment';

const getNpsBadgeProps = (score) => {
    const numScore = Number(score);
    if (numScore >= 9) return { label: numScore, color: '#dcfce7', textColor: '#16a34a', classification: 'Promotor' };
    if (numScore >= 7) return { label: numScore, color: '#fef3c7', textColor: '#d97706', classification: 'Neutro' };
    return { label: numScore, color: '#fee2e2', textColor: '#dc2626', classification: 'Detrator' };
};

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
                const params = { page: 1, limit: 10 };
                if (startDate) params.startDate = getStartOfDayUTC(startDate);
                if (endDate) params.endDate = getEndOfDayUTC(endDate);
                const data = await dashboardService.getFeedbacks(params);
                if (isActive) setFeedbacks(data.rows || []);
            } catch (err) {
                if (isActive) setError(err.message || 'Falha ao carregar os feedbacks recentes.');
            } finally {
                if (isActive) setLoading(false);
            }
        };

        fetchFeedbacks();
        return () => { isActive = false; };
    }, [startDate, endDate]);

    if (loading) {
        return (
            <Grid item xs={12} md={6}>
                <Paper elevation={0} sx={{ p: 2, height: { xs: 300, md: 400 }, display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
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
            <Paper elevation={0} sx={{ p: 2, height: { xs: 300, md: 400 }, display: 'flex', flexDirection: 'column', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                <Typography variant="subtitle1" fontWeight={600} color="text.primary" sx={{ pb: 1, mb: 1 }}>
                    Feedbacks Recentes
                </Typography>
                <List sx={{ flexGrow: 1, overflowY: 'auto', p: 0 }}>
                    {feedbacks.length > 0 ? feedbacks.map((feedback) => {
                        const npsResponse = feedback.responses.find(r => r.questionType === 'rating_0_10');
                        const suggestionResponse = feedback.responses.find(r => r.questionType === 'free_text' && r.answer);
                        const badge = npsResponse ? getNpsBadgeProps(npsResponse.answer) : null;

                        return (
                            <ListItemButton
                                key={feedback.sessionId}
                                onClick={() => handleFeedbackClick(feedback.sessionId)}
                                sx={{
                                    borderRadius: '8px',
                                    mb: 0.5,
                                    '&:hover': { backgroundColor: '#f8fafc' },
                                }}
                            >
                                <ListItemText
                                    primary={
                                        <Box display="flex" justifyContent="space-between" alignItems="center">
                                            <Typography component="span" variant="body2" fontWeight={600} color="text.primary">
                                                {feedback.client?.name || 'Anônimo'}
                                            </Typography>
                                            <Typography component="span" variant="caption" color="text.secondary">
                                                {formatDateForDisplay(feedback.createdAt)}
                                            </Typography>
                                        </Box>
                                    }
                                    secondary={
                                        <Box sx={{ mt: 0.5, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                            {badge && (
                                                <Tooltip title={badge.classification}>
                                                    <Box
                                                        component="span"
                                                        sx={{
                                                            px: '8px',
                                                            py: '2px',
                                                            borderRadius: '12px',
                                                            fontSize: '0.75rem',
                                                            fontWeight: 700,
                                                            backgroundColor: badge.color,
                                                            color: badge.textColor,
                                                            lineHeight: 1.4,
                                                        }}
                                                    >
                                                        {badge.label}
                                                    </Box>
                                                </Tooltip>
                                            )}
                                            {suggestionResponse && (
                                                <Typography component="span" variant="body2" color="text.secondary" noWrap sx={{ maxWidth: '70%' }}>
                                                    {suggestionResponse.answer}
                                                </Typography>
                                            )}
                                        </Box>
                                    }
                                />
                            </ListItemButton>
                        );
                    }) : (
                        <ListItemButton sx={{ borderRadius: '8px' }}>
                            <ListItemText primary="Nenhum feedback recente para o período selecionado." />
                        </ListItemButton>
                    )}
                </List>
            </Paper>
        </Grid>
    );
};

export default RecentFeedbacks;
