const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    stars: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    trailer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Trailer'
    },
    videoTitle: {
        type: String,
        default: 'Trailer'
    },
    date: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Rating', ratingSchema);
