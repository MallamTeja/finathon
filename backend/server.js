const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const path = require('path');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Transaction = require('./models/Transaction');

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

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User exists',
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    return res.status(201).json({ 
      success: true, 
      message: 'Registration successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email
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

    // Find user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        message: 'Invalid email or password'
      });
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email
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

// Transaction Routes
app.post('/api/transactions', async (req, res) => {
    try {
        const { type, amount, category, description } = req.body;
        
        if (!type || !amount || !category || !description) {
            return res.status(400).json({
                success: false,
                error: 'Missing fields',
                message: 'Please provide all required fields'
            });
        }

        // For now, we'll use a hardcoded user ID
        // In a real app, this would come from the authenticated user
        const userId = '65f1a2b3c4d5e6f7a8b9c0d1'; // Valid MongoDB ObjectId

        const transaction = await Transaction.create({
            user: userId,
            type,
            amount,
            category,
            description
        });

        return res.status(201).json({
            success: true,
            data: transaction
        });
    } catch (error) {
        console.error('Transaction error:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.get('/api/transactions', async (req, res) => {
    try {
        // For now, we'll use a hardcoded user ID
        // In a real app, this would come from the authenticated user
        const userId = '65f1a2b3c4d5e6f7a8b9c0d1'; // Valid MongoDB ObjectId

        const transactions = await Transaction.find({ user: userId })
            .sort({ date: -1 });

        return res.status(200).json({
            success: true,
            count: transactions.length,
            data: transactions
        });
    } catch (error) {
        console.error('Get transactions error:', error);
        return res.status(500).json({
            success: false,
            error: error.message
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