const { Notification, PushSubscription, Usuario } = require('../../models');
const webpush = require('web-push');
const config = require('../config');

if (config.webPush.publicKey && config.webPush.privateKey) {
  webpush.setVapidDetails(
    `mailto:${config.webPush.contactEmail}`,
    config.webPush.publicKey,
    config.webPush.privateKey
  );
}

class NotificationService {
  async createNotification(io, data) {
    try {
      const notification = await Notification.create(data);

      if (data.tenantId) {
        io.to(data.tenantId).emit('new_notification', notification);
      }

      // Send push notification to all users in the tenant
      const usersToNotify = await Usuario.findAll({ where: { tenantId: data.tenantId } });
      for (const user of usersToNotify) {
        const subscriptions = await PushSubscription.findAll({ where: { userId: user.id } });
        for (const sub of subscriptions) {
          const payload = JSON.stringify({
            title: 'Nova Notificação do Feedeliza',
            body: notification.message,
          });
          webpush.sendNotification(sub.subscription, payload).catch(error => {
            console.error('Error sending push notification:', error);
            if (error.statusCode === 410) {
              // Subscription is no longer valid, remove it
              sub.destroy();
            }
          });
        }
      }

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  async getNotifications(userId, tenantId) {
    // TODO: Implement method to get notifications for a user
  }

  async markAsRead(notificationId) {
    // TODO: Implement method to mark a notification as read
  }
}

module.exports = new NotificationService();
