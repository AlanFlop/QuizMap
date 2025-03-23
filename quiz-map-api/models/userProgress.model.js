const mongoose = require('mongoose');

const userProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  countryCode: {
    type: String,
    required: true
  },
  discoveredAt: {
    type: Date,
    default: Date.now
  }
});

// Index composé pour éviter les doublons
userProgressSchema.index({ userId: 1, countryCode: 1 }, { unique: true });

const UserProgress = mongoose.model('UserProgress', userProgressSchema);

module.exports = UserProgress;