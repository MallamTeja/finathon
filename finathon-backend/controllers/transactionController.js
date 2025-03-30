const Transaction = require("../models/transaction");

// Add a new transaction
exports.addTransaction = async (req, res) => {
    try {
        const { userId, type, amount, category, date, description } = req.body;

        const transaction = new Transaction({
            userId,
            type, // "income" or "expense"
            amount,
            category,
            date,
            description,
        });

        await transaction.save();
        res.status(201).json({ message: "Transaction added successfully", transaction });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// Get all transactions for a user
exports.getTransactions = async (req, res) => {
    try {
        const { userId } = req.params;
        const transactions = await Transaction.find({ userId }).sort({ date: -1 });
        res.status(200).json(transactions);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// Delete a transaction
exports.deleteTransaction = async (req, res) => {
    try {
        const { transactionId } = req.params;
        await Transaction.findByIdAndDelete(transactionId);
        res.status(200).json({ message: "Transaction deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// Get financial insights
exports.getInsights = async (req, res) => {
    try {
        const { userId } = req.params;
        const transactions = await Transaction.find({ userId });

        let totalIncome = 0;
        let totalExpense = 0;
        let categoryBreakdown = {};

        transactions.forEach((txn) => {
            if (txn.type === "income") {
                totalIncome += txn.amount;
            } else {
                totalExpense += txn.amount;
                categoryBreakdown[txn.category] = (categoryBreakdown[txn.category] || 0) + txn.amount;
            }
        });

        res.status(200).json({
            totalIncome,
            totalExpense,
            balance: totalIncome - totalExpense,
            categoryBreakdown,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};
