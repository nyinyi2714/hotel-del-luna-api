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

// JWT Token for Auth
const jwt = require('jsonwebtoken');
const tokenBlacklist = new Set();

// Middleware to authenticate requests
const authenticateJWT = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.sendStatus(401);

  if (tokenBlacklist.has(token)) {
    return res.sendStatus(401); // Token is blacklisted (logged out)
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

// Cleanup function to remove expired tokens from the blacklist
const cleanupBlacklist = () => {
  const currentTimestamp = Math.floor(Date.now() / 1000);
  tokenBlacklist.forEach((token) => {
    try {
      const decodedToken = jwt.decode(token);
      if (decodedToken && decodedToken.exp && decodedToken.exp < currentTimestamp) {
        tokenBlacklist.delete(token);
      }
    } catch (error) {
      console.error('Error decoding token:', error);
    }
  });
};

// Run the cleanup function every day

const cleanupIntervalInMilliseconds = 24 * 60 * 60 * 1000;
setInterval(cleanupBlacklist, cleanupIntervalInMilliseconds);

// Cors
const cors = require('cors')
app.use(cors({origin: "http://localhost:3000", credentials: true}))

// BodyParser
const bodyParser = require('body-parser')	
app.use(bodyParser.urlencoded({extended: false}))			
app.use(express.json())

const bcrypt = require('bcrypt');

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
    res.status(200).json({ token });
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
    res.status(200).json({ token });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Route to log out and invalidate the token
app.post('/logout', (req, res) => {
  const token = req.header('Authorization');
  if (token) {
    tokenBlacklist.add(token); // Add the token to the blacklist
  }
  res.sendStatus(200);
});


// Check if the user is logged in
app.get('/checkAuth', authenticateJWT, async (req, res) => {
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
