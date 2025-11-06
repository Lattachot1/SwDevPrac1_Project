const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser")

//route files
//const hospitals = require("./routes/hospitals");
const auth = require("./routes/auth");
//const appointments = require("./routes/appointments");
const hotels = require("./routes/hotels");
const bookings = require("./routes/bookings");
const reviews = require('./routes/reviews');


dotenv.config({ path: "./config/config.env" });

connectDB();

const app = express(); 

//ทำให้ใช้ lt gt lte gte in query ได้
app.set('query parser', 'extended');

app.use(express.json());
app.use(cookieParser());
app.use("/api/v1/hotels", hotels);
app.use("/api/v1/bookings", bookings);
app.use("/api/v1/auth", auth);
app.use('/api/v1/reviews', reviews);


const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));

process.on("unhandledRejection", (err) => {
    console.log(`Error: ${err.message}`);
    server.close(() => process.exit(1));
});
