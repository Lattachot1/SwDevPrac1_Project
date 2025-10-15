const Booking = require('../models/Bookings');
const Hotel = require('../models/Hotels');

// @desc    Get all bookings
// @route   GET /api/v1/bookings
// @access  Private
exports.getBookings = async (req,res,next) =>{
    let query;
    if(req.user.role !== 'admin'){
        query = Booking.find({user: req.user.id}).populate({path:'hotel', select:'name province tel'});
    }else {
        query = Booking.find().populate({path:'hotel', select:'name province tel'});
    }
    try{
        const bookings = await query;

        res.status(200).json({
            success: true,
            count: bookings.length,
            data: bookings
        });
    }catch(err){
        res.status(400).json({success:false, msg:err.message});
    }
};

//get with id

exports.getBooking = async(req,res,next) => {
    try{
        const booking = await Booking.findById(req.params.id).populate({path:'hotel', select:'name province tel'});
        if(req.user.role !== 'admin' && booking.user.toString() !== req.user.id){
            return res.status(401).json({success:false, msg:`the Booking id ${req.params.id} is not your booking`});
        }
        if(!booking){
            return res.status(404).json({success:false, msg:`No booking found with id ${req.params.id}`});
        }
        res.status(200).json({success:true, data:booking});
    }catch(err){
        res.status(400).json({success:false, msg:err.message});
    }
}

//Create new booking
exports.addBooking = async (req,res,next) => {
    try{
        req.body.user = req.user.id;
        req.body.hotel = req.params.hotelId;

        const hotel = await Hotel.findById(req.params.hotelId);
        if(!hotel){
            return res.status(404).json({success:false, msg:`No hotel with id ${req.params.hotelId}`});
        }
        const existedBooking = await Booking.find({user:req.user.id});
        if(existedBooking.length >= 3 && req.user.role !== 'admin'){
            return res.status(400).json({success:false, msg:`The user with ID ${req.user.id} has already made 3 bookings`});
        }
        const booking = await Booking.create(req.body);
        res.status(201).json({success:true, data:booking});
    }catch(err){
        res.status(400).json({success:false, msg:err.message});
    } 
};

//Update booking
exports.updateBooking = async (req,res,next) => {
    try{
        let booking = await Booking.findById(req.params.id);
        if(!booking){
            return res.status(404).json({success:false, msg:`No booking found with id ${req.params.id}`});
        }
        if(booking.user.toString() !== req.user.id && req.user.role !== 'admin'){
            return res.status(401).json({success:false, msg:`the Booking id ${req.params.id} is not your booking`});
        }
        booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        res.status(200).json({success:true, data:booking});
    }catch(err){
        res.status(400).json({success:false, msg:err.message});
    }   
};

//Delete booking

exports.deleteBooking = async (req,res,next) =>{
    try{
        const booking = await Booking.findById(req.params.id);
        if(!booking){
            return res.status(404).json({success:false, msg:`No booking found with id ${req.params.id}`});
        }
        if(req.user.role !== 'admin' && booking.user.toString() !== req.user.id){
            return res.status(401).json({success:false, msg:`the Booking id ${req.params.id} is not your booking`});
        }
        booking = await booking.deleteOne();
        res.status(200).json({success:true, data:{}});
    }catch(err){
        res.status(400).json({success:false, msg:err.message});
    }
}


