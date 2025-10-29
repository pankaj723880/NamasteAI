const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  conversationId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  feedback: {
    type: String,
    enum: ['positive', 'negative', null],
    default: null
  }
});

// Index for efficient queries
chatSchema.index({ userId: 1, conversationId: 1, timestamp: -1 });

module.exports = mongoose.model('Chat', chatSchema);
