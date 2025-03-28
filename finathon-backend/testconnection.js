require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://Teja:24r25a6705@finathondb.ti6sv5y.mongodb.net/finathondb";

async function testDB() {
    try {
        await mongoose.connect(MONGODB_URI);

        console.log("✅ Connected to MongoDB Atlas successfully!");
        process.exit(0);
    } catch (error) {
        console.error("❌ MongoDB Connection Failed:", error.message);
        process.exit(1);
    }
}

testDB();
