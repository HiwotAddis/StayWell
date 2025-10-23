import Booking from "../models/Booking.js";
import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";

// function to check availability of room
const checkAvailability = async ({ checkInDate, checkOutDate, room }) => {
  try {
    const bookings = await Booking.find({
      room,
      checkInDate: { $lte: checkOutDate },
      checkOutDate: { $gte: checkInDate },
    });
    const isAvailable = bookings.length === 0;
    return isAvailable;
  } catch (error) {
    console.error(error.message);
  }
};

//API to check availability of a room
// POST /api/bookings/check-availability
export const checkAvailabilityAPI = async (req, res) => {
  try {
    const { room, checkInDate, checkOutDate } = req.body;
    const isAvailable = await checkAvailability({
      room,
      checkInDate,
      checkOutDate,
    });
    res.json({ success: true, isAvailable });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// API to create a new booking
// POST /api/bookings/book

export const createBooking = async (req, res) => {
  try {
    const { room, guests, checkInDate, checkOutDate } = req.body;
    const user = req.user._id;
    //before booking check avaliability

    const isAvailable = await checkAvailability({
      room,
      checkInDate,
      checkOutDate,
    });
    if (!isAvailable) {
      return res.json({ success: false, message: "Room is not available " });
    }

    // Get totalprice from Room
    const roomData = await Room.findById(room).populate("hotel");
    let totalprice = roomData.pricePerNight;
    // calculate totlaprice based on nights
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const timeDiff = checkOut.getTime() - checkIn.getTime();
    const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
    totalprice *= nights;

    const booking = await Booking.create({
      room,
      user,
      hotel: roomData.hotel._id,
      guests: +guests,
      checkInDate,
      checkOutDate,
      totalprice,
    });
    res.json({ success: true, message: "Booking created successfully" });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: "Failed to create booking" });
  }
};

// API to get all bookings for a user
// GET /api/bookings/user
export const getUserBookings = async (req, res) => {
  try {
    const user = req.user._id;
    const bookings = await Booking.find({ user })
      .populate("room hotel")
      .sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: "Failed to fetch bookings" });
  }
};

export const getHotelBookings = async (req, res) => {
  try {
    const hotel = await Hotel.findOne({ owner: req.auth.user._id });
    if (!hotel) {
      return res.json({ success: false, message: "No hotel found" });
    }
    const bookings = await Booking.find({ hotel: hotel._id })
      .populate("room hotel user")
      .sort({ createdAt: -1 });
    // total bookings
    const totalBookings = bookings.length;
    //total revenue
    const totalRevenue = bookings.reduce(
      (acc, booking) => acc + booking.totalprice,
      0
    );
    res.json({
      success: true,
      dashboardData: { bookings, totalBookings, totalRevenue },
    });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: "Failed to fetch bookings" });
  }
};
