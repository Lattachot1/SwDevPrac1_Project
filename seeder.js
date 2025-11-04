// seeder.js
// Safe seeder: will NOT delete existing data. Adds mock users/hotels/bookings/review only if missing.
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const connectDB = require("./config/db");

dotenv.config({ path: "./config/config.env" });

const User = require("./models/User");
const Hotel = require("./models/Hotel");
const Booking = require("./models/Booking");
const Review = require("./models/Review");

async function seedData() {
  await connectDB();

  console.log("🌱 Seeding mock data (no deletes)...");

  // --- Users ---
  let admin = await User.findOne({ email: "admin@test.com" });
  let user = await User.findOne({ email: "user@test.com" });

  if (!admin || !user) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash("123456", salt);

    if (!admin) {
      admin = await User.create({
        name: "Admin User",
        tel: "0999999999",
        email: "admin@test.com",
        password: passwordHash,
        role: "admin"
      });
      console.log("👑 Created admin:", admin.email);
    }

    if (!user) {
      user = await User.create({
        name: "Test User",
        tel: "0888888888",
        email: "user@test.com",
        password: passwordHash,
        role: "user"
      });
      console.log("👤 Created user:", user.email);
    }
  } else {
    console.log("👥 Users already exist, skipping creation.");
  }

  // --- Hotels ---
  const hotelNames = ["Sunset Resort", "Urban Stay", "Mountain View"];
  const existingHotels = await Hotel.find({ name: { $in: hotelNames } });
  const existingNames = existingHotels.map(h => h.name);

  const hotelsToInsert = [
    {
      name: "Sunset Resort",
      address: "123 Beach Road",
      district: "Mueang Phuket",
      province: "Phuket",
      postalcode: "83000",
      tel: "076123456",
      region: "South"
    },
    {
      name: "Urban Stay",
      address: "45 Sukhumvit Road",
      district: "Khlong Toei",
      province: "Bangkok",
      postalcode: "10110",
      tel: "021234567",
      region: "Central"
    },
    {
      name: "Mountain View",
      address: "98 Hill Lane",
      district: "Mueang Chiang Mai",
      province: "Chiang Mai",
      postalcode: "50000",
      tel: "053999888",
      region: "North"
    }
  ].filter(h => !existingNames.includes(h.name));

  if (hotelsToInsert.length > 0) {
    const inserted = await Hotel.insertMany(hotelsToInsert);
    console.log("🏨 Added hotels:", inserted.map(h => h.name));
  } else {
    console.log("🏨 Hotels already exist, skipping creation.");
  }

  // refresh hotels from DB to get IDs
  const sunset = await Hotel.findOne({ name: "Sunset Resort" });
  const urban = await Hotel.findOne({ name: "Urban Stay" });
  const mountain = await Hotel.findOne({ name: "Mountain View" });

  // --- Bookings for test user ---
  // IMPORTANT: use 'hotel' (lowercase) because Booking schema expects 'hotel'
  const userBookingsCount = await Booking.countDocuments({ user: user._id });
  if (userBookingsCount === 0) {
    const bookings = await Booking.create([
      {
        bookDate: new Date("2025-11-10"),
        user: user._id,
        hotel: sunset._id   // <-- lowercase field name
      },
      {
        bookDate: new Date("2025-11-12"),
        user: user._id,
        hotel: urban._id    // <-- lowercase
      }
    ]);
    console.log("🧾 Created bookings for user:", bookings.length);
  } else {
    console.log("🧾 User already has bookings, skipping creation.");
  }

  // create a review for the first booking if not exists
  const firstBooking = await Booking.findOne({ user: user._id }).sort({ createdAt: 1 });
  if (firstBooking) {
    const existingReview = await Review.findOne({ booking: firstBooking._id });
    if (!existingReview) {
      const review = await Review.create({
        title: "Fantastic stay",
        rating: 5,
        comment: "Very clean, friendly staff, and great view.",
        user: user._id,
        hotel: firstBooking.hotel, // booking.hotel (lowercase)
        booking: firstBooking._id
      });
      console.log("⭐ Added review:", review.title);
    } else {
      console.log("⭐ Review for first booking already exists, skipping.");
    }
  } else {
    console.log("⚠️ No booking found for user to create a review.");
  }

  console.log("✅ Seeding complete (no deletion).");
  process.exit(0);
}

seedData().catch(err => {
  console.error("❌ Error seeding data:", err);
  process.exit(1);
});
