const express = require('express');
const router = express.Router();
const { getFinanceStats } = require('../controllers/financeController');
const { protect, admin } = require('../middleware/auth');

// Note: assuming admin middleware exists or role is checked in controller
// Current protect middleware sets req.user. isAdmin logic should be applied.
// Looking at adminController, they use project but most admin routes are /admin/...
// and handled by AdminRoute on frontend. 
// Let's protect it and check if user is admin.

const adminProtect = async (req, res, next) => {
    if (req.user && req.user.isAdmin === 1) {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Not authorized as admin' });
    }
};

router.get('/stats', protect, adminProtect, getFinanceStats);

module.exports = router;
