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
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Trailer', trailerSchema);
