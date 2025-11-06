// models/Review.js
const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true
  },
  rating: {
    type: Number,
    required: [true, 'Please add a rating between 1 and 5'],
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: [true, 'Please add a comment']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  hotel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
    unique: true // one review per booking
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes: unique booking to enforce 1 review per booking, and fast hotel queries
ReviewSchema.index({ booking: 1 }, { unique: true });
ReviewSchema.index({ hotel: 1, createdAt: -1 });

module.exports = mongoose.model('Review', ReviewSchema);
