const express = require("express");
const Transaction = require("../models/Transaction");

const router = express.Router();

// AI-Based Financial Analysis (Basic Prediction)
router.get("/", async (req, res) => {
    try {
        const transactions = await Transaction.find();

        let totalIncome = 0, totalExpenses = 0, lastMonthExpenses = 0;
        let currentMonth = new Date().getMonth() + 1;

        transactions.forEach(txn => {
            if (txn.type === "income") {
                totalIncome += txn.amount;
            } else {
                totalExpenses += txn.amount;
                let txnMonth = new Date(txn.createdAt).getMonth() + 1;
                if (txnMonth === currentMonth - 1) {
                    lastMonthExpenses += txn.amount;
                }
            }
        });

        let expenseTrend = (totalExpenses - lastMonthExpenses) / (lastMonthExpenses || 1) * 100;
        let trendMessage = expenseTrend > 10 ? "⚠️ High Spending Detected!" : "✅ Spending is Stable.";

        res.json({
            message: "🧠 AI Analysis Completed!",
            insights: trendMessage,
            predictedSavings: totalIncome - totalExpenses,
        });
    } catch (error) {
        res.status(500).json({ message: "❌ AI Analysis Failed", error });
    }
});

module.exports = router;
