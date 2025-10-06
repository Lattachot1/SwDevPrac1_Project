const mongoose = require('mongoose');

const HospitalSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, "Please add a hospital name"],
        unique: true,
        trim: true,
        maxlength:[50, "Hospital name cannot be more than 50 characters"]
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

HospitalSchema.virtual('appointments',{
    ref:'Appointment',
    localField:'_id',// ค่าฝั่ง Hospital ที่จะเอาไปจับคู่ (ค่า _id ของโรงพยาบาล)
    foreignField:'hospital', // ฟิลด์ใน Appointment ที่อ้างถึงโรงพยาบาล (ObjectId)
    justOne:false // ถ้าเป็น true จะคืนค่าเป็น object เดียว ถ้า false จะคืนค่าเป็น array
});

module.exports = mongoose.model("Hospital", HospitalSchema);
