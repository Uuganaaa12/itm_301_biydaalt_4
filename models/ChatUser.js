const mongoose = require('mongoose');

const ChatUserSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    firstName: String,
    lastName: String,
    email: String,
    picture: String,
    roleId: Number,
    schools: [String],
    lastActiveAt: Date,
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.ChatUser || mongoose.model('ChatUser', ChatUserSchema);
