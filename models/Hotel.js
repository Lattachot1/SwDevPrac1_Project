const mongoose = require('mongoose');

const HotelSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, "Please add a hotel name"],
        unique: true,
    },
    address:{
        type: String,
        required: [true, "Please add an address"],
    },
    district:{
            type: String,
            required: [true, "Please add a district"],
    
        },
        province:{
            type: String,
            required: [true, "Please add a province"],
    
        },
        postalcode:{
            type: String,
            required: [true, "Please add a postal code"],
            maxlength:[5, "Postal code cannot be more than 5 characters"]
        },
        tel:{
            type: String
    
        },
        region:{
            type: String,
            required: [true, "Please add a region"],
        }},
        {
            toJSON: {virtuals:true},
            toObject: {virtuals:true}
        }
    );

    //reverse populate with virtuals
    HotelSchema.virtual('bookings',{
        ref:'Booking',  
        localField:'_id',
        foreignField:'hotel', 
        justOne:false
    });

    module.exports = mongoose.model("Hotel", HotelSchema);