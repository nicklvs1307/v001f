import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSocket } from './SocketContext';

const NotificationsContext = createContext();

export const useNotifications = () => {
  return useContext(NotificationsContext);
};

export const NotificationsProvider = ({ children }) => {
  const socket = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then(registration => {
        registration.pushManager.getSubscription().then(subscription => {
          if (subscription === null) {
            // We are not subscribed, so ask for permission
            Notification.requestPermission().then(permission => {
              if (permission === 'granted') {
                // Subscribe
                const vapidPublicKey = process.env.REACT_APP_VAPID_PUBLIC_KEY;
                registration.pushManager.subscribe({
                  userVisibleOnly: true,
                  applicationServerKey: vapidPublicKey
                }).then(newSubscription => {
                  // TODO: Send subscription to the backend
                  console.log('New push subscription:', newSubscription);
                });
              }
            });
          } else {
            // We are already subscribed
            // TODO: Send subscription to the backend to ensure it's up to date
            console.log('Existing push subscription:', subscription);
          }
        });
      });
    }
  }, []);

  useEffect(() => {
    // TODO: Fetch initial notifications from the API

    const onNewNotification = (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
      // TODO: Show push notification
    };

    socket.on('new_notification', onNewNotification);

    return () => {
      socket.off('new_notification', onNewNotification);
    };
  }, [socket]);

  const markAsRead = (notificationId) => {
    // TODO: Call API to mark notification as read
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => (prev > 0 ? prev - 1 : 0));
  };

  const value = {
    notifications,
    unreadCount,
    markAsRead,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};
