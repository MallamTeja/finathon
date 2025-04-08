const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');

// Get all transactions for a user
router.get('/', auth, async (req, res) => {
    try {
        console.log('Fetching transactions for user:', req.user._id);
        const transactions = await Transaction.find({ user: req.user._id })
            .sort({ date: -1 });
        console.log('Found transactions:', transactions.length);
        res.json(transactions);
    } catch (error) {
        console.error('Error getting transactions:', error);
        res.status(500).json({ error: 'Failed to get transactions' });
    }
});

// Add new transaction
router.post('/', auth, async (req, res) => {
    try {
        console.log('Received transaction data:', req.body);
        const { type, category, amount, description, date } = req.body;
        
        if (!type || !category || !amount) {
            return res.status(400).json({ error: 'Type, category and amount are required' });
        }
        
        if (type !== 'income' && type !== 'expense') {
            return res.status(400).json({ error: 'Invalid transaction type' });
        }
        
        if (isNaN(amount) || amount <= 0) {
            return res.status(400).json({ error: 'Invalid amount' });
        }

        const transaction = new Transaction({
            user: req.user._id,
            type,
            category,
            amount,
            description: description || '',
            date: date ? new Date(date) : new Date()
        });

        console.log('Saving transaction:', transaction);
        await transaction.save();
        console.log('Transaction saved successfully');
        
        // Update user's balance
        if (type === 'income') {
            req.user.balance += amount;
        } else {
            req.user.balance -= amount;
        }
        console.log('Updating user balance:', req.user.balance);
        await req.user.save();
        console.log('User balance updated successfully');

        res.status(201).json(transaction);
    } catch (error) {
        console.error('Error adding transaction:', error);
        res.status(500).json({ error: 'Failed to add transaction', details: error.message });
    }
});

// Update transaction
router.patch('/:id', auth, async (req, res) => {
    try {
        console.log('Updating transaction:', req.params.id);
        const updates = Object.keys(req.body);
        const allowedUpdates = ['description', 'amount', 'category', 'type', 'date'];
        const isValidOperation = updates.every(update => allowedUpdates.includes(update));

        if (!isValidOperation) {
            return res.status(400).json({ error: 'Invalid updates!' });
        }

        const transaction = await Transaction.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        updates.forEach(update => transaction[update] = req.body[update]);
        await transaction.save();
        console.log('Transaction updated successfully');
        res.json(transaction);
    } catch (error) {
        console.error('Error updating transaction:', error);
        res.status(500).json({ error: 'Failed to update transaction', details: error.message });
    }
});

// Delete transaction
router.delete('/:id', auth, async (req, res) => {
    try {
        console.log('Deleting transaction:', req.params.id);
        const transaction = await Transaction.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id
        });

        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }

        console.log('Transaction deleted successfully');
        res.json(transaction);
    } catch (error) {
        console.error('Error deleting transaction:', error);
        res.status(500).json({ error: 'Failed to delete transaction', details: error.message });
    }
});

module.exports = router; 