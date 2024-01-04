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

// Use express-session middleware
const cookieParser = require('cookie-parser');
app.use(cookieParser(process.env.SESSION_KEY));
const session = require('express-session');
app.use(session({
  secret: process.env.SESSION_KEY,
  resave: false,
  saveUninitialized: true,
}));


// Cors
const cors = require('cors')
app.use(cors({origin: "http://localhost:3000", credentials: true}))

// BodyParser
const bodyParser = require('body-parser')	
app.use(bodyParser.urlencoded({extended: false}))			
app.use(express.json())

const bcrypt = require('bcrypt');
const User = require('./models/User');


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

    await user.save();

    // Set a session variable to indicate the user is logged in
    req.session.userId = user._id;

    res.status(201).json({ message: 'User registered successfully' });
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

    // Set a session variable to indicate the user is logged in

    req.session.userId = user._id;
		console.log(req.session.userId)
    res.json({ message: 'Login successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Logout endpoint
app.post('/logout', (req, res) => {
  // Destroy the session to log out the user
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error logging out' });
    }
    res.json({ message: 'Logout successful' });
  });
});

// Check if the user is logged in
app.get('/checkAuth', async (req, res) => {
  try {
    if (req.session.userId) {
      const user = await User.findById(req.session.userId);
      if (user) res.json({ authenticated: true, firstname: user.firstname });
			else res.json({ authenticated: false });
    } else {
      res.json({ authenticated: false });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


app.get('/rooms/json', (req, res) => {
	const rooms = [
    {
      id: 1,
      type: "Standard",
      price: 100
    },
    {
      id: 2,
      type: "Deluxe",
      price: 150
    },
    {
      id: 3,
      type: "Suite",
      price: 220
    }
  ]
  res.status(200).json(rooms);
})

app.listen(PORT)

module.exports = app
