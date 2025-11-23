import React from 'react';
import { Paper, Typography, List, ListItem, ListItemText, Divider, Box, Avatar, Chip, useTheme } from '@mui/material';
import { Forum } from '@mui/icons-material';
import { formatDateForDisplay } from '../../utils/dateUtils';

const getRatingChip = (rating) => {
    if (rating === null || rating === undefined) return null;

    if (rating >= 9) return <Chip label={`Nota: ${rating}`} color="success" size="small" />;
    if (rating >= 7) return <Chip label={`Nota: ${rating}`} color="warning" size="small" />;
    return <Chip label={`Nota: ${rating}`} color="error" size="small" />;
}

const CustomerFeedback = ({ latestComments }) => {
    const theme = useTheme();

    return (
        <Paper sx={{ p: 2, borderRadius: '16px', boxShadow: '0 8px 32px 0 rgba(0,0,0,0.1)', height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Forum sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                    Últimos Comentários
                </Typography>
            </Box>
            <List sx={{ maxHeight: 400, overflow: 'auto', p: 0 }}>
                {latestComments && latestComments.length > 0 ? (
                    latestComments.map((comment, index) => (
                        <React.Fragment key={index}>
                            <ListItem
                                alignItems="flex-start"
                                sx={{
                                    transition: 'background-color 0.3s',
                                    '&:hover': {
                                        backgroundColor: theme.palette.action.hover
                                    },
                                    borderRadius: '8px',
                                    mb: 1
                                }}
                            >
                                <Avatar sx={{ bgcolor: theme.palette.primary.light, color: theme.palette.primary.dark, mr: 2 }}>
                                    {comment.client ? comment.client.charAt(0) : 'A'}
                                </Avatar>
                                <ListItemText
                                    primary={
                                        <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                                            "{comment.comment}"
                                        </Typography>
                                    }
                                    secondary={
                                        <Box component="span" sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                            <Typography component="span" variant="caption" color="text.secondary">
                                                - {comment.client} em {formatDateForDisplay(comment.date, 'dd/MM/yy HH:mm')}
                                            </Typography>
                                            <Box component="span" sx={{ ml: 1.5 }}>
                                                {getRatingChip(comment.rating)}
                                            </Box>
                                        </Box>
                                    }
                                />
                            </ListItem>
                            {index < latestComments.length - 1 && <Divider variant="middle" component="li" />}
                        </React.Fragment>
                    ))
                ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 100 }}>
                        <Typography color="text.secondary">Nenhum comentário recente.</Typography>
                    </Box>
                )}
            </List>
        </Paper>
    );
};

export default CustomerFeedback;