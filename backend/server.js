const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const path = require('path');

console.log('Starting server...');

// Load environment variables
dotenv.config();
console.log('Environment variables loaded');

const app = express();
console.log('Express app created');

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from frontend
app.use(express.static(path.join(__dirname, '../frontend/public')));

// API Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Missing fields',
        message: 'Please provide name, email, and password'
      });
    }

    console.log('Registration attempt:', email);
    
    // For now, return a successful response
    return res.json({ 
      success: true, 
      message: 'Registration successful',
      user: {
        name: name,
        email: email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Registration failed',
      message: 'An error occurred during registration'
    });
  }
});

// Login route
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Missing credentials',
        message: 'Please provide both email and password'
      });
    }

    console.log('Login attempt:', email);
    
    // For now, return a successful response
    return res.status(200).json({ 
      success: true, 
      message: 'Login successful',
      user: {
        email: email,
        name: email.split('@')[0] // Temporary: use email prefix as name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Login failed',
      message: 'An error occurred during login'
    });
  }
});

// Handle 404 for API routes
app.use('/api/*', (req, res) => {
  return res.status(404).json({
    success: false,
    error: 'Not Found',
    message: 'API endpoint not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error occurred:', err.stack);
  return res.status(500).json({ 
    success: false, 
    error: err.message || 'Server Error',
    message: 'An unexpected error occurred'
  });
});

// Connect to database
console.log('Attempting to connect to database...');
try {
  connectDB();
} catch (error) {
  console.error('Database connection error:', error);
}

// Start server
const PORT = process.env.PORT || 5000;
console.log(`Starting server on port ${PORT}...`);

try {
  const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`API available at: http://localhost:${PORT}/api`);
  }).on('error', (err) => {
    console.error('Server error:', err);
  });
} catch (error) {
  console.error('Failed to start server:', error);
} 