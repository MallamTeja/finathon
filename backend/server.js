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
app.use(express.static(path.join(__dirname, 'public')));
console.log('Middleware configured');

// Connect to database
console.log('Attempting to connect to database...');
try {
  connectDB();
} catch (error) {
  console.error('Database connection error:', error);
}

// Basic route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Login route
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  // TODO: Implement actual authentication
  console.log('Login attempt:', email);
  res.json({ success: true, message: 'Login successful' });
});

// Register route
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  // TODO: Implement actual registration
  console.log('Registration attempt:', email);
  res.json({ success: true, message: 'Registration successful' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error occurred:', err.stack);
  res.status(500).json({ 
    success: false, 
    error: 'Server Error' 
  });
});

// Start server
const PORT = process.env.PORT || 5000;
console.log(`Starting server on port ${PORT}...`);

try {
  const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Try accessing: http://localhost:${PORT}`);
  }).on('error', (err) => {
    console.error('Server error:', err);
  });
} catch (error) {
  console.error('Failed to start server:', error);
} 