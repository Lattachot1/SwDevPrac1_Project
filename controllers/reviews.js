// controllers/reviews.js
const mongoose = require('mongoose');
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Hotel = require('../models/Hotel');

/**
 * Helper: update hotel aggregates (avgRating, numReviews)
 */
async function updateHotelStats(hotelId) {
  try {
    const agg = await Review.aggregate([
      { $match: { hotel: mongoose.Types.ObjectId(hotelId) } },
      {
        $group: {
          _id: '$hotel',
          avgRating: { $avg: '$rating' },
          numReviews: { $sum: 1 }
        }
      }
    ]);

    if (agg.length > 0) {
      const avg = Math.round(agg[0].avgRating * 10) / 10; // round to 1 decimal
      await Hotel.findByIdAndUpdate(hotelId, {
        avgRating: avg,
        numReviews: agg[0].numReviews
      }, { new: true, runValidators: true });
    } else {
      await Hotel.findByIdAndUpdate(hotelId, { avgRating: 0, numReviews: 0 }, { new: true, runValidators: true });
    }
  } catch (err) {
    // Log and swallow — don't crash the request flow for a stats update failure
    console.error('Failed to update hotel stats:', err);
  }
}

/**
 * POST /api/v1/hotels/:hotelId/bookings/:bookingId/reviews
 * Create a review for a booking (one review per booking).
 * Access: Private (user must be booking owner)
 */
exports.createReview = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { hotelId, bookingId } = req.params;
    const { rating, comment, title } = req.body;

    // 1) booking exists
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, msg: 'Booking not found' });

    // 2) booking belongs to user
    if (booking.user.toString() !== userId) {
      return res.status(403).json({ success: false, msg: 'You can only review your own bookings' });
    }

    // 3) booking belongs to the hotel
    if (booking.hotel.toString() !== hotelId) {
      return res.status(400).json({ success: false, msg: 'Booking does not belong to this hotel' });
    }

    // 4) check existing review for this booking
    const existing = await Review.findOne({ booking: bookingId });
    if (existing) return res.status(400).json({ success: false, msg: 'This booking has already been reviewed' });

    // 5) create review
    const review = await Review.create({
      title,
      rating,
      comment,
      user: userId,
      hotel: hotelId,
      booking: bookingId
    });

    // update hotel stats (best-effort)
    updateHotelStats(hotelId);

    res.status(201).json({ success: true, data: review });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, msg: 'This booking has already been reviewed' });
    }
    res.status(500).json({ success: false, msg: err.message });
  }
};

/**
 * GET /api/v1/hotels/:hotelId/reviews
 * Get reviews for a hotel (public)
 */
exports.getReviewsForHotel = async (req, res, next) => {
  try {
    const { hotelId } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const skip = (page - 1) * limit;

    const filter = { hotel: hotelId };
    if (req.query.rating) {
      // simple rating filter support: rating=gte:4 or rating=5
      const ratingQuery = req.query.rating;
      if (ratingQuery.startsWith('gte:')) {
        filter.rating = { $gte: Number(ratingQuery.split(':')[1]) };
      } else {
        filter.rating = Number(ratingQuery);
      }
    }

    const total = await Review.countDocuments(filter);
    const reviews = await Review.find(filter)
      .populate({ path: 'user', select: 'name tel email' })
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    const pagination = {};
    if (skip + reviews.length < total) pagination.next = { page: page + 1, limit };
    if (skip > 0) pagination.prev = { page: page - 1, limit };

    res.status(200).json({ success: true, count: reviews.length, total, pagination, data: reviews });
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
};

/**
 * GET /api/v1/reviews/:id
 * Get single review (public). If you want restricted visibility, protect this route.
 */
exports.getReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate({ path: 'user', select: 'name email tel' })
      .populate({ path: 'hotel', select: 'name province tel' })
      .populate({ path: 'booking', select: '_id createdAt' });

    if (!review) return res.status(404).json({ success: false, msg: 'Review not found' });

    res.status(200).json({ success: true, data: review });
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
};

/**
 * PUT /api/v1/reviews/:id
 * Update a review (owner or admin)
 * Access: Private (owner or admin)
 */
exports.updateReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, msg: 'Review not found' });

    // permission check
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, msg: 'Not authorized to update this review' });
    }

    const fieldsToUpdate = {};
    if (req.body.rating !== undefined) fieldsToUpdate.rating = req.body.rating;
    if (req.body.comment !== undefined) fieldsToUpdate.comment = req.body.comment;
    if (req.body.title !== undefined) fieldsToUpdate.title = req.body.title;

    const updated = await Review.findByIdAndUpdate(req.params.id, fieldsToUpdate, { new: true, runValidators: true });

    // If rating changed, update hotel stats
    if (fieldsToUpdate.rating !== undefined) {
      await updateHotelStats(updated.hotel);
    }

    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
};

/**
 * DELETE /api/v1/reviews/:id
 * Delete a review (owner or admin)
 * Access: Private (owner or admin)
 */
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, msg: 'Review not found' });

    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, msg: 'Not authorized to delete this review' });
    }

    const hotelId = review.hotel;
    await review.deleteOne();

    // update hotel stats after delete
    await updateHotelStats(hotelId);

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, msg: err.message });
  }
};
