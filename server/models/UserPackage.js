const mongoose = require('mongoose');

const userPackageSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    package: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Package',
        required: true
    },
    packageName: String,
    dailyEarnings: Number,
    dailyIncome: String,
    unlockPrice: String,
    status: {
        type: String,
        enum: ['active', 'expired', 'pending'],
        default: 'pending'
    },
    purchaseDate: {
        type: Date,
        default: Date.now
    },
    expiryDate: {
        type: Date,
        required: true
    },
    lastTaskDate: {
        type: Date
    },
    completedTasksCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('UserPackage', userPackageSchema);
