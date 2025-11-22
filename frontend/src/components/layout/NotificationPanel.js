import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
} from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import { formatDateForDisplay } from '../../utils/dateUtils';

const NotificationPanel = ({ notifications, onMarkAsRead }) => {
  return (
    <Box sx={{ width: 360 }}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6">Notificações</Typography>
      </Box>
      <Divider />
      <List sx={{ maxHeight: 400, overflow: 'auto' }}>
        {notifications.length === 0 ? (
          <ListItem>
            <ListItemText primary="Nenhuma notificação nova." />
          </ListItem>
        ) : (
          notifications.map((notification) => (
            <ListItem
              key={notification.id}
              secondaryAction={
                !notification.read && (
                  <IconButton edge="end" aria-label="mark as read" onClick={() => onMarkAsRead(notification.id)}>
                    <CheckCircle />
                  </IconButton>
                )
              }
            >
              <ListItemText
                primary={notification.message}
                secondary={formatDateForDisplay(notification.createdAt, 'dd/MM/yyyy HH:mm')}
                sx={{ pr: 4, opacity: notification.read ? 0.5 : 1 }}
              />
            </ListItem>
          ))
        )}
      </List>
    </Box>
  );
};

export default NotificationPanel;
