import React from 'react';
import {
    Card, CardHeader, CardContent, Typography, List, ListItem, ListItemText,
    ListItemAvatar, Avatar, Divider, Box, Chip
} from '@mui/material';
import { Chat as ChatIcon, Star } from '@mui/icons-material';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const getRatingColor = (rating, type) => {
    if (typeof type !== 'string' || rating === null) {
        return 'grey.500';
    }
    if (type.includes('0_10')) { // NPS
        if (rating >= 9) return 'success.main';
        if (rating >= 7) return 'warning.main';
        return 'error.main';
    }
    if (type.includes('1_5') || type.includes('rating')) { // CSAT
        if (rating >= 4) return 'success.main';
        if (rating === 3) return 'warning.main';
        return 'error.main';
    }
    return 'grey.500';
};

const FeedbackResponse = ({ response }) => {
    return (
        <Box sx={{ mb: 1.5 }}>
            <Typography variant="body2" color="text.secondary" sx={{ display: 'block', fontWeight: 'bold' }}>
                {response.question || 'Pergunta não encontrada'}
            </Typography>
            <Typography variant="body1" color="text.primary" sx={{ display: 'block', wordWrap: 'break-word' }}>
                {String(response.answer) || 'Sem resposta'}
            </Typography>
            {response.ratingValue !== null && (
                <Chip 
                    label={`Nota: ${response.ratingValue} ★`} 
                    size="small" 
                    sx={{ mt: 0.5, bgcolor: getRatingColor(response.ratingValue, response.questionType), color: 'white', height: 'auto', '& .MuiChip-label': { whiteSpace: 'normal' } }} 
                />
            )}
        </Box>
    );
};


const FeedbacksList = ({ feedbacks }) => {
    if (!feedbacks || feedbacks.length === 0) {
        return (
            <Card sx={{ height: '100%', borderRadius: 4, boxShadow: '0 4px 12px 0 rgba(0,0,0,0.07)' }}>
                <CardHeader
                    avatar={<Avatar sx={{ bgcolor: 'primary.main' }}><ChatIcon /></Avatar>}
                    title={<Typography variant="h6">Últimos Feedbacks</Typography>}
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
                        const firstRatingResponse = session.responses.find(res => res.ratingValue !== null);
                        
                        return (
                            <React.Fragment key={session.sessionId}>
                                <ListItem alignItems="flex-start" sx={{ pt: 2, pb: 1, display: 'flex', flexDirection: 'column' }}>
                                    <Box sx={{ display: 'flex', width: '100%', alignItems: 'center', mb: 1 }}>
                                        <ListItemAvatar sx={{minWidth: 48}}>
                                            <Avatar sx={{ bgcolor: firstRatingResponse ? getRatingColor(firstRatingResponse.ratingValue, firstRatingResponse.questionType) : 'grey.500' }}>
                                                <Star />
                                            </Avatar>
                                        </ListItemAvatar>
                                        <Box>
                                            <Typography variant="body1" fontWeight="bold">
                                                {session.client?.name || 'Anônimo'}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {session.createdAt ? format(new Date(session.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : 'Data indisponível'}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Box sx={{ pl: '56px', width: 'calc(100% - 56px)' }}>
                                        {session.responses && session.responses.map((res, resIndex) => (
                                            <FeedbackResponse key={res.perguntaId || resIndex} response={res} />
                                        ))}
                                    </Box>
                                </ListItem>
                                {sessionIndex < feedbacks.length - 1 && <Divider component="li" />}
                            </React.Fragment>
                        );
                    })}
                </List>
            </CardContent>
        </Card>
    );
};

export default FeedbacksList;

