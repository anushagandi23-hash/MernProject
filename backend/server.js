require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const express = require('express');
const mongoose = require('mongoose');
const cors = require("cors");

const Bus = require('./models/bus');

const app = express();
app.use(cors()); 
// middleware
app.use(express.json());



/* ===========================
   ADD BUS
=========================== */
app.post('/buses', async (req, res) => {
  try {
    const {
      busNumber,
      from,
      to,
      departureTime,
      arrivalTime,
      price,
      totalSeats
    } = req.body;

    const bus = new Bus({
      busNumber,
      from,
      to,
      departureTime,
      arrivalTime,
      price,
      totalSeats
    });

    await bus.save();
    res.status(201).send("Bus added successfully");

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/* ===========================
   GET ALL BUSES
=========================== */
app.get('/buses', async (req, res) => {
  const buses = await Bus.find();
  res.json(buses);
});

/* ===========================
   SEARCH BUSES
=========================== */


app.get('/buses/search', async (req, res) => {
  const { from, to } = req.query;

  const buses = await Bus.find({
    from: { $regex: new RegExp(`^${from}$`, 'i') },
    to: { $regex: new RegExp(`^${to}$`, 'i') }
  });

  res.json(buses);
});


/* ===========================
   VIEW SEATS
=========================== */
app.get('/buses/:id/seats', async (req, res) => {
  const bus = await Bus.findById(req.params.id);

  if (!bus) {
    return res.status(404).send("Bus not found");
  }

  const allSeats = Array.from(
    { length: bus.totalSeats },
    (_, i) => i + 1
  );

  const availableSeats = allSeats.filter(
    seat => !bus.bookedSeats.includes(seat)
  );

  res.json({
    totalSeats: bus.totalSeats,
    bookedSeats: bus.bookedSeats,
    availableSeats
  });
});
//authentication middleware
const auth = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).send("Access denied");
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).send("Invalid token");
  }
};

/* ===========================
   BOOK SEATS
=========================== */
app.post('/buses/:id/book', auth, async (req, res) => {
  try {
    console.log("BOOK REQUEST BODY:", req.body);
    console.log("BUS ID:", req.params.id);
    console.log("USER:", req.user);

    const { seats } = req.body;
    const bus = await Bus.findById(req.params.id);

    if (!bus) {
      return res.status(404).send("Bus not found");
    }

    if (!Array.isArray(seats) || seats.length === 0) {
      return res.status(400).send("Seats must be an array");
    }

    // invalid seat numbers
    const invalidSeats = seats.filter(
      seat => seat < 1 || seat > bus.totalSeats
    );

    if (invalidSeats.length > 0) {
      return res.status(400).json({
        message: "Invalid seat numbers",
        seats: invalidSeats
      });
    }

    // already booked seats
    const alreadyBooked = seats.filter(seat =>
      bus.bookedSeats.includes(seat)
    );

    if (alreadyBooked.length > 0) {
      return res.status(400).json({
        message: "Seats already booked",
        seats: alreadyBooked
      });
    }

    bus.bookedSeats.push(...seats);
    await bus.save();

    res.json({
      message: "Seats booked successfully",
      bookedSeats: bus.bookedSeats
    });

  } catch (error) {
    res.status(500).send(error.message);
  }
});
//
app.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword
    });

    await user.save();

    res.status(201).send("User registered successfully");

  } catch (error) {
    res.status(400).send(error.message);
  }
});
//
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).send("User not found");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(400).send("Invalid password");
  }

  const token = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.json({ token });
});




/* ===========================
   DATABASE CONNECTION
=========================== */
const PORT = process.env.PORT || 5001;
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
.then(() => {
  console.log("MongoDB connected");

  app.listen(PORT, () => {
    console.log(`Express server running on port ${PORT}`);
  });
})
.catch(err => {
  console.error("MongoDB connection error:", err);
});
