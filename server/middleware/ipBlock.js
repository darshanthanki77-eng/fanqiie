const BlockedIP = require('../models/BlockedIP');

const ipBlock = async (req, res, next) => {
    try {
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

        // Handle potential array from x-forwarded-for
        const ipAddress = Array.isArray(ip) ? ip[0] : ip.split(',')[0].trim();

        const isBlocked = await BlockedIP.findOne({ ipAddress });

        if (isBlocked) {
            return res.status(403).json({
                success: false,
                message: 'Your IP address has been blocked due to suspicious activity.'
            });
        }

        next();
    } catch (error) {
        console.error('IP Block Middleware Error:', error);
        next(); // Proceed anyway to not break the app if DB check fails
    }
};

module.exports = ipBlock;
