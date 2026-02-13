const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
    level: {
        type: String,
        required: [true, 'Please add a level (e.g. 1-star or Trial)'],
        unique: true
    },
    dailyEarnings: {
        type: Number,
        required: [true, 'Please add number of daily earnings (Times)']
    },
    validDays: {
        type: Number,
        required: [true, 'Please add valid days']
    },
    dailyIncome: {
        type: String,
        required: [true, 'Please add daily income amount']
    },
    unlockPrice: {
        type: String,
        required: [true, 'Please add unlock price']
    },
    isTrial: {
        type: Boolean,
        default: false
    },
    isOpenSoon: {
        type: Boolean,
        default: false
    },
    order: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Package', packageSchema);
