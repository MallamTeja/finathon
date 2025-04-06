const express = require('express');
const router = express.Router();
const SavingsGoal = require('../models/SavingsGoal');
const auth = require('../middleware/auth');

// Get all savings goals
router.get('/', auth, async (req, res) => {
    try {
        const savingsGoals = await SavingsGoal.find({ userId: req.user._id })
            .sort({ due_date: 1 });
        res.json(savingsGoals);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create new savings goal
router.post('/', auth, async (req, res) => {
    try {
        const { title, target_amount, due_date, category } = req.body;
        
        // Validate date format
        const parsedDate = new Date(due_date);
        if (isNaN(parsedDate.getTime())) {
            return res.status(400).json({ error: 'Invalid date format' });
        }

        const savingsGoal = new SavingsGoal({
            userId: req.user._id,
            title,
            target_amount,
            due_date: parsedDate,
            category
        });

        await savingsGoal.save();
        res.status(201).json(savingsGoal);
    } catch (error) {
        console.error('Error creating savings goal:', error);
        res.status(400).json({ error: error.message });
    }
});

// Update savings goal progress
router.patch('/:id/update', auth, async (req, res) => {
    try {
        const { amount } = req.body;
        const savingsGoal = await SavingsGoal.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!savingsGoal) {
            return res.status(404).json({ error: 'Savings goal not found' });
        }

        savingsGoal.current_amount += amount;
        
        // Update status based on progress
        if (savingsGoal.current_amount >= savingsGoal.target_amount) {
            savingsGoal.status = 'Completed';
        }

        await savingsGoal.save();
        res.json(savingsGoal);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete a savings goal
router.delete('/:id', auth, async (req, res) => {
    try {
        const savingsGoal = await SavingsGoal.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!savingsGoal) {
            return res.status(404).json({ error: 'Savings goal not found' });
        }

        res.json({ message: 'Savings goal deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 