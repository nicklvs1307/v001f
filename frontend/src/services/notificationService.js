import apiAuthenticated from './apiAuthenticated';

const getNotifications = async () => {
    try {
        const response = await apiAuthenticated.get('/notifications');
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

const markAsRead = async (id) => {
    try {
        const response = await apiAuthenticated.put(`/notifications/${id}/read`);
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

const subscribeToPush = async (subscription) => {
    try {
        const response = await apiAuthenticated.post('/push/subscribe', { subscription });
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

const notificationService = {
    getNotifications,
    markAsRead,
    subscribeToPush,
};

export default notificationService;
