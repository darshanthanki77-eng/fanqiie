const Withdraw = require('../models/Withdraw');
const User = require('../models/User');
const WithdrawFee = require('../models/WithdrawFee');

// @desc    Create a withdrawal request
// @route   POST /api/withdraw
// @access  Private
const createWithdraw = async (req, res) => {
    try {
        const { amount, walletAddress, network, securityPassword } = req.body;

        const user = await User.findById(req.user.id);

        // Verify security password
        const isMatch = await user.compareSecurityPassword(securityPassword);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid security password' });
        }

        // Check balance (Electronic wallet)
        if (user.electronicWallet < amount) {
            return res.status(400).json({ success: false, message: 'Insufficient balance' });
        }

        const withdrawConfig = await WithdrawFee.findOne() || { feePercentage: 5, minWithdrawal: 2 };

        if (amount < withdrawConfig.minWithdrawal) {
            return res.status(400).json({ success: false, message: `Minimum withdrawal is ${withdrawConfig.minWithdrawal} USDT` });
        }

        const fee = amount * (withdrawConfig.feePercentage / 100);
        const finalAmount = amount - fee;

        const withdraw = await Withdraw.create({
            user: user._id,
            amount,
            fee,
            finalAmount,
            walletAddress,
            network,
            status: 'pending'
        });

        // Deduct from wallet and freeze
        await User.findByIdAndUpdate(user._id, {
            $inc: { electronicWallet: -amount, frozenWallet: amount }
        });

        res.status(201).json({
            success: true,
            data: withdraw
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Approve withdrawal (Admin)
// @route   PUT /api/withdraw/:id/approve
// @access  Private/Admin
const approveWithdraw = async (req, res) => {
    try {
        const withdraw = await Withdraw.findById(req.params.id);

        if (!withdraw) {
            return res.status(404).json({ success: false, message: 'Withdrawal not found' });
        }

        if (withdraw.status !== 'pending') {
            return res.status(400).json({ success: false, message: 'Withdrawal already processed' });
        }

        withdraw.status = 'approved';
        await withdraw.save();

        // Update user stats
        await User.findByIdAndUpdate(withdraw.user, {
            $inc: { frozenWallet: -withdraw.amount, totalWithdraw: withdraw.amount }
        });

        res.status(200).json({
            success: true,
            message: 'Withdrawal approved'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Reject withdrawal (Admin)
// @route   PUT /api/withdraw/:id/reject
// @access  Private/Admin
const rejectWithdraw = async (req, res) => {
    try {
        const withdraw = await Withdraw.findById(req.params.id);

        if (!withdraw) {
            return res.status(404).json({ success: false, message: 'Withdrawal not found' });
        }

        if (withdraw.status !== 'pending') {
            return res.status(400).json({ success: false, message: 'Withdrawal already processed' });
        }

        withdraw.status = 'rejected';
        await withdraw.save();

        // Refund balance
        await User.findByIdAndUpdate(withdraw.user, {
            $inc: { frozenWallet: -withdraw.amount, electronicWallet: withdraw.amount }
        });

        res.status(200).json({
            success: true,
            message: 'Withdrawal rejected and balance refunded'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get user withdrawals
// @route   GET /api/withdraw/my
// @access  Private
const getMyWithdrawals = async (req, res) => {
    try {
        const withdrawals = await Withdraw.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: withdrawals
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createWithdraw,
    approveWithdraw,
    rejectWithdraw,
    getMyWithdrawals
};
