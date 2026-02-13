const User = require('../models/User');
const Recharge = require('../models/Recharge');
const LevelIncome = require('../models/LevelIncome');
const LevelRate = require('../models/LevelRate');

// @desc    Get team statistics across 3 levels
// @route   GET /api/team/stats
// @access  Private
const getTeamStats = async (req, res) => {
    try {
        const userId = req.user.id;

        // Level 1: Direct referrals
        const level1Users = await User.find({ referredBy: userId }).select('_id createdAt');
        const level1Ids = level1Users.map(u => u._id);

        // Level 2: Referrals of Level 1
        const level2Users = await User.find({ referredBy: { $in: level1Ids } }).select('_id createdAt');
        const level2Ids = level2Users.map(u => u._id);

        // Level 3: Referrals of Level 2
        const level3Users = await User.find({ referredBy: { $in: level2Ids } }).select('_id createdAt');
        const level3Ids = level3Users.map(u => u._id);

        // Helper to get stats for a group of IDs
        const getGroupStats = async (ids) => {
            if (ids.length === 0) return { headcount: 0, active: 0, topUp: 0, earnings: 0 };

            const headcount = ids.length;

            // For 'active', let's say a user who has ever recharged is active
            const activeCount = await User.countDocuments({
                _id: { $in: ids },
                totalRecharge: { $gt: 0 }
            });

            // Total Top Up (Recharges)
            const recharges = await Recharge.aggregate([
                { $match: { user: { $in: ids }, status: 'approved' } },
                { $group: { _id: null, total: { $sum: "$amount" } } }
            ]);
            const topUp = recharges.length > 0 ? recharges[0].total : 0;

            // Earnings (Income generated FOR THE LOGGED IN USER from this level)
            const incomes = await LevelIncome.aggregate([
                { $match: { to: userId, from: { $in: ids } } },
                { $group: { _id: null, total: { $sum: "$amount" } } }
            ]);
            const earnings = incomes.length > 0 ? incomes[0].total : 0;

            return { headcount, active: activeCount, topUp, earnings };
        };

        const level1Data = await getGroupStats(level1Ids);
        const level2Data = await getGroupStats(level2Ids);
        const level3Data = await getGroupStats(level3Ids);

        // General Stats
        const totalTeamMembers = level1Users.length + level2Users.length + level3Users.length;

        // Total Team Topup
        const allTeamIds = [...level1Ids, ...level2Ids, ...level3Ids];
        const teamRecharges = await Recharge.aggregate([
            { $match: { user: { $in: allTeamIds }, status: 'approved' } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        const teamTotalTopup = teamRecharges.length > 0 ? teamRecharges[0].total : 0;
        // Added Today
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const addedToday = await User.countDocuments({
            _id: { $in: allTeamIds },
            createdAt: { $gte: startOfDay }
        });

        // Earnings Today
        const teamIncomesToday = await LevelIncome.aggregate([
            { $match: { to: userId, createdAt: { $gte: startOfDay } } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        const teamEarningsToday = teamIncomesToday.length > 0 ? teamIncomesToday[0].total : 0;

        res.status(200).json({
            success: true,
            data: {
                totalTeamMembers,
                teamTotalTopup,
                addedToday,
                teamEarningsToday,
                levels: {
                    1: level1Data,
                    2: level2Data,
                    3: level3Data
                }
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get team members by level
// @route   GET /api/team/members?level=1
// @access  Private
const getTeamMembers = async (req, res) => {
    try {
        const userId = req.user.id;
        const level = parseInt(req.query.level) || 1;

        if (level < 1 || level > 3) {
            return res.status(400).json({
                success: false,
                message: 'Level must be between 1 and 3'
            });
        }

        let members = [];

        if (level === 1) {
            // Direct referrals
            members = await User.find({ referredBy: userId })
                .select('email mobile invitationCode totalRecharge totalIncome createdAt')
                .sort({ createdAt: -1 });
        } else if (level === 2) {
            // Level 2: referrals of referrals
            const level1 = await User.find({ referredBy: userId }).select('_id');
            const level1Ids = level1.map(u => u._id);

            members = await User.find({ referredBy: { $in: level1Ids } })
                .select('email mobile invitationCode totalRecharge totalIncome createdAt')
                .sort({ createdAt: -1 });
        } else if (level === 3) {
            // Level 3: referrals of level 2
            const level1 = await User.find({ referredBy: userId }).select('_id');
            const level1Ids = level1.map(u => u._id);

            const level2 = await User.find({ referredBy: { $in: level1Ids } }).select('_id');
            const level2Ids = level2.map(u => u._id);

            members = await User.find({ referredBy: { $in: level2Ids } })
                .select('email mobile invitationCode totalRecharge totalIncome createdAt')
                .sort({ createdAt: -1 });
        }

        res.status(200).json({
            success: true,
            level,
            count: members.length,
            data: members
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get commission rates for display
// @route   GET /api/team/rates
// @access  Private
const getCommissionRates = async (req, res) => {
    try {
        const rechargeRates = await LevelRate.findOne({ type: 'recharge' });

        const defaultRates = { L1: 13, L2: 1, L3: 1 };
        const rates = rechargeRates ? {
            L1: rechargeRates.L1,
            L2: rechargeRates.L2,
            L3: rechargeRates.L3
        } : defaultRates;

        res.status(200).json({
            success: true,
            data: rates
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getTeamStats,
    getTeamMembers,
    getCommissionRates
};
