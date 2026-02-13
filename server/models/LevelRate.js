const mongoose = require('mongoose');

const levelRateSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['recharge', 'task'],
        unique: true
    },
    L1: {
        type: Number,
        required: true,
        default: 0
    },
    L2: {
        type: Number,
        required: true,
        default: 0
    },
    L3: {
        type: Number,
        required: true,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('LevelRate', levelRateSchema);
