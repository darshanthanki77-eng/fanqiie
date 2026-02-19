const mongoose = require('mongoose');

const withdrawFeeSchema = new mongoose.Schema({
    feePercentage: {
        type: Number,
        required: true,
        default: 5
    },
    minWithdrawal: {
        type: Number,
        default: 2
    },
    noSubordinateWithdrawPercent: {
        type: Number,
        default: 100 // Default to 100% (unrestricted)
    },
    status: {
        type: String,
        default: 'active'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('WithdrawFee', withdrawFeeSchema);
