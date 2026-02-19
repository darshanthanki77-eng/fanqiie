const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['popup', 'ticker', 'both'],
        default: 'popup'
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    backgroundColor: {
        type: String,
        default: '#1e293b'
    },
    textColor: {
        type: String,
        default: '#ffffff'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Announcement', announcementSchema);
