// controllers/notificationController.js
const notificationService = require('../services/notificationService');
const NotificationUser = require('../models/NotificationUser');
exports.sendNotification = async (req, res) => {
  try {
    const data = req.body;
    const createdBy = req.user.id;
    const token = req.headers.authorization?.split(' ')[1];

    const notif = await notificationService.sendNotification(
      data,
      createdBy,
      token
    );

    res.json({ success: true, notification: notif });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error sending notification' });
  }
};

exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifs = await notificationService.getUserNotifications(userId);
    res.json(notifs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching notifications' });
  }
};

exports.getNotificationDetailById = async (req, res) => {
  try {
    const notifUserId = req.params.id;
    const userId = req.user.id;

    console.log('ids', userId);
    const notifUser = await NotificationUser.findOne({
      _id: notifUserId,
      userId,
    }).populate('notificationId');

    if (!notifUser) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json(notifUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching notification' });
  }
};
exports.markAsRead = async (req, res) => {
  try {
    const notifUserId = req.params.id;
    const updated = await notificationService.markAsRead(notifUserId);
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error marking notification as read' });
  }
};
