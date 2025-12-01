import React from 'react';
import {
    Card, CardHeader, CardContent, Typography, List, ListItem, ListItemText,
    ListItemAvatar, Avatar, Divider, Box, Chip
} from '@mui/material';
import { Chat as ChatIcon, Star } from '@mui/icons-material';
import { format } from 'date-fns';

const getRatingColor = (rating, type) => {
    if (typeof type !== 'string' || rating === null) {
        return 'text.secondary';
    }
    if (type.includes('0_10')) { // NPS
        if (rating >= 9) return 'success.main';
        if (rating >= 7) return 'warning.main';
        return 'error.main';
    }
    if (type.includes('1_5') || type.includes('rating')) { // CSAT ou genérico 1-5
        if (rating >= 4) return 'success.main';
        if (rating === 3) return 'warning.main';
        return 'error.main';
    }
    return 'text.secondary';
};

const FeedbacksList = ({ feedbacks }) => {
    if (!feedbacks || feedbacks.length === 0) {
        return (
            <Card sx={{ height: '100%', borderRadius: 4, boxShadow: '0 4px 12px 0 rgba(0,0,0,0.07)' }}>
                <CardHeader
                    avatar={<Avatar sx={{ bgcolor: 'primary.main' }}><ChatIcon /></Avatar>}
                    title={<Typography variant="h6">Últimos Comentários</Typography>}
                />
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: 150 }}>
                        <Typography variant="body2" color="text.secondary">
                            Nenhum feedback no período.
                        </Typography>
                    </Box>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card sx={{ height: '100%', borderRadius: 4, boxShadow: '0 4px 12px 0 rgba(0,0,0,0.07)' }}>
            <CardHeader
                avatar={<Avatar sx={{ bgcolor: 'primary.main' }}><ChatIcon /></Avatar>}
                title={<Typography variant="h6">Últimos Feedbacks</Typography>}
            />
            <CardContent sx={{ p: 0 }}>
                <List sx={{ height: 350, overflowY: 'auto', p: 0 }}>
                    {feedbacks.map((session, sessionIndex) => {
                        const firstRatingResponse = session.responses.find(res => res.ratingValue !== null && (res.questionType.includes('0_10') || res.questionType.includes('1_5') || res.questionType.includes('rating')));
                        const displayRating = firstRatingResponse ? firstRatingResponse.ratingValue : null;
                        const displayRatingType = firstRatingResponse ? firstRatingResponse.questionType : null;

                        return (
                            <React.Fragment key={session.sessionId}>
                                <ListItem alignItems="flex-start" sx={{ pt: 2, pb: 1 }}>
                                    <ListItemAvatar>
                                        <Avatar sx={{ bgcolor: getRatingColor(displayRating, displayRatingType) }}>
                                            <Star />
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={
                                            <Box>
                                                <Typography variant="body1" fontWeight="bold">
                                                    {session.client?.name || 'Anônimo'}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {format(new Date(session.createdAt), 'dd/MM/yyyy HH:mm')}
                                                </Typography>
                                            </Box>
                                        }
                                        secondary={
                                            <Box component="span" sx={{ display: 'flex', flexDirection: 'column', mt: 1 }}>
                                                {session.responses.map((res, resIndex) => (
                                                    <Box key={resIndex} sx={{ mb: 1 }}>
                                                        <Typography component="span" variant="body2" color="text.primary" sx={{ display: 'block' }}>
                                                            <span style={{ fontWeight: 'bold' }}>{res.question}:</span> {res.answer}
                                                        </Typography>
                                                        {res.ratingValue !== null && (
                                                            <Chip 
                                                                label={`Nota: ${res.ratingValue} ★`} 
                                                                size="small" 
                                                                sx={{ mt: 0.5, bgcolor: getRatingColor(res.ratingValue, res.questionType), color: 'white' }} 
                                                            />
                                                        )}
                                                    </Box>
                                                ))}
                                            </Box>
                                        }
                                    />
                                </ListItem>
                                {sessionIndex < feedbacks.length - 1 && <Divider variant="inset" component="li" />}
                            </React.Fragment>
                        );
                    })}
                </List>
            </CardContent>
        </Card>
    );
};

export default FeedbacksList;

