const User = require('../models/User');
const Recharge = require('../models/Recharge');
const Withdraw = require('../models/Withdraw');
const UserPackage = require('../models/UserPackage');
const Package = require('../models/Package');
const LevelRate = require('../models/LevelRate');
const Rating = require('../models/Rating');
const Config = require('../models/Config');
const WithdrawFee = require('../models/WithdrawFee');
const BlockedIP = require('../models/BlockedIP');
const Contact = require('../models/Contact');
const LevelIncome = require('../models/LevelIncome');
const TaskLog = require('../models/TaskLog');

// @desc    Get complete user details for admin
// @route   GET /api/admin/users/:id/details
// @access  Private/Admin
const getAdminUserDetails = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId).populate('referredBy', 'email mobile invitationCode');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // 1. Current Package
        const currentPackage = await UserPackage.findOne({ user: userId, status: 'active' }).populate('package');

        // 2. Earnings Breakdown
        const selfIncome = await TaskLog.aggregate([
            { $match: { user: user._id } },
            { $group: { _id: null, total: { $sum: '$earning' } } }
        ]);

        const refCommission = await LevelIncome.aggregate([
            { $match: { to: user._id } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const bonusIncome = 0; // Placeholder if bonus system is separate

        // 3. Team Summary & Umbrella Structure
        // Level 1
        const level1 = await User.find({ referredBy: userId }).select('email mobile invitationCode totalRecharge totalIncome createdAt isBlocked');
        const level1Ids = level1.map(u => u._id);

        // Level 2
        const level2 = await User.find({ referredBy: { $in: level1Ids } }).select('email mobile invitationCode totalRecharge totalIncome createdAt isBlocked');
        const level2Ids = level2.map(u => u._id);

        // Level 3
        const level3 = await User.find({ referredBy: { $in: level2Ids } }).select('email mobile invitationCode totalRecharge totalIncome createdAt isBlocked');

        const allSubordinateIds = [...level1Ids, ...level2Ids, ...level3.map(u => u._id)];
        const activeSubordinates = await User.countDocuments({ _id: { $in: allSubordinateIds }, totalRecharge: { $gt: 0 } });

        const teamBusiness = await User.aggregate([
            { $match: { _id: { $in: allSubordinateIds } } },
            { $group: { _id: null, total: { $sum: '$totalRecharge' } } }
        ]);

        // 4. Histories (Limit to last 10 for overview, can be paginated if needed)
        const recharges = await Recharge.find({ user: userId }).sort({ createdAt: -1 }).limit(10);
        const withdrawals = await Withdraw.find({ user: userId }).sort({ createdAt: -1 }).limit(10);
        const commissions = await LevelIncome.find({ to: userId }).sort({ createdAt: -1 }).limit(10).populate('from', 'email mobile');
        const packages = await UserPackage.find({ user: userId }).populate('package').sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: {
                user: {
                    ...user._doc,
                    currentPackageName: currentPackage?.package?.name || 'None'
                },
                earnings: {
                    totalEarned: user.totalIncome || 0,
                    selfIncome: selfIncome[0]?.total || 0,
                    refCommission: refCommission[0]?.total || 0,
                    bonusIncome,
                    totalWithdrawn: user.totalWithdraw || 0,
                    netProfit: (user.totalIncome || 0) - (user.totalWithdraw || 0)
                },
                teamSummary: {
                    totalTeam: allSubordinateIds.length,
                    activeTeam: activeSubordinates,
                    teamBusiness: teamBusiness[0]?.total || 0,
                    totalCommission: user.totalCommission || 0
                },
                downline: {
                    level1: level1.map(u => ({ ...u._doc, level: 1 })),
                    level2: level2.map(u => ({ ...u._doc, level: 2 })),
                    level3: level3.map(u => ({ ...u._doc, level: 3 }))
                },
                histories: {
                    recharges,
                    withdrawals,
                    commissions,
                    packages
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

// @desc    Adjust User Balance
// @route   POST /api/admin/users/:id/adjust-balance
// @access  Private/Admin
const adjustBalance = async (req, res) => {
    try {
        const { amount, action, walletType } = req.body; // action: 'add' or 'deduct', walletType: 'electronicWallet', etc.
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const adjustment = action === 'add' ? Number(amount) : -Number(amount);

        if (adjustment < 0 && user[walletType] < Math.abs(adjustment)) {
            return res.status(400).json({ success: false, message: 'Insufficient balance for deduction' });
        }

        user[walletType] += adjustment;
        await user.save();

        res.status(200).json({
            success: true,
            message: `Successfully ${action}ed ${amount} to ${walletType}`,
            balance: user[walletType]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Change User Parent (Upline)
// @route   PUT /api/admin/users/:id/change-parent
// @access  Private/Admin
const changeParent = async (req, res) => {
    try {
        const { newParentCode } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const newParent = await User.findOne({ invitationCode: newParentCode });
        if (!newParent) return res.status(404).json({ success: false, message: 'New parent not found' });

        if (newParent._id.toString() === user._id.toString()) {
            return res.status(400).json({ success: false, message: 'User cannot be their own parent' });
        }

        // decrement old parent's team size
        if (user.referredBy) {
            await User.findByIdAndUpdate(user.referredBy, { $inc: { teamSize: -1 } });
        }

        user.referredBy = newParent._id;
        await user.save();

        // increment new parent's team size
        await User.findByIdAndUpdate(newParent._id, { $inc: { teamSize: 1 } });

        res.status(200).json({
            success: true,
            message: `Parent successfully changed to ${newParent.email || newParent.mobile}`,
            newParent: { email: newParent.email, mobile: newParent.mobile }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Admin Reset User Password
// @route   PUT /api/admin/users/:id/reset-password
// @access  Private/Admin
const adminResetPassword = async (req, res) => {
    try {
        const { newPassword } = req.body;
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
        }

        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        user.loginPassword = newPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password reset successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getAdminUserDetails,
    adjustBalance,
    changeParent,
    adminResetPassword
};
