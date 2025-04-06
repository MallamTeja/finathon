const express = require('express');
const router = express.Router();
const SavingsGoal = require('../models/SavingsGoal');
const auth = require('../middleware/auth');

// Get all savings goals
router.get('/', auth, async (req, res) => {
    try {
        const goals = await SavingsGoal.find({ userId: req.user._id })
            .sort({ deadline: 1 });
        res.json(goals);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching savings goals' });
    }
});

// Create new savings goal
router.post('/', auth, async (req, res) => {
    try {
        const { title, target, deadline, saved, category } = req.body;
        
        const goal = new SavingsGoal({
            userId: req.user._id,
            title,
            target,
            deadline,
            saved: saved || 0,
            category
        });

        await goal.save();
        res.status(201).json(goal);
    } catch (error) {
        res.status(500).json({ message: 'Error creating savings goal' });
    }
});

// Update savings goal
router.patch('/:id/update', auth, async (req, res) => {
    try {
        const { amount } = req.body;
        const goal = await SavingsGoal.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { $inc: { saved: amount } },
            { new: true }
        );

        if (!goal) {
            return res.status(404).json({ message: 'Savings goal not found' });
        }

        res.json(goal);
    } catch (error) {
        res.status(500).json({ message: 'Error updating savings goal' });
    }
});

// Delete savings goal
router.delete('/:id', auth, async (req, res) => {
    try {
        const goal = await SavingsGoal.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!goal) {
            return res.status(404).json({ message: 'Savings goal not found' });
        }

        res.json({ message: 'Savings goal deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting savings goal' });
    }
});

module.exports = router; 