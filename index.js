const express = require('express')
const app = express()
const PORT = 5000
require('dotenv').config();

// Connect to mongoDB
const mongoose = require('mongoose')
try {
  mongoose.connect(process.env.DATABASE_URL);
} catch (error) {
  console.error('MongoDB connection error:', error);
}

const User = require('./models/User');
const Reservation = require('./models/Reservation')

// JWT Token for Auth
const jwt = require('jsonwebtoken');

// Cors
const cors = require('cors')
const allowedOrigins = ["http://localhost:3000", "http://localhost:5173", "https://main.d3h5714ovsmoy5.amplifyapp.com"];
app.use(cors({ origin: allowedOrigins, credentials: true }))

// BodyParser
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.json())

const bcrypt = require('bcrypt');

// httpOnly Cookie for JWT token
const cookieParser = require('cookie-parser');
app.use(cookieParser());

// Middleware to authenticate requests
const authenticateJWT = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  jwt.verify(token, process.env.SECRET_KEY, async (err, key) => {
    if (err) return res.sendStatus(403);
    try {
      const user = await User.findById(key.userId);
      if (!user) {
        return res.sendStatus(404); // User not found
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('Error finding user:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
};

// Applying the middleware to the specified routes
app.use(['/checkAuth', '/reservations', '/reservation/new', '/reservation/update', '/reservation/delete'], authenticateJWT);

app.get('/', (req, res) => {
  res.json({ message: "Successfully Connected" })
})

// Registration endpoint
app.post('/register', async (req, res) => {
  try {
    const { firstname, lastname, email, password } = req.body;

    // Check if the email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      firstname: firstname,
      lastname: lastname,
      email: email,
      password: hashedPassword,
    });

    const savedUser = await user.save();

    const token = jwt.sign({ userId: savedUser._id }, process.env.SECRET_KEY, { expiresIn: '5h' });
    res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'Lax'});
    res.status(200).json({ success: true, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Login endpoint
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // After successful authentication, generate a token
    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, { expiresIn: '5h' });
    res.cookie('token', token, { httpOnly: true });
    res.status(200).json({ success: true, secure: true, sameSite: 'Lax' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/logout', (req, res) => {
  // Clear the token cookie by setting an expired date in the past
  res.cookie('token', '', { expires: new Date(0), httpOnly: true });
  res.status(200).json({ success: true, message: 'Logout successful' });
});

// Check if the user is logged in
app.get('/checkAuth', async (req, res) => {
  if (req.user) {
    res.json({ authenticated: true, user: req.user });
  } else {
    res.json({ authenticated: false });
  }
});


app.get('/rooms/json', (req, res) => {
  const rooms = [
    {
      id: 1,
      roomType: "Standard",
      price: 100
    },
    {
      id: 2,
      roomType: "Deluxe",
      price: 150
    },
    {
      id: 3,
      roomType: "Suite",
      price: 220
    }
  ]
  res.status(200).json(rooms);
})

function calculatePrice(checkinDate, checkoutDate, roomType) {
  let pricePerNight = 0;

  switch (roomType) {
    case 'Standard':
      pricePerNight = 100;
      break;
    case 'Deluxe':
      pricePerNight = 150;
      break;
    case 'Suite':
      pricePerNight = 220;
      break;
    default:
      pricePerNight = 150;
  }

  // Ensure checkinDate and checkoutDate are valid Date objects
  const checkinDateObj = new Date(checkinDate.year, checkinDate.month - 1, checkinDate.day);
  const checkoutDateObj = new Date(checkoutDate.year, checkoutDate.month - 1, checkoutDate.day);

  // Calculate the total price: (checkoutDate - checkinDate) * pricePerNight
  const numberOfNights = Math.ceil((checkoutDateObj - checkinDateObj) / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
  const calculatedPrice = numberOfNights * pricePerNight;

  return calculatedPrice;
}

app.post('/reservation/new', async (req, res) => {
  if (!req.user) res.status(401).json({ error: 'Unauthorized' })
  const { checkinDate, checkoutDate, numOfGuests, roomType } = req.body

  let calculatedPrice = calculatePrice(checkinDate, checkoutDate, roomType)

  console.log({
    checkinDate: checkinDate,
      checkoutDate: checkoutDate,
      numOfGuests: numOfGuests,
      roomType: roomType,
      price: calculatedPrice,
  })

  try {
    const newReservation = new Reservation({
      checkinDate: checkinDate,
      checkoutDate: checkoutDate,
      numOfGuests: numOfGuests,
      roomType: roomType,
      price: calculatedPrice,
    })

    await newReservation.save()

    // Add the new reservation to the user's array of reservations
    req.user.reservations.push(newReservation._id);
    await req.user.save();

    res.status(200).json({ message: 'new reservation created successfully' })

  } catch (err) {
    res.status(500).json({ error: 'Internal server error during saving new reservation' })
  }

})

app.post('/reservation/update', async (req, res) => {
  try {
    // Check if the user is authenticated
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Retrieve existing reservation data by reservation ID
    const reservationId = req.body.reservationId;
    const existingReservation = await Reservation.findById(reservationId);

    if (!existingReservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    // Calculate price based on the new data
    const { checkinDate, checkoutDate, numOfGuests, roomType } = req.body;
    let calculatedPrice = calculatePrice(checkinDate, checkoutDate, roomType)

    // Update existing reservation data
    existingReservation.checkinDate = checkinDate;
    existingReservation.checkoutDate = checkoutDate;
    existingReservation.numOfGuests = numOfGuests;
    existingReservation.roomType = roomType;
    existingReservation.price = calculatedPrice;

    // Save the updated reservation to the database
    await existingReservation.save();

    res.status(200).json({ message: 'Reservation updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error during reservation update' });
  }
});

app.get('/reservations', async (req, res) => {
  if (!req.user) res.status(401).json({ error: "Unauthorized" })

  try {
    // If req.user exists, retrieve reservations from user.reservations
    const userReservations = req.user.reservations || [];

    // Fetch the real reservation data using the reservation IDs
    const reservationsData = await Reservation.find({ _id: { $in: userReservations } });

    res.status(200).json(reservationsData);

  } catch(err) {
    console.error(err);
    res.status(500).json({ err: 'Internal server error' });
  }
  
});

app.post('/calculate/room-price', (req, res) => {
  const { checkinDate, checkoutDate, roomType } = req.body;

  if (!checkinDate || !checkoutDate || !roomType) {
    return res.status(400).json({ error: 'checkinDate, checkoutDate, and roomType are required parameters' });
  }

  const calculatedPrice = calculatePrice(checkinDate, checkoutDate, roomType);
  res.status(200).json({ calculatedPrice: calculatedPrice });
});

// TODO check if reservation is also removed from the User model
app.delete('/reservation/delete', async (req, res) => {
  try {
    // Check if the user is authenticated
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Retrieve reservationId from the request body
    const { reservationId } = req.body;

    // Check if reservationId is provided
    if (!reservationId) {
      return res.status(400).json({ error: 'reservationId is a required parameter' });
    }

    // Find and delete the reservation by reservationId
    const deletedReservation = await Reservation.findByIdAndDelete(reservationId);

    // Check if the reservation exists
    if (!deletedReservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    // Remove the reservation reference from the associated user
    await User.updateOne(
      { _id: req.user._id },
      { $pull: { reservations: reservationId } }
    );

    res.status(200).json({ message: 'Reservation deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error during reservation deletion' });
  }
});

app.listen(PORT)
