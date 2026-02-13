const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getPackages,
    createPackage,
    updatePackage,
    deletePackage,
    checkWalletBalance,
    purchasePackage,
    getUserPackages
} = require('../controllers/packageController');

router.route('/')
    .get(getPackages)
    .post(createPackage);

router.get('/my-packages', protect, getUserPackages);
router.post('/check-balance', protect, checkWalletBalance);
router.post('/purchase', protect, purchasePackage);

router.route('/:id')
    .put(updatePackage)
    .delete(deletePackage);

module.exports = router;
