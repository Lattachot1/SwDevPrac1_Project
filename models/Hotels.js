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

    HotelSchema.virtual('bookings',{
        ref:'Booking', //อ้างอิงจาก model Booking ใน  
        localField:'_id',// ค่าฝั่ง Hotel ที่จะเอาไปจับคู่ (ค่า _id ของโรงแรม)
        foreignField:'Hotel', // ฟิลด์ใน Booking ที่อ้างถึงโรงแรม (ObjectId) ฝั่ง Booking ต้องมีฟิลด์ชื่อ Hotel 
        // (ชนิด ObjectId, ref: 'Hotel') ที่เก็บ _id ของโรงแรมไว้ เพื่อให้ Mongooseเอา _id ของ Hotel ไปหา Booking ที่ Booking.Hotel ตรงกัน
        justOne:false // ถ้าเป็น true จะคืนค่าเป็น object เดียว ถ้า false จะคืนค่าเป็น array
    });

    module.exports = mongoose.model("Hotel", HotelSchema);