const express = require('express');
const router = express.Router();
const { createRecharge, confirmRecharge, getMyRecharges } = require('../controllers/rechargeController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createRecharge);
router.get('/my', protect, getMyRecharges);
router.put('/:id/confirm', protect, confirmRecharge); // In a real app, only admin

module.exports = router;
