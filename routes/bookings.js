const express = require('express');
const router = express.Router({mergeParams:true});// mergeParams:true เพื่อให้เข้าถึง req.params.id ของโรงแรมได้
const {protect,authorize} = require("../middleware/auth");
const {getBookings, getBooking, addBooking, updateBooking, deleteBooking} = require("../controllers/bookings");

router.route('/').get(protect,getBookings).post(protect, authorize("user","admin"), addBooking);
router.route('/:id').get(protect,authorize("user","admin"), getBooking).put(protect, authorize("user","admin"), updateBooking).delete(protect, authorize("user","admin"), deleteBooking);

module.exports = router;