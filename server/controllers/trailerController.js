const Trailer = require('../models/Trailer');
const Rating = require('../models/Rating');

// @desc    Get all trailers
// @route   GET /api/trailers
// @access  Public
const getTrailers = async (req, res) => {
    try {
        const trailers = await Trailer.find().lean();

        // Calculate average rating for each trailer
        const trailersWithRatings = [];

        for (const trailer of trailers) {
            const ratings = await Rating.find({ trailer: trailer._id });
            let avg = "5.0";

            if (ratings.length > 0) {
                const sum = ratings.reduce((acc, r) => acc + r.stars, 0);
                avg = (sum / ratings.length).toFixed(1);
            }

            trailersWithRatings.push({ ...trailer, stars: avg });
        }

        res.status(200).json({
            success: true,
            count: trailersWithRatings.length,
            data: trailersWithRatings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Create a trailer
// @route   POST /api/trailers
// @access  Private/Admin (for now just Public for testing)
const createTrailer = async (req, res) => {
    try {
        const trailer = await Trailer.create(req.body);
        res.status(201).json({
            success: true,
            data: trailer
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const deleteTrailer = async (req, res) => {
    try {
        const trailer = await Trailer.findById(req.params.id);

        if (!trailer) {
            return res.status(404).json({ success: false, message: 'Trailer not found' });
        }

        await trailer.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Trailer deleted'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const updateTrailer = async (req, res) => {
    try {
        const trailer = await Trailer.findById(req.params.id);

        if (!trailer) {
            return res.status(404).json({ success: false, message: 'Trailer not found' });
        }

        const { title, thumbnail, videoUrl, duration, category } = req.body;

        if (title) trailer.title = title;
        if (thumbnail) trailer.thumbnail = thumbnail;
        if (videoUrl) trailer.videoUrl = videoUrl;
        if (duration) trailer.duration = duration;
        if (category) trailer.category = category;

        await trailer.save();

        res.status(200).json({
            success: true,
            message: 'Trailer updated successfully',
            data: trailer
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getTrailers,
    createTrailer,
    deleteTrailer,
    updateTrailer
};
