const User = require('../models/User');
const Recharge = require('../models/Recharge');
const LevelIncome = require('../models/LevelIncome');
const LevelRate = require('../models/LevelRate');
const UserPackage = require('../models/UserPackage');

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

// @desc    Get detailed downline information with earnings and filters
// @route   GET /api/team/downline-detailed
// @access  Private
const getDownlineDetailed = async (req, res) => {
    try {
        const userId = req.query.userId || req.user.id; // Allow admin to specify userId
        const { level, status, minDeposit, maxDeposit, startDate, endDate, packageType } = req.query;

        // Verify if the requester is authorized for this userId
        let isAuthorized = req.user.id === userId;

        if (!isAuthorized) {
            const requester = await User.findById(req.user.id);
            if (requester && requester.isAdmin === 1) {
                isAuthorized = true;
            }
        }

        if (!isAuthorized) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        // 1. Get all downline IDs across 3 levels
        const level1Users = await User.find({ referredBy: userId }).select('_id');
        const level1Ids = level1Users.map(u => u._id);

        const level2Users = await User.find({ referredBy: { $in: level1Ids } }).select('_id');
        const level2Ids = level2Users.map(u => u._id);

        const level3Users = await User.find({ referredBy: { $in: level2Ids } }).select('_id');
        const level3Ids = level3Users.map(u => u._id);

        let allDownlineIds = [];
        allDownlineIds.push(...level1Ids);
        allDownlineIds.push(...level2Ids);
        allDownlineIds.push(...level3Ids);

        // 2. Build Query Filters for Users
        let userQuery = { _id: { $in: allDownlineIds } };

        if (status === 'active') {
            userQuery.totalRecharge = { $gt: 0 };
        } else if (status === 'inactive') {
            userQuery.totalRecharge = 0;
        }

        if (minDeposit) userQuery.totalRecharge = { ...userQuery.totalRecharge, $gte: Number(minDeposit) };
        if (maxDeposit) userQuery.totalRecharge = { ...userQuery.totalRecharge, $lte: Number(maxDeposit) };

        if (startDate || endDate) {
            userQuery.createdAt = {};
            if (startDate) userQuery.createdAt.$gte = new Date(startDate);
            if (endDate) userQuery.createdAt.$lte = new Date(endDate);
        }

        // 3. Fetch Users
        let users = await User.find(userQuery)
            .select('email mobile invitationCode totalRecharge totalIncome totalCommission totalWithdraw electronicWallet flexibleWallet frozenWallet createdAt referredBy')
            .sort({ createdAt: -1 });

        // 4. Enrich with Level, Current Package, and Commissions Given
        const enrichedUsers = await Promise.all(users.map(async (u) => {
            let uLevel = 0;
            if (level1Ids.some(id => id.equals(u._id))) uLevel = 1;
            else if (level2Ids.some(id => id.equals(u._id))) uLevel = 2;
            else if (level3Ids.some(id => id.equals(u._id))) uLevel = 3;

            // Current Package
            const activePkg = await UserPackage.findOne({ user: u._id, status: 'active' }).sort({ createdAt: -1 });

            // Commissions given to the parent (the target userId)
            const commissionGiven = await LevelIncome.aggregate([
                { $match: { from: u._id, to: userId } },
                { $group: { _id: null, total: { $sum: "$amount" } } }
            ]);

            return {
                ...u.toObject(),
                level: uLevel,
                currentPackage: activePkg ? activePkg.packageName : 'None',
                commissionGiven: commissionGiven.length > 0 ? commissionGiven[0].total : 0,
                selfIncome: u.totalIncome - u.totalCommission,
                walletBalance: (u.electronicWallet || 0) + (u.flexibleWallet || 0)
            };
        }));

        // Filter by Level if requested
        let filteredUsers = enrichedUsers;
        if (level) {
            filteredUsers = filteredUsers.filter(u => u.level === Number(level));
        }

        // Filter by packageType if provided
        if (packageType) {
            filteredUsers = filteredUsers.filter(u => u.currentPackage.toLowerCase().includes(packageType.toLowerCase()));
        }

        // 5. Calculate Global Stats for the target user's downline
        const totalDirect = level1Ids.length;
        const totalTeam = level1Ids.length + level2Ids.length + level3Ids.length;
        const activeUsersCount = await User.countDocuments({ _id: { $in: allDownlineIds }, totalRecharge: { $gt: 0 } });
        const inactiveUsersCount = totalTeam - activeUsersCount;

        // Level-wise Income Summary
        const levelIncomes = await LevelIncome.aggregate([
            { $match: { to: userId } },
            { $group: { _id: "$level", total: { $sum: "$amount" } } }
        ]);

        const levelIncomeSummary = {
            1: levelIncomes.find(i => i._id === 1)?.total || 0,
            2: levelIncomes.find(i => i._id === 2)?.total || 0,
            3: levelIncomes.find(i => i._id === 3)?.total || 0
        };

        const totalTeamIncome = levelIncomeSummary[1] + levelIncomeSummary[2] + levelIncomeSummary[3];

        res.status(200).json({
            success: true,
            stats: {
                totalDirect,
                totalTeam,
                activeUsersCount,
                inactiveUsersCount,
                levelIncomeSummary,
                totalTeamIncome
            },
            data: filteredUsers
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
    getCommissionRates,
    getDownlineDetailed
};
