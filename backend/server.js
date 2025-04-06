const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { connectDB, User, Transaction, SavingsGoal } = require('./db');
const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transaction');
const budgetRoutes = require('./routes/budget');
const savingsRoutes = require('./routes/savings');

console.log('Starting server...');

// Load environment variables
dotenv.config();
console.log('Environment variables loaded');

const app = express();
console.log('Express app created');

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());

// Serve static files from frontend
app.use(express.static(path.join(__dirname, '../frontend/public')));

// Connect to MongoDB
connectDB().catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});

// Add error handler for MongoDB connection
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    process.exit(1);
});

// Root API route
app.get('/api', (req, res) => {
    res.json({
        message: 'Welcome to FinTrack API',
        endpoints: {
            auth: {
                register: 'POST /api/auth/register',
                login: 'POST /api/auth/login'
            },
            transactions: {
                list: 'GET /api/transactions',
                create: 'POST /api/transactions'
            },
            savingsGoals: {
                list: 'GET /api/savings-goals',
                create: 'POST /api/savings-goals',
                update: 'PUT /api/savings-goals/:id'
            }
        }
    });
});

// Auth middleware
const authMiddleware = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name,
            email,
            password: hashedPassword
        });

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });

        res.status(201).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

// Transaction Routes
app.get('/api/transactions', authMiddleware, async (req, res) => {
    try {
        const transactions = await Transaction.find({ user: req.user._id }).sort({ date: -1 });
        res.json(transactions);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ message: 'Error fetching transactions' });
    }
});

app.post('/api/transactions', authMiddleware, async (req, res) => {
    try {
        const { type, category, amount, description } = req.body;

        if (!type || !category || !amount || !description) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const transaction = await Transaction.create({
            user: req.user._id,
            type,
            category,
            amount,
            description
        });

        res.status(201).json(transaction);
    } catch (error) {
        console.error('Error creating transaction:', error);
        res.status(500).json({ message: 'Error creating transaction' });
    }
});

// Savings Goals Routes
app.get('/api/savings-goals', authMiddleware, async (req, res) => {
    try {
        const goals = await SavingsGoal.find({ user_id: req.user._id })
            .sort({ due_date: 1 });
        res.json({
            success: true,
            goals
        });
    } catch (error) {
        console.error('Error fetching savings goals:', error);
        res.status(500).json({
            success: false,
            error: 'Server error',
            message: 'Error fetching savings goals'
        });
    }
});

app.post('/api/savings-goals', authMiddleware, async (req, res) => {
    try {
        const { title, target_amount, category, due_date } = req.body;
        
        const goal = await SavingsGoal.create({
            user_id: req.user._id,
            title,
            target_amount,
            category,
            due_date: new Date(due_date)
        });

        res.status(201).json({
            success: true,
            goal
        });
    } catch (error) {
        console.error('Error creating savings goal:', error);
        res.status(500).json({
            success: false,
            error: 'Server error',
            message: 'Error creating savings goal'
        });
    }
});

app.put('/api/savings-goals/:id', authMiddleware, async (req, res) => {
    try {
        const { current_amount } = req.body;
        const goal = await SavingsGoal.findOneAndUpdate(
            { _id: req.params.id, user_id: req.user._id },
            { current_amount },
            { new: true }
        );

        if (!goal) {
            return res.status(404).json({
                success: false,
                error: 'Not found',
                message: 'Savings goal not found'
            });
        }

        res.json({
            success: true,
            goal
        });
    } catch (error) {
        console.error('Error updating savings goal:', error);
        res.status(500).json({
            success: false,
            error: 'Server error',
            message: 'Error updating savings goal'
        });
    }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/savings-goals', savingsRoutes);

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
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 5000;
console.log(`Starting server on port ${PORT}...`);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API available at: http://localhost:${PORT}/api`);
}); 