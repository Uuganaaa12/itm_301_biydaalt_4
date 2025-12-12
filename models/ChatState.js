const mongoose = require('mongoose');

const ChatStateSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    chatId: {
      type: String,
      required: true,
      index: true,
    },
    lastReadAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

ChatStateSchema.index({ userId: 1, chatId: 1 }, { unique: true });

module.exports =
  mongoose.models.ChatState || mongoose.model('ChatState', ChatStateSchema);
