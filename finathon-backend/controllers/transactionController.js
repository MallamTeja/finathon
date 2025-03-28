const Transaction = require('../models/Transaction');

// 🚀 Get All Transactions
exports.getTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find();
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 🚀 Add a New Transaction
exports.addTransaction = async (req, res) => {
    try {
        const { amount, category, type } = req.body;

        if (!amount || !category || !type) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const transaction = new Transaction({ amount, category, type });
        await transaction.save();

        res.status(201).json({ message: "Transaction added successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
