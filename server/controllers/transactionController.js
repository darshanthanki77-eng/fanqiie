const Recharge = require('../models/Recharge');
const Withdraw = require('../models/Withdraw');
const UserPackage = require('../models/UserPackage');
const LevelIncome = require('../models/LevelIncome');
const TaskLog = require('../models/TaskLog');

// @desc    Get all user transactions (Recharge, Withdrawal, Package Purchase)
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch recharges
        const recharges = await Recharge.find({ user: userId }).sort({ createdAt: -1 });

        // Fetch withdrawals
        const withdrawals = await Withdraw.find({ user: userId }).sort({ createdAt: -1 });

        // Fetch package purchases
        const purchases = await UserPackage.find({ user: userId }).sort({ createdAt: -1 });

        // Fetch Level Income (Commissions)
        const commissions = await LevelIncome.find({ to: userId }).sort({ createdAt: -1 });

        // Fetch Task Earnings
        const taskEarnings = await TaskLog.find({ user: userId }).sort({ createdAt: -1 });

        // Format and merge
        const allTransactions = [
            ...recharges.map(item => ({
                id: item._id,
                type: 'recharge',
                title: 'USDT Recharge',
                amount: item.amount,
                status: item.status,
                date: item.createdAt,
                method: item.paymentMethod || 'USDT'
            })),
            ...withdrawals.map(item => ({
                id: item._id,
                type: 'withdraw',
                title: 'USDT Withdrawal',
                amount: item.amount,
                status: item.status,
                date: item.createdAt,
                method: item.paymentMethod || 'USDT'
            })),
            ...purchases.map(item => ({
                id: item._id,
                type: 'purchase',
                title: `${item.packageName || 'VIP'} Package Purchase`,
                amount: parseFloat(item.unlockPrice?.toString().replace(/[^0-9.]/g, '')) || 0,
                status: item.status,
                date: item.createdAt,
                method: 'Wallet'
            })),
            ...commissions.map(item => ({
                id: item._id,
                type: 'commission',
                title: `Team Commission (L${item.level})`,
                amount: item.amount,
                status: 'completed',
                date: item.createdAt,
                method: 'Electronic Wallet'
            })),
            ...taskEarnings.map(item => ({
                id: item._id,
                type: 'earning',
                title: 'Task Earning',
                amount: item.earning,
                status: 'completed',
                date: item.createdAt,
                method: 'Electronic Wallet'
            }))
        ];

        // Sort by date descending
        allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

        res.status(200).json({
            success: true,
            count: allTransactions.length,
            data: allTransactions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getTransactions
};
