const mongoose = require('mongoose');

const savingsGoalSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    target_amount: {
        type: Number,
        required: true,
        min: 0
    },
    current_amount: {
        type: Number,
        default: 0,
        min: 0
    },
    due_date: {
        type: Date,
        required: true,
        validate: {
            validator: function(value) {
                return value instanceof Date && !isNaN(value);
            },
            message: 'Invalid date format'
        }
    },
    category: {
        type: String,
        required: true,
        enum: ['Emergency Fund', 'Vacation', 'Education', 'Home', 'Car', 'Other']
    },
    status: {
        type: String,
        enum: ['In Progress', 'Completed', 'Failed'],
        default: 'In Progress'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('SavingsGoal', savingsGoalSchema); 