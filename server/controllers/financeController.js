const Recharge = require('../models/Recharge');
const Withdraw = require('../models/Withdraw');
const UserPackage = require('../models/UserPackage');
const LevelIncome = require('../models/LevelIncome');
const TaskLog = require('../models/TaskLog');
const User = require('../models/User');

// @desc    Get Platform Financial Overview
// @route   GET /api/finance/stats
// @access  Private/Admin
const getFinanceStats = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        let dateFilter = {};

        if (startDate || endDate) {
            dateFilter.createdAt = {};
            if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
            if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
        }

        // 1. Deposits (Income Source)
        const depositStats = await Recharge.aggregate([
            { $match: { status: { $in: ['completed', 'approved', 'active'] }, ...dateFilter } },
            { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
        ]);

        // 2. Withdrawals (Expense Source)
        const withdrawalStats = await Withdraw.aggregate([
            { $match: { status: 'approved', ...dateFilter } },
            { $group: { _id: null, total: { $sum: '$amount' }, paid: { $sum: '$finalAmount' }, fees: { $sum: '$fee' }, count: { $sum: 1 } } }
        ]);

        // 3. Commissions (Expense)
        const commissionStats = await LevelIncome.aggregate([
            { $match: { ...dateFilter } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        // 4. ROI/Task Earnings (Expense)
        const taskStats = await TaskLog.aggregate([
            { $match: { ...dateFilter } },
            { $group: { _id: null, total: { $sum: '$earning' } } }
        ]);

        // 5. Package Sales
        const packageStats = await UserPackage.aggregate([
            { $match: { status: { $in: ['active', 'expired'] }, ...dateFilter } },
            { $group: { _id: null, count: { $sum: 1 }, revenue: { $sum: { $toDouble: '$unlockPrice' } } } }
        ]);

        // 6. Active Users (Users who have recharged)
        const activeUsersCount = await User.countDocuments({ totalRecharge: { $gt: 0 } });

        // Calculations
        const totalDeposits = depositStats[0]?.total || 0;
        const totalWithdrawalsRequested = withdrawalStats[0]?.total || 0;
        const totalWithdrawalsPaid = withdrawalStats[0]?.paid || 0;
        const withdrawalFees = withdrawalStats[0]?.fees || 0;

        const commissions = commissionStats[0]?.total || 0;
        const roi = taskStats[0]?.total || 0;

        // Income = Deposits + Withdrawal Fees (fees are profit kept by platform)
        // Note: Deposits are the primary inflow.
        const totalIncome = totalDeposits + withdrawalFees;

        // Expenses = What we actually paid out or promised
        // For realized P&L, we can use: Deposits - Withdrawals Paid
        const totalExpenses = totalWithdrawalsPaid + commissions + roi;

        const netProfit = totalIncome - totalExpenses;

        // Pending Stats for Widgets
        const pendingWithdrawals = await Withdraw.countDocuments({ status: 'pending' });
        const pendingDeposits = await Recharge.countDocuments({ status: 'pending' });

        // Chart Data (Last 7 days or monthly)
        // Let's do daily data for the last 15 days for a trend chart
        const last15Days = [];
        for (let i = 14; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);
            last15Days.push(date);
        }

        const chartData = await Promise.all(last15Days.map(async (day) => {
            const nextDay = new Date(day);
            nextDay.setDate(nextDay.getDate() + 1);

            const dayFilter = { createdAt: { $gte: day, $lt: nextDay } };

            const dayDeposit = await Recharge.aggregate([
                { $match: { status: { $in: ['completed', 'approved', 'active'] }, ...dayFilter } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]);

            const dayWithdraw = await Withdraw.aggregate([
                { $match: { status: 'approved', ...dayFilter } },
                { $group: { _id: null, total: { $sum: '$finalAmount' } } }
            ]);

            return {
                name: day.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
                income: dayDeposit[0]?.total || 0,
                expense: dayWithdraw[0]?.total || 0,
                profit: (dayDeposit[0]?.total || 0) - (dayWithdraw[0]?.total || 0)
            };
        }));

        res.status(200).json({
            success: true,
            data: {
                summary: {
                    totalIncome,
                    totalExpenses,
                    netProfit,
                    totalDeposits,
                    totalWithdrawals: totalWithdrawalsPaid,
                    withdrawalFees,
                    commissions,
                    roi,
                    activeUsers: activeUsersCount,
                    packageSales: packageStats[0]?.count || 0,
                    packageRevenue: packageStats[0]?.revenue || 0,
                    pendingWithdrawals,
                    pendingDeposits
                },
                chartData
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getFinanceStats
};
