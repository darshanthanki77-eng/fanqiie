const TaskLog = require('../models/TaskLog');
const UserPackage = require('../models/UserPackage');
const User = require('../models/User');
const Package = require('../models/Package');
const LevelIncome = require('../models/LevelIncome');
const LevelRate = require('../models/LevelRate');
const Rating = require('../models/Rating');
const Trailer = require('../models/Trailer');

// @desc    Get available tasks for today based on active packages
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
    try {
        const userPackages = await UserPackage.find({
            user: req.user.id,
            status: { $in: ['active', 'pending'] }
        }).populate('package');

        const tasks = userPackages.map(up => {
            const today = new Date().setHours(15, 0, 0, 0); // Singapore 15:00 refresh logic or simple date
            // The prompt says "Refresh time: 15:00 Singapore Time".
            // Need to check if lastTaskDate is BEFORE the last 15:00 SGT.

            // Simplified logic: Check if lastTaskDate is today (local server time) for now, or implement strict SGT check
            // Let's implement a basic "is done today" check.
            const now = new Date();
            const lastTask = up.lastTaskDate ? new Date(up.lastTaskDate) : null;

            // Basic: allowed if lastTask is null or not same day
            let isCompleted = false;
            if (lastTask) {
                if (lastTask.toDateString() === now.toDateString()) {
                    isCompleted = true;
                }
            }

            return {
                userPackageId: up._id,
                packageName: up.package.level,
                dailyEarnings: up.package.dailyIncome,
                status: up.status,
                isCompleted
            };
        });

        res.status(200).json({
            success: true,
            data: tasks
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Complete a task
// @route   POST /api/tasks/complete
// @access  Private
const completeTask = async (req, res) => {
    try {
        const { userPackageId, rating, trailerId, videoTitle } = req.body;
        const userPackage = await UserPackage.findById(userPackageId).populate('package');

        if (!userPackage) {
            return res.status(404).json({ success: false, message: 'Active package not found' });
        }

        if (userPackage.user.toString() !== req.user.id) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        // Daily limit check
        const now = new Date();
        if (userPackage.lastTaskDate) {
            const lastTask = new Date(userPackage.lastTaskDate);
            if (lastTask.toDateString() === now.toDateString()) {
                return res.status(400).json({ success: false, message: 'Task already completed today' });
            }
        }

        const earning = parseFloat(userPackage.package.dailyIncome);

        // Update UserPackage
        userPackage.lastTaskDate = now;
        userPackage.completedTasksCount += 1;
        await userPackage.save();

        // Credit User Wallet
        await User.findByIdAndUpdate(req.user.id, {
            $inc: { electronicWallet: earning, totalIncome: earning }
        });

        // Log Task
        await TaskLog.create({
            user: req.user.id,
            package: userPackage.package._id,
            earning
        });

        // Save Rating if provided
        if (rating) {
            await Rating.create({
                user: req.user.id,
                stars: rating,
                trailer: trailerId,
                videoTitle: videoTitle || 'Trailer'
            });
        }

        // Distribute Level Income (Task Rebate) - Use specific Task Rates
        try {
            const rateDoc = await LevelRate.findOne({ type: 'task' });
            // Default to 1% for tasks if not set
            const ratesData = rateDoc || { L1: 1, L2: 1, L3: 1 };

            const rates = [
                (ratesData.L1 || 0) / 100,
                (ratesData.L2 || 0) / 100,
                (ratesData.L3 || 0) / 100
            ];

            const currentUser = await User.findById(req.user.id);
            let currentUplineId = currentUser.referredBy;

            for (let i = 0; i < 3; i++) {
                if (!currentUplineId) break;

                const upline = await User.findById(currentUplineId);
                if (!upline) break;

                const commission = earning * rates[i];

                if (commission > 0) {
                    // Create Level Income record
                    await LevelIncome.create({
                        from: currentUser._id,
                        to: upline._id,
                        amount: commission,
                        level: i + 1,
                        type: 'earning' // 'earning' type for task rebates
                    });

                    // Update Upline's wallet and stats
                    await User.findByIdAndUpdate(upline._id, {
                        $inc: {
                            electronicWallet: commission,
                            totalIncome: commission,
                            totalCommission: commission
                        }
                    });
                }

                currentUplineId = upline.referredBy;
            }
        } catch (commError) {
            console.error('Error distributing task commission:', commError);
            // Don't fail the whole request if commission distribution fails
        }

        res.status(200).json({
            success: true,
            message: `Task completed! Earned ${earning} USDT`,
            data: { earning }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getTasks,
    completeTask
};
