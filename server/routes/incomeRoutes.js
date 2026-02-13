const express = require('express');
const router = express.Router();
const { getMyIncomes, getIncomeStats } = require('../controllers/incomeController');
const { protect } = require('../middleware/auth');

router.get('/my', protect, getMyIncomes);
router.get('/stats', protect, getIncomeStats);

module.exports = router;
