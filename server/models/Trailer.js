const mongoose = require('mongoose');

const trailerSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true
    },
    views: {
        type: String,
        default: '0'
    },
    duration: {
        type: String,
        required: [true, 'Please add duration']
    },
    stars: {
        type: Number,
        default: 5
    },
    points: {
        type: Number,
        default: 0
    },
    thumbnail: {
        type: String,
        required: [true, 'Please add a thumbnail URL']
    },
    videoUrl: {
        type: String,
        default: ''
    },
    category: {
        type: String,
        required: [true, 'Please add a category'],
        enum: ['Trailer', 'Music', 'Commercial advertising']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    // Auto-Engagement Fields
    autoViewsEnabled: { type: Boolean, default: false },
    baseViews: { type: Number, default: 0 },
    dailyIncrement: { type: Number, default: 0 },
    autoLikesEnabled: { type: Boolean, default: false },
    likeRatio: { type: Number, default: 0.8 }, // 80%
    autoRatingEnabled: { type: Boolean, default: false },
    ratingValue: { type: Number, default: 4.5 },
    isRatingDynamic: { type: Boolean, default: false }
}, {
    timestamps: true
});

module.exports = mongoose.model('Trailer', trailerSchema);
