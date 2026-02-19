const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    whatsappNumber: {
        type: String,
        default: ''
    },
    telegramLink: {
        type: String,
        default: ''
    },
    whatsappEnabled: {
        type: Boolean,
        default: true
    },
    telegramEnabled: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Contact', contactSchema);
