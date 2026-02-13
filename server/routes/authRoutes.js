
const express = require('express');
const router = express.Router();
const { register, login, getMe, updatePassword, updateSecurityPassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);
router.put('/update-password', (req, res, next) => {
    console.log('PUT /api/auth/update-password hit');
    next();
}, protect, updatePassword);
router.put('/update-security-password', (req, res, next) => {
    console.log('PUT /api/auth/update-security-password hit');
    next();
}, protect, updateSecurityPassword);

module.exports = router;
