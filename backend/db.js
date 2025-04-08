const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load .env file from the root directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MongoDB URI is not defined in environment variables');
        }

        console.log('Attempting to connect to MongoDB...');
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            retryWrites: true,
            w: 'majority'
        });

        console.log('MongoDB connected successfully');
        return conn;
    } catch (error) {
        console.error('MongoDB connection error:', error);
        // Don't exit immediately, let the server handle the error
        throw error;
    }
};

module.exports = { connectDB };