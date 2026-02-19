const Announcement = require('../models/Announcement');

// @desc    Get active announcements for public display
// @route   GET /api/announcements
// @access  Public
const getActiveAnnouncements = async (req, res) => {
    try {
        const now = new Date();
        const announcements = await Announcement.find({
            isActive: true,
            startDate: { $lte: now },
            endDate: { $gte: now }
        }).sort({ priority: -1, createdAt: -1 });

        res.status(200).json({
            success: true,
            data: announcements
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all announcements for admin
// @route   GET /api/admin/announcements
// @access  Private/Admin
const getAllAnnouncements = async (req, res) => {
    try {
        const announcements = await Announcement.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: announcements
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Create announcement
// @route   POST /api/admin/announcements
// @access  Private/Admin
const createAnnouncement = async (req, res) => {
    try {
        const announcement = await Announcement.create(req.body);
        res.status(201).json({
            success: true,
            data: announcement
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update announcement
// @route   PUT /api/admin/announcements/:id
// @access  Private/Admin
const updateAnnouncement = async (req, res) => {
    try {
        const announcement = await Announcement.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!announcement) {
            return res.status(404).json({ success: false, message: 'Announcement not found' });
        }
        res.status(200).json({
            success: true,
            data: announcement
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete announcement
// @route   DELETE /api/admin/announcements/:id
// @access  Private/Admin
const deleteAnnouncement = async (req, res) => {
    try {
        const announcement = await Announcement.findByIdAndDelete(req.params.id);
        if (!announcement) {
            return res.status(404).json({ success: false, message: 'Announcement not found' });
        }
        res.status(200).json({
            success: true,
            message: 'Announcement deleted'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getActiveAnnouncements,
    getAllAnnouncements,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement
};
