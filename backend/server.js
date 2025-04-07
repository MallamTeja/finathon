require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Transaction, SavingsGoal } = require('./db');
const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transaction');
const budgetRoutes = require('./routes/budget');
const savingsRoutes = require('./routes/savings');

console.log('Starting server...');

// Load environment variables
console.log('Environment variables loaded');

const app = express();
console.log('Express app created');

// Middleware
app.use(cors({
    origin: '*',  // Allow all origins in development
    credentials: true
}));
app.use(express.json());

// Serve static files from frontend/public directory
app.use(express.static(path.join(__dirname, '../frontend/public')));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

// Add error handler for MongoDB connection
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    process.exit(1);
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/savings-goals', savingsRoutes);

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
        
        // Validate input
        if (!type || !category || !amount || !description) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        
        if (type !== 'income' && type !== 'expense') {
            return res.status(400).json({ error: 'Invalid transaction type' });
        }
        
        if (isNaN(amount) || amount <= 0) {
            return res.status(400).json({ error: 'Invalid amount' });
        }

        const transaction = new Transaction({
            user: req.user._id,
            type,
            category,
            amount,
            description,
            date: new Date()
        });

        await transaction.save();
        
        // Update user's balance
        const user = await User.findById(req.user._id);
        if (type === 'income') {
            user.balance += amount;
        } else {
            user.balance -= amount;
        }
        await user.save();

        res.status(201).json(transaction);
    } catch (error) {
        console.error('Error adding transaction:', error);
        res.status(500).json({ error: 'Failed to add transaction' });
    }
});

// Get dashboard data
app.get('/api/dashboard', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        
        // Get recent transactions
        const recentTransactions = await Transaction.find({ user: req.user._id })
            .sort({ date: -1 })
            .limit(5);
        
        // Calculate income and expenses for current month
        const currentDate = new Date();
        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        
        const monthlyTransactions = await Transaction.find({
            user: req.user._id,
            date: { $gte: firstDayOfMonth }
        });
        
        const income = monthlyTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
            
        const expenses = monthlyTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        res.json({
            balance: user.balance,
            income,
            expenses,
            recentTransactions
        });
    } catch (error) {
        console.error('Error getting dashboard data:', error);
        res.status(500).json({ error: 'Failed to get dashboard data' });
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

const PORT = process.env.PORT || 5000;

// Serve static files for any route not matching /api
app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(__dirname, '../frontend/public/index.html'));
    }
});

// Listen on all network interfaces
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Frontend available at: http://localhost:${PORT}`);
    console.log(`API available at: http://localhost:${PORT}/api`);
});

module.exports = app; 