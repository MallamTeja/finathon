const express = require('express');
const router = express.Router();
const Budget = require('../models/Budget');
const auth = require('../middleware/auth');

// Get all budgets
router.get('/', auth, async (req, res) => {
    try {
        const budgets = await Budget.find({ userId: req.user._id });
        const budgetMap = {};
        budgets.forEach(budget => {
            budgetMap[budget.category] = {
                limit: budget.limit,
                spent: budget.spent,
                enabled: budget.enabled
            };
        });
        res.json(budgetMap);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching budgets' });
    }
});

// Get budget by category
router.get('/:category', auth, async (req, res) => {
    try {
        const budget = await Budget.findOne({
            userId: req.user._id,
            category: req.params.category
        });
        if (!budget) {
            return res.json({
                limit: 0,
                spent: 0,
                enabled: false
            });
        }
        res.json(budget);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching budget' });
    }
});

// Update budget
router.patch('/:category', auth, async (req, res) => {
    try {
        const { limit, enabled } = req.body;
        const budget = await Budget.findOneAndUpdate(
            { userId: req.user._id, category: req.params.category },
            { $set: { limit, enabled } },
            { new: true, upsert: true }
        );
        res.json(budget);
    } catch (error) {
        res.status(500).json({ message: 'Error updating budget' });
    }
});

// Update spent amount
router.patch('/:category/spent', auth, async (req, res) => {
    try {
        const { amount } = req.body;
        const budget = await Budget.findOneAndUpdate(
            { userId: req.user._id, category: req.params.category },
            { $inc: { spent: amount } },
            { new: true, upsert: true }
        );
        res.json(budget);
    } catch (error) {
        res.status(500).json({ message: 'Error updating spent amount' });
    }
});

module.exports = router; 