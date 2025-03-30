const express = require("express");
const Transaction = require("../models/Transaction");

const router = express.Router();

// Add a new transaction
router.post("/add", async (req, res) => {
    try {
        const { userId, amount, category, type } = req.body;

        if (!userId || !amount || !category || !type) {
            return res.status(400).json({ message: "All fields are required!" });
        }

        const newTransaction = new Transaction({ userId, amount, category, type });
        await newTransaction.save();

        res.status(201).json({ message: "Transaction added successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Server error. Please try again." });
    }
});

// Get all transactions for a user
router.get("/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const transactions = await Transaction.find({ userId }).sort({ date: -1 });

        res.status(200).json(transactions);
    } catch (error) {
        res.status(500).json({ message: "Server error. Please try again." });
    }
});

// Delete a transaction
router.delete("/:transactionId", async (req, res) => {
    try {
        const { transactionId } = req.params;
        await Transaction.findByIdAndDelete(transactionId);

        res.status(200).json({ message: "Transaction deleted successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Server error. Please try again." });
    }
});

module.exports = router;
