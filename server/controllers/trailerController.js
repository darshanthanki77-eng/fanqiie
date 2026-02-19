const Trailer = require('../models/Trailer');
const Rating = require('../models/Rating');

const formatEngagement = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
};

// @desc    Get all trailers
// @route   GET /api/trailers
// @access  Public
const getTrailers = async (req, res) => {
    try {
        const trailers = await Trailer.find().lean();
        const trailersWithEngagement = [];

        for (const trailer of trailers) {
            let finalViews = parseInt(trailer.views) || 0;
            let finalStars = trailer.stars || 5;
            let finalLikes = 0;

            // 1. Calculate Auto Views
            if (trailer.autoViewsEnabled) {
                const daysDiff = Math.floor((Date.now() - new Date(trailer.createdAt).getTime()) / (1000 * 60 * 60 * 24));
                finalViews = trailer.baseViews + (daysDiff * trailer.dailyIncrement);
            }

            // 2. Calculate Auto Likes
            if (trailer.autoLikesEnabled) {
                finalLikes = Math.floor(finalViews * trailer.likeRatio);
            }

            // 3. Calculate Auto Rating
            if (trailer.autoRatingEnabled) {
                if (trailer.isRatingDynamic) {
                    // Randomize between ratingValue - 0.3 and ratingValue + 0.3
                    finalStars = (trailer.ratingValue - 0.3 + (Math.random() * 0.6)).toFixed(1);
                } else {
                    finalStars = trailer.ratingValue.toFixed(1);
                }
            } else {
                // Fallback to average ratings from Rating model
                const ratings = await Rating.find({ trailer: trailer._id });
                if (ratings.length > 0) {
                    const sum = ratings.reduce((acc, r) => acc + r.stars, 0);
                    finalStars = (sum / ratings.length).toFixed(1);
                } else {
                    finalStars = "5.0";
                }
            }

            trailersWithEngagement.push({
                ...trailer,
                views: formatEngagement(finalViews),
                likes: formatEngagement(finalLikes),
                stars: finalStars,
                rawViews: finalViews,
                rawLikes: finalLikes
            });
        }

        res.status(200).json({
            success: true,
            count: trailersWithEngagement.length,
            data: trailersWithEngagement
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

        const {
            title, thumbnail, videoUrl, duration, category, points,
            autoViewsEnabled, baseViews, dailyIncrement,
            autoLikesEnabled, likeRatio,
            autoRatingEnabled, ratingValue, isRatingDynamic,
            resetGrowth
        } = req.body;

        if (title) trailer.title = title;
        if (thumbnail) trailer.thumbnail = thumbnail;
        if (videoUrl) trailer.videoUrl = videoUrl;
        if (duration) trailer.duration = duration;
        if (category) trailer.category = category;
        if (points !== undefined) trailer.points = Number(points);

        // Engagement updates
        if (autoViewsEnabled !== undefined) trailer.autoViewsEnabled = autoViewsEnabled;
        if (baseViews !== undefined) trailer.baseViews = Number(baseViews);
        if (dailyIncrement !== undefined) trailer.dailyIncrement = Number(dailyIncrement);
        if (autoLikesEnabled !== undefined) trailer.autoLikesEnabled = autoLikesEnabled;
        if (likeRatio !== undefined) trailer.likeRatio = Number(likeRatio);
        if (autoRatingEnabled !== undefined) trailer.autoRatingEnabled = autoRatingEnabled;
        if (ratingValue !== undefined) trailer.ratingValue = Number(ratingValue);
        if (isRatingDynamic !== undefined) trailer.isRatingDynamic = isRatingDynamic;

        if (resetGrowth) {
            trailer.createdAt = Date.now();
        }

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

const bulkUpdateTrailers = async (req, res) => {
    try {
        const { target, category, settings } = req.body;
        let query = {};

        if (target === 'category' && category) {
            query = { category };
        } else if (target !== 'all') {
            return res.status(400).json({ success: false, message: 'Invalid target' });
        }

        const updateData = {};
        if (settings.autoViewsEnabled !== undefined) updateData.autoViewsEnabled = settings.autoViewsEnabled;
        if (settings.baseViews !== undefined) updateData.baseViews = Number(settings.baseViews);
        if (settings.dailyIncrement !== undefined) updateData.dailyIncrement = Number(settings.dailyIncrement);
        if (settings.autoLikesEnabled !== undefined) updateData.autoLikesEnabled = settings.autoLikesEnabled;
        if (settings.likeRatio !== undefined) updateData.likeRatio = Number(settings.likeRatio);
        if (settings.autoRatingEnabled !== undefined) updateData.autoRatingEnabled = settings.autoRatingEnabled;
        if (settings.ratingValue !== undefined) updateData.ratingValue = Number(settings.ratingValue);
        if (settings.isRatingDynamic !== undefined) updateData.isRatingDynamic = settings.isRatingDynamic;

        const result = await Trailer.updateMany(query, { $set: updateData });

        res.status(200).json({
            success: true,
            message: `Successfully updated ${result.modifiedCount} trailers`,
            data: result
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
    updateTrailer,
    bulkUpdateTrailers
};
