const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    title: String,
    message: String,
    createdBy: String,
    type: String,
    img: String,
    url: String,
    targetType: String,
    targetValue: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', NotificationSchema);
