import React from 'react';
import { Paper, Typography, List, ListItem, ListItemText, Divider, Box } from '@mui/material';
import { Forum } from '@mui/icons-material';

const CustomerFeedback = ({ latestComments }) => {
    return (
        <Paper sx={{ p: 3, borderRadius: '16px', boxShadow: '0 4px 12px 0 rgba(0,0,0,0.05)', height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Forum sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" gutterBottom component="div" sx={{ fontWeight: 'bold' }}>
                    Últimos Comentários
                </Typography>
            </Box>
            <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                <List>
                    {latestComments && latestComments.length > 0 ? (
                        latestComments.map((comment, index) => (
                            <React.Fragment key={index}>
                                <ListItem alignItems="flex-start">
                                    <ListItemText
                                        primary={comment.comment}
                                        secondary={`- ${comment.client} em ${comment.date}`}
                                    />
                                </ListItem>
                                {index < latestComments.length - 1 && <Divider variant="inset" component="li" />}
                            </React.Fragment>
                        ))
                    ) : (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 100 }}>
                            <Typography color="text.secondary">Nenhum comentário recente.</Typography>
                        </Box>
                    )}
                </List>
            </Box>
        </Paper>
    );
};

export default CustomerFeedback;