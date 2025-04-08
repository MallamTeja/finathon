const express = require('express');
const router = express.Router();
const SavingsGoal = require('../models/SavingsGoal');
const auth = require('../middleware/auth');

// Get all savings goals
router.get('/', auth, async (req, res) => {
    try {
        const goals = await SavingsGoal.find({ user: req.user._id })
            .sort({ due_date: 1 });
        res.json(goals);
    } catch (error) {
        console.error('Error getting savings goals:', error);
        res.status(500).json({ error: 'Failed to get savings goals' });
    }
});

// Create new savings goal
router.post('/', auth, async (req, res) => {
    try {
        const { name, target_amount, current_amount, due_date } = req.body;
        
        if (!name || !target_amount || !due_date) {
            return res.status(400).json({ error: 'Name, target amount and due date are required' });
        }
        
        if (isNaN(target_amount) || target_amount <= 0) {
            return res.status(400).json({ error: 'Invalid target amount' });
        }

        const goal = new SavingsGoal({
            user: req.user._id,
            name,
            target_amount,
            current_amount: current_amount || 0,
            due_date: new Date(due_date)
        });

        await goal.save();
        res.status(201).json(goal);
    } catch (error) {
        console.error('Error creating savings goal:', error);
        res.status(500).json({ error: 'Failed to create savings goal' });
    }
});

// Update savings goal
router.patch('/:id', auth, async (req, res) => {
    try {
        const updates = Object.keys(req.body);
        const allowedUpdates = ['name', 'target_amount', 'current_amount', 'due_date'];
        const isValidOperation = updates.every(update => allowedUpdates.includes(update));

        if (!isValidOperation) {
            return res.status(400).json({ error: 'Invalid updates!' });
        }

        const goal = await SavingsGoal.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!goal) {
            return res.status(404).json({ error: 'Savings goal not found' });
        }

        updates.forEach(update => goal[update] = req.body[update]);
        await goal.save();
        res.json(goal);
    } catch (error) {
        console.error('Error updating savings goal:', error);
        res.status(500).json({ error: 'Failed to update savings goal' });
    }
});

// Delete savings goal
router.delete('/:id', auth, async (req, res) => {
    try {
        const goal = await SavingsGoal.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id
        });

        if (!goal) {
            return res.status(404).json({ error: 'Savings goal not found' });
        }

        res.json(goal);
    } catch (error) {
        console.error('Error deleting savings goal:', error);
        res.status(500).json({ error: 'Failed to delete savings goal' });
    }
});

module.exports = router; 