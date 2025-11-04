const express = require('express');
const router = express.Router();
const {getHotel,getHotels,createHotel,updateHotel,deleteHotel} = require("../controllers/hotels");
const bookingRouter = require('./bookings');
const reviewRouter = require('./reviews');
const{protect,authorize} = require("../middleware/auth");

router.use('/:hotelId/bookings', bookingRouter);
router.use('/:hotelId/reviews', reviewRouter);

router.route('/').get(getHotels).post(protect,authorize('admin'),createHotel);
router.route('/:id').get(getHotel).put(protect,authorize('admin'),updateHotel).delete(protect,authorize('admin'),deleteHotel);

module.exports = router;
