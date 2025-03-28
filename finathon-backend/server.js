require('dotenv').config();
const express = require('express');
const mongoose = require('./config/db'); 
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Serve Frontend Files
app.use(express.static(path.join(__dirname, '../finathon-frontend')));

// Routes
const userRoutes = require('./routes/userRoutes');
const transactionRoutes = require('./routes/transactionRoutes');

app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../finathon-frontend/index.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
