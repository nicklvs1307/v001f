import React from 'react';
import { Paper, Typography, List, ListItem, ListItemText, Divider } from '@mui/material';


const CustomerFeedback = ({ wordCloud, latestComments, tenantId }) => {
    return (
        <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Feedback dos Clientes</Typography>

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Últimos Comentários</Typography>
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
                    <Typography>Nenhum comentário recente.</Typography>
                )}
            </List>
        </Paper>
    );
};

export default CustomerFeedback;