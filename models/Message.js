const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema(
  {
    chatId: {
      type: String,
      required: true,
      index: true,
    },
    participants: {
      type: [String],
      required: true,
      index: true,
    },
    sender: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['text', 'location'],
      default: 'text',
    },
    text: {
      type: String,
      default: '',
    },
    lat: Number,
    lng: Number,
    deletedFor: {
      type: [String],
      default: [],
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    editedAt: Date,
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Message || mongoose.model('Message', MessageSchema);
