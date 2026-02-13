const User = require('../models/User');
const Recharge = require('../models/Recharge');
const Withdraw = require('../models/Withdraw');
const UserPackage = require('../models/UserPackage');
const Package = require('../models/Package');
const LevelRate = require('../models/LevelRate');
const Rating = require('../models/Rating');
const Config = require('../models/Config');
const WithdrawFee = require('../models/WithdrawFee');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
    try {
        // Total users & Status Breakdown
        const userStats = await User.aggregate([
            {
                $match: {
                    $or: [
                        { isAdmin: 0 },
                        { isAdmin: { $exists: false } }
                    ]
                }
            },
            {
                $group: {
                    _id: { $ifNull: ["$isBlocked", false] },
                    count: { $sum: 1 }
                }
            }
        ]);

        const totalUsers = userStats.reduce((acc, curr) => acc + curr.count, 0);
        const blockedUsers = userStats.find(s => s._id === true)?.count || 0;
        const activeUsers = totalUsers - blockedUsers;

        // Recharges Breakdown
        const rechargeStats = await Recharge.aggregate([
            {
                $group: {
                    _id: '$status',
                    total: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            }
        ]);

        // Withdrawals Breakdown
        const withdrawalStats = await Withdraw.aggregate([
            {
                $group: {
                    _id: '$status',
                    total: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            }
        ]);

        // Packages Breakdown
        const packageStats = await UserPackage.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const getStat = (arr, id, field = 'total') => arr.find(s => s._id === id)?.[field] || 0;

        const totalRatings = await Rating.countDocuments();

        res.status(200).json({
            success: true,
            data: {
                users: {
                    total: totalUsers,
                    active: activeUsers,
                    blocked: blockedUsers
                },
                recharges: {
                    completed: getStat(rechargeStats, 'completed'),
                    pending: getStat(rechargeStats, 'pending'),
                    rejected: getStat(rechargeStats, 'rejected')
                },
                withdrawals: {
                    approved: getStat(withdrawalStats, 'approved'),
                    pending: getStat(withdrawalStats, 'pending'),
                    rejected: getStat(withdrawalStats, 'rejected')
                },
                packages: {
                    active: getStat(packageStats, 'active', 'count'),
                    pending: getStat(packageStats, 'pending', 'count'),
                    expired: getStat(packageStats, 'expired', 'count')
                },
                totalRatings,
                // For backward compatibility if needed by other components
                totalRecharges: getStat(rechargeStats, 'completed'),
                totalWithdrawals: getStat(withdrawalStats, 'approved'),
                pendingRecharges: getStat(rechargeStats, 'pending', 'count'),
                pendingWithdrawals: getStat(withdrawalStats, 'pending', 'count'),
                activePackages: getStat(packageStats, 'active', 'count')
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const users = await User.find({
            $or: [
                { isAdmin: 0 },
                { isAdmin: { $exists: false } }
            ]
        })
            .select('-loginPassword -securityPassword')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await User.countDocuments({
            $or: [
                { isAdmin: 0 },
                { isAdmin: { $exists: false } }
            ]
        });

        res.status(200).json({
            success: true,
            count: users.length,
            total,
            page,
            pages: Math.ceil(total / limit),
            data: users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all pending recharges
// @route   GET /api/admin/recharges/pending
// @access  Private/Admin
const getPendingRecharges = async (req, res) => {
    try {
        console.log('Fetching pending recharges...');
        const rawRecharges = await Recharge.find({ status: { $ne: 'completed' } });
        console.log('Raw recharges in DB:', rawRecharges);

        const recharges = await Recharge.find({ status: { $ne: 'completed' } })
            .populate('user', 'email mobile invitationCode')
            .sort({ createdAt: -1 });

        console.log(`Found ${recharges.length} pending recharges after population`);

        res.status(200).json({
            success: true,
            count: recharges.length,
            data: recharges
        });
    } catch (error) {
        console.error('Error fetching pending recharges:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all pending withdrawals
// @route   GET /api/admin/withdrawals/pending
// @access  Private/Admin
const getPendingWithdrawals = async (req, res) => {
    try {
        const withdrawals = await Withdraw.find({ status: 'pending' })
            .populate('user', 'email mobile invitationCode')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: withdrawals.length,
            data: withdrawals
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all withdrawals (history)
// @route   GET /api/admin/withdrawals/history
// @access  Private/Admin
const getAllWithdrawals = async (req, res) => {
    try {
        const { status } = req.query;
        let query = {};

        if (status && status !== 'all') {
            query.status = status;
        }

        const withdrawals = await Withdraw.find(query)
            .populate('user', 'email mobile invitationCode')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: withdrawals.length,
            data: withdrawals
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all packages
// @route   GET /api/admin/packages
// @access  Private/Admin
const getAllPackages = async (req, res) => {
    try {
        const packages = await Package.find().sort({ unlockPrice: 1 });

        res.status(200).json({
            success: true,
            count: packages.length,
            data: packages
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Approve withdrawal
// @route   PUT /api/admin/withdrawals/:id/approve
// @access  Private/Admin
const approveWithdrawal = async (req, res) => {
    try {
        const withdraw = await Withdraw.findById(req.params.id);

        if (!withdraw) {
            return res.status(404).json({ success: false, message: 'Withdrawal not found' });
        }

        if (withdraw.status !== 'pending') {
            return res.status(400).json({ success: false, message: 'Withdrawal not in pending status' });
        }

        withdraw.status = 'approved';
        await withdraw.save();

        // Update user stats
        await User.findByIdAndUpdate(withdraw.user, {
            $inc: { totalWithdraw: withdraw.amount }
        });

        res.status(200).json({
            success: true,
            message: 'Withdrawal approved successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Reject withdrawal
// @route   PUT /api/admin/withdrawals/:id/reject
// @access  Private/Admin
const rejectWithdrawal = async (req, res) => {
    try {
        const withdraw = await Withdraw.findById(req.params.id);

        if (!withdraw) {
            return res.status(404).json({ success: false, message: 'Withdrawal not found' });
        }

        if (withdraw.status !== 'pending') {
            return res.status(400).json({ success: false, message: 'Withdrawal not in pending status' });
        }

        withdraw.status = 'failed';
        await withdraw.save();

        // Refund the user's electronic wallet
        await User.findByIdAndUpdate(withdraw.user, {
            $inc: { electronicWallet: withdraw.amount }
        });

        res.status(200).json({
            success: true,
            message: 'Withdrawal rejected and funds refunded'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all pending package purchases
// @route   GET /api/admin/packages/pending
// @access  Private/Admin
const getPendingPurchases = async (req, res) => {
    try {
        const purchases = await UserPackage.find({ status: 'pending' })
            .populate('user', 'email mobile invitationCode')
            .populate('package')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: purchases.length,
            data: purchases
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all package purchases (history)
// @route   GET /api/admin/packages/history
// @access  Private/Admin
const getAllPurchases = async (req, res) => {
    try {
        const { status } = req.query;
        let query = {};

        if (status && status !== 'all') {
            query.status = status;
        }

        const purchases = await UserPackage.find(query)
            .populate('user', 'email mobile invitationCode')
            .populate('package', 'level unlockPrice')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: purchases.length,
            data: purchases
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all recharges (history)
// @route   GET /api/admin/recharges/history
// @access  Private/Admin
const getAllRecharges = async (req, res) => {
    try {
        const { status } = req.query;
        let query = {};

        if (status && status !== 'all') {
            query.status = status;
        }

        const recharges = await Recharge.find(query)
            .populate('user', 'email mobile invitationCode')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: recharges.length,
            data: recharges
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Activate package purchase
// @route   PUT /api/admin/packages/activate/:id
// @access  Private/Admin
const activatePackage = async (req, res) => {
    try {
        const userPackage = await UserPackage.findById(req.params.id);

        if (!userPackage) {
            return res.status(404).json({ success: false, message: 'Purchase record not found' });
        }

        if (userPackage.status !== 'pending') {
            return res.status(400).json({ success: false, message: 'Package already active or expired' });
        }

        userPackage.status = 'active';
        userPackage.activatedAt = Date.now();
        await userPackage.save();

        res.status(200).json({
            success: true,
            message: 'Package activated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Block/Unblock user
// @route   PUT /api/admin/users/:id/block
// @access  Private/Admin
const toggleBlockUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.isBlocked = !user.isBlocked;
        await user.save();

        res.status(200).json({
            success: true,
            message: user.isBlocked ? 'User blocked' : 'User unblocked',
            isBlocked: user.isBlocked
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update user details
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
    try {
        const { email, mobile, electronicWallet, flexibleWallet, frozenWallet, totalRecharge, totalWithdraw, totalIncome, loginPassword } = req.body;

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Update fields if provided
        if (email) user.email = email;
        if (mobile) user.mobile = mobile;
        if (electronicWallet !== undefined) user.electronicWallet = Number(electronicWallet);
        if (flexibleWallet !== undefined) user.flexibleWallet = Number(flexibleWallet);
        if (frozenWallet !== undefined) user.frozenWallet = Number(frozenWallet);
        if (totalRecharge !== undefined) user.totalRecharge = Number(totalRecharge);
        if (totalWithdraw !== undefined) user.totalWithdraw = Number(totalWithdraw);
        if (totalIncome !== undefined) user.totalIncome = Number(totalIncome);

        if (loginPassword && loginPassword.trim().length >= 6) {
            user.loginPassword = loginPassword;
        }

        await user.save();

        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all users with their current levels and commissions
// @route   GET /api/admin/user-levels
// @access  Private/Admin
const getUserLevels = async (req, res) => {
    try {
        const users = await User.find({}, 'email mobile invitationCode totalCommission totalIncome');
        const activePackages = await UserPackage.find({ status: 'active' }).populate('package', 'level');

        // Map users with their active level
        const data = users.map(user => {
            const userPkg = activePackages.find(pkg => pkg.user.toString() === user._id.toString());
            return {
                _id: user._id,
                email: user.email,
                mobile: user.mobile,
                invitationCode: user.invitationCode,
                totalCommission: user.totalCommission || 0,
                totalIncome: user.totalIncome || 0,
                currentLevel: userPkg ? userPkg.packageName : 'No Level'
            };
        });

        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get system settings
// @route   GET /api/admin/settings
// @access  Private/Admin
const getSystemSettings = async (req, res) => {
    try {
        let rechargeRates = await LevelRate.findOne({ type: 'recharge' });
        let taskRates = await LevelRate.findOne({ type: 'task' });

        if (!rechargeRates) {
            rechargeRates = await LevelRate.create({
                type: 'recharge',
                L1: 13,
                L2: 1,
                L3: 1
            });
        }

        if (!taskRates) {
            taskRates = await LevelRate.create({
                type: 'task',
                L1: 1,
                L2: 1,
                L3: 1
            });
        }

        let withdrawConfig = await WithdrawFee.findOne();
        if (!withdrawConfig) {
            withdrawConfig = await WithdrawFee.create({ feePercentage: 5, minWithdrawal: 2 });
        }

        res.status(200).json({
            success: true,
            data: {
                recharge: { L1: rechargeRates.L1, L2: rechargeRates.L2, L3: rechargeRates.L3 },
                task: { L1: taskRates.L1, L2: taskRates.L2, L3: taskRates.L3 },
                withdrawalFee: withdrawConfig.feePercentage,
                minWithdrawal: withdrawConfig.minWithdrawal
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const updateSystemSettings = async (req, res) => {
    try {
        const { recharge, task } = req.body;

        if (recharge) {
            await LevelRate.findOneAndUpdate(
                { type: 'recharge' },
                {
                    type: 'recharge',
                    L1: Number(recharge.L1),
                    L2: Number(recharge.L2),
                    L3: Number(recharge.L3)
                },
                { new: true, upsert: true }
            );
        }

        if (task) {
            await LevelRate.findOneAndUpdate(
                { type: 'task' },
                {
                    type: 'task',
                    L1: Number(task.L1),
                    L2: Number(task.L2),
                    L3: Number(task.L3)
                },
                { new: true, upsert: true }
            );
        }

        if (req.body.withdrawalFee !== undefined) {
            await WithdrawFee.findOneAndUpdate(
                {},
                {
                    feePercentage: Number(req.body.withdrawalFee),
                    minWithdrawal: req.body.minWithdrawal !== undefined ? Number(req.body.minWithdrawal) : 2
                },
                { upsert: true, new: true }
            );
        }

        res.status(200).json({
            success: true,
            message: 'Settings updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all ratings
// @route   GET /api/admin/ratings
// @access  Private/Admin
const getRatings = async (req, res) => {
    try {
        const ratings = await Rating.find()
            .populate('user', 'email mobile')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: ratings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
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
    getAllWithdrawals
};
