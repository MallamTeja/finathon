const express = require('express');
const { getTransactions, addTransaction } = require('../controllers/transactionController');
const router = express.Router();

// Route to get all transactions
router.get('/', getTransactions);

// Route to add a new transaction
router.post('/add', addTransaction);

module.exports = router;
