const Recharge = require('../models/Recharge');
const User = require('../models/User');
const LevelIncome = require('../models/LevelIncome');
const LevelRate = require('../models/LevelRate');

// @desc    Create a recharge request
// @route   POST /api/recharge
// @access  Private
const createRecharge = async (req, res) => {
    try {
        const { amount, transactionId, paymentMethod } = req.body;

        const recharge = await Recharge.create({
            user: req.user.id,
            amount,
            transactionId,
            paymentMethod: paymentMethod || 'USDT',
            status: 'pending'
        });

        res.status(201).json({
            success: true,
            data: recharge
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Confirm recharge (Admin) and distribute commission
// @route   PUT /api/recharge/:id/confirm
// @access  Private/Admin
const confirmRecharge = async (req, res) => {
    try {
        const recharge = await Recharge.findById(req.params.id).populate('user');

        if (!recharge) {
            return res.status(404).json({ success: false, message: 'Recharge not found' });
        }

        if (recharge.status === 'completed') {
            return res.status(400).json({ success: false, message: 'Recharge already completed' });
        }

        // Check if this is the FIRST recharge for the user
        const existingRecharges = await Recharge.countDocuments({
            user: recharge.user._id,
            status: 'completed'
        });

        const isFirstRecharge = existingRecharges === 0;

        recharge.status = 'completed'; // Standardize to 'completed'
        await recharge.save();

        const user = recharge.user;
        const amount = recharge.amount;

        // Update user's wallet
        await User.findByIdAndUpdate(user._id, {
            $inc: { electronicWallet: amount, totalRecharge: amount }
        });

        // Distribute Level Income ONLY if it's the first recharge
        if (isFirstRecharge) {
            // Fetch dynamic commission rates from LevelRate
            const rateDoc = await LevelRate.findOne({ type: 'recharge' });
            const ratesData = rateDoc || { L1: 13, L2: 1, L3: 1 };

            // Convert percent to decimal (e.g. 13 -> 0.13)
            // Use undefined check to allow 0 as a valid rate
            const getRate = (val, def) => (val !== undefined && val !== null) ? val : def;

            const rates = [
                getRate(ratesData.L1, 13) / 100,
                getRate(ratesData.L2, 1) / 100,
                getRate(ratesData.L3, 1) / 100
            ];
            let currentUplineId = user.referredBy;

            for (let i = 0; i < 3; i++) {
                if (!currentUplineId) break;

                const upline = await User.findById(currentUplineId);
                if (!upline) break;

                const commission = amount * rates[i];

                // Create Level Income record
                await LevelIncome.create({
                    from: user._id,
                    to: upline._id,
                    amount: commission,
                    level: i + 1,
                    type: 'recharge'
                });

                // Update Upline's wallet and stats
                await User.findByIdAndUpdate(upline._id, {
                    $inc: {
                        electronicWallet: commission,
                        totalIncome: commission,
                        totalCommission: commission
                    }
                });

                currentUplineId = upline.referredBy;
            }
        }

        res.status(200).json({
            success: true,
            message: isFirstRecharge
                ? 'Recharge confirmed and first-deposit commissions distributed'
                : 'Recharge confirmed (no commission for subsequent deposits)'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get user recharges
// @route   GET /api/recharge/my
// @access  Private
const getMyRecharges = async (req, res) => {
    try {
        const recharges = await Recharge.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: recharges
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Reject recharge (Admin)
// @route   PUT /api/recharge/:id/reject
// @access  Private/Admin
const rejectRecharge = async (req, res) => {
    try {
        const recharge = await Recharge.findById(req.params.id);

        if (!recharge) {
            return res.status(404).json({ success: false, message: 'Recharge not found' });
        }

        if (recharge.status !== 'pending') {
            return res.status(400).json({ success: false, message: 'Recharge already processed' });
        }

        recharge.status = 'rejected';
        await recharge.save();

        res.status(200).json({
            success: true,
            message: 'Recharge rejected'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createRecharge,
    confirmRecharge,
    getMyRecharges,
    rejectRecharge
};
