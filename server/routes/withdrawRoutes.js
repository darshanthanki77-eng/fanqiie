const express = require('express');
const router = express.Router();
const { createWithdraw, approveWithdraw, rejectWithdraw, getMyWithdrawals } = require('../controllers/withdrawController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createWithdraw);
router.get('/my', protect, getMyWithdrawals);
router.put('/:id/approve', protect, approveWithdraw); // Admin
router.put('/:id/reject', protect, rejectWithdraw);   // Admin

module.exports = router;
