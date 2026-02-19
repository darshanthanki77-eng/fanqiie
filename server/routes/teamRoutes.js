const express = require('express');
const router = express.Router();
const { getTeamStats, getTeamMembers, getCommissionRates, getDownlineDetailed } = require('../controllers/teamController');
const { protect } = require('../middleware/auth');

router.get('/stats', protect, getTeamStats);
router.get('/members', protect, getTeamMembers);
router.get('/rates', protect, getCommissionRates);
router.get('/downline-detailed', protect, getDownlineDetailed);

module.exports = router;
