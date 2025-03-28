const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    type: { type: String, enum: ["income", "expense"], required: true }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', TransactionSchema);
