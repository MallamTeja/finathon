const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');
const { pool, initializeDatabase } = require('./db');

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

// Initialize database
initializeDatabase().catch(console.error);

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
    const [existingUsers] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
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
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    return res.status(201).json({ 
      success: true, 
      message: 'Registration successful',
      user: {
        id: result.insertId,
        name,
        email
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
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        message: 'Invalid email or password'
      });
    }

    const user = users[0];

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
        id: user.id,
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

// Transactions API
app.get('/api/transactions', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM transactions ORDER BY date DESC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching transactions' });
    }
});

app.post('/api/transactions', async (req, res) => {
    try {
        const { title, description, amount, type, category, date } = req.body;
        const [result] = await pool.query(
            'INSERT INTO transactions (title, description, amount, type, category, date) VALUES (?, ?, ?, ?, ?, ?)',
            [title, description, amount, type, category, date]
        );
        res.json({ id: result.insertId, ...req.body });
    } catch (error) {
        res.status(500).json({ error: 'Error creating transaction' });
    }
});

app.delete('/api/transactions/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM transactions WHERE id = ?', [req.params.id]);
        res.json({ message: 'Transaction deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting transaction' });
    }
});

// Savings Goals API
app.get('/api/savings-goals', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM savings_goals ORDER BY due_date ASC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching savings goals' });
    }
});

app.post('/api/savings-goals', async (req, res) => {
    try {
        const { title, target_amount, category, due_date } = req.body;
        const [result] = await pool.query(
            'INSERT INTO savings_goals (title, target_amount, category, due_date) VALUES (?, ?, ?, ?)',
            [title, target_amount, category, due_date]
        );
        res.json({ id: result.insertId, ...req.body, current_amount: 0 });
    } catch (error) {
        res.status(500).json({ error: 'Error creating savings goal' });
    }
});

app.put('/api/savings-goals/:id', async (req, res) => {
    try {
        const { current_amount } = req.body;
        await pool.query(
            'UPDATE savings_goals SET current_amount = ? WHERE id = ?',
            [current_amount, req.params.id]
        );
        res.json({ message: 'Savings goal updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error updating savings goal' });
    }
});

app.delete('/api/savings-goals/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM savings_goals WHERE id = ?', [req.params.id]);
        res.json({ message: 'Savings goal deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting savings goal' });
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

// Start server
const PORT = process.env.PORT || 5000;
console.log(`Starting server on port ${PORT}...`);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API available at: http://localhost:${PORT}/api`);
}); 