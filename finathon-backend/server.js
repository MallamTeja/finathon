const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

// Import Routes
const userRoutes = require("./routes/userRoutes");
const transactionRoutes = require("./routes/transactionRoutes");

dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Connect to Database
connectDB();

// Serve Static Frontend Files
app.use(express.static(path.join(__dirname, "../finathon-frontend")));

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/transactions", transactionRoutes);

// Serve Dashboard as Default Route
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../finathon-frontend/dashboard.html"));
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
