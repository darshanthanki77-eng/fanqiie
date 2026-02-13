const mongoose = require('mongoose');

const levelIncomeSchema = new mongoose.Schema({
    from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    level: {
        type: Number, // 1, 2, or 3
        required: true
    },
    type: {
        type: String,
        enum: ['recharge', 'earning'],
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('LevelIncome', levelIncomeSchema);
