const express = require('express');
const router = express.Router();
const { createRecharge, confirmRecharge, getMyRecharges } = require('../controllers/rechargeController');
const { protect } = require('../middleware/auth');
const ipBlock = require('../middleware/ipBlock');

router.post('/', protect, ipBlock, createRecharge);
router.get('/my', protect, getMyRecharges);
router.put('/:id/confirm', protect, confirmRecharge); // In a real app, only admin

module.exports = router;
