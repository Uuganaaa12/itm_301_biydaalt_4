// models/LostFound.js

const mongoose = require('mongoose');

const LostFoundSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Гарчиг шаардлагатай'],
    trim: true,
    maxlength: [100, 'Гарчиг 100 тэмдэгтээс хэтрэх боломжгүй'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Тайлбар 1000 тэмдэгтээс хэтрэх боломжгүй'],
  },
  imageUrl: String,
  location: {
    type: String,
    trim: true,
  },
  foundDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: {
      values: ['lost', 'found'],
      message: 'Status нь "lost" эсвэл "found" байх ёстой',
    },
    default: 'lost',
    required: true,
  },
  createdBy: {
    userId: String,
    name: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

LostFoundSchema.index({ title: 'text', description: 'text', location: 'text' });
LostFoundSchema.index({ status: 1, createdAt: -1 });

LostFoundSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

LostFoundSchema.pre('findByIdAndUpdate', function (next) {
  this.set({ updatedAt: new Date() });
  next();
});

module.exports = mongoose.model('LostFound', LostFoundSchema);
