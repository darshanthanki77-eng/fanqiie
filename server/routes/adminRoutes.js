const express = require('express');
const router = express.Router();
const {
    getDashboardStats,
    getAllUsers,
    getPendingRecharges,
    getPendingWithdrawals,
    getAllPackages,
    approveWithdrawal,
    rejectWithdrawal,
    getPendingPurchases,
    activatePackage,
    toggleBlockUser,
    updateUser,
    getUserLevels,
    getSystemSettings,
    updateSystemSettings,
    getRatings,
    getAllPurchases,
    getAllRecharges,
    getAllWithdrawals,
    blockIP,
    unblockIP,
    getBlockedIPs
} = require('../controllers/adminController');
const { getAdminUserDetails, adjustBalance, changeParent, adminResetPassword } = require('../controllers/userDetailController');
const { getTrailers, createTrailer: addTrailer, deleteTrailer: removeTrailer, updateTrailer, bulkUpdateTrailers } = require('../controllers/trailerController');
const { confirmRecharge, rejectRecharge } = require('../controllers/rechargeController');
const { getAllBannersAdmin, createBanner, updateBanner, deleteBanner } = require('../controllers/bannerController');
const { getAllAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } = require('../controllers/announcementController');
const { adminAuth } = require('../middleware/adminAuth');

// Dashboard
router.get('/dashboard', adminAuth, getDashboardStats);

// Users
router.get('/users', adminAuth, getAllUsers);
router.get('/user-levels', adminAuth, getUserLevels);
router.put('/users/:id/block', adminAuth, toggleBlockUser);
router.put('/users/:id', adminAuth, updateUser);
router.get('/users/:id/details', adminAuth, getAdminUserDetails);
router.post('/users/:id/adjust-balance', adminAuth, adjustBalance);
router.put('/users/:id/change-parent', adminAuth, changeParent);
router.put('/users/:id/reset-password', adminAuth, adminResetPassword);

// Recharges
router.get('/recharges/pending', adminAuth, getPendingRecharges);
router.get('/recharges/history', adminAuth, getAllRecharges);
router.put('/recharges/:id/confirm', adminAuth, confirmRecharge);
router.put('/recharges/:id/reject', adminAuth, rejectRecharge);

// Withdrawals
router.get('/withdrawals/pending', adminAuth, getPendingWithdrawals);
router.get('/withdrawals/history', adminAuth, getAllWithdrawals);
router.put('/withdrawals/:id/approve', adminAuth, approveWithdrawal);
router.put('/withdrawals/:id/reject', adminAuth, rejectWithdrawal);

// Packages
router.get('/packages', adminAuth, getAllPackages);
router.get('/packages/history', adminAuth, getAllPurchases);
router.get('/packages/pending', adminAuth, getPendingPurchases);
router.put('/packages/activate/:id', adminAuth, activatePackage);

// CRUD Packages
const { createPackage, updatePackage, deletePackage } = require('../controllers/packageController');
router.post('/packages/create', adminAuth, createPackage);
router.put('/packages/:id', adminAuth, updatePackage);
router.delete('/packages/:id', adminAuth, deletePackage);

// Trailers
router.get('/trailers', adminAuth, getTrailers);
router.post('/trailers', adminAuth, addTrailer);
router.post('/trailers/bulk-update', adminAuth, bulkUpdateTrailers);
router.put('/trailers/:id', adminAuth, updateTrailer);
router.delete('/trailers/:id', adminAuth, removeTrailer);

// System Settings
router.get('/settings', adminAuth, getSystemSettings);
router.put('/settings', adminAuth, updateSystemSettings);

// Ratings
router.get('/ratings', adminAuth, getRatings);

// IP Blocking
router.get('/ips/blocked', adminAuth, getBlockedIPs);
router.post('/ips/block', adminAuth, blockIP);
router.delete('/ips/:ip/unblock', adminAuth, unblockIP);

// Banners
router.get('/banners', adminAuth, getAllBannersAdmin);
router.post('/banners', adminAuth, createBanner);
router.put('/banners/:id', adminAuth, updateBanner);
router.delete('/banners/:id', adminAuth, deleteBanner);

// Announcements
router.get('/announcements', adminAuth, getAllAnnouncements);
router.post('/announcements', adminAuth, createAnnouncement);
router.put('/announcements/:id', adminAuth, updateAnnouncement);
router.delete('/announcements/:id', adminAuth, deleteAnnouncement);

module.exports = router;
