// services/notificationService.js
const Notification = require('../models/Notification');
const NotificationUser = require('../models/NotificationUser');
const userApi = require('./userApi');

/**
 * LMS-тэй холбогдож хэрэглэгчийн жагсаалт авах
 */
async function fetchTargetUsers(targetType, targetValue, token) {
  const headers = { Authorization: `Bearer ${token}` };
  let res;

  if (targetType === 'all') {
    res = await userApi.get('/users?limit=1000', { headers });
    return res.data.items; // items array-г шууд буцаана
  }

  if (targetType === 'role') {
    res = await userApi.get(`/users?role=${targetValue}&limit=1000`, {
      headers,
    });
    return res.data.items;
  }

  if (targetType === 'course') {
    res = await userApi.get(`/courses/${targetValue}/users?limit=1000`, {
      headers,
    });

    return res.data.items;
  }

  if (targetType === 'user') {
    return [{ id: targetValue }];
  }

  return [];
}

/**
 * Notification үүсгэх, хэрэглэгчдэд дамжуулах
 */
exports.sendNotification = async (data, createdBy, token) => {
  // 1. Create notification
  const notif = await Notification.create({
    ...data,
    createdBy,
  });

  // 2. Get target users from LMS
  const users = await fetchTargetUsers(
    data.targetType,
    data.targetValue,
    token
  );

  let list = [];

  if (data.targetType === 'course') {
    list = users.map(u => ({
      notificationId: notif._id,
      userId: u.user_id,
    }));
  } else {
    list = users.map(u => ({
        notificationId: notif._id,
        userId: u.id,
      }));
  }

  // Хуваарилалт хийх
  await NotificationUser.insertMany(list);

  return notif;
};

/**
 * Хэрэглэгчийн мэдэгдлүүд авах
 */
exports.getUserNotifications = async userId => {
  return NotificationUser.find({ userId })
    .populate('notificationId')
    .sort({ createdAt: -1 });
};

exports.getNotificationDetail = async () => {
  return Notification.find();
};

/**
 * Мэдэгдлийг уншсан гэж тэмдэглэх
 */
exports.markAsRead = async notifUserId => {
  return NotificationUser.findByIdAndUpdate(
    notifUserId,
    { isRead: true },
    { new: true }
  );
};
