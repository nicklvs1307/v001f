import React from 'react';
import {
    Card, CardHeader, CardContent, Typography, List, ListItem, ListItemText,
    ListItemAvatar, Avatar, Divider, Box, Chip
} from '@mui/material';
import { Chat as ChatIcon, Star } from '@mui/icons-material';

const getRatingColor = (rating, type) => {
    if (typeof type !== 'string') {
        return 'text.secondary';
    }
    if (type.includes('0_10')) { // NPS
        if (rating >= 9) return 'success.main';
        if (rating >= 7) return 'warning.main';
        return 'error.main';
    }
    if (type.includes('1_5')) { // CSAT
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
                            Nenhum comentário no período.
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
                title={<Typography variant="h6">Últimos Comentários</Typography>}
            />
            <CardContent sx={{ p: 0 }}>
                <List sx={{ height: 350, overflowY: 'auto', p: 0 }}>
                    {feedbacks.map((feedback, index) => (
                        <React.Fragment key={index}>
                            <ListItem alignItems="flex-start">
                                <ListItemAvatar>
                                    <Avatar sx={{ bgcolor: getRatingColor(feedback.npsScore, feedback.questionType) }}>
                                        <Star />
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={
                                        <Typography variant="body1">
                                            "{feedback.comment}"
                                        </Typography>
                                    }
                                    secondary={
                                        <Box component="span" sx={{ display: 'flex', flexDirection: 'column', mt: 1 }}>
                                            <Typography component="span" variant="body2" color="text.primary">
                                                {feedback.client?.name || 'Anônimo'}
                                            </Typography>
                                            <Chip label={`${feedback.npsScore} ★ - ${feedback.question}`} size="small" sx={{ mt: 0.5, width: 'fit-content' }} />
                                        </Box>
                                    }
                                />
                            </ListItem>
                            {index < feedbacks.length - 1 && <Divider variant="inset" component="li" />}
                        </React.Fragment>
                    ))}
                </List>
            </CardContent>
        </Card>
    );
};

export default FeedbacksList;
