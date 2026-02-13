const mongoose = require('mongoose');

const withdrawSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    fee: {
        type: Number,
        default: 0
    },
    finalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    walletAddress: {
        type: String,
        required: true
    },
    network: {
        type: String,
        required: true
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

module.exports = mongoose.model('Withdraw', withdrawSchema);
