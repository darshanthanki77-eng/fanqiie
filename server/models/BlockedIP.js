const mongoose = require('mongoose');

const blockedIPSchema = new mongoose.Schema({
    ipAddress: {
        type: String,
        required: true,
        unique: true
    },
    reason: {
        type: String,
        default: 'Fake deposit requests'
    },
    blockedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('BlockedIP', blockedIPSchema);
