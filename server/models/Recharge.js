const mongoose = require('mongoose');

const rechargeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'active', 'rejected'],
        default: 'pending'
    },
    transactionId: {
        type: String,
        unique: true
    },
    paymentMethod: {
        type: String,
        default: 'USDT'
    },
    date: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Recharge', rechargeSchema);
