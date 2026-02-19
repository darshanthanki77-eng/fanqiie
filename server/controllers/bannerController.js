const Banner = require('../models/Banner');

// @desc    Get all active banners (Public)
// @route   GET /api/banners
// @access  Public
const getBanners = async (req, res) => {
    try {
        const banners = await Banner.find({ isActive: true }).sort({ order: 1 });
        res.status(200).json({
            success: true,
            data: banners
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all banners (Admin)
// @route   GET /api/admin/banners
// @access  Private/Admin
const getAllBannersAdmin = async (req, res) => {
    try {
        const banners = await Banner.find().sort({ order: 1 });
        res.status(200).json({
            success: true,
            data: banners
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Create a banner
// @route   POST /api/admin/banners
// @access  Private/Admin
const createBanner = async (req, res) => {
    try {
        const banner = await Banner.create(req.body);
        res.status(201).json({
            success: true,
            data: banner
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update a banner
// @route   PUT /api/admin/banners/:id
// @access  Private/Admin
const updateBanner = async (req, res) => {
    try {
        const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!banner) {
            return res.status(404).json({ success: false, message: 'Banner not found' });
        }
        res.status(200).json({
            success: true,
            data: banner
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete a banner
// @route   DELETE /api/admin/banners/:id
// @access  Private/Admin
const deleteBanner = async (req, res) => {
    try {
        const banner = await Banner.findByIdAndDelete(req.params.id);
        if (!banner) {
            return res.status(404).json({ success: false, message: 'Banner not found' });
        }
        res.status(200).json({
            success: true,
            message: 'Banner deleted'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getBanners,
    getAllBannersAdmin,
    createBanner,
    updateBanner,
    deleteBanner
};
