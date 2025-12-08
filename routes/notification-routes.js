// routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const controller = require('../controllers/notificationController');

// Admin / Teacher creates notification
router.post('/send', auth, controller.sendNotification);

// User gets their notifications
router.get('/my', auth, controller.getUserNotifications);


router.get('/:id', auth, controller.getNotificationDetailById);
// Mark as read
router.put('/read/:id', auth, controller.markAsRead);

module.exports = router;
