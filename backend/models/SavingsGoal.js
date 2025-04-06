const mongoose = require('mongoose');

const savingsGoalSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    target: {
        type: Number,
        required: true
    },
    saved: {
        type: Number,
        default: 0
    },
    deadline: {
        type: Date,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['travel', 'gadget', 'emergency', 'other']
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('SavingsGoal', savingsGoalSchema); 