const express = require('express');
const router = express.Router();
const { getTeamStats, getTeamMembers, getCommissionRates } = require('../controllers/teamController');
const { protect } = require('../middleware/auth');

router.get('/stats', protect, getTeamStats);
router.get('/members', protect, getTeamMembers);
router.get('/rates', protect, getCommissionRates);

module.exports = router;
