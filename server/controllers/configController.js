const Contact = require('../models/Contact');

// @desc    Get public contact settings
// @route   GET /api/config/contact
// @access  Public
const getContactInfo = async (req, res) => {
    try {
        let contact = await Contact.findOne();
        if (!contact) {
            contact = {
                whatsappNumber: '',
                telegramLink: '',
                whatsappEnabled: false,
                telegramEnabled: false
            };
        }
        res.status(200).json({
            success: true,
            data: contact
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getContactInfo
};
