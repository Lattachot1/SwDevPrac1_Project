const express = require('express');
const router = express.Router({ mergeParams: true }); 

const { protect, authorize } = require('../middleware/auth');
const {
  createReview,
  getReviewsForHotel,
  getReview,
  updateReview,
  deleteReview
} = require('../controllers/reviews');

// สร้างรีวิว (ผู้ใช้ที่เป็นเจ้าของ booking เท่านั้น), ดึงรีวิวทั้งหมดของโรงแรม (public), // ดึงรีวิวทั้งหมดในระบบ (admin)
router
  .route('/')
  .post(protect, authorize('user', 'admin'), createReview)
  .get(getReviewsForHotel);
  

// จัดการรีวิวแต่ละรายการ (ดู / แก้ / ลบ)
router
  .route('/:id')
  .get(getReview)
  .put(protect, authorize('user', 'admin'), updateReview)
  .delete(protect, authorize('user', 'admin'), deleteReview);

module.exports = router;
