const express = require("express");
const Transaction = require("../models/Transaction");

const router = express.Router();

// Get financial insights for a user
router.get("/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const transactions = await Transaction.find({ userId });

        if (!transactions.length) {
            return res.status(400).json({ message: "No transactions found for insights!" });
        }

        // Calculate insights
        const totalIncome = transactions
            .filter(txn => txn.type === "income")
            .reduce((sum, txn) => sum + txn.amount, 0);

        const totalExpenses = transactions
            .filter(txn => txn.type === "expense")
            .reduce((sum, txn) => sum + txn.amount, 0);

        const balance = totalIncome - totalExpenses;
        const expenseByCategory = {};

        transactions.forEach(txn => {
            if (txn.type === "expense") {
                expenseByCategory[txn.category] = (expenseByCategory[txn.category] || 0) + txn.amount;
            }
        });

        res.status(200).json({
            totalIncome,
            totalExpenses,
            balance,
            expenseByCategory,
            message: "Financial insights generated successfully!"
        });
    } catch (error) {
        res.status(500).json({ message: "Server error. Please try again." });
    }
});

module.exports = router;
